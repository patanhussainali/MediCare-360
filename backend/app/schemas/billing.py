from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.models.billing import PaymentStatus

class InvoiceBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[dict]] = None
    subtotal: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)
    discount: float = Field(default=0.0, ge=0)
    total_amount: float = Field(default=0.0, ge=0)
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    description: Optional[str] = None
    items: Optional[List[dict]] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    discount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_status: Optional[PaymentStatus] = None
    payment_method: Optional[str] = None
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None

class InvoiceStatusUpdate(BaseModel):
    payment_status: PaymentStatus
    payment_method: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
