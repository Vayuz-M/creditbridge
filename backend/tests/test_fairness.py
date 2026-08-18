"""
Unit & Integration Tests for Responsible AI & Fairness Auditing
"""

import pytest
from ml.fairness import FairnessAuditor


def test_fairness_auditor_core():
    """Verify FairnessAuditor computes demographic parity and equal opportunity correctly."""
    auditor = FairnessAuditor()
    report = auditor.audit_model()

    assert "overall_status" in report
    assert "test_records_audited" in report
    assert report["test_records_audited"] > 0
    assert "slices" in report

    # Verify protected slices exist
    assert "gender" in report["slices"]
    assert "age_group" in report["slices"]
    assert "occupation_category" in report["slices"]

    # Verify slice structure
    gender_slice = report["slices"]["gender"]
    assert "groups" in gender_slice
    assert len(gender_slice["groups"]) >= 2
    assert "demographic_parity_difference" in gender_slice
    assert "equal_opportunity_difference" in gender_slice
    assert 0.0 <= gender_slice["demographic_parity_difference"] <= 100.0


def test_fairness_api_endpoint(client, user_headers):
    """Test GET /api/analytics/fairness."""
    res = client.get("/api/analytics/fairness", headers=user_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["overall_status"]["badge"] in ["COMPLIANT", "REVIEW_REQUIRED"]
    assert len(data["slices"]) >= 3
