"""
Unit & Integration Tests for Authentication and Health Endpoints
"""

import pytest
import uuid


def test_health_check(client):
    """Test /health and /api/health observability endpoints."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["HEALTHY", "DEGRADED"]
    assert data["database"] == "HEALTHY"
    assert data["ml_models_ready"] is True
    assert "uptime_seconds" in data

    res_api = client.get("/api/health")
    assert res_api.status_code == 200


def test_sample_personas(client):
    """Test sample personas retrieval."""
    res = client.get("/api/auth/sample-personas")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    assert "gig_worker" in data
    assert data["gig_worker"]["monthly_income"] > 0


def test_demo_logins(client):
    """Test 1-click hackathon demo logins for USER and ADMIN."""
    # User Demo Login
    res_user = client.post("/api/auth/demo-login", json={"role": "USER"})
    assert res_user.status_code == 200
    user_payload = res_user.json()
    assert "access_token" in user_payload
    assert user_payload["user"]["role"] == "USER"

    # Admin Demo Login
    res_admin = client.post("/api/auth/demo-login", json={"role": "ADMIN"})
    assert res_admin.status_code == 200
    admin_payload = res_admin.json()
    assert "access_token" in admin_payload
    assert admin_payload["user"]["role"] == "ADMIN"


def test_user_registration_and_login_flow(client):
    """Test full registration and login lifecycle."""
    unique_email = f"test_{uuid.uuid4().hex[:8]}@creditbridge.ai"
    password = "SecurePassword2026!"
    full_name = "Automated Test User"

    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": full_name
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]

    # 2. Verify /me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

    # 3. Duplicate email should fail
    dup_res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": full_name
    })
    assert dup_res.status_code == 400

    # 4. Login with correct credentials
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": password
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 5. Login with invalid password
    bad_login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword!"
    })
    assert bad_login_res.status_code == 401


def test_unauthorized_access(client):
    """Test protected endpoints reject unauthenticated requests."""
    res = client.get("/api/auth/me")
    assert res.status_code == 401
