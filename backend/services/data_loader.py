"""
Robust Data Loader for Synthetic MSME Market Dataset.

Supports:
  - Excel (.xlsx) via built-in XML/ZIP streaming or openpyxl
  - CSV (.csv) with high-speed Pandas loading
  - Data quality validation (range clipping, name normalization, null checks)
  - Category-aware state aggregation for all 36 Indian States & UTs
  - Full transparency metadata reporting
"""

import os
import zipfile
import xml.etree.ElementTree as ET
from typing import Optional, Dict, Any, List, Tuple
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
XLSX_PATH = os.path.join(DATA_DIR, "msme_market_dataset.xlsx")
CSV_PATH = os.path.join(DATA_DIR, "msme_market_dataset.csv")
CSV_1000_PATH = os.path.join(DATA_DIR, "msme_market_dataset_1000.csv")
BACKUP_PATH = os.path.join(DATA_DIR, "markets_backup_dummy.csv")

# Standard category taxonomy mapping from MSME input to dataset categories
CATEGORY_MAP = {
    "food & beverages": "Packaged Foods",
    "packaged foods": "Packaged Foods",
    "food": "Packaged Foods",
    "millet snacks": "Packaged Foods",
    "agriculture & farm products": "Packaged Foods",
    "textiles & apparel": "Textiles & Apparel",
    "textiles": "Textiles & Apparel",
    "apparel": "Textiles & Apparel",
    "handicrafts": "Handicrafts & Gifts",
    "handicrafts & gifts": "Handicrafts & Gifts",
    "personal care & cosmetics": "Personal Care",
    "personal care": "Personal Care",
    "cosmetics": "Personal Care",
    "home & kitchen goods": "Home & Kitchen Goods",
    "home & kitchen": "Home & Kitchen Goods",
    "general merchandise": "Home & Kitchen Goods",
    "retail/office supplies": "Retail/Office Supplies",
    "electronics & hardware": "Retail/Office Supplies",
}

# Column mappings from raw dataset to unified internal schema
COLUMN_MAPPING = {
    "Market_State_UT": "state",
    "Region": "region",
    "Product_Category": "category",
    "Demand_Index_synthetic_0_100": "demand",
    "Growth_Score_synthetic_0_100": "market_growth",
    "Competition_Index_synthetic_0_100": "competition",
    "Purchasing_Power_Index_synthetic_0_100": "purchasing_power",
    "Logistics_Suitability_Index_synthetic_0_100": "logistics",
    "Market_Access_Index_synthetic_0_100": "accessibility",
    "NSDP_pc_current_2021_22_INR_official_fallback": "nsdp_per_capita",
    "Competitor_Count_Estimated_synthetic": "competitor_count",
    "Competitor_Price_Average_INR_synthetic": "competitor_price_avg",
    "Estimated_Transport_Cost_Per_Unit_INR_synthetic": "transport_cost_per_unit",
    "Average_Transit_Time_Hours_synthetic": "avg_transit_hours",
    "Estimated_Market_Entry_Cost_INR_synthetic": "market_entry_cost",
    "Estimated_Monthly_Operating_Cost_INR_synthetic": "monthly_operating_cost",
    "Synthetic_Record_ID": "record_id",
    "Data_Type": "data_type",
}

_raw_cache: Optional[pd.DataFrame] = None
_state_cache: Dict[str, pd.DataFrame] = {}


def _parse_xlsx_sheet(xlsx_path: str, target_sheet: str = "Synthetic_1000") -> pd.DataFrame:
    """Dependency-free Excel reader using Python standard library zipfile and XML parsing."""
    with zipfile.ZipFile(xlsx_path, "r") as z:
        wb_xml = z.read("xl/workbook.xml")
        wb_tree = ET.fromstring(wb_xml)
        ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

        sheet_idx = None
        for i, s in enumerate(wb_tree.findall(".//main:sheet", ns), 1):
            if s.attrib.get("name") == target_sheet:
                sheet_idx = i
                break

        if sheet_idx is None:
            sheet_idx = 1

        sheet_xml = z.read(f"xl/worksheets/sheet{sheet_idx}.xml")
        root = ET.fromstring(sheet_xml)

        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss_xml = z.read("xl/sharedStrings.xml")
            ss_tree = ET.fromstring(ss_xml)
            for si in ss_tree.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
                t = si.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
                shared_strings.append(t.text if t is not None else "")

        rows_data = []
        for row in root.findall(".//main:row", ns):
            row_dict = {}
            for c in row.findall("main:c", ns):
                col_ref = c.attrib.get("r")
                col_letter = "".join([ch for ch in col_ref if ch.isalpha()])
                t = c.attrib.get("t")
                val_el = c.find("main:v", ns)
                is_el = c.find("main:is/main:t", ns)
                val = ""
                if is_el is not None and is_el.text:
                    val = is_el.text
                elif val_el is not None and val_el.text:
                    if t == "s":
                        val = shared_strings[int(val_el.text)]
                    else:
                        val = val_el.text
                row_dict[col_letter] = val
            rows_data.append(row_dict)

        col_map = {col: name for col, name in rows_data[0].items()}
        records = [{col_map[k]: r.get(k, "") for k in col_map} for r in rows_data[1:]]
        return pd.DataFrame(records)


def load_raw_dataset(force_reload: bool = False) -> pd.DataFrame:
    """
    Loads the full raw synthetic dataset.
    Prioritizes CSV if cached for speed, falls back to XLSX.
    """
    global _raw_cache
    if _raw_cache is not None and not force_reload:
        return _raw_cache.copy()

    # Try loading from CSV first
    target_csv = CSV_PATH if os.path.exists(CSV_PATH) else CSV_1000_PATH
    if os.path.exists(target_csv) and not force_reload:
        df = pd.read_csv(target_csv)
    elif os.path.exists(XLSX_PATH):
        try:
            df = pd.read_excel(XLSX_PATH, sheet_name="Synthetic_1000")
        except Exception:
            df = _parse_xlsx_sheet(XLSX_PATH, "Synthetic_1000")

        # Save CSV copy for fast subsequent reads
        try:
            df.to_csv(CSV_PATH, index=False)
        except Exception:
            pass
    elif os.path.exists(BACKUP_PATH):
        df = pd.read_csv(BACKUP_PATH)
    else:
        raise FileNotFoundError("Could not find any synthetic market dataset in backend/data/")

    # Data Quality Cleaning
    df["Market_State_UT"] = df["Market_State_UT"].astype(str).str.strip()
    if "Product_Category" in df.columns:
        df["Product_Category"] = df["Product_Category"].astype(str).str.strip()

    # Ensure numeric columns are properly parsed & bounded to 0-100
    numeric_index_cols = [
        "Demand_Index_synthetic_0_100",
        "Growth_Score_synthetic_0_100",
        "Competition_Index_synthetic_0_100",
        "Purchasing_Power_Index_synthetic_0_100",
        "Logistics_Suitability_Index_synthetic_0_100",
        "Market_Access_Index_synthetic_0_100",
    ]

    for col in numeric_index_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(50.0).clip(0.0, 100.0)

    # Optional operational columns
    op_cols = [
        "Competitor_Count_Estimated_synthetic",
        "Competitor_Price_Average_INR_synthetic",
        "Estimated_Transport_Cost_Per_Unit_INR_synthetic",
        "Average_Transit_Time_Hours_synthetic",
        "Estimated_Market_Entry_Cost_INR_synthetic",
        "Estimated_Monthly_Operating_Cost_INR_synthetic",
        "NSDP_pc_current_2021_22_INR_official_fallback",
    ]
    for col in op_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0).clip(lower=0.0)

    _raw_cache = df
    return _raw_cache.copy()


def load_markets(category: Optional[str] = None) -> pd.DataFrame:
    """
    Main entry point for market scoring.
    Returns a DataFrame containing one row per Indian State (all 36 States/UTs),
    calibrated to the requested category (or general aggregate).
    """
    global _state_cache
    cat_key = (category or "all").lower().strip()
    if cat_key in _state_cache:
        return _state_cache[cat_key].copy()

    raw_df = load_raw_dataset()

    # Map category to dataset taxonomy
    matched_dataset_cat = None
    if category:
        clean_cat = category.lower().strip()
        matched_dataset_cat = CATEGORY_MAP.get(clean_cat)
        if not matched_dataset_cat:
            # Check partial substring matches
            for k, v in CATEGORY_MAP.items():
                if k in clean_cat or clean_cat in k:
                    matched_dataset_cat = v
                    break

    # Filter by category if matched
    if matched_dataset_cat and "Product_Category" in raw_df.columns:
        cat_slice = raw_df[raw_df["Product_Category"] == matched_dataset_cat]
        if cat_slice.empty:
            cat_slice = raw_df
    else:
        cat_slice = raw_df

    # Aggregate state metrics across all 36 States/UTs
    agg_rules = {
        "Demand_Index_synthetic_0_100": "mean",
        "Growth_Score_synthetic_0_100": "mean",
        "Competition_Index_synthetic_0_100": "mean",
        "Purchasing_Power_Index_synthetic_0_100": "mean",
        "Logistics_Suitability_Index_synthetic_0_100": "mean",
        "Market_Access_Index_synthetic_0_100": "mean",
    }

    # Add optional operational indicators if present
    for op in [
        "Region",
        "Competitor_Count_Estimated_synthetic",
        "Competitor_Price_Average_INR_synthetic",
        "Estimated_Transport_Cost_Per_Unit_INR_synthetic",
        "Average_Transit_Time_Hours_synthetic",
        "Estimated_Market_Entry_Cost_INR_synthetic",
        "Estimated_Monthly_Operating_Cost_INR_synthetic",
        "NSDP_pc_current_2021_22_INR_official_fallback",
    ]:
        if op in cat_slice.columns:
            agg_rules[op] = "first" if op == "Region" else "mean"

    aggregated = cat_slice.groupby("Market_State_UT").agg(agg_rules).reset_index()

    # Rename to internal schema
    rename_dict = {orig: COLUMN_MAPPING[orig] for orig in agg_rules.keys() if orig in COLUMN_MAPPING}
    rename_dict["Market_State_UT"] = "state"
    final_df = aggregated.rename(columns=rename_dict)

    # --- Gap-fill: some states may have no records for a specific category.
    # Fall back to their general-aggregate row so every API call always
    # returns exactly 36 States/UTs regardless of category slice coverage.
    all_states_in_raw = sorted(raw_df["Market_State_UT"].unique().tolist())
    covered_states = set(final_df["state"].tolist())
    missing_states = [s for s in all_states_in_raw if s not in covered_states]

    if missing_states:
        # Build a general (all-category) aggregate for the missing states
        general_agg = raw_df[raw_df["Market_State_UT"].isin(missing_states)].groupby("Market_State_UT").agg(agg_rules).reset_index()
        general_df = general_agg.rename(columns=rename_dict)
        general_df["_gap_filled"] = True  # transparent flag (not surfaced in API)
        final_df = pd.concat([final_df, general_df], ignore_index=True)

    # Round core index indicators to 1 decimal place
    for c in ["demand", "market_growth", "competition", "purchasing_power", "logistics", "accessibility"]:
        if c in final_df.columns:
            final_df[c] = final_df[c].round(1)

    # Attach matched category metadata
    final_df["matched_category"] = matched_dataset_cat or "General Multi-Category"

    _state_cache[cat_key] = final_df
    return final_df.copy()


def get_market_row(state: str, category: Optional[str] = None) -> Optional[pd.Series]:
    df = load_markets(category)
    match = df[df["state"].str.lower() == state.lower()]
    if match.empty:
        return None
    return match.iloc[0]


def get_dataset_metadata() -> Dict[str, Any]:
    """Returns transparent summary metadata for UI and auditing."""
    raw = load_raw_dataset()
    states = sorted(raw["Market_State_UT"].unique().tolist())
    categories = sorted(raw["Product_Category"].unique().tolist()) if "Product_Category" in raw.columns else []

    # Calculate data completeness
    total_cells = raw.size
    null_cells = raw.isna().sum().sum()
    completeness = round(((total_cells - null_cells) / total_cells) * 100, 2)

    return {
        "dataset_name": "Synthetic MSME Market Expansion Dataset (2024–25)",
        "dataset_type": "Synthetic Benchmark",
        "source_format": "Excel (.xlsx) & Cached CSV (.csv)",
        "total_records": len(raw),
        "states_covered_count": len(states),
        "states_covered": states,
        "available_categories_count": len(categories),
        "available_categories": categories,
        "completeness_percentage": completeness,
        "missing_indicators": [],
        "mapped_dimensions": {
            "Demand": "Demand_Index_synthetic_0_100 (30% weight)",
            "Market Growth": "Growth_Score_synthetic_0_100 (15% weight)",
            "Competition": "Competition_Index_synthetic_0_100 (Inverted, 15% weight)",
            "Purchasing Power": "Purchasing_Power_Index_synthetic_0_100 (15% weight)",
            "Logistics": "Logistics_Suitability_Index_synthetic_0_100 (15% weight)",
            "Market Accessibility": "Market_Access_Index_synthetic_0_100 (10% weight)",
        },
        "disclaimer": "This synthetic dataset is calibrated for demonstration and academic evaluation. All values are synthetic and must not be cited as official Census or RBI data.",
    }
