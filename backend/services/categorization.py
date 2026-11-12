"""
Product categorization service using keyword taxonomy and domain heuristics.

Allows user review, correction, and subcategory granularity.
Designed so it can be swapped for an NLP/LLM classifier later without
changing frontend contracts.
"""

from typing import Optional, List, Dict
from models.schemas import CategorizationResult

TAXONOMY = {
    "Food & Beverages": {
        "Packaged Snacks & Savories": ["snack", "chips", "namkeen", "crunch", "wafers", "roasted", "puff", "bites"],
        "Spices, Condiments & Pickles": ["spice", "masala", "pickle", "sauce", "chutney", "seasoning", "condiment"],
        "Beverages, Tea & Coffee": ["tea", "coffee", "juice", "beverage", "drink", "brew", "syrup"],
        "Bakery & Confectionery": ["bakery", "sweet", "biscuit", "cookie", "cake", "chocolate", "mithai"],
        "Dairy & Organic Staples": ["millet", "dairy", "milk", "ghee", "paneer", "grain", "pulse", "flour", "organic", "food"],
    },
    "Textiles & Apparel": {
        "Handloom & Ethnic Wear": ["saree", "handloom", "kurti", "ethnic", "traditional", "silk", "khadi"],
        "Ready-made Garments": ["garment", "shirt", "apparel", "t-shirt", "dress", "trouser", "cloth"],
        "Fabrics & Cotton Goods": ["fabric", "cotton", "linen", "textile", "yarn"],
        "Home Textiles & Furnishings": ["bedsheet", "curtain", "towel", "rug", "cushion"],
    },
    "Handicrafts": {
        "Pottery & Ceramic Decor": ["pottery", "ceramic", "clay", "terracotta", "vase", "planter"],
        "Woodcraft & Metal Art": ["wood", "metal", "carving", "brass", "sculpture", "furniture"],
        "Handmade Decor & Eco-crafts": ["handicraft", "craft", "handmade", "jute", "bamboo", "paper", "art", "decor"],
    },
    "Electronics & Hardware": {
        "Consumer Electronics & Gadgets": ["electronic", "gadget", "device", "audio", "charger", "cable"],
        "Sensors, IoT & Circuits": ["circuit", "sensor", "iot", "microcontroller", "embedded"],
        "Electrical Appliances & Hardware": ["hardware", "appliance", "wire", "switch", "tool", "fixture"],
    },
    "Agriculture & Farm Products": {
        "Seeds, Bio-Inputs & Fertilizers": ["seed", "fertilizer", "pesticide", "compost", "bio", "soil"],
        "Fresh & Processed Farm Goods": ["farm", "crop", "agri", "harvest", "grain", "produce"],
    },
    "Personal Care & Cosmetics": {
        "Ayurvedic & Herbal Skincare": ["ayurved", "herbal", "skincare", "cream", "lotion", "serum", "face"],
        "Bath, Hair & Body Essentials": ["soap", "cosmetic", "shampoo", "hair", "oil", "wash", "beauty"],
    },
    "General Merchandise": {
        "Household & Utility Goods": ["household", "plastic", "container", "kitchen", "cleaning", "box"],
    },
}

CATEGORIES_LIST = list(TAXONOMY.keys())


def get_subcategories_for_category(category: str) -> List[str]:
    sub_dict = TAXONOMY.get(category, {})
    return list(sub_dict.keys()) if sub_dict else ["General"]


def categorize_product(
    product_name: str,
    product_description: str = "",
    user_category: Optional[str] = None,
    user_subcategory: Optional[str] = None,
) -> CategorizationResult:
    """
    Categorizes the product using description keywords, or honors user confirmed category.
    """
    text = f"{product_name} {product_description}".lower()

    # If the user has explicitly selected/confirmed a category
    if user_category and user_category in TAXONOMY:
        subcats = get_subcategories_for_category(user_category)
        matched_sub = user_subcategory if user_subcategory in subcats else subcats[0]

        # Check keyword hits to verify if any matched
        matched_kws = []
        for subcat, kws in TAXONOMY[user_category].items():
            for kw in kws:
                if kw in text and kw not in matched_kws:
                    matched_kws.append(kw)

        return CategorizationResult(
            category=user_category,
            subcategory=matched_sub,
            confidence=0.95,
            matched_keywords=matched_kws or ["User Selected"],
            available_categories=CATEGORIES_LIST,
            available_subcategories=subcats,
        )

    # Keyword detection across all categories
    best_category = "General Merchandise"
    best_subcategory = "Household & Utility Goods"
    best_hits = 0
    best_kws: List[str] = []

    for category, sub_dict in TAXONOMY.items():
        cat_hits = 0
        cat_kws = []
        best_sub_for_cat = list(sub_dict.keys())[0]
        max_sub_hits = 0

        for subcat, keywords in sub_dict.items():
            sub_hits = sum(1 for kw in keywords if kw in text)
            if sub_hits > max_sub_hits:
                max_sub_hits = sub_hits
                best_sub_for_cat = subcat
            for kw in keywords:
                if kw in text and kw not in cat_kws:
                    cat_kws.append(kw)
            cat_hits += sub_hits

        if cat_hits > best_hits:
            best_hits = cat_hits
            best_category = category
            best_subcategory = best_sub_for_cat
            best_kws = cat_kws

    if best_hits == 0:
        return CategorizationResult(
            category="General Merchandise",
            subcategory="Household & Utility Goods",
            confidence=0.55,
            matched_keywords=[],
            available_categories=CATEGORIES_LIST,
            available_subcategories=get_subcategories_for_category("General Merchandise"),
        )

    confidence = min(0.96, round(0.70 + best_hits * 0.08, 2))
    return CategorizationResult(
        category=best_category,
        subcategory=best_subcategory,
        confidence=confidence,
        matched_keywords=best_kws,
        available_categories=CATEGORIES_LIST,
        available_subcategories=get_subcategories_for_category(best_category),
    )
