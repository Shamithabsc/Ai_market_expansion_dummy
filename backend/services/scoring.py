"""
DUMMY Market Fit Score calculation.

REPLACE LATER WITH: a validated, data-driven scoring model (e.g. a
regression / ML model trained on real MSME expansion outcomes).

Everything here is intentionally simple, transparent and easy to swap:
  - normalize_factor(): min-max normalization to 0-100
  - competition_suitability(): converts raw competition into a
    "suitability" number where LOWER competition -> HIGHER suitability
    (so high competition never blindly boosts the score)
  - calculate_market_fit_score(): the weighted formula
  - msme_adjustment(): small, explainable adjustment based on the
    MSME's own inputs (price, capacity, budget, constraints)
  - classify_recommendation(): turns a score into EXPAND / PILOT / AVOID
"""

from typing import Iterable
import pandas as pd

from models.schemas import MSMEInput

# ---- Configurable weights (must sum to 1.0) --------------------------------
WEIGHTS = {
    "demand": 0.30,
    "market_growth": 0.15,
    "purchasing_power": 0.15,
    "logistics": 0.15,
    "accessibility": 0.10,
    "competition_suitability": 0.15,
}

# ---- Configurable recommendation thresholds --------------------------------
THRESHOLD_EXPAND = 75
THRESHOLD_PILOT = 55


def normalize_factor(value: float, min_value: float, max_value: float) -> float:
    """Min-max normalize a value onto a 0-100 scale."""
    if max_value == min_value:
        return 50.0  # neutral fallback to avoid divide-by-zero
    normalized = (value - min_value) / (max_value - min_value) * 100
    return max(0.0, min(100.0, normalized))


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize every raw factor column across the whole dataset to 0-100."""
    normalized = df.copy()
    for col in ["demand", "market_growth", "competition", "purchasing_power", "logistics", "accessibility"]:
        min_v, max_v = df[col].min(), df[col].max()
        normalized[col] = df[col].apply(lambda v: normalize_factor(v, min_v, max_v))
    return normalized


def competition_suitability(competition_score: float) -> float:
    """
    Lower competition -> higher suitability.
    This is the key rule that stops high competition from boosting the score.
    """
    return 100 - competition_score


def calculate_market_fit_score(row: pd.Series) -> float:
    """Apply the weighted formula to one (already normalized) market row."""
    suitability = competition_suitability(row["competition"])
    score = (
        WEIGHTS["demand"] * row["demand"]
        + WEIGHTS["market_growth"] * row["market_growth"]
        + WEIGHTS["purchasing_power"] * row["purchasing_power"]
        + WEIGHTS["logistics"] * row["logistics"]
        + WEIGHTS["accessibility"] * row["accessibility"]
        + WEIGHTS["competition_suitability"] * suitability
    )
    return round(score, 2)


def msme_adjustment(row: pd.Series, msme: MSMEInput) -> float:
    """
    Small, explainable adjustment layer based on the MSME's own situation.
    Kept intentionally simple for the prototype — replace with a proper
    model later (e.g. one that factors in price elasticity, real freight
    costs, category-specific competition intensity, etc).
    """
    adjustment = 0.0
    constraints = [c.lower() for c in msme.constraints]

    # Budget constraint: penalize low budget when logistics costs are high (low logistics score).
    if "budget" in constraints and msme.expansion_budget < 150_000:
        adjustment -= 3

    # Transportation constraint: penalize markets with weaker logistics infrastructure.
    if "transportation" in constraints:
        adjustment -= (100 - row["logistics"]) * 0.05

    # Competition constraint: penalize markets with higher competition.
    if "competition" in constraints:
        adjustment -= row["competition"] * 0.05

    # Reward markets where production capacity comfortably matches demand.
    if msme.production_capacity > 3000 and row["demand"] > 70:
        adjustment += 2

    # Reward markets with strong purchasing power for higher-priced products.
    if msme.selling_price > 100 and row["purchasing_power"] > 75:
        adjustment += 1.5

    return round(adjustment, 2)


def classify_recommendation(score: float) -> str:
    if score >= THRESHOLD_EXPAND:
        return "EXPAND"
    if score >= THRESHOLD_PILOT:
        return "PILOT"
    return "AVOID"


def score_all_markets(df: pd.DataFrame, msme: MSMEInput) -> pd.DataFrame:
    """
    Full pipeline: normalize raw factors -> weighted score -> MSME
    adjustment -> final score + recommendation, for every market row.
    """
    normalized = normalize_dataframe(df)

    results = []
    for _, row in normalized.iterrows():
        base_score = calculate_market_fit_score(row)
        adjustment = msme_adjustment(row, msme)
        final_score = max(0.0, min(100.0, round(base_score + adjustment, 2)))
        results.append({
            "state": row["state"],
            "demand": round(row["demand"], 1),
            "market_growth": round(row["market_growth"], 1),
            "competition": round(row["competition"], 1),
            "purchasing_power": round(row["purchasing_power"], 1),
            "logistics": round(row["logistics"], 1),
            "accessibility": round(row["accessibility"], 1),
            "market_fit_score": final_score,
            "recommendation": classify_recommendation(final_score),
        })

    result_df = pd.DataFrame(results)
    return result_df.sort_values("market_fit_score", ascending=False).reset_index(drop=True)


def build_explanation(market: dict) -> tuple[list[str], list[str], list[str], str]:
    """
    Generate positive factors / risks / limitations / explanation text
    FROM the actual factor values (not hard-coded), for the Market
    Details page.
    """
    positives, risks = [], []

    if market["demand"] >= 70:
        positives.append("Strong customer demand")
    if market["market_growth"] >= 70:
        positives.append("Healthy market growth trend")
    if market["purchasing_power"] >= 70:
        positives.append("Good purchasing power")
    if market["logistics"] >= 70:
        positives.append("Good logistics infrastructure")
    if market["accessibility"] >= 70:
        positives.append("Good market accessibility")
    if market["competition"] <= 50:
        positives.append("Relatively low competition")

    if market["competition"] > 70:
        risks.append("High competition from existing players")
    if market["logistics"] < 55:
        risks.append("Weaker transportation / logistics infrastructure")
    if market["demand"] < 55:
        risks.append("Limited current demand")
    if market["purchasing_power"] < 55:
        risks.append("Lower purchasing power in this market")
    if market["accessibility"] < 55:
        risks.append("Harder market accessibility")

    if not positives:
        positives.append("No standout strengths identified in the sample data")
    if not risks:
        risks.append("No major risks identified in the sample data")

    limitations = [
        "Scores are based on sample/dummy data, not verified statistics.",
        "MSME adjustment logic is simplified for this prototype.",
        "Category-specific nuances (e.g. perishability, seasonality) are not yet modeled.",
    ]

    explanation = (
        f"{market['state']} received a Market Fit Score of {market['market_fit_score']} "
        f"mainly due to its demand level ({market['demand']}), growth trend "
        f"({market['market_growth']}), and purchasing power ({market['purchasing_power']}). "
        f"Competition ({market['competition']}) was treated as a suitability factor rather than "
        f"a positive multiplier — higher competition reduces, not increases, the score."
    )

    return positives, risks, limitations, explanation
