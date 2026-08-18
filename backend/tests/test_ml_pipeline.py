"""
Unit & Integration Tests for ML Feature Engineering, Scoring, SHAP and What-If Simulator
"""

import pytest
from ml.features import engineer_features, ALL_FEATURE_COLUMNS
from ml.predict import Predictor
from ml.explain import ShapExplainer


def test_feature_engineering_integrity(sample_financial_profile):
    """Verify feature engineering produces all expected columns without NaNs or infs."""
    features_df = engineer_features(sample_financial_profile)
    assert len(features_df) == 1
    
    for col in ALL_FEATURE_COLUMNS:
        assert col in features_df.columns, f"Missing engineered feature: {col}"
        val = features_df[col].iloc[0]
        assert not (val is None or (isinstance(val, float) and val != val)), f"NaN in feature: {col}"


def test_predictor_bounds():
    """Verify Trust Score is strictly within 300 to 850 across diverse profiles."""
    predictor = Predictor()

    # 1. High-performing profile
    prime_profile = {
        "monthly_income": 80000,
        "income_variability": 0.05,
        "income_regularity": 0.98,
        "income_sources": 3,
        "monthly_transaction_count": 80,
        "average_transaction_value": 850,
        "transaction_consistency": 0.95,
        "digital_payment_ratio": 0.98,
        "electricity_payment_consistency": 0.99,
        "mobile_payment_consistency": 1.0,
        "rent_payment_consistency": 0.98,
        "average_payment_delay": 0.0,
        "on_time_payment_ratio": 0.99,
        "monthly_savings": 25000,
        "upi_activity_months": 48,
        "digital_activity_months": 60,
        "transaction_history_months": 36,
        "age_group": "26-35",
        "gender": "Female",
        "occupation_category": "Salaried"
    }
    prime_res = predictor.predict_profile(prime_profile)
    assert 300 <= prime_res["trust_score"] <= 850
    assert prime_res["trust_score"] >= 700
    assert prime_res["repayment_probability"] > 0.70

    # 2. High-risk profile
    subprime_profile = {
        "monthly_income": 8000,
        "income_variability": 0.55,
        "income_regularity": 0.40,
        "income_sources": 1,
        "monthly_transaction_count": 10,
        "average_transaction_value": 120,
        "transaction_consistency": 0.35,
        "digital_payment_ratio": 0.40,
        "electricity_payment_consistency": 0.45,
        "mobile_payment_consistency": 0.50,
        "rent_payment_consistency": 0.40,
        "average_payment_delay": 20.0,
        "on_time_payment_ratio": 0.40,
        "monthly_savings": 200,
        "upi_activity_months": 6,
        "digital_activity_months": 8,
        "transaction_history_months": 6,
        "age_group": "18-25",
        "gender": "Male",
        "occupation_category": "Gig Economy"
    }
    subprime_res = predictor.predict_profile(subprime_profile)
    assert 300 <= subprime_res["trust_score"] <= 850
    assert subprime_res["trust_score"] < prime_res["trust_score"]
    assert subprime_res["repayment_probability"] < prime_res["repayment_probability"]


def test_shap_explainer_mathematics(sample_financial_profile):
    """Verify TreeSHAP explanation output format, baseline, and feature attributions."""
    predictor = Predictor()
    shap_explainer = ShapExplainer()

    pred = predictor.predict_profile(sample_financial_profile)
    shap_res = shap_explainer.explain_profile(sample_financial_profile, pred["trust_score"])

    assert "trust_score" in shap_res
    assert "baseline_score" in shap_res
    assert "top_contributions" in shap_res
    assert len(shap_res["top_contributions"]) > 0
    assert "narrative" in shap_res
    assert len(shap_res["narrative"]["actionable_advice"]) > 0


def test_assessment_creation_and_history_api(client, user_headers, sample_financial_profile):
    """Test POST /api/assessment and GET /api/assessment/history."""
    # 1. Create Assessment
    create_res = client.post("/api/assessment", json=sample_financial_profile, headers=user_headers)
    assert create_res.status_code == 200
    data = create_res.json()
    assert 300 <= data["trust_score"] <= 850
    assert "factor_ratings" in data
    assert "shap_explanation" in data
    assessment_id = data["id"]

    # 2. Fetch by ID
    get_res = client.get(f"/api/assessment/{assessment_id}", headers=user_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == assessment_id

    # 3. Fetch History
    hist_res = client.get("/api/assessment/history", headers=user_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1


def test_what_if_simulator_api(client, user_headers, sample_financial_profile):
    """Test POST /api/assessment/simulate returns sensible counterfactual delta."""
    modified_features = {
        "on_time_payment_ratio": 0.99,
        "monthly_savings": 15000,
        "average_payment_delay": 0.0
    }
    sim_res = client.post("/api/assessment/simulate", json={
        "baseline_profile": sample_financial_profile,
        "modified_features": modified_features
    }, headers=user_headers)

    assert sim_res.status_code == 200
    data = sim_res.json()
    assert "current_score" in data
    assert "simulated_score" in data
    assert "score_delta" in data
    assert len(data["factor_changes"]) > 0
