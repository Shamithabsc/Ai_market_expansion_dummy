"""
Market Fit Score calculation and Explainable Recommendation Engine.

Weights and formula are preserved:
  - normalize_factor(): min-max normalization to 0-100
  - competition_suitability(): converts raw competition into a "suitability"
    score where LOWER competition -> HIGHER suitability (100 - competition)
  - calculate_market_fit_score(): weighted formula summing to 1.0
  - msme_adjustment(): transparent adjustment layer based on MSME parameters
  - classify_recommendation(): maps score to EXPAND / PILOT / AVOID
  - build_explanation(): dynamic, explainable diagnosis from actual scores
"""

import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from models.schemas import MSMEInput

# ---- Configurable weights (sum = 1.0) -------------------------------------
WEIGHTS = {
    "demand": 0.30,
    "market_growth": 0.15,
    "purchasing_power": 0.15,
    "logistics": 0.15,
    "accessibility": 0.10,
    "competition_suitability": 0.15,
}

# ---- Recommendation thresholds ---------------------------------------------
THRESHOLD_EXPAND = 75
THRESHOLD_PILOT = 55

DATA_SOURCE_CITATION = (
    "Sample/Demonstration Dataset (2024–25 Synthetic Benchmark), structured "
    "to simulate Indian state-level indicators across demand, GSDP growth, "
    "retail purchasing power, LEADS logistics index, and accessibility."
)


def normalize_factor(value: float, min_value: float, max_value: float) -> float:
    """Min-max normalize a value onto a 0-100 scale."""
    if max_value == min_value:
        return 50.0
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
    Inverts raw competition so saturation does not mistakenly inflate market fit.
    """
    return round(100.0 - competition_score, 1)


def calculate_market_fit_score(row: pd.Series) -> float:
    """Apply the weighted formula to one normalized market row."""
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


def msme_adjustment_details(row: pd.Series, msme: MSMEInput) -> Tuple[float, Dict[str, Any]]:
    """
    Detailed explainability for the MSME adjustment layer.
    Returns (net_adjustment, breakdown_dict).
    """
    net_adjustment = 0.0
    constraints = [c.lower() for c in msme.constraints]
    breakdown = {}

    # 1. Budget constraint
    if "budget" in constraints and msme.expansion_budget < 150_000:
        net_adjustment -= 3.0
        breakdown["budget_constraint"] = {
            "applied": True,
            "delta": -3.0,
            "reason": f"Expansion budget (₹{msme.expansion_budget:,.0f}) is under ₹150,000 threshold, increasing risk in large markets.",
        }
    else:
        breakdown["budget_constraint"] = {"applied": False, "delta": 0.0, "reason": "Expansion budget is adequate for regional entry."}

    # 2. Transportation constraint
    if "transportation" in constraints:
        penalty = round((100 - row["logistics"]) * 0.05, 2)
        net_adjustment -= penalty
        breakdown["transportation_constraint"] = {
            "applied": True,
            "delta": -penalty,
            "reason": f"Transportation constraint active; {row['state']}'s logistics score ({row['logistics']}) reflects transit friction.",
        }
    else:
        breakdown["transportation_constraint"] = {"applied": False, "delta": 0.0, "reason": "No transportation restriction specified."}

    # 3. Competition constraint
    if "competition" in constraints:
        comp_penalty = round(row["competition"] * 0.05, 2)
        net_adjustment -= comp_penalty
        breakdown["competition_constraint"] = {
            "applied": True,
            "delta": -comp_penalty,
            "reason": f"High competition sensitivity specified; market competition level ({row['competition']}) reduces suitability.",
        }
    else:
        breakdown["competition_constraint"] = {"applied": False, "delta": 0.0, "reason": "Competition constraint not selected."}

    # 4. Production capacity match
    if msme.production_capacity > 3000 and row["demand"] > 70:
        net_adjustment += 2.0
        breakdown["capacity_match"] = {
            "applied": True,
            "delta": +2.0,
            "reason": f"Monthly capacity ({msme.production_capacity:,.0f} units) comfortably meets high consumer demand ({row['demand']}).",
        }
    else:
        breakdown["capacity_match"] = {"applied": False, "delta": 0.0, "reason": "Capacity aligns moderately with local absorption."}

    # 5. Price vs Purchasing power
    if msme.selling_price > 100 and row["purchasing_power"] > 75:
        net_adjustment += 1.5
        breakdown["price_power_alignment"] = {
            "applied": True,
            "delta": +1.5,
            "reason": f"Premium unit price of ₹{msme.selling_price:,.0f} is well-supported by high purchasing power ({row['purchasing_power']}).",
        }
    else:
        breakdown["price_power_alignment"] = {"applied": False, "delta": 0.0, "reason": "Standard price-to-purchasing-power alignment."}

    return round(net_adjustment, 2), breakdown


def msme_adjustment(row: pd.Series, msme: MSMEInput) -> float:
    """Wrapper returning just the net adjustment float."""
    adj, _ = msme_adjustment_details(row, msme)
    return adj


def classify_recommendation(score: float) -> str:
    if score >= THRESHOLD_EXPAND:
        return "EXPAND"
    if score >= THRESHOLD_PILOT:
        return "PILOT"
    return "AVOID"


def generate_market_insights(row: dict, msme: MSMEInput) -> Tuple[List[str], List[str], List[str], Dict[str, Any]]:
    """
    Generates explainable reasons, opportunities, risks, and MSME suitability tags for a market.
    """
    reasons = []
    opportunities = []
    risks = []
    suitability = {}

    comp_suit = competition_suitability(row["competition"])

    # Demand & Growth
    if row["demand"] >= 75:
        reasons.append(f"Strong customer appetite with a high demand index of {row['demand']}/100.")
        opportunities.append("Fast inventory turnover and rapid initial consumer adoption.")
    elif row["demand"] < 60:
        risks.append(f"Subdued consumer demand ({row['demand']}/100) indicates slower off-take.")

    if row["market_growth"] >= 75:
        opportunities.append(f"Rising economic expansion trend ({row['market_growth']}/100) presents long-term market upside.")

    # Competition Suitability
    if comp_suit >= 60:
        reasons.append(f"Favorable competitive landscape with low incumbent saturation (suitability: {comp_suit}/100).")
        opportunities.append("Opportunity to capture early market share without high distributor margin discounting.")
    elif row["competition"] >= 75:
        risks.append(f"Dense competitor presence ({row['competition']}/100) requires elevated promotional spend.")

    # Purchasing Power vs Price
    if row["purchasing_power"] >= 75 and msme.selling_price >= 100:
        reasons.append(f"Local disposable income ({row['purchasing_power']}/100) readily supports unit price of ₹{msme.selling_price}.")
    elif row["purchasing_power"] < 55 and msme.selling_price > 120:
        risks.append(f"Lower purchasing power ({row['purchasing_power']}/100) may resist unit price of ₹{msme.selling_price}; smaller packaging advised.")

    # Logistics & Geography
    if row["logistics"] >= 75:
        opportunities.append(f"Robust regional freight network ({row['logistics']}/100) facilitates low transit shrinkage.")
    elif row["logistics"] < 55:
        risks.append(f"Logistics score ({row['logistics']}/100) indicates higher interstate freight cost.")

    if not reasons:
        reasons.append(f"Balanced performance across core economic and accessibility indices ({row['market_fit_score']}/100).")
    if not opportunities:
        opportunities.append("Stable secondary expansion testbed with moderate demand potential.")
    if not risks:
        risks.append("No critical operational deterrents detected in benchmark parameters.")

    # MSME Suitability summary
    suitability = {
        "budget_fit": "Optimal" if msme.expansion_budget >= 150_000 else "Constrained",
        "price_acceptance": "High" if row["purchasing_power"] >= 70 else "Moderate",
        "capacity_utilization": "Favorable" if msme.production_capacity >= 3000 and row["demand"] >= 70 else "Balanced",
        "channel_type": f"{msme.target_customer} Distribution Model",
    }

    return reasons, opportunities, risks, suitability


def score_all_markets(df: pd.DataFrame, msme: MSMEInput) -> pd.DataFrame:
    """
    Full pipeline: normalize raw factors -> weighted score -> MSME adjustment ->
    final score + recommendation + explainable insights for every market row.
    """
    normalized = normalize_dataframe(df)

    results = []
    for _, row in normalized.iterrows():
        base_score = calculate_market_fit_score(row)
        net_adj, adj_breakdown = msme_adjustment_details(row, msme)
        final_score = max(0.0, min(100.0, round(base_score + net_adj, 2)))
        comp_suit = competition_suitability(row["competition"])

        market_dict = {
            "state": row["state"],
            "demand": round(row["demand"], 1),
            "market_growth": round(row["market_growth"], 1),
            "competition": round(row["competition"], 1),
            "competition_suitability": comp_suit,
            "purchasing_power": round(row["purchasing_power"], 1),
            "logistics": round(row["logistics"], 1),
            "accessibility": round(row["accessibility"], 1),
            "market_fit_score": final_score,
            "recommendation": classify_recommendation(final_score),
        }

        reasons, opps, risks, suitability = generate_market_insights(market_dict, msme)
        market_dict["key_reasons"] = reasons
        market_dict["key_opportunities"] = opps
        market_dict["potential_risks"] = risks
        market_dict["msme_suitability"] = suitability
        market_dict["_adjustment_breakdown"] = adj_breakdown

        results.append(market_dict)

    result_df = pd.DataFrame(results)
    return result_df.sort_values("market_fit_score", ascending=False).reset_index(drop=True)


def generate_comparative_summary(top_markets: List[dict]) -> str:
    """
    Generates a natural-language comparative explanation across the top 3 recommended markets.
    """
    if len(top_markets) < 2:
        return "Market evaluation complete."

    first = top_markets[0]
    second = top_markets[1]
    third = top_markets[2] if len(top_markets) > 2 else None

    # Compare first vs second
    strongest_first = []
    if first["demand"] > second["demand"]:
        strongest_first.append("stronger consumer demand")
    if first["purchasing_power"] > second["purchasing_power"]:
        strongest_first.append("higher retail purchasing power")
    if first["logistics"] > second["logistics"]:
        strongest_first.append("better logistics connectivity")
    if first.get("competition_suitability", 0) > second.get("competition_suitability", 0):
        strongest_first.append("lower competitive saturation")

    first_edge = ", ".join(strongest_first) if strongest_first else "overall balanced factor suitability"

    summary = (
        f"{first['state']} ranks #1 with a Market Fit Score of {first['market_fit_score']} "
        f"because it offers {first_edge} compared to {second['state']} (Score: {second['market_fit_score']}). "
    )

    if second.get("competition_suitability", 0) > first.get("competition_suitability", 0):
        summary += f"However, {second['state']} provides less competitive friction. "

    if third:
        summary += (
            f"Meanwhile, {third['state']} (Score: {third['market_fit_score']}) represents a viable "
            f"{third['recommendation'].lower()} alternative with solid growth dynamics."
        )

    return summary


def build_explanation(market: dict, msme: Optional[MSMEInput] = None) -> Tuple[List[str], List[str], List[str], str, Dict[str, Any], str, str, str]:
    """
    Generates structured, transparent explainability for a single market:
    (positives, risks, limitations, explanation, msme_alignment, ranking_rationale, data_sources, data_vs_rules_note)
    """
    positives, risks = [], []

    comp_suit = market.get("competition_suitability", competition_suitability(market["competition"]))

    if market["demand"] >= 70:
        positives.append(f"Robust customer demand ({market['demand']}/100)")
    if market["market_growth"] >= 70:
        positives.append(f"Accelerating economic expansion ({market['market_growth']}/100)")
    if market["purchasing_power"] >= 70:
        positives.append(f"High consumer purchasing power ({market['purchasing_power']}/100)")
    if market["logistics"] >= 70:
        positives.append(f"Efficient highway & transport infrastructure ({market['logistics']}/100)")
    if market["accessibility"] >= 70:
        positives.append(f"High trade corridor accessibility ({market['accessibility']}/100)")
    if comp_suit >= 55:
        positives.append(f"Uncluttered competitive landscape (suitability {comp_suit}/100)")

    if market["competition"] > 70:
        risks.append(f"High incumbent brand competition ({market['competition']}/100)")
    if market["logistics"] < 55:
        risks.append(f"Lower freight & logistics infrastructure efficiency ({market['logistics']}/100)")
    if market["demand"] < 55:
        risks.append(f"Limited existing category demand ({market['demand']}/100)")
    if market["purchasing_power"] < 55:
        risks.append(f"Lower consumer purchasing capacity ({market['purchasing_power']}/100)")
    if market["accessibility"] < 55:
        risks.append(f"Higher geographic distance and interstate transit friction ({market['accessibility']}/100)")

    if not positives:
        positives.append("Balanced baseline performance across indicators")
    if not risks:
        risks.append("No severe operational risk barriers identified")

    limitations = [
        "Dataset values reflect synthetic demonstration benchmarks calibrated against Census and state transport indices.",
        "MSME heuristic adjustment layer applies transparent rule-based multipliers rather than opaque neural predictions.",
        "Hyperlocal municipal trade regulations and seasonal commodity price shifts are not modeled in this release.",
    ]

    explanation = (
        f"{market['state']} achieved a composite Market Fit Score of {market['market_fit_score']} (Recommendation: {market['recommendation']}). "
        f"This evaluation is anchored by a demand score of {market['demand']}/100 and growth rate of {market['market_growth']}/100. "
        f"Rather than treating competition as a positive multiplier, our model inverts raw competition ({market['competition']}/100) into a suitability score of {comp_suit}/100, "
        f"ensuring that heavily saturated markets do not artificially inflate expansion viability."
    )

    msme_alignment = {}
    if msme:
        _, breakdown = msme_adjustment_details(pd.Series(market), msme)
        msme_alignment = breakdown

    ranking_rationale = (
        f"{market['state']} is classified as '{market['recommendation']}' because its weighted balance of demand ({market['demand']}), "
        f"purchasing power ({market['purchasing_power']}), and logistics ({market['logistics']}) surpasses the {THRESHOLD_EXPAND if market['recommendation'] == 'EXPAND' else THRESHOLD_PILOT} threshold."
    )

    data_vs_rules_note = (
        "Methodology Transparency: Raw state factor scores (Demand, Growth, Competition, Purchasing Power, Logistics, Accessibility) "
        "derive from the benchmark dataset. Specific score boosts or penalties reflect explicit deterministic rules based on your "
        "MSME inputs (budget limits, freight constraints, price thresholds, and production capacity)."
    )

    return (
        positives,
        risks,
        limitations,
        explanation,
        msme_alignment,
        ranking_rationale,
        DATA_SOURCE_CITATION,
        data_vs_rules_note,
    )
