from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database.session import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate, AppointmentResponse
from app.services.appointment_service import appointment_service
from app.models.appointment import AppointmentStatus
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PATIENT))
):
    """Schedule a new appointment between patient and doctor."""
    return appointment_service.create(db, appointment_in, current_user)

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    appt_status: Optional[AppointmentStatus] = Query(None, alias="status"),
    appointment_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List appointments with optional patient, doctor, status, and date filters."""
    return appointment_service.get_multi(
        db, skip=skip, limit=limit,
        patient_id=patient_id, doctor_id=doctor_id,
        status=appt_status, appointment_date=appointment_date
    )

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get appointment details by ID."""
    appt = appointment_service.get_by_id(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR))
):
    """Update appointment details (time, reason, notes)."""
    return appointment_service.update(db, appointment_id, appointment_in, current_user)

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_in: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE))
):
    """Update the status of an appointment (Scheduled → Confirmed → Completed etc.)."""
    return appointment_service.update_status(db, appointment_id, status_in, current_user)

@router.delete("/{appointment_id}", status_code=status.HTTP_200_OK)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTIONIST))
):
    """Cancel/delete an appointment."""
    appointment_service.delete(db, appointment_id, current_user)
    return {"message": "Appointment deleted successfully"}
