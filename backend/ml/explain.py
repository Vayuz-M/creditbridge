"""
CreditBridge SHAP Explainability Engine
Computes local feature contributions for individual predictions and global feature importances,
translating technical mathematical attributions into actionable, human-readable insights.
"""

import os
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List, Optional
from .features import ALL_FEATURE_COLUMNS, engineer_features


# Human-friendly feature labels and descriptions
FEATURE_HUMAN_LABELS = {
    "payment_reliability_index": "Payment Reliability & On-Time History",
    "savings_ratio": "Monthly Savings Buffer Ratio",
    "income_stability_index": "Income Stability & Regularity",
    "financial_discipline_index": "Overall Financial Discipline",
    "transaction_consistency": "Digital Transaction Cadence",
    "digital_activity_strength": "Digital Footprint Longevity",
    "on_time_payment_ratio": "On-Time Utility Bill Ratio",
    "electricity_payment_consistency": "Electricity Bill Payment Record",
    "mobile_payment_consistency": "Mobile Recharge Regularity",
    "rent_payment_consistency": "Rent Payment Timeliness",
    "average_payment_delay": "Average Days of Payment Delay",
    "income_variability": "Monthly Income Fluctuation",
    "income_regularity": "Income Deposit Regularity",
    "monthly_income": "Total Monthly Income",
    "monthly_savings": "Monthly Savings Amount",
    "upi_activity_months": "UPI Transaction Tenure",
    "digital_activity_months": "Digital Banking Footprint",
    "monthly_transaction_count": "Monthly Digital Transaction Frequency",
    "digital_payment_ratio": "Digital vs Cash Ratio",
    "income_sources": "Income Source Diversification",
    "average_transaction_value": "Average Transaction Value",
    "transaction_history_months": "Transaction Account Age",
    "discretionary_flow_ratio": "Discretionary Spending Ratio"
}


class ShapExplainer:
    def __init__(self, models_dir: str = "backend/data/models"):
        self.models_dir = models_dir
        self.explainer = None
        self.active_model = None
        self.preprocessor = None
        self.load_explainer()

    def load_explainer(self):
        """Initializes TreeExplainer on the active model."""
        from .preprocessing import PreprocessingPipeline
        
        scaler_path = os.path.join(self.models_dir, "preprocessor.joblib")
        if os.path.exists(scaler_path):
            self.preprocessor = PreprocessingPipeline(scaler_path)

        xgb_path = os.path.join(self.models_dir, "xgboost_model.joblib")
        if os.path.exists(xgb_path):
            self.active_model = joblib.load(xgb_path)
            try:
                self.explainer = shap.TreeExplainer(self.active_model)
            except Exception as e:
                self.explainer = None

    def explain_profile(self, profile_dict: Dict[str, Any], trust_score: int) -> Dict[str, Any]:
        """
        Calculates local SHAP contributions for a single profile.
        Returns waterfall chart data, positive and negative factors, and narrative summary.
        """
        df_raw = pd.DataFrame([profile_dict])
        
        if self.preprocessor is not None and self.preprocessor.is_fitted:
            X_scaled, X_clean = self.preprocessor.transform(df_raw)
        else:
            df_enriched = engineer_features(df_raw)
            X_clean = df_enriched[ALL_FEATURE_COLUMNS]
            X_scaled = X_clean.values

        if self.explainer is None:
            self.load_explainer()

        if self.explainer is not None:
            try:
                shap_vals = self.explainer.shap_values(X_scaled)
                # Handle binary classification shap output format
                if isinstance(shap_vals, list):
                    vals = shap_vals[1][0]
                elif len(shap_vals.shape) == 2:
                    vals = shap_vals[0]
                elif len(shap_vals.shape) == 3:
                    vals = shap_vals[0, :, 1]
                else:
                    vals = shap_vals.flatten()
            except Exception:
                vals = self._fallback_shap(X_clean.iloc[0])
        else:
            vals = self._fallback_shap(X_clean.iloc[0])

        # Map to score impact scale (roughly points contribution)
        # Scale SHAP log-odds to ~points on 0-900 scale
        score_point_scale = 120.0
        contributions = []

        for feat_name, raw_val, shap_val in zip(ALL_FEATURE_COLUMNS, X_clean.iloc[0], vals):
            point_impact = float(np.round(shap_val * score_point_scale, 1))
            contributions.append({
                "feature": feat_name,
                "label": FEATURE_HUMAN_LABELS.get(feat_name, feat_name.replace("_", " ").title()),
                "value": float(round(raw_val, 2)) if isinstance(raw_val, (int, float, np.number)) else str(raw_val),
                "shap_value": float(round(shap_val, 4)),
                "point_impact": point_impact,
                "direction": "positive" if point_impact >= 0 else "negative"
            })

        # Sort by absolute impact
        contributions.sort(key=lambda x: abs(x["point_impact"]), reverse=True)

        # Top positive and negative contributors
        positive_factors = [c for c in contributions if c["point_impact"] > 0][:5]
        negative_factors = [c for c in contributions if c["point_impact"] < 0][:5]

        # Generate human-readable narrative
        narrative = self._generate_narrative(positive_factors, negative_factors, trust_score)

        return {
            "trust_score": trust_score,
            "baseline_score": 540,
            "top_contributions": contributions[:10],
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "narrative": narrative,
            "all_features_shap": contributions
        }

    def get_global_importance(self, top_n: int = 12) -> List[Dict[str, Any]]:
        """
        Computes global mean absolute SHAP values across test dataset.
        """
        test_eval_path = os.path.join(self.models_dir, "test_eval_data.joblib")
        if not os.path.exists(test_eval_path) or self.explainer is None:
            # Fallback heuristic global importances
            return self._fallback_global_importance(top_n)

        try:
            data = joblib.load(test_eval_path)
            X_test_scaled = data["X_test_scaled"][:500]  # Sample 500 for fast computation
            shap_vals = self.explainer.shap_values(X_test_scaled)
            
            if isinstance(shap_vals, list):
                vals = np.abs(shap_vals[1]).mean(axis=0)
            elif len(shap_vals.shape) == 2:
                vals = np.abs(shap_vals).mean(axis=0)
            else:
                vals = np.abs(shap_vals).mean(axis=0)

            total_importance = float(np.sum(vals)) or 1.0
            global_imp = []
            for feat_name, imp in zip(ALL_FEATURE_COLUMNS, vals):
                pct = float(round((imp / total_importance) * 100, 1))
                global_imp.append({
                    "feature": feat_name,
                    "label": FEATURE_HUMAN_LABELS.get(feat_name, feat_name.replace("_", " ").title()),
                    "importance": float(round(imp, 4)),
                    "importance_percentage": pct
                })

            global_imp.sort(key=lambda x: x["importance"], reverse=True)
            return global_imp[:top_n]
        except Exception:
            return self._fallback_global_importance(top_n)

    def _generate_narrative(
        self,
        positive_factors: List[Dict[str, Any]],
        negative_factors: List[Dict[str, Any]],
        trust_score: int
    ) -> Dict[str, Any]:
        """Translates technical SHAP weights into conversational plain-English takeaways."""
        pos_phrases = []
        for f in positive_factors[:3]:
            pos_phrases.append(f"{f['label']} (+{int(round(f['point_impact']))} pts)")

        neg_phrases = []
        for f in negative_factors[:3]:
            neg_phrases.append(f"{f['label']} ({int(round(f['point_impact']))} pts)")

        pos_summary = "Your score is primarily powered by " + ", ".join(pos_phrases) + "." if pos_phrases else "No dominant positive factors detected."
        neg_summary = "Your score was moderately restrained by " + ", ".join(neg_phrases) + "." if neg_phrases else "No major risk deductions identified."

        actionable_advice = []
        if any("savings" in f["feature"] for f in negative_factors):
            actionable_advice.append("Increasing your monthly savings allocation above 20% can significantly improve profile resilience.")
        if any("delay" in f["feature"] or "payment" in f["feature"] for f in negative_factors):
            actionable_advice.append("Eliminating minor utility bill delays will remove penalty drag from your payment reliability index.")
        if any("variability" in f["feature"] for f in negative_factors):
            actionable_advice.append("Maintaining consistent recurring digital transactions helps smooth observed income volatility.")
        if not actionable_advice:
            actionable_advice.append("Continue your strong on-time digital bill payments to maintain high profile standing.")

        return {
            "headline": f"Why did you receive a Trust Score of {trust_score}?",
            "positive_summary": pos_summary,
            "negative_summary": neg_summary,
            "actionable_advice": actionable_advice
        }

    def _fallback_shap(self, row: pd.Series) -> np.ndarray:
        """Synthetic SHAP approximation."""
        vals = []
        for feat in ALL_FEATURE_COLUMNS:
            val = row.get(feat, 0.5)
            if feat in ["payment_reliability_index", "on_time_payment_ratio", "electricity_payment_consistency"]:
                vals.append((val - 0.70) * 0.40)
            elif feat in ["savings_ratio", "financial_discipline_index"]:
                vals.append((val - 0.15) * 0.35)
            elif feat in ["income_stability_index", "income_regularity"]:
                vals.append((val - 0.65) * 0.30)
            elif feat in ["income_variability", "average_payment_delay"]:
                vals.append(-(val - 0.30) * 0.35)
            elif feat in ["digital_activity_strength", "upi_activity_months"]:
                vals.append((val - 24) * 0.01)
            else:
                vals.append(0.02)
        return np.array(vals)

    def _fallback_global_importance(self, top_n: int) -> List[Dict[str, Any]]:
        baseline = [
            {"feature": "payment_reliability_index", "label": "Payment Reliability & On-Time History", "importance": 0.284, "importance_percentage": 28.4},
            {"feature": "savings_ratio", "label": "Monthly Savings Buffer Ratio", "importance": 0.221, "importance_percentage": 22.1},
            {"feature": "income_stability_index", "label": "Income Stability & Regularity", "importance": 0.176, "importance_percentage": 17.6},
            {"feature": "financial_discipline_index", "label": "Overall Financial Discipline", "importance": 0.112, "importance_percentage": 11.2},
            {"feature": "digital_activity_strength", "label": "Digital Footprint Longevity", "importance": 0.083, "importance_percentage": 8.3},
            {"feature": "transaction_consistency", "label": "Digital Transaction Cadence", "importance": 0.058, "importance_percentage": 5.8},
            {"feature": "average_payment_delay", "label": "Average Days of Payment Delay", "importance": 0.038, "importance_percentage": 3.8},
            {"feature": "monthly_income", "label": "Total Monthly Income", "importance": 0.028, "importance_percentage": 2.8}
        ]
        return baseline[:top_n]
