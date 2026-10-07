"""Tests for Authentication endpoints."""
import pytest


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "MediCare360" in data["service"]


def test_admin_login_success(client):
    """Admin should be able to login with seeded credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@medicare360.com",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@medicare360.com"
    assert data["user"]["role"] == "ADMIN"


def test_login_wrong_password(client):
    """Login with wrong password should return 401."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@medicare360.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login with non-existent email should return 401."""
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@notexist.com",
        "password": "password123"
    })
    assert response.status_code == 401


def test_register_new_user(client):
    """Registering a new patient user should succeed."""
    response = client.post("/api/v1/auth/register", json={
        "email": "testpatient@example.com",
        "password": "SecurePass@123",
        "full_name": "Test Patient",
        "role": "PATIENT"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testpatient@example.com"
    assert data["role"] == "PATIENT"


def test_register_duplicate_email(client):
    """Registering with same email twice should return 400."""
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePass@123",
        "full_name": "Duplicate User"
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


def test_me_endpoint_requires_auth(client):
    """Accessing /me without a token should return 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_endpoint_with_auth(client, auth_headers):
    """Accessing /me with a valid token returns current user profile."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@medicare360.com"


def test_logout(client, admin_token):
    """Logout should blacklist the token."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Get a fresh token first to avoid blacklisting the shared admin_token fixture
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "admin@medicare360.com",
        "password": "Admin@123"
    })
    fresh_token = login_resp.json()["access_token"]
    fresh_headers = {"Authorization": f"Bearer {fresh_token}"}
    
    logout_resp = client.post("/api/v1/auth/logout", headers=fresh_headers)
    assert logout_resp.status_code == 200
    
    # Token should be blacklisted, /me should now fail
    me_resp = client.get("/api/v1/auth/me", headers=fresh_headers)
    assert me_resp.status_code == 401


def test_token_refresh(client):
    """Refresh token should return a new access token."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "admin@medicare360.com",
        "password": "Admin@123"
    })
    refresh_token = login_resp.json()["refresh_token"]
    
    refresh_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()
