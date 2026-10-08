from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, CategorizationResult, MarketScore,
    MarketDetailResponse, WhatIfRequest, WhatIfResponse,
    StrategyRequest, StrategyResponse, MSMEInput,
)
from services.data_loader import load_markets
from services.categorization import categorize_product
from services.scoring import (
    normalize_dataframe, calculate_market_fit_score, msme_adjustment,
    classify_recommendation, score_all_markets, build_explanation,
)
from services.strategy import generate_strategy

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    msme = payload.msme
    categorization = categorize_product(msme.product_name, msme.product_description)

    df = load_markets()
    scored_df = score_all_markets(df, msme)

    all_markets = [MarketScore(**row) for row in scored_df.to_dict(orient="records")]
    top_markets = all_markets[:3]

    return AnalyzeResponse(
        categorization=categorization,
        top_markets=top_markets,
        all_markets=all_markets,
    )


@router.get("/markets")
def get_markets():
    """Raw dummy dataset (unscored) — mainly for debugging / transparency."""
    df = load_markets()
    return df.to_dict(orient="records")


@router.get("/market/{state}", response_model=MarketDetailResponse)
def get_market(
    state: str,
    selling_price: float = Query(0),
    production_capacity: float = Query(0),
    expansion_budget: float = Query(0),
    target_customer: str = Query("B2C"),
    constraints: Optional[str] = Query(None, description="Comma-separated list"),
):
    df = load_markets()
    if state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found")

    msme = MSMEInput(
        product_name="",
        current_state=state,
        selling_price=selling_price,
        production_capacity=production_capacity,
        expansion_budget=expansion_budget,
        target_customer=target_customer,
        constraints=constraints.split(",") if constraints else [],
    )

    scored_df = score_all_markets(df, msme)
    market_row = scored_df[scored_df["state"].str.lower() == state.lower()].iloc[0].to_dict()

    positives, risks, limitations, explanation = build_explanation(market_row)

    return MarketDetailResponse(
        market=MarketScore(**market_row),
        positive_factors=positives,
        risks=risks,
        limitations=limitations,
        explanation=explanation,
    )


@router.post("/what-if", response_model=WhatIfResponse)
def what_if(payload: WhatIfRequest):
    df = load_markets()
    if payload.state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{payload.state}' not found")

    normalized = normalize_dataframe(df)
    row = normalized[normalized["state"].str.lower() == payload.state.lower()].iloc[0].copy()

    # --- Original score ---
    original_base = calculate_market_fit_score(row)
    original_adj = msme_adjustment(row, payload.msme)
    original_score = max(0.0, min(100.0, round(original_base + original_adj, 2)))
    original_recommendation = classify_recommendation(original_score)

    # --- Scenario: apply demand % change and transport cost % change ---
    scenario_row = row.copy()
    scenario_row["demand"] = max(0.0, min(100.0, row["demand"] * (1 + payload.demand_change_pct / 100)))
    # Higher transport cost -> lower effective logistics score.
    scenario_row["logistics"] = max(0.0, min(100.0, row["logistics"] - payload.transport_cost_change_pct * 0.4))

    scenario_base = calculate_market_fit_score(scenario_row)
    scenario_adj = msme_adjustment(scenario_row, payload.msme)
    scenario_score = max(0.0, min(100.0, round(scenario_base + scenario_adj, 2)))
    scenario_recommendation = classify_recommendation(scenario_score)

    return WhatIfResponse(
        state=payload.state,
        original_score=original_score,
        original_recommendation=original_recommendation,
        scenario_score=scenario_score,
        scenario_recommendation=scenario_recommendation,
        change=round(scenario_score - original_score, 2),
    )


@router.post("/strategy", response_model=StrategyResponse)
def strategy(payload: StrategyRequest):
    df = load_markets()
    if payload.state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{payload.state}' not found")

    scored_df = score_all_markets(df, payload.msme)
    market_row = scored_df[scored_df["state"].str.lower() == payload.state.lower()].iloc[0].to_dict()

    result = generate_strategy(payload.state, market_row["recommendation"], payload.msme, market_row)
    return StrategyResponse(**result)
