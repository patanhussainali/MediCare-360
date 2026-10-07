from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.report import PatientStatsResponse, AppointmentStatsResponse, BillingStatsResponse, PharmacyStatsResponse
from app.services.report_service import report_service
from app.core.dependencies import require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/patients", response_model=PatientStatsResponse)
def patient_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR))
):
    """Patient statistics: total, gender distribution, blood groups, new registrations."""
    return report_service.get_patient_stats(db)

@router.get("/appointments", response_model=AppointmentStatsResponse)
def appointment_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST))
):
    """Appointment statistics: total, by status, today's count, upcoming count."""
    return report_service.get_appointment_stats(db)

@router.get("/billing", response_model=BillingStatsResponse)
def billing_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """Billing statistics: total invoiced, paid, pending amounts."""
    return report_service.get_billing_stats(db)

@router.get("/pharmacy", response_model=PharmacyStatsResponse)
def pharmacy_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """Pharmacy statistics: total medicines, low stock, out of stock, total dispensed."""
    return report_service.get_pharmacy_stats(db)
