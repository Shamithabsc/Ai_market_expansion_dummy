"""
Loads the dummy market dataset.

REPLACE LATER WITH: a real data pipeline pulling verified government /
industry datasets (e.g. from data.gov.in, Census, GST filings, etc.)
into a proper database instead of a static CSV.
"""

import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "markets.csv")

_cache: pd.DataFrame | None = None


def load_markets() -> pd.DataFrame:
    """Load the markets CSV once and cache it in memory."""
    global _cache
    if _cache is None:
        _cache = pd.read_csv(DATA_PATH)
    return _cache.copy()


def get_market_row(state: str) -> pd.Series | None:
    df = load_markets()
    match = df[df["state"].str.lower() == state.lower()]
    if match.empty:
        return None
    return match.iloc[0]
