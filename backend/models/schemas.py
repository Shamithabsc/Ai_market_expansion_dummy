"""
Pydantic models (schemas) used across the API.

NOTE FOR REPLACEMENT LATER:
These schemas describe the CONTRACT between frontend and backend.
When you plug in real ML models / LLMs, these shapes can mostly stay
the same — only the internal calculation logic in services/ changes.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class MSMEInput(BaseModel):
    product_name: str
    product_description: str = ""
    current_state: str
    selling_price: float
    production_capacity: float  # units per month
    expansion_budget: float
    target_customer: str  # "B2C" or "B2B"
    constraints: List[str] = Field(default_factory=list)  # e.g. ["Budget", "Transportation"]


class CategorizationResult(BaseModel):
    category: str
    confidence: float


class MarketScore(BaseModel):
    state: str
    demand: float
    market_growth: float
    competition: float
    purchasing_power: float
    logistics: float
    accessibility: float
    market_fit_score: float
    recommendation: str  # EXPAND / PILOT / AVOID


class AnalyzeRequest(BaseModel):
    msme: MSMEInput


class AnalyzeResponse(BaseModel):
    categorization: CategorizationResult
    top_markets: List[MarketScore]
    all_markets: List[MarketScore]
    disclaimer: str = (
        "Prototype demonstration — market values are sample data and will be "
        "replaced with verified datasets."
    )


class MarketDetailResponse(BaseModel):
    market: MarketScore
    positive_factors: List[str]
    risks: List[str]
    limitations: List[str]
    explanation: str


class WhatIfRequest(BaseModel):
    state: str
    msme: MSMEInput
    demand_change_pct: float = 0.0        # -20 to +20
    transport_cost_change_pct: float = 0.0  # -20 to +50


class WhatIfResponse(BaseModel):
    state: str
    original_score: float
    original_recommendation: str
    scenario_score: float
    scenario_recommendation: str
    change: float


class StrategyRequest(BaseModel):
    state: str
    msme: MSMEInput


class StrategyResponse(BaseModel):
    state: str
    recommendation: str
    target_customer: str
    recommended_approach: str
    suggested_channels: List[str]
    pricing_consideration: str
    initial_launch_steps: List[str]
    key_risks: List[str]
