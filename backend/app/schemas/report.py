from pydantic import BaseModel
from typing import Dict, Any, List

class PatientStatsResponse(BaseModel):
    total_patients: int
    gender_distribution: Dict[str, int]
    blood_group_distribution: Dict[str, int]
    new_patients_last_30_days: int

class AppointmentStatsResponse(BaseModel):
    total_appointments: int
    by_status: Dict[str, int]
    today_count: int
    upcoming_count: int

class BillingStatsResponse(BaseModel):
    total_invoiced: float
    total_paid: float
    total_pending: float
    by_status: Dict[str, int]
    invoice_count: int

class PharmacyStatsResponse(BaseModel):
    total_medicines: int
    low_stock_count: int
    out_of_stock_count: int
    total_dispensed: int
