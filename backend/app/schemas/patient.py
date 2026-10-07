from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    date_of_birth: str
    blood_group: Optional[str] = None
    phone: str = Field(..., min_length=5, max_length=50)
    email: EmailStr
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    status: str = "Active"

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data):
        if isinstance(data, dict):
            if "full_name" not in data and ("first_name" in data or "last_name" in data):
                fn = data.get("first_name", "") or ""
                ln = data.get("last_name", "") or ""
                data["full_name"] = f"{fn} {ln}".strip()
            if "phone" not in data and "phone_number" in data:
                data["phone"] = data.get("phone_number")
        return data


class PatientCreate(PatientBase):
    password: Optional[str] = "Patient@123"
    medical_record_number: Optional[str] = None


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    status: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_update_fields(cls, data):
        if isinstance(data, dict):
            if "phone" not in data and "phone_number" in data:
                data["phone"] = data.get("phone_number")
            if "full_name" not in data and ("first_name" in data or "last_name" in data):
                fn = data.get("first_name", "") or ""
                ln = data.get("last_name", "") or ""
                data["full_name"] = f"{fn} {ln}".strip()
        return data


class PatientResponse(PatientBase):
    id: int
    patient_id: str
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    medical_record_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
