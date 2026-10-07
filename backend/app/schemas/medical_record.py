from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicalRecordBase(BaseModel):
    patient_id: int
    doctor_id: int
    diagnosis: str = Field(..., min_length=2, max_length=255)
    symptoms: Optional[str] = None
    examination_notes: Optional[str] = None
    vital_signs: Optional[str] = None
    attachments: Optional[str] = None
    visit_date: str


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    examination_notes: Optional[str] = None
    vital_signs: Optional[str] = None
    attachments: Optional[str] = None
    visit_date: Optional[str] = None


class MedicalRecordResponse(MedicalRecordBase):
    id: int
    record_number: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
