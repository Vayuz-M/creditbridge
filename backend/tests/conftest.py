"""
Pytest Fixtures for CreditBridge Test Suite
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal, Base, engine
from app.models.models import User
from app.auth.auth import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def client():
    """FastAPI test client fixture."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def user_token(client):
    """Generates a valid user authentication token."""
    res = client.post("/api/auth/demo-login", json={"role": "USER"})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def user_headers(user_token):
    """Authorization headers for a standard user."""
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture(scope="session")
def admin_token(client):
    """Generates a valid admin authentication token."""
    res = client.post("/api/auth/demo-login", json={"role": "ADMIN"})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    """Authorization headers for an admin user."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def sample_financial_profile():
    """Returns a realistic financial profile for scoring tests."""
    return {
        "monthly_income": 35000,
        "income_variability": 0.15,
        "income_regularity": 0.90,
        "income_sources": 2,
        "monthly_transaction_count": 55,
        "average_transaction_value": 420,
        "transaction_consistency": 0.88,
        "digital_payment_ratio": 0.92,
        "electricity_payment_consistency": 0.95,
        "mobile_payment_consistency": 0.98,
        "rent_payment_consistency": 0.92,
        "average_payment_delay": 1.5,
        "on_time_payment_ratio": 0.95,
        "monthly_savings": 7500,
        "savings_ratio": 0.21,
        "upi_activity_months": 30,
        "digital_activity_months": 36,
        "transaction_history_months": 24,
        "age_group": "26-35",
        "gender": "Male",
        "occupation_category": "Gig Economy"
    }
