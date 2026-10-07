from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database.session import get_db
from app.schemas.staff import (
    NurseCreate, NurseUpdate, NurseResponse,
    ReceptionistCreate, ReceptionistUpdate, ReceptionistResponse,
    PharmacistCreate, PharmacistUpdate, PharmacistResponse,
    StaffScheduleCreate, StaffScheduleResponse
)
from app.services.staff_service import staff_service
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/staff", tags=["Staff"])

# --- Nurses ---
@router.post("/nurses", response_model=NurseResponse, status_code=status.HTTP_201_CREATED)
def create_nurse(nurse_in: NurseCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Register a new nurse. Admin only."""
    return staff_service.create_nurse(db, nurse_in, current_user)

@router.get("/nurses", response_model=List[NurseResponse])
def list_nurses(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """List all nurses."""
    return staff_service.get_nurses(db, skip=skip, limit=limit)

@router.get("/nurses/{nurse_id}", response_model=NurseResponse)
def get_nurse(nurse_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Get a nurse by ID."""
    nurse = staff_service.get_nurse(db, nurse_id)
    if not nurse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nurse not found")
    return nurse

# --- Receptionists ---
@router.post("/receptionists", response_model=ReceptionistResponse, status_code=status.HTTP_201_CREATED)
def create_receptionist(rec_in: ReceptionistCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Register a new receptionist. Admin only."""
    return staff_service.create_receptionist(db, rec_in, current_user)

@router.get("/receptionists", response_model=List[ReceptionistResponse])
def list_receptionists(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """List all receptionists."""
    return staff_service.get_receptionists(db, skip=skip, limit=limit)

# --- Pharmacists ---
@router.post("/pharmacists", response_model=PharmacistResponse, status_code=status.HTTP_201_CREATED)
def create_pharmacist(pharm_in: PharmacistCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Register a new pharmacist. Admin only."""
    return staff_service.create_pharmacist(db, pharm_in, current_user)

@router.get("/pharmacists", response_model=List[PharmacistResponse])
def list_pharmacists(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """List all pharmacists."""
    return staff_service.get_pharmacists(db, skip=skip, limit=limit)

# --- Schedules ---
@router.post("/schedules", response_model=StaffScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(sched_in: StaffScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.ADMIN))):
    """Create a staff schedule entry."""
    return staff_service.create_schedule(db, sched_in, current_user)

@router.get("/schedules", response_model=List[StaffScheduleResponse])
def list_schedules(
    skip: int = 0,
    limit: int = 50,
    staff_type: Optional[str] = Query(None),
    schedule_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """List staff schedules with optional filters."""
    return staff_service.get_schedules(db, skip=skip, limit=limit, staff_type=staff_type, schedule_date=schedule_date)
