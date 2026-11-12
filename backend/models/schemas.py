"""
Pydantic models (schemas) used across the API.

NOTE FOR REPLACEMENT LATER:
These schemas describe the CONTRACT between frontend and backend.
When you plug in real ML models / LLMs, these shapes can mostly stay
the same — only the internal calculation logic in services/ changes.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class MSMEInput(BaseModel):
    product_name: str
    product_description: str = ""
    product_category: Optional[str] = None
    product_subcategory: Optional[str] = None
    current_state: str
    selling_price: float
    production_capacity: float  # units per month
    expansion_budget: float
    target_customer: str  # "B2C" or "B2B"
    current_customer_base: Optional[str] = "Local"  # "Local", "State-wide", "Regional Multi-State"
    constraints: List[str] = Field(default_factory=list)  # e.g. ["Budget", "Transportation", "Competition"]


class CategorizationResult(BaseModel):
    category: str
    subcategory: Optional[str] = None
    confidence: float
    matched_keywords: List[str] = Field(default_factory=list)
    available_categories: List[str] = Field(default_factory=list)
    available_subcategories: List[str] = Field(default_factory=list)


class MarketScore(BaseModel):
    state: str
    demand: float
    market_growth: float
    competition: float
    competition_suitability: Optional[float] = None
    purchasing_power: float
    logistics: float
    accessibility: float
    market_fit_score: float
    recommendation: str  # EXPAND / PILOT / AVOID
    key_reasons: List[str] = Field(default_factory=list)
    key_opportunities: List[str] = Field(default_factory=list)
    potential_risks: List[str] = Field(default_factory=list)
    msme_suitability: Optional[Dict[str, Any]] = None


class AnalyzeRequest(BaseModel):
    msme: MSMEInput


class AnalyzeResponse(BaseModel):
    categorization: CategorizationResult
    top_markets: List[MarketScore]
    all_markets: List[MarketScore]
    comparative_summary: Optional[str] = None
    dataset_metadata: Optional[Dict[str, Any]] = None
    disclaimer: str = (
        "Prototype demonstration — market values are drawn from the 2024–25 "
        "synthetic benchmark dataset and will be replaced with verified datasets."
    )


class MarketDetailResponse(BaseModel):
    market: MarketScore
    positive_factors: List[str]
    risks: List[str]
    limitations: List[str]
    explanation: str
    msme_alignment: Optional[Dict[str, Any]] = None
    ranking_rationale: Optional[str] = None
    data_sources: Optional[str] = None
    data_vs_rules_note: Optional[str] = None


class WhatIfRequest(BaseModel):
    state: str
    msme: MSMEInput
    demand_change_pct: float = 0.0        # -20 to +20
    transport_cost_change_pct: float = 0.0  # -20 to +50


class RankShiftItem(BaseModel):
    state: str
    original_rank: int
    scenario_rank: int
    rank_delta: int  # +1 = moved up 1 spot, -2 = dropped 2 spots, 0 = unchanged
    original_score: float
    scenario_score: float
    score_delta: float
    original_recommendation: str
    scenario_recommendation: str
    shift_reason: str


class WhatIfResponse(BaseModel):
    state: str
    original_score: float
    original_recommendation: str
    scenario_score: float
    scenario_recommendation: str
    change: float
    explanation: Optional[str] = None
    scenario_top_markets: List[MarketScore] = Field(default_factory=list)
    rank_changes: List[RankShiftItem] = Field(default_factory=list)


class StrategyRequest(BaseModel):
    state: str
    msme: MSMEInput


class BudgetItem(BaseModel):
    category: str
    percentage: int
    amount: float
    rationale: str


class StrategyResponse(BaseModel):
    state: str
    recommendation: str
    target_customer: str
    recommended_approach: str
    suggested_channels: List[str]
    pricing_consideration: str
    initial_launch_steps: List[str]
    key_risks: List[str]
    budget_allocation: List[BudgetItem] = Field(default_factory=list)
    is_rule_based: bool = True
