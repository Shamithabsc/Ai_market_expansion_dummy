"""
Rule-based Market Entry Strategy generator.

Synthesizes tailored, actionable market penetration plans based on the
MSME profile, state factor indices, and expansion budget allocation.
Clearly marked as a deterministic heuristic engine.
"""

from typing import List, Dict, Any
from models.schemas import MSMEInput, BudgetItem


def generate_budget_allocation(budget: float, target_customer: str, logistics_score: float) -> List[BudgetItem]:
    """
    Computes a realistic initial investment allocation tailored to the MSME's expansion budget.
    """
    total = max(10_000.0, float(budget))

    if target_customer.upper() == "B2C":
        # B2C focuses more on consumer trial, retail placement, and local buzz
        freight_pct = 25 if logistics_score < 60 else 18
        marketing_pct = 32
        trade_margin_pct = 28 if logistics_score < 60 else 35
        contingency_pct = 100 - (freight_pct + marketing_pct + trade_margin_pct)

        return [
            BudgetItem(
                category="Retail Placement & Trade Schemes",
                percentage=trade_margin_pct,
                amount=round(total * (trade_margin_pct / 100), 2),
                rationale="Introductory retailer margins, kirana shelf placement fees, and distributor incentive programs.",
            ),
            BudgetItem(
                category="Hyperlocal Consumer Marketing & Sampling",
                percentage=marketing_pct,
                amount=round(total * (marketing_pct / 100), 2),
                rationale="Targeted regional social ads, in-store product tasting / sampling stations, and localized banners.",
            ),
            BudgetItem(
                category="Initial Logistics & Warehousing Buffer",
                percentage=freight_pct,
                amount=round(total * (freight_pct / 100), 2),
                rationale="First-mile to hub transport buffer, regional 3PL consolidation, and damage insurance.",
            ),
            BudgetItem(
                category="Working Capital & Regulatory Contingency",
                percentage=contingency_pct,
                amount=round(total * (contingency_pct / 100), 2),
                rationale="FSSAI / GST interstate compliance, delayed receivables buffer, and emergency re-order liquidity.",
            ),
        ]
    else:
        # B2B focuses on institutional trade fairs, distributor credit terms, and direct outreach
        return [
            BudgetItem(
                category="Distributor Terms & Credit Buffer",
                percentage=38,
                amount=round(total * 0.38, 2),
                rationale="Working capital to support 30-day dealer credit cycles and bulk volume rebates.",
            ),
            BudgetItem(
                category="Direct B2B Sales & Trade Engagement",
                percentage=27,
                amount=round(total * 0.27, 2),
                rationale="Regional trade expo booths, targeted distributor catalog outreach, and B2B marketplace listings.",
            ),
            BudgetItem(
                category="Bulk Freight & Regional Staging Hub",
                percentage=20,
                amount=round(total * 0.20, 2),
                rationale="Full-truckload (FTL) / part-truckload (PTL) shipping contracts and regional consignment storage.",
            ),
            BudgetItem(
                category="Commercial Legal & Contract Contingency",
                percentage=15,
                amount=round(total * 0.15, 2),
                rationale="Vendor agreement notarization, state tax documentation, and sample trial shipments.",
            ),
        ]


def generate_strategy(state: str, recommendation: str, msme: MSMEInput, market: dict) -> dict:
    target = msme.target_customer.upper()
    budget = float(msme.expansion_budget)
    logistics = market.get("logistics", 70.0)
    purchasing = market.get("purchasing_power", 70.0)
    competition = market.get("competition", 50.0)

    # 1. Recommended Approach
    if recommendation == "EXPAND":
        approach = (
            f"Execute a confident, direct market expansion in {state}. High consumer demand and strong regional purchasing power "
            f"support full-scale distribution rather than an overly timid launch. Deploy marketing and stock 10-15 key retail/wholesale nodes simultaneously."
        )
    elif recommendation == "PILOT":
        approach = (
            f"Initiate a controlled, 90-day pilot test in 1–2 tier-1 or tier-2 hubs within {state} (such as the capital or industrial hub). "
            f"Validate actual customer repeat-purchase rates and logistics turnaround before allocating the remainder of your ₹{budget:,.0f} budget."
        )
    else:
        approach = (
            f"Direct commercial launch in {state} is currently high-risk based on benchmark metrics. Saturated competition or "
            f"transit hurdles would disproportionately strain your capital. Prioritize higher-ranking neighboring markets first."
        )

    # 2. Suggested Channels
    if target == "B2C":
        channels = [
            f"Neighborhood retail & local grocery (Kirana) networks in top urban districts of {state}",
            "Regional quick-commerce dark stores (Zepto/Blinkit/Instamart hubs) for high velocity",
            "State-targeted social media reels & regional language influencer sampling",
        ]
    else:
        channels = [
            f"Regional master distributors with established supply lines across {state}",
            "Direct institutional outreach to enterprise buyers, hotels/restaurants, or industrial clients",
            "Authorized presence on verified B2B trade platforms (IndiaMART/Udaan)",
        ]

    if logistics < 55:
        channels.append(f"Dedicated 3PL micro-warehouse tie-up near {state}'s central transport junction to buffer weak transit")

    # 3. Pricing Considerations
    if msme.selling_price and purchasing < 55:
        pricing = (
            f"Purchasing power index in {state} ({purchasing}/100) is conservative. While your base price of ₹{msme.selling_price:,.0f} "
            f"remains your flagship, introduce trial sachets, smaller SKUs, or introductory 10–15% promotional trade discounts to accelerate first trial."
        )
    elif purchasing >= 75:
        pricing = (
            f"Strong consumer purchasing power in {state} ({purchasing}/100) readily absorbs your ₹{msme.selling_price:,.0f} price point. "
            f"Maintain premium margin integrity while emphasizing superior packaging, hygiene, and authenticity."
        )
    else:
        pricing = (
            f"Unit pricing of ₹{msme.selling_price:,.0f} aligns well with median state income benchmarks. "
            f"Offer volume bundling (e.g. Buy 2 Get 1 or family multi-packs) to boost average basket value."
        )

    # 4. Phased Launch Roadmap
    steps = [
        f"Stage 1 (Days 1–15): Dispatch 100 test sample kits to verified distributors and key retailers in {state}.",
        f"Stage 2 (Days 16–30): Finalize commercial terms with 2 primary distribution partners and lock in initial credit cycle of 15–21 days.",
        f"Stage 3 (Days 31–45): Stock the first commercial inventory batch ({min(1500, int(msme.production_capacity * 0.3))} units) in the regional staging hub.",
        f"Stage 4 (Days 46–75): Launch regional point-of-sale displays and localized promotional campaigns to drive initial retail off-take.",
        f"Stage 5 (Days 76–90): Audit re-order velocity, return-to-origin (RTO) rates, and customer feedback before scaling up monthly allocations.",
    ]

    # 5. Key Risks
    risks = []
    if competition > 70:
        risks.append(f"Entrenched legacy brands in {state} (Competition: {competition}/100) may react with temporary price cuts.")
    if logistics < 55:
        risks.append(f"Interstate transit time from your home base ({msme.current_state}) to {state} may risk stockouts unless a local buffer is maintained.")
    if budget < 150_000:
        risks.append(f"Lean expansion budget (₹{budget:,.0f}) leaves little room for distributor payment defaults; enforce strict credit limits.")
    if not risks:
        risks.append(f"Primary operational risk is slow distributor onboarding when entering {state} from {msme.current_state}; maintain direct oversight during the first 60 days.")

    # 6. Budget Allocation
    budget_allocation = generate_budget_allocation(budget, target, logistics)

    return {
        "state": state,
        "recommendation": recommendation,
        "target_customer": msme.target_customer,
        "recommended_approach": approach,
        "suggested_channels": channels,
        "pricing_consideration": pricing,
        "initial_launch_steps": steps,
        "key_risks": risks,
        "budget_allocation": [item.dict() for item in budget_allocation],
        "is_rule_based": True,
    }
