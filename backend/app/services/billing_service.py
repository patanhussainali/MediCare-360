import random
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.billing import Invoice, PaymentStatus
from app.models.patient import Patient
from app.schemas.billing import InvoiceCreate, InvoiceUpdate, InvoiceStatusUpdate
from app.services.audit_service import audit_service
from app.models.user import User

class BillingService:
    @staticmethod
    def generate_invoice_number() -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_num = random.randint(1000, 9999)
        return f"INV-{date_str}-{rand_num}"

    @staticmethod
    def get_by_id(db: Session, invoice_id: int) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.id == invoice_id).first()

    @staticmethod
    def get_by_number(db: Session, invoice_number: str) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        patient_id: Optional[int] = None,
        payment_status: Optional[PaymentStatus] = None
    ) -> List[Invoice]:
        query = db.query(Invoice)
        if patient_id is not None:
            query = query.filter(Invoice.patient_id == patient_id)
        if payment_status is not None:
            query = query.filter(Invoice.payment_status == payment_status)
        return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, invoice_in: InvoiceCreate, current_user: Optional[User] = None) -> Invoice:
        patient = db.query(Patient).filter(Patient.id == invoice_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        inv_num = invoice_in.invoice_number
        if not inv_num:
            inv_num = BillingService.generate_invoice_number()
            while db.query(Invoice).filter(Invoice.invoice_number == inv_num).first():
                inv_num = BillingService.generate_invoice_number()

        # Calculate total if not set or subtotal provided
        subtotal = invoice_in.subtotal
        tax = invoice_in.tax
        discount = invoice_in.discount
        total = invoice_in.total_amount if invoice_in.total_amount > 0 else (subtotal + tax - discount)

        invoice_dict = invoice_in.model_dump(exclude={"invoice_number", "total_amount"})
        invoice = Invoice(
            **invoice_dict,
            invoice_number=inv_num,
            total_amount=max(0.0, total)
        )

        if invoice.payment_status == PaymentStatus.PAID and not invoice.paid_at:
            invoice.paid_at = datetime.now(timezone.utc)

        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        audit_service.log_action(
            db=db,
            action="INVOICE_CREATED",
            resource="Invoice",
            user=current_user,
            resource_id=str(invoice.id),
            details={"invoice_number": invoice.invoice_number, "total": invoice.total_amount, "status": invoice.payment_status.value}
        )

        return invoice

    @staticmethod
    def update(
        db: Session,
        invoice_id: int,
        invoice_in: InvoiceUpdate,
        current_user: Optional[User] = None
    ) -> Invoice:
        invoice = BillingService.get_by_id(db, invoice_id)
        if not invoice:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

        update_data = invoice_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(invoice, field, value)

        if invoice.payment_status == PaymentStatus.PAID and not invoice.paid_at:
            invoice.paid_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(invoice)

        audit_service.log_action(
            db=db,
            action="INVOICE_UPDATED",
            resource="Invoice",
            user=current_user,
            resource_id=str(invoice.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return invoice

    @staticmethod
    def update_status(
        db: Session,
        invoice_id: int,
        status_in: InvoiceStatusUpdate,
        current_user: Optional[User] = None
    ) -> Invoice:
        invoice = BillingService.get_by_id(db, invoice_id)
        if not invoice:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

        old_status = invoice.payment_status
        invoice.payment_status = status_in.payment_status
        if status_in.payment_method:
            invoice.payment_method = status_in.payment_method
        if status_in.payment_status == PaymentStatus.PAID and not invoice.paid_at:
            invoice.paid_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(invoice)

        audit_service.log_action(
            db=db,
            action="INVOICE_STATUS_UPDATED",
            resource="Invoice",
            user=current_user,
            resource_id=str(invoice.id),
            details={"from": old_status.value, "to": invoice.payment_status.value}
        )

        return invoice

billing_service = BillingService()
