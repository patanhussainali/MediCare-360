from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


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


class PatientCreate(PatientBase):
    password: Optional[str] = "Patient@123"


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


class PatientResponse(PatientBase):
    id: int
    patient_id: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
