"""Tests for Patient CRUD endpoints."""
import pytest

SAMPLE_PATIENT = {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1985-06-15",
    "gender": "Male",
    "blood_group": "O+",
    "phone_number": "+1-555-0100",
    "email": "john.doe@example.com",
    "address": "123 Main St, Springfield"
}


def test_create_patient(client, auth_headers):
    """Create a new patient as admin."""
    response = client.post("/api/v1/patients", json=SAMPLE_PATIENT, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert "medical_record_number" in data
    assert data["medical_record_number"].startswith("MRN-")
    return data


def test_list_patients(client, auth_headers):
    """List patients should return paginated results."""
    response = client.get("/api/v1/patients", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_patient_by_id(client, auth_headers):
    """Create a patient then retrieve by ID."""
    create_resp = client.post("/api/v1/patients", json={**SAMPLE_PATIENT, "email": "getbyid@example.com"}, headers=auth_headers)
    patient_id = create_resp.json()["id"]
    
    get_resp = client.get(f"/api/v1/patients/{patient_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == patient_id


def test_get_nonexistent_patient(client, auth_headers):
    """Getting a non-existent patient ID should return 404."""
    response = client.get("/api/v1/patients/99999", headers=auth_headers)
    assert response.status_code == 404


def test_update_patient(client, auth_headers):
    """Update patient's phone number."""
    create_resp = client.post("/api/v1/patients", json={**SAMPLE_PATIENT, "email": "update@example.com"}, headers=auth_headers)
    patient_id = create_resp.json()["id"]
    
    update_resp = client.put(
        f"/api/v1/patients/{patient_id}",
        json={"phone_number": "+1-555-9999"},
        headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["phone_number"] == "+1-555-9999"


def test_search_patients(client, auth_headers):
    """Search patients by name."""
    client.post("/api/v1/patients", json={**SAMPLE_PATIENT, "first_name": "Searchable", "email": "search@example.com"}, headers=auth_headers)
    
    response = client.get("/api/v1/patients?search=Searchable", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert any(p["first_name"] == "Searchable" for p in results)


def test_patient_requires_auth(client):
    """Patient list without auth should return 401."""
    response = client.get("/api/v1/patients")
    assert response.status_code == 401
