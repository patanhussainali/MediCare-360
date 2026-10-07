from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse
from app.services.medical_record_service import medical_record_service
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

@router.post("", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_medical_record(
    record_in: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE))
):
    """Create a new medical record for a patient visit."""
    return medical_record_service.create(db, record_in, current_user)

@router.get("", response_model=List[MedicalRecordResponse])
def list_medical_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE))
):
    """List all medical records (paginated)."""
    return medical_record_service.get_multi(db, skip=skip, limit=limit)

@router.get("/patient/{patient_id}", response_model=List[MedicalRecordResponse])
def get_patient_medical_history(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve complete medical history for a specific patient."""
    return medical_record_service.get_patient_history(db, patient_id, skip=skip, limit=limit)

@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific medical record by ID."""
    record = medical_record_service.get_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
    return record

@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    record_id: int,
    record_in: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.DOCTOR))
):
    """Update a medical record. Doctors and Admins only."""
    return medical_record_service.update(db, record_id, record_in, current_user)
