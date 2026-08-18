"""
Unit & Integration Tests for Admin Portal, MLOps, and Model Governance
"""

import pytest


def test_admin_rbac_protection(client, user_headers):
    """Verify standard users cannot access admin endpoints (RBAC)."""
    res = client.get("/api/admin/dashboard", headers=user_headers)
    assert res.status_code == 403


def test_admin_dashboard(client, admin_headers):
    """Test GET /api/admin/dashboard."""
    res = client.get("/api/admin/dashboard", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "total_users" in data["metrics"]
    assert "active_model" in data["metrics"]


def test_admin_models_and_activation(client, admin_headers):
    """Test GET /api/admin/models and POST /api/admin/models/activate."""
    # 1. Fetch models
    res = client.get("/api/admin/models", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "models" in data
    assert "xgboost" in data["models"]
    assert "lightgbm" in data["models"]

    # 2. Switch model
    switch_res = client.post("/api/admin/models/activate", json={
        "model_key": "lightgbm"
    }, headers=admin_headers)
    assert switch_res.status_code == 200
    assert "activated" in switch_res.json()["message"].lower()

    # 3. Switch back to xgboost
    switch_back = client.post("/api/admin/models/activate", json={
        "model_key": "xgboost"
    }, headers=admin_headers)
    assert switch_back.status_code == 200


def test_admin_datasets_stats(client, admin_headers):
    """Test GET /api/admin/datasets."""
    res = client.get("/api/admin/datasets", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_records" in data
    assert data["total_records"] > 0
    assert "feature_count" in data
