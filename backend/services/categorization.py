"""
DUMMY product categorization using keyword matching.

REPLACE LATER WITH: an NLP/LLM classifier (e.g. a fine-tuned text
classification model, or a call to an LLM API) that takes the product
name + description and returns a category + confidence.

The function signature below is intentionally kept generic so that
swapping the implementation does not require changes anywhere else
in the codebase.
"""

from models.schemas import CategorizationResult

# Very small keyword -> category lookup table for the prototype.
KEYWORD_MAP = {
    "Food & Beverages": [
        "snack", "food", "millet", "spice", "tea", "coffee", "juice",
        "pickle", "sweet", "bakery", "dairy", "beverage", "namkeen",
    ],
    "Textiles & Apparel": [
        "textile", "fabric", "cloth", "garment", "saree", "apparel",
        "shirt", "handloom", "cotton",
    ],
    "Handicrafts": [
        "handicraft", "craft", "pottery", "wood", "art", "decor", "handmade",
    ],
    "Electronics & Hardware": [
        "electronic", "device", "gadget", "hardware", "circuit", "sensor",
    ],
    "Agriculture & Farm Products": [
        "seed", "fertilizer", "farm", "agri", "crop", "organic",
    ],
    "Personal Care & Cosmetics": [
        "soap", "cosmetic", "skincare", "beauty", "shampoo", "ayurved",
    ],
}

DEFAULT_CATEGORY = "General Merchandise"


def categorize_product(product_name: str, product_description: str = "") -> CategorizationResult:
    text = f"{product_name} {product_description}".lower()

    best_category = DEFAULT_CATEGORY
    best_hits = 0

    for category, keywords in KEYWORD_MAP.items():
        hits = sum(1 for kw in keywords if kw in text)
        if hits > best_hits:
            best_hits = hits
            best_category = category

    if best_hits == 0:
        # No keyword matched — low-confidence default category.
        return CategorizationResult(category=DEFAULT_CATEGORY, confidence=0.55)

    # Simple dummy confidence heuristic: more keyword hits -> higher confidence.
    confidence = min(0.95, 0.7 + best_hits * 0.1)
    return CategorizationResult(category=best_category, confidence=round(confidence, 2))
