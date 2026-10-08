"""
DUMMY rule-based Market Entry Strategy generator.

REPLACE LATER WITH: an LLM API call that takes the MSME profile +
market data + score breakdown and generates a tailored strategy in
natural language.
"""

from models.schemas import MSMEInput


def generate_strategy(state: str, recommendation: str, msme: MSMEInput, market: dict) -> dict:
    target = msme.target_customer.upper()

    if recommendation == "EXPAND":
        approach = (
            f"Enter {state} with a full-scale rollout. Demand and purchasing power support "
            f"a direct expansion rather than a limited trial."
        )
    elif recommendation == "PILOT":
        approach = (
            f"Start with a small pilot in {state} (e.g. 1-2 cities) to validate demand and "
            f"logistics before committing the full expansion budget."
        )
    else:
        approach = (
            f"Expansion into {state} is not recommended at this time based on the sample data. "
            f"Consider re-evaluating after addressing the key risks below, or explore other markets."
        )

    if target == "B2C":
        channels = ["Local retail / kirana partnerships", "Quick-commerce & e-commerce listings", "Regional social media marketing"]
    else:
        channels = ["Direct B2B sales outreach", "Distributor / wholesaler partnerships", "Trade fairs and B2B marketplaces"]

    if market["logistics"] < 55:
        channels.append("Consider a local warehousing/fulfilment partner to offset weak logistics")

    if msme.selling_price and market["purchasing_power"] < 55:
        pricing = (
            f"Purchasing power in {state} is below average — consider an entry-level price point "
            f"or smaller pack sizes rather than your current ₹{msme.selling_price} price point."
        )
    else:
        pricing = f"Current price point of ₹{msme.selling_price} appears reasonable for {state}'s purchasing power."

    steps = [
        "Validate demand with a small trial batch or local survey",
        f"Identify 2-3 distribution partners in {state}",
        "Set up basic logistics / fulfilment arrangement",
        "Run a limited marketing campaign to test customer response",
        "Review results after 60-90 days before scaling further",
    ]

    risks = []
    if market["competition"] > 70:
        risks.append("High competition may require differentiated pricing or branding")
    if market["logistics"] < 55:
        risks.append("Transportation costs may erode margins")
    if "budget" in [c.lower() for c in msme.constraints] and msme.expansion_budget < 150_000:
        risks.append("Limited expansion budget may restrict scale of entry")
    if not risks:
        risks.append("No major risks identified in the sample data")

    return {
        "state": state,
        "recommendation": recommendation,
        "target_customer": msme.target_customer,
        "recommended_approach": approach,
        "suggested_channels": channels,
        "pricing_consideration": pricing,
        "initial_launch_steps": steps,
        "key_risks": risks,
    }
