from datetime import datetime
from typing import Optional, Union, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class DoctorBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    specialization: str = Field(..., min_length=2, max_length=255)
    qualification: str = Field(..., min_length=2, max_length=255)
    department_id: Optional[int] = None
    department: Optional[Union[str, int]] = None
    experience_years: int = Field(default=0, ge=0)
    consultation_fee: float = Field(default=50.0, ge=0)
    available_days: Optional[str] = "Mon,Tue,Wed,Thu,Fri"
    phone: str = Field(..., min_length=5, max_length=50)
    email: EmailStr
    status: str = "Available"

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any):
        if isinstance(data, dict):
            # Normalize full_name from name
            if "full_name" not in data and "name" in data:
                data["full_name"] = data["name"]
            # Normalize phone from phone_number
            if "phone" not in data and "phone_number" in data:
                data["phone"] = data.get("phone_number")
            # Normalize experience_years from experienceYears
            if "experience_years" not in data and "experienceYears" in data:
                data["experience_years"] = data.get("experienceYears")
            # Normalize consultation_fee from consultationFee
            if "consultation_fee" not in data and "consultationFee" in data:
                data["consultation_fee"] = data.get("consultationFee")
        return data


class DoctorCreate(DoctorBase):
    password: Optional[str] = "Doctor@123"


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    department_id: Optional[int] = None
    department: Optional[Union[str, int]] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_update_fields(cls, data: Any):
        if isinstance(data, dict):
            if "full_name" not in data and "name" in data:
                data["full_name"] = data["name"]
            if "phone" not in data and "phone_number" in data:
                data["phone"] = data.get("phone_number")
            if "experience_years" not in data and "experienceYears" in data:
                data["experience_years"] = data.get("experienceYears")
            if "consultation_fee" not in data and "consultationFee" in data:
                data["consultation_fee"] = data.get("consultationFee")
        return data


class DoctorResponse(DoctorBase):
    id: int
    doctor_id: str
    user_id: int
    name: Optional[str] = None
    department: Optional[str] = None
    consultationFee: Optional[float] = None
    experienceYears: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def extract_orm_fields(cls, data: Any):
        if hasattr(data, "full_name"):
            # ORM object
            dept_name = None
            if hasattr(data, "department") and data.department:
                dept_name = getattr(data.department, "name", None)
            data_dict = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            data_dict["name"] = data.full_name
            data_dict["department"] = dept_name or "Cardiology"
            data_dict["consultationFee"] = data.consultation_fee
            data_dict["experienceYears"] = data.experience_years
            return data_dict
        return data
