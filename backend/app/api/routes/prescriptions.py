from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse, PrescriptionItemCreate, PrescriptionItemResponse
from app.services.prescription_service import prescription_service
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    prescription_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR))
):
    """Create a prescription with medication items. Doctor/Admin only."""
    return prescription_service.create(db, prescription_in, current_user)

@router.get("", response_model=List[PrescriptionResponse])
def list_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.NURSE))
):
    """List prescriptions with optional patient/doctor filters."""
    return prescription_service.get_multi(db, skip=skip, limit=limit, patient_id=patient_id, doctor_id=doctor_id)

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a prescription by ID including all items."""
    prescription = prescription_service.get_by_id(db, prescription_id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return prescription

@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int,
    prescription_in: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR))
):
    """Update prescription notes or status."""
    return prescription_service.update(db, prescription_id, prescription_in, current_user)

@router.post("/{prescription_id}/items", response_model=PrescriptionItemResponse, status_code=status.HTTP_201_CREATED)
def add_prescription_item(
    prescription_id: int,
    item_in: PrescriptionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR))
):
    """Add a new medication item to an existing prescription."""
    return prescription_service.add_item(db, prescription_id, item_in, current_user)
