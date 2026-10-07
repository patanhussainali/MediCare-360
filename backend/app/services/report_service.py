from datetime import datetime, timezone, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.patient import Patient
from app.models.appointment import Appointment, AppointmentStatus
from app.models.billing import Invoice, PaymentStatus
from app.models.pharmacy import Medicine, MedicineIssueRecord
from app.schemas.report import (
    PatientStatsResponse,
    AppointmentStatsResponse,
    BillingStatsResponse,
    PharmacyStatsResponse
)

class ReportService:
    @staticmethod
    def get_patient_stats(db: Session) -> PatientStatsResponse:
        total = db.query(func.count(Patient.id)).scalar() or 0

        # Gender distribution
        gender_rows = db.query(Patient.gender, func.count(Patient.id)).group_by(Patient.gender).all()
        gender_dist = {g or "Unknown": count for g, count in gender_rows}

        # Blood group distribution
        bg_rows = db.query(Patient.blood_group, func.count(Patient.id)).group_by(Patient.blood_group).all()
        bg_dist = {bg or "Unknown": count for bg, count in bg_rows}

        # New in last 30 days
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        new_count = db.query(func.count(Patient.id)).filter(Patient.created_at >= thirty_days_ago).scalar() or 0

        return PatientStatsResponse(
            total_patients=total,
            gender_distribution=gender_dist,
            blood_group_distribution=bg_dist,
            new_patients_last_30_days=new_count
        )

    @staticmethod
    def get_appointment_stats(db: Session) -> AppointmentStatsResponse:
        total = db.query(func.count(Appointment.id)).scalar() or 0

        # By status
        status_rows = db.query(Appointment.status, func.count(Appointment.id)).group_by(Appointment.status).all()
        status_dist = {s.value if hasattr(s, "value") else str(s): count for s, count in status_rows}

        # Today's appointments
        today = date.today()
        today_count = db.query(func.count(Appointment.id)).filter(Appointment.appointment_date == today).scalar() or 0

        # Upcoming appointments
        upcoming_count = db.query(func.count(Appointment.id)).filter(Appointment.appointment_date > today).scalar() or 0

        return AppointmentStatsResponse(
            total_appointments=total,
            by_status=status_dist,
            today_count=today_count,
            upcoming_count=upcoming_count
        )

    @staticmethod
    def get_billing_stats(db: Session) -> BillingStatsResponse:
        total_invoiced = db.query(func.sum(Invoice.total_amount)).scalar() or 0.0

        total_paid = db.query(func.sum(Invoice.total_amount)).filter(Invoice.payment_status == PaymentStatus.PAID).scalar() or 0.0
        total_pending = db.query(func.sum(Invoice.total_amount)).filter(Invoice.payment_status == PaymentStatus.PENDING).scalar() or 0.0

        status_rows = db.query(Invoice.payment_status, func.count(Invoice.id)).group_by(Invoice.payment_status).all()
        status_dist = {s.value if hasattr(s, "value") else str(s): count for s, count in status_rows}

        invoice_count = db.query(func.count(Invoice.id)).scalar() or 0

        return BillingStatsResponse(
            total_invoiced=float(total_invoiced),
            total_paid=float(total_paid),
            total_pending=float(total_pending),
            by_status=status_dist,
            invoice_count=invoice_count
        )

    @staticmethod
    def get_pharmacy_stats(db: Session) -> PharmacyStatsResponse:
        total = db.query(func.count(Medicine.id)).scalar() or 0
        low_stock = db.query(func.count(Medicine.id)).filter(Medicine.stock_quantity <= Medicine.min_stock_threshold, Medicine.stock_quantity > 0).scalar() or 0
        out_of_stock = db.query(func.count(Medicine.id)).filter(Medicine.stock_quantity == 0).scalar() or 0
        total_dispensed = db.query(func.sum(MedicineIssueRecord.quantity)).scalar() or 0

        return PharmacyStatsResponse(
            total_medicines=total,
            low_stock_count=low_stock,
            out_of_stock_count=out_of_stock,
            total_dispensed=int(total_dispensed)
        )

report_service = ReportService()
