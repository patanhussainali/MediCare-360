from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.models.user import User

class AppointmentService:
    @staticmethod
    def get_by_id(db: Session, appointment_id: int) -> Optional[Appointment]:
        return db.query(Appointment).filter(Appointment.id == appointment_id).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        patient_id: Optional[int] = None,
        doctor_id: Optional[int] = None,
        status: Optional[AppointmentStatus] = None,
        appointment_date: Optional[date] = None
    ) -> List[Appointment]:
        query = db.query(Appointment)
        if patient_id is not None:
            query = query.filter(Appointment.patient_id == patient_id)
        if doctor_id is not None:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if status is not None:
            query = query.filter(Appointment.status == status)
        if appointment_date is not None:
            query = query.filter(Appointment.appointment_date == appointment_date)
        return query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, appointment_in: AppointmentCreate, current_user: Optional[User] = None) -> Appointment:
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.id == appointment_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        # Verify doctor exists
        doctor = db.query(Doctor).filter(Doctor.id == appointment_in.doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        # Create appointment
        appointment = Appointment(**appointment_in.model_dump())
        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        audit_service.log_action(
            db=db,
            action="APPOINTMENT_CREATED",
            resource="Appointment",
            user=current_user,
            resource_id=str(appointment.id),
            details={
                "patient_id": appointment.patient_id,
                "doctor_id": appointment.doctor_id,
                "date": str(appointment.appointment_date),
                "time": str(appointment.appointment_time)
            }
        )

        # Notify doctor user if linked
        if doctor.user_id:
            notification_service.send(
                db=db,
                user_id=doctor.user_id,
                title="New Appointment Scheduled",
                message=f"You have a new appointment with {patient.first_name} {patient.last_name} on {appointment.appointment_date}.",
                type="appointment"
            )

        # Notify patient user if linked
        if patient.user_id:
            notification_service.send(
                db=db,
                user_id=patient.user_id,
                title="Appointment Confirmed",
                message=f"Your appointment is scheduled for {appointment.appointment_date} at {appointment.appointment_time}.",
                type="appointment"
            )

        return appointment

    @staticmethod
    def update(
        db: Session,
        appointment_id: int,
        appointment_in: AppointmentUpdate,
        current_user: Optional[User] = None
    ) -> Appointment:
        appointment = AppointmentService.get_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        update_data = appointment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(appointment, field, value)

        db.commit()
        db.refresh(appointment)

        audit_service.log_action(
            db=db,
            action="APPOINTMENT_UPDATED",
            resource="Appointment",
            user=current_user,
            resource_id=str(appointment.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return appointment

    @staticmethod
    def update_status(
        db: Session,
        appointment_id: int,
        status_in: AppointmentStatusUpdate,
        current_user: Optional[User] = None
    ) -> Appointment:
        appointment = AppointmentService.get_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        old_status = appointment.status
        appointment.status = status_in.status
        if status_in.notes:
            appointment.notes = status_in.notes

        db.commit()
        db.refresh(appointment)

        audit_service.log_action(
            db=db,
            action="APPOINTMENT_STATUS_CHANGED",
            resource="Appointment",
            user=current_user,
            resource_id=str(appointment.id),
            details={"from": old_status.value, "to": status_in.status.value}
        )

        return appointment

    @staticmethod
    def delete(db: Session, appointment_id: int, current_user: Optional[User] = None) -> Appointment:
        appointment = AppointmentService.get_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        db.delete(appointment)
        db.commit()

        audit_service.log_action(
            db=db,
            action="APPOINTMENT_DELETED",
            resource="Appointment",
            user=current_user,
            resource_id=str(appointment_id)
        )

        return appointment

appointment_service = AppointmentService()
