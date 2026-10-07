from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Nurse
class NurseBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    department_id: Optional[int] = None
    shift: str = "Morning"
    phone: str
    email: EmailStr
    status: str = "Active"

class NurseCreate(NurseBase):
    license_number: str
    password: Optional[str] = "Nurse@123"

class NurseUpdate(BaseModel):
    shift: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[int] = None
    phone: Optional[str] = None

class NurseResponse(NurseBase):
    id: int
    license_number: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Receptionist
class ReceptionistBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    shift: str = "Day"
    phone: str
    email: EmailStr
    status: str = "Active"

class ReceptionistCreate(ReceptionistBase):
    password: Optional[str] = "Receptionist@123"

class ReceptionistUpdate(BaseModel):
    shift: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None

class ReceptionistResponse(ReceptionistBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Pharmacist
class PharmacistBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    license_number: str
    phone: str
    email: EmailStr
    status: str = "Active"

class PharmacistCreate(PharmacistBase):
    password: Optional[str] = "Pharmacist@123"

class PharmacistUpdate(BaseModel):
    status: Optional[str] = None
    phone: Optional[str] = None

class PharmacistResponse(PharmacistBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Schedule
class StaffScheduleCreate(BaseModel):
    staff_type: str
    staff_id: int
    staff_name: str
    day_of_week: str
    shift_start: str
    shift_end: str
    duty_location: Optional[str] = None

class StaffScheduleResponse(StaffScheduleCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
