from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class DoctorBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    specialization: str = Field(..., min_length=2, max_length=255)
    qualification: str = Field(..., min_length=2, max_length=255)
    department_id: Optional[int] = None
    experience_years: int = Field(default=0, ge=0)
    consultation_fee: float = Field(default=50.0, ge=0)
    available_days: Optional[str] = "Mon,Tue,Wed,Thu,Fri"
    phone: str = Field(..., min_length=5, max_length=50)
    email: EmailStr
    status: str = "Available"


class DoctorCreate(DoctorBase):
    password: Optional[str] = "Doctor@123"


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    department_id: Optional[int] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None


class DoctorResponse(DoctorBase):
    id: int
    doctor_id: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
