"""
CreditBridge Prediction Engine & Trust Score Calculator
Translates model probability output into the official CreditBridge Trust Score (0 to 900)
and evaluates 5 core alternative credit profile dimensions.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from .preprocessing import PreprocessingPipeline
from .features import engineer_features, ALL_FEATURE_COLUMNS


SCORE_BANDS = [
    {"min": 750, "max": 850, "label": "Excellent", "color": "#059669", "tier": "Tier 1: Prime"},
    {"min": 670, "max": 749, "label": "Good", "color": "#0d9488", "tier": "Tier 2: Near-Prime"},
    {"min": 580, "max": 669, "label": "Fair", "color": "#d97706", "tier": "Tier 3: Moderate"},
    {"min": 480, "max": 579, "label": "Developing", "color": "#f59e0b", "tier": "Tier 4: Developing"},
    {"min": 300, "max": 479, "label": "Higher Risk", "color": "#e11d48", "tier": "Tier 5: High Risk"}
]


class Predictor:
    def __init__(self, models_dir: str = "backend/data/models"):
        self.models_dir = models_dir
        self.active_model = None
        self.active_model_name = "XGBoost"
        self.model_version = "v1.0"
        self.preprocessor = None
        self.load_active_model()

    def load_active_model(self, model_key: Optional[str] = None):
        """
        Loads the specified or default active model and fitted preprocessor.
        """
        scaler_path = os.path.join(self.models_dir, "preprocessor.joblib")
        if os.path.exists(scaler_path):
            self.preprocessor = PreprocessingPipeline(scaler_path)

        metadata_path = os.path.join(self.models_dir, "models_metadata.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                meta = json.load(f)
                target_key = model_key or meta.get("active_model", "xgboost")
                model_info = meta.get("models", {}).get(target_key, {})
                filename = model_info.get("filename", f"{target_key}_model.joblib")
                model_file = os.path.join(self.models_dir, filename)
                if os.path.exists(model_file):
                    self.active_model = joblib.load(model_file)
                    self.active_model_name = model_info.get("algorithm", target_key.upper())
                    self.model_version = model_info.get("version", "v1.0")

    def predict_profile(self, profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs prediction pipeline on single financial profile dict.
        Returns Trust Score (0-900), probabilities, band, and factor ratings.
        """
        df_raw = pd.DataFrame([profile_dict])
        
        # Preprocess features
        if self.preprocessor is not None and self.preprocessor.is_fitted:
            X_scaled, X_clean = self.preprocessor.transform(df_raw)
        else:
            df_enriched = engineer_features(df_raw)
            X_clean = df_enriched[ALL_FEATURE_COLUMNS]
            X_scaled = X_clean.values

        # Predict probability
        if self.active_model is not None:
            # Predict class 1 = positive repayment
            proba = float(self.active_model.predict_proba(X_scaled)[0, 1])
        else:
            # Fallback deterministic baseline if model file not yet loaded
            proba = self._fallback_score(X_clean.iloc[0])

        repayment_probability = float(np.clip(proba, 0.01, 0.99))
        risk_probability = float(np.round(1.0 - repayment_probability, 4))

        # Convert to 300-850 CreditBridge Trust Score
        trust_score = int(np.round(300 + repayment_probability * 550))
        trust_score = max(300, min(850, trust_score))

        # Assign Score Band
        score_band = "Higher Risk"
        band_tier = "Tier 5: High Risk"
        band_color = "#ff6b6b"
        for band in SCORE_BANDS:
            if band["min"] <= trust_score <= band["max"]:
                score_band = band["label"]
                band_tier = band["tier"]
                band_color = band["color"]
                break

        # Calculate 5-Factor Profile Strengths
        row = X_clean.iloc[0]
        factor_breakdown = self._compute_factor_ratings(row)

        return {
            "trust_score": trust_score,
            "score_band": score_band,
            "band_tier": band_tier,
            "band_color": band_color,
            "repayment_probability": round(repayment_probability, 4),
            "risk_probability": round(risk_probability, 4),
            "model_version": self.model_version,
            "algorithm": self.active_model_name,
            "factor_ratings": factor_breakdown,
            "raw_features": {k: float(v) if isinstance(v, (int, float, np.number)) else v for k, v in row.items()}
        }

    def _compute_factor_ratings(self, row: pd.Series) -> Dict[str, Dict[str, Any]]:
        """
        Computes 5 alternative credit factor dimensions with scores and status tags.
        """
        # 1. Payment Reliability
        pr_val = float(row.get("payment_reliability_index", 0.75))
        pr_status = "Exceptional" if pr_val >= 0.88 else "Strong" if pr_val >= 0.72 else "Moderate" if pr_val >= 0.50 else "Needs Improvement"
        
        # 2. Income Stability
        is_val = float(row.get("income_stability_index", 0.70))
        is_status = "Exceptional" if is_val >= 0.85 else "Strong" if is_val >= 0.68 else "Moderate" if is_val >= 0.48 else "Needs Improvement"

        # 3. Savings Discipline
        sr_val = float(row.get("savings_ratio", 0.15))
        sr_score = min(1.0, sr_val / 0.35)
        sr_status = "Exceptional" if sr_val >= 0.28 else "Strong" if sr_val >= 0.18 else "Moderate" if sr_val >= 0.08 else "Needs Improvement"

        # 4. Transaction Consistency
        tc_val = float(row.get("transaction_consistency", 0.75))
        tc_status = "Exceptional" if tc_val >= 0.85 else "Strong" if tc_val >= 0.70 else "Moderate" if tc_val >= 0.50 else "Needs Improvement"

        # 5. Digital Activity
        da_val = float(row.get("digital_activity_strength", 0.70))
        da_status = "Exceptional" if da_val >= 0.80 else "Strong" if da_val >= 0.60 else "Moderate" if da_val >= 0.40 else "Needs Improvement"

        return {
            "payment_reliability": {
                "name": "Payment Reliability",
                "score": round(pr_val * 100, 1),
                "status": pr_status,
                "weight": "30%",
                "description": "Consistency in utility bills, mobile recharges, and on-time rent payment"
            },
            "income_stability": {
                "name": "Income Stability",
                "score": round(is_val * 100, 1),
                "status": is_status,
                "weight": "25%",
                "description": "Regularity of monthly deposits and income source diversification"
            },
            "savings_discipline": {
                "name": "Savings Discipline",
                "score": round(sr_score * 100, 1),
                "status": sr_status,
                "weight": "20%",
                "description": f"Savings buffer ratio ({round(sr_val * 100, 1)}% of monthly earnings saved)"
            },
            "transaction_consistency": {
                "name": "Transaction Consistency",
                "score": round(tc_val * 100, 1),
                "status": tc_status,
                "weight": "15%",
                "description": "Steady transaction rhythm across digital and UPI channels"
            },
            "digital_activity": {
                "name": "Digital Activity Footprint",
                "score": round(da_val * 100, 1),
                "status": da_status,
                "weight": "10%",
                "description": "Longevity and digital payment adoption history"
            }
        }

    def _fallback_score(self, row: pd.Series) -> float:
        """Deterministic baseline fallback."""
        score = (
            row.get("payment_reliability_index", 0.7) * 0.35 +
            min(1.0, row.get("savings_ratio", 0.2) * 3.0) * 0.25 +
            row.get("income_stability_index", 0.7) * 0.20 +
            row.get("transaction_consistency", 0.7) * 0.10 +
            row.get("digital_activity_strength", 0.7) * 0.10
        )
        return float(np.clip(score, 0.05, 0.95))
