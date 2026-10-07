from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.staff import Nurse, Receptionist, Pharmacist, StaffSchedule
from app.schemas.staff import (
    NurseCreate, NurseUpdate,
    ReceptionistCreate, ReceptionistUpdate,
    PharmacistCreate, PharmacistUpdate,
    StaffScheduleCreate
)
from app.services.audit_service import audit_service
from app.models.user import User

class StaffService:
    # Nurses
    @staticmethod
    def get_nurse(db: Session, nurse_id: int) -> Optional[Nurse]:
        return db.query(Nurse).filter(Nurse.id == nurse_id).first()

    @staticmethod
    def get_nurses(db: Session, skip: int = 0, limit: int = 50) -> List[Nurse]:
        return db.query(Nurse).offset(skip).limit(limit).all()

    @staticmethod
    def create_nurse(db: Session, nurse_in: NurseCreate, current_user: Optional[User] = None) -> Nurse:
        existing = db.query(Nurse).filter(Nurse.license_number == nurse_in.license_number).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already in use")
        nurse = Nurse(**nurse_in.model_dump())
        db.add(nurse)
        db.commit()
        db.refresh(nurse)
        audit_service.log_action(db, "NURSE_CREATED", "Nurse", current_user, resource_id=str(nurse.id))
        return nurse

    # Receptionists
    @staticmethod
    def get_receptionist(db: Session, rec_id: int) -> Optional[Receptionist]:
        return db.query(Receptionist).filter(Receptionist.id == rec_id).first()

    @staticmethod
    def get_receptionists(db: Session, skip: int = 0, limit: int = 50) -> List[Receptionist]:
        return db.query(Receptionist).offset(skip).limit(limit).all()

    @staticmethod
    def create_receptionist(db: Session, rec_in: ReceptionistCreate, current_user: Optional[User] = None) -> Receptionist:
        rec = Receptionist(**rec_in.model_dump())
        db.add(rec)
        db.commit()
        db.refresh(rec)
        audit_service.log_action(db, "RECEPTIONIST_CREATED", "Receptionist", current_user, resource_id=str(rec.id))
        return rec

    # Pharmacists
    @staticmethod
    def get_pharmacist(db: Session, pharm_id: int) -> Optional[Pharmacist]:
        return db.query(Pharmacist).filter(Pharmacist.id == pharm_id).first()

    @staticmethod
    def get_pharmacists(db: Session, skip: int = 0, limit: int = 50) -> List[Pharmacist]:
        return db.query(Pharmacist).offset(skip).limit(limit).all()

    @staticmethod
    def create_pharmacist(db: Session, pharm_in: PharmacistCreate, current_user: Optional[User] = None) -> Pharmacist:
        existing = db.query(Pharmacist).filter(Pharmacist.license_number == pharm_in.license_number).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already in use")
        pharm = Pharmacist(**pharm_in.model_dump())
        db.add(pharm)
        db.commit()
        db.refresh(pharm)
        audit_service.log_action(db, "PHARMACIST_CREATED", "Pharmacist", current_user, resource_id=str(pharm.id))
        return pharm

    # Schedules
    @staticmethod
    def get_schedules(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        staff_type: Optional[str] = None,
        schedule_date: Optional[date] = None
    ) -> List[StaffSchedule]:
        query = db.query(StaffSchedule)
        if staff_type:
            query = query.filter(StaffSchedule.staff_type == staff_type)
        if schedule_date:
            query = query.filter(StaffSchedule.schedule_date == schedule_date)
        return query.order_by(StaffSchedule.schedule_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create_schedule(db: Session, sched_in: StaffScheduleCreate, current_user: Optional[User] = None) -> StaffSchedule:
        sched = StaffSchedule(**sched_in.model_dump())
        db.add(sched)
        db.commit()
        db.refresh(sched)
        audit_service.log_action(db, "STAFF_SCHEDULE_CREATED", "StaffSchedule", current_user, resource_id=str(sched.id))
        return sched

staff_service = StaffService()
