from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import pandas as pd

from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, CategorizationResult, MarketScore,
    MarketDetailResponse, WhatIfRequest, WhatIfResponse, RankShiftItem,
    StrategyRequest, StrategyResponse, MSMEInput,
)
from services.data_loader import load_markets, load_raw_dataset, get_dataset_metadata
from services.categorization import categorize_product
from services.scoring import (
    normalize_dataframe, calculate_market_fit_score, msme_adjustment,
    classify_recommendation, score_all_markets, build_explanation,
    generate_comparative_summary, competition_suitability,
)
from services.strategy import generate_strategy

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    msme = payload.msme
    categorization = categorize_product(
        msme.product_name,
        msme.product_description,
        user_category=msme.product_category,
        user_subcategory=msme.product_subcategory,
    )

    # Load 36 states calibrated to product category
    effective_category = categorization.category or msme.product_category
    df = load_markets(effective_category)
    scored_df = score_all_markets(df, msme)

    all_markets = [MarketScore(**row) for row in scored_df.to_dict(orient="records")]
    top_markets = all_markets[:3]

    comparative_summary = generate_comparative_summary(scored_df.head(3).to_dict(orient="records"))
    metadata = get_dataset_metadata()

    return AnalyzeResponse(
        categorization=categorization,
        top_markets=top_markets,
        all_markets=all_markets,
        comparative_summary=comparative_summary,
        dataset_metadata=metadata,
    )


@router.get("/dataset-metadata")
def get_metadata():
    """Returns dataset completeness, source file, state coverage, and mapping transparency."""
    return get_dataset_metadata()


@router.get("/markets")
def get_markets(category: Optional[str] = Query(None), format: Optional[str] = Query("aggregated")):
    """
    Returns market dataset records.
    format='aggregated' returns the 36 Indian States/UTs.
    format='raw' returns the full 1,000 synthetic records.
    """
    if format == "raw":
        raw = load_raw_dataset()
        return raw.to_dict(orient="records")
    df = load_markets(category)
    return df.to_dict(orient="records")


@router.get("/market/{state}", response_model=MarketDetailResponse)
def get_market(
    state: str,
    selling_price: float = Query(0),
    production_capacity: float = Query(0),
    expansion_budget: float = Query(0),
    target_customer: str = Query("B2C"),
    current_customer_base: Optional[str] = Query("Local"),
    category: Optional[str] = Query(None),
    constraints: Optional[str] = Query(None, description="Comma-separated list"),
):
    df = load_markets(category)
    if state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found in benchmark dataset")

    msme = MSMEInput(
        product_name="",
        product_category=category,
        current_state=state,
        selling_price=selling_price,
        production_capacity=production_capacity,
        expansion_budget=expansion_budget,
        target_customer=target_customer,
        current_customer_base=current_customer_base,
        constraints=constraints.split(",") if constraints else [],
    )

    scored_df = score_all_markets(df, msme)
    market_row = scored_df[scored_df["state"].str.lower() == state.lower()].iloc[0].to_dict()

    (
        positives,
        risks,
        limitations,
        explanation,
        msme_alignment,
        ranking_rationale,
        data_sources,
        data_vs_rules_note,
    ) = build_explanation(market_row, msme)

    return MarketDetailResponse(
        market=MarketScore(**market_row),
        positive_factors=positives,
        risks=risks,
        limitations=limitations,
        explanation=explanation,
        msme_alignment=msme_alignment,
        ranking_rationale=ranking_rationale,
        data_sources=data_sources,
        data_vs_rules_note=data_vs_rules_note,
    )


@router.post("/what-if", response_model=WhatIfResponse)
def what_if(payload: WhatIfRequest):
    df = load_markets(payload.msme.product_category)
    if payload.state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{payload.state}' not found")

    normalized = normalize_dataframe(df)

    # 1. Baseline scoring across all 36 states
    original_records = []
    for _, row in normalized.iterrows():
        base_score = calculate_market_fit_score(row)
        adj = msme_adjustment(row, payload.msme)
        score = max(0.0, min(100.0, round(base_score + adj, 2)))
        original_records.append({
            "state": row["state"],
            "score": score,
            "rec": classify_recommendation(score),
            "demand": row["demand"],
            "logistics": row["logistics"],
            "row": row,
        })

    original_records.sort(key=lambda x: x["score"], reverse=True)
    orig_ranks = {r["state"]: idx + 1 for idx, r in enumerate(original_records)}
    orig_scores = {r["state"]: r["score"] for r in original_records}
    orig_recs = {r["state"]: r["rec"] for r in original_records}

    # 2. Scenario scoring across all 36 states under what-if inputs
    scenario_records = []
    for r in original_records:
        row = r["row"]
        scenario_row = row.copy()

        # Demand adjustment
        scenario_row["demand"] = max(0.0, min(100.0, row["demand"] * (1 + payload.demand_change_pct / 100)))

        # Freight adjustment
        scenario_row["logistics"] = max(0.0, min(100.0, row["logistics"] - payload.transport_cost_change_pct * 0.4))

        scen_base = calculate_market_fit_score(scenario_row)
        scen_adj = msme_adjustment(scenario_row, payload.msme)
        scen_score = max(0.0, min(100.0, round(scen_base + scen_adj, 2)))
        scen_rec = classify_recommendation(scen_score)

        scenario_records.append({
            "state": row["state"],
            "demand": round(scenario_row["demand"], 1),
            "market_growth": round(scenario_row["market_growth"], 1),
            "competition": round(scenario_row["competition"], 1),
            "competition_suitability": competition_suitability(scenario_row["competition"]),
            "purchasing_power": round(scenario_row["purchasing_power"], 1),
            "logistics": round(scenario_row["logistics"], 1),
            "accessibility": round(scenario_row["accessibility"], 1),
            "market_fit_score": scen_score,
            "recommendation": scen_rec,
        })

    scenario_records.sort(key=lambda x: x["market_fit_score"], reverse=True)
    scen_ranks = {r["state"]: idx + 1 for idx, r in enumerate(scenario_records)}

    # 3. Identify ranking shifts
    rank_changes: List[RankShiftItem] = []
    for r in scenario_records:
        st = r["state"]
        orig_r = orig_ranks[st]
        scen_r = scen_ranks[st]
        orig_s = orig_scores[st]
        scen_s = r["market_fit_score"]
        delta_rank = orig_r - scen_r
        delta_score = round(scen_s - orig_s, 2)

        if delta_rank > 0:
            shift_reason = f"Rose {delta_rank} spot(s) to #{scen_r} due to higher relative resilience to cost/demand changes."
        elif delta_rank < 0:
            shift_reason = f"Fell {abs(delta_rank)} spot(s) to #{scen_r} due to freight/demand sensitivity."
        else:
            shift_reason = f"Maintained rank at #{scen_r} with net score delta of {delta_score:+} pts."

        rank_changes.append(RankShiftItem(
            state=st,
            original_rank=orig_r,
            scenario_rank=scen_r,
            rank_delta=delta_rank,
            original_score=orig_s,
            scenario_score=scen_s,
            score_delta=delta_score,
            original_recommendation=orig_recs[st],
            scenario_recommendation=r["recommendation"],
            shift_reason=shift_reason,
        ))

    sel_orig_score = orig_scores[payload.state]
    sel_orig_rec = orig_recs[payload.state]
    sel_scen = next(r for r in scenario_records if r["state"].lower() == payload.state.lower())
    sel_scen_score = sel_scen["market_fit_score"]
    sel_scen_rec = sel_scen["recommendation"]
    sel_change = round(sel_scen_score - sel_orig_score, 2)

    shifts_summary = []
    if payload.demand_change_pct != 0:
        shifts_summary.append(f"{payload.demand_change_pct:+}% demand shift")
    if payload.transport_cost_change_pct != 0:
        shifts_summary.append(f"{payload.transport_cost_change_pct:+}% transportation fluctuation")

    factors_str = " and ".join(shifts_summary) if shifts_summary else "baseline parameters"

    movers = sorted(rank_changes, key=lambda x: abs(x.rank_delta), reverse=True)
    top_mover_note = ""
    if movers and movers[0].rank_delta != 0:
        m = movers[0]
        direction = "climbed" if m.rank_delta > 0 else "slipped"
        top_mover_note = f" Noticeably, {m.state} {direction} from #{m.original_rank} to #{m.scenario_rank}."

    explanation = (
        f"Under {factors_str}: {payload.state}'s Market Fit Score shifted from {sel_orig_score} to {sel_scen_score} ({sel_change:+}). "
        f"In this scenario, {payload.state} holds rank #{scen_ranks[payload.state]} (baseline #{orig_ranks[payload.state]}).{top_mover_note}"
    )

    scenario_top_markets = [MarketScore(**r) for r in scenario_records[:3]]

    return WhatIfResponse(
        state=payload.state,
        original_score=sel_orig_score,
        original_recommendation=sel_orig_rec,
        scenario_score=sel_scen_score,
        scenario_recommendation=sel_scen_rec,
        change=sel_change,
        explanation=explanation,
        scenario_top_markets=scenario_top_markets,
        rank_changes=rank_changes,
    )


@router.post("/strategy", response_model=StrategyResponse)
def strategy(payload: StrategyRequest):
    df = load_markets(payload.msme.product_category)
    if payload.state.lower() not in [s.lower() for s in df["state"]]:
        raise HTTPException(status_code=404, detail=f"State '{payload.state}' not found in benchmark dataset")

    scored_df = score_all_markets(df, payload.msme)
    market_row = scored_df[scored_df["state"].str.lower() == payload.state.lower()].iloc[0].to_dict()

    result = generate_strategy(payload.state, market_row["recommendation"], payload.msme, market_row)
    return StrategyResponse(**result)
