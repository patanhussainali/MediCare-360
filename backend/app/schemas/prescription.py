from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PrescriptionItemBase(BaseModel):
    medicine_name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    duration: str = Field(..., min_length=1, max_length=100)
    instructions: Optional[str] = None


class PrescriptionItemCreate(PrescriptionItemBase):
    pass


class PrescriptionItemResponse(PrescriptionItemBase):
    id: int
    prescription_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    diagnosis: str = Field(..., min_length=1, max_length=255)
    instructions: Optional[str] = None
    status: str = "Active"


class PrescriptionCreate(PrescriptionBase):
    items: List[PrescriptionItemCreate] = []


class PrescriptionUpdate(BaseModel):
    diagnosis: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = None


class PrescriptionResponse(PrescriptionBase):
    id: int
    prescription_number: str
    items: List[PrescriptionItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
