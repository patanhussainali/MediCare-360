from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicineBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    generic_name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    manufacturer: Optional[str] = None
    unit_price: float = Field(default=0.0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    min_stock_threshold: int = Field(default=10, ge=0)
    expiry_date: Optional[str] = None
    status: str = "Available"


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    unit_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock_threshold: Optional[int] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = None


class MedicineStockUpdate(BaseModel):
    quantity_delta: int = Field(..., description="Positive to add, negative to deduct")
    notes: Optional[str] = None


class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MedicineIssueCreate(BaseModel):
    medicine_id: int
    patient_id: int
    prescription_id: Optional[int] = None
    quantity: int = Field(..., gt=0)
    notes: Optional[str] = None


class MedicineIssueResponse(BaseModel):
    id: int
    medicine_id: int
    patient_id: int
    prescription_id: Optional[int] = None
    quantity: int
    dispensed_by: str
    dispensed_at: datetime
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
