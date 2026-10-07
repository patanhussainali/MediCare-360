from app.api.routes import (
    auth, patients, doctors, appointments,
    medical_records, prescriptions, pharmacy,
    billing, departments, staff, notifications, reports, audit_logs
)

__all__ = [
    "auth", "patients", "doctors", "appointments",
    "medical_records", "prescriptions", "pharmacy",
    "billing", "departments", "staff", "notifications", "reports", "audit_logs"
]
