"""
CreditBridge Feature Engineering Pipeline
Computes high-signal composite indicators from alternative financial inputs.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union


# List of raw predictive features input by user
RAW_NUMERIC_FEATURES = [
    "monthly_income",
    "income_variability",
    "income_regularity",
    "income_sources",
    "monthly_transaction_count",
    "average_transaction_value",
    "transaction_consistency",
    "digital_payment_ratio",
    "electricity_payment_consistency",
    "mobile_payment_consistency",
    "rent_payment_consistency",
    "average_payment_delay",
    "on_time_payment_ratio",
    "monthly_savings",
    "savings_ratio",
    "upi_activity_months",
    "digital_activity_months",
    "transaction_history_months"
]

# Engineered composite features
ENGINEERED_FEATURES = [
    "payment_reliability_index",
    "income_stability_index",
    "digital_activity_strength",
    "financial_discipline_index",
    "discretionary_flow_ratio"
]

ALL_FEATURE_COLUMNS = RAW_NUMERIC_FEATURES + ENGINEERED_FEATURES


def engineer_features(data: Union[pd.DataFrame, Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw inputs into an enriched DataFrame with composite behavioral features.
    Accepts either a single record dictionary or a DataFrame of multiple records.
    """
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = data.copy()

    # Ensure required raw columns exist with sane defaults
    for col in RAW_NUMERIC_FEATURES:
        if col not in df.columns:
            if col == "monthly_income":
                df[col] = 30000.0
            elif col == "income_sources":
                df[col] = 1
            elif col == "savings_ratio":
                if "monthly_savings" in df.columns and "monthly_income" in df.columns:
                    df[col] = df["monthly_savings"] / np.maximum(df["monthly_income"], 1.0)
                else:
                    df[col] = 0.15
            elif "consistency" in col or "ratio" in col:
                df[col] = 0.75
            elif "months" in col:
                df[col] = 24
            elif col == "average_payment_delay":
                df[col] = 2.0
            else:
                df[col] = 0.0

    # Ensure savings_ratio is accurately aligned
    df["savings_ratio"] = np.clip(
        df["monthly_savings"] / np.maximum(df["monthly_income"], 1.0),
        0.0,
        0.95
    )

    # 1. Payment Reliability Index (0.0 to 1.0)
    # Weighted average of bill consistency minus penalty for payment delays
    raw_bill_consistency = (
        df["electricity_payment_consistency"] * 0.30 +
        df["mobile_payment_consistency"] * 0.25 +
        df["rent_payment_consistency"] * 0.25 +
        df["on_time_payment_ratio"] * 0.20
    )
    delay_penalty = np.clip(df["average_payment_delay"] / 30.0, 0.0, 1.0) * 0.35
    df["payment_reliability_index"] = np.clip(raw_bill_consistency - delay_penalty, 0.05, 1.0)

    # 2. Income Stability Index (0.0 to 1.0)
    # Combines regularity, inverse variability, and multi-source diversification buffer
    source_buffer = np.clip((df["income_sources"] - 1) * 0.05, 0.0, 0.15)
    df["income_stability_index"] = np.clip(
        (df["income_regularity"] * 0.55 + (1.0 - df["income_variability"]) * 0.45) + source_buffer,
        0.05,
        1.0
    )

    # 3. Digital Activity Strength (0.0 to 1.0)
    # Combines tenure of digital payments with ongoing transaction cadence
    activity_age_norm = np.clip(df["digital_activity_months"] / 60.0, 0.05, 1.0)
    upi_age_norm = np.clip(df["upi_activity_months"] / 48.0, 0.05, 1.0)
    df["digital_activity_strength"] = np.clip(
        activity_age_norm * 0.35 +
        upi_age_norm * 0.35 +
        df["transaction_consistency"] * 0.20 +
        df["digital_payment_ratio"] * 0.10,
        0.05,
        1.0
    )

    # 4. Discretionary Cash Flow Ratio
    # Monthly spending capacity relative to income
    estimated_monthly_spend = df["monthly_transaction_count"] * df["average_transaction_value"]
    df["discretionary_flow_ratio"] = np.clip(
        estimated_monthly_spend / np.maximum(df["monthly_income"], 1.0),
        0.05,
        1.5
    )

    # 5. Financial Discipline Index (0.0 to 1.0)
    # Holistically merges savings habit, payment timeliness, and digital reliability
    df["financial_discipline_index"] = np.clip(
        df["savings_ratio"] * 2.2 * 0.35 +
        df["payment_reliability_index"] * 0.40 +
        df["income_stability_index"] * 0.25,
        0.05,
        1.0
    )

    return df


def extract_feature_vector(df_enriched: pd.DataFrame) -> pd.DataFrame:
    """
    Returns only the standardized feature columns required for ML model training and inference.
    """
    return df_enriched[ALL_FEATURE_COLUMNS]
