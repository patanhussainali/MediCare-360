from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.billing import InvoiceCreate, InvoiceUpdate, InvoiceStatusUpdate, InvoiceResponse
from app.services.billing_service import billing_service
from app.models.billing import PaymentStatus
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """Create a billing invoice for a patient. Auto-generates invoice number."""
    return billing_service.create(db, invoice_in, current_user)

@router.get("", response_model=List[InvoiceResponse])
def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    patient_id: Optional[int] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """List all invoices with optional patient and payment status filters."""
    return billing_service.get_multi(db, skip=skip, limit=limit, patient_id=patient_id, payment_status=payment_status)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get an invoice by ID."""
    invoice = billing_service.get_by_id(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """Update invoice details."""
    return billing_service.update(db, invoice_id, invoice_in, current_user)

@router.patch("/{invoice_id}/status", response_model=InvoiceResponse)
def update_invoice_status(
    invoice_id: int,
    status_in: InvoiceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """Update invoice payment status (Pending → Paid, etc.)."""
    return billing_service.update_status(db, invoice_id, status_in, current_user)
