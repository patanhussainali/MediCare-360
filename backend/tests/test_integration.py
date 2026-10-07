"""Tests for Appointments, Billing, and RBAC enforcement."""
import pytest

# ========== RBAC TESTS ==========

def test_admin_can_list_departments(client, auth_headers):
    """Admin should access departments endpoint."""
    response = client.get("/api/v1/departments", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_unauthenticated_appointments_returns_401(client):
    """Appointments endpoint without auth should fail."""
    response = client.get("/api/v1/appointments")
    assert response.status_code == 401


def test_admin_can_list_appointments(client, auth_headers):
    """Admin should list appointments (empty at start)."""
    response = client.get("/api/v1/appointments", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ========== BILLING TESTS ==========

def test_list_invoices_requires_auth(client):
    """Billing list requires authentication."""
    response = client.get("/api/v1/billing")
    assert response.status_code == 401


def test_admin_can_list_invoices(client, auth_headers):
    """Admin can view billing invoices."""
    response = client.get("/api/v1/billing", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ========== DEPARTMENTS TESTS ==========

def test_create_department(client, auth_headers):
    """Admin can create a new department."""
    response = client.post("/api/v1/departments", json={
        "name": "Test Radiology",
        "description": "X-Ray and MRI department"
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Radiology"


def test_duplicate_department_rejected(client, auth_headers):
    """Creating a department with the same name returns 400."""
    payload = {"name": "Unique Dept XYZ", "description": "Test"}
    client.post("/api/v1/departments", json=payload, headers=auth_headers)
    response = client.post("/api/v1/departments", json=payload, headers=auth_headers)
    assert response.status_code == 400


# ========== REPORTS TESTS ==========

def test_patient_stats(client, auth_headers):
    """Patient statistics endpoint should return valid structure."""
    response = client.get("/api/v1/reports/patients", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_patients" in data
    assert "gender_distribution" in data
    assert "blood_group_distribution" in data
    assert "new_patients_last_30_days" in data


def test_appointment_stats(client, auth_headers):
    """Appointment statistics should return valid structure."""
    response = client.get("/api/v1/reports/appointments", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_appointments" in data
    assert "by_status" in data


def test_billing_stats(client, auth_headers):
    """Billing statistics should return valid structure."""
    response = client.get("/api/v1/reports/billing", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_invoiced" in data
    assert "total_paid" in data


def test_pharmacy_stats(client, auth_headers):
    """Pharmacy statistics should return valid structure."""
    response = client.get("/api/v1/reports/pharmacy", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_medicines" in data
    assert "low_stock_count" in data


# ========== AUDIT LOGS TESTS ==========

def test_audit_logs_admin_only(client, auth_headers):
    """Admin can view audit logs."""
    response = client.get("/api/v1/audit-logs", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    # Should have at least the startup admin init logs
