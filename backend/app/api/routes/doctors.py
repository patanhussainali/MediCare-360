from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.services.doctor_service import doctor_service
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor_in: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Register a new doctor. Admin only."""
    return doctor_service.create(db, doctor_in, current_user)

@router.get("", response_model=List[DoctorResponse])
def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    department_id: Optional[int] = Query(None),
    is_available: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all doctors with optional department and availability filters."""
    return doctor_service.get_multi(db, skip=skip, limit=limit, department_id=department_id, is_available=is_available)

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get doctor details by ID."""
    doctor = doctor_service.get_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor

@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    doctor_in: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Update doctor information. Admin only."""
    return doctor_service.update(db, doctor_id, doctor_in, current_user)
