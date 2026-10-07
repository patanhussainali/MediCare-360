from app.api.routes import (
    auth, patients, doctors, appointments,
    medical_records, prescriptions, pharmacy,
    billing, departments, staff, notifications, reports, audit_logs, users
)

__all__ = [
    "auth", "users", "patients", "doctors", "appointments",
    "medical_records", "prescriptions", "pharmacy",
    "billing", "departments", "staff", "notifications", "reports", "audit_logs"
]
