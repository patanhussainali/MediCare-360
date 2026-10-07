from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.services.audit_service import audit_service
from app.models.user import User

class DoctorService:
    @staticmethod
    def get_by_id(db: Session, doctor_id: int) -> Optional[Doctor]:
        return db.query(Doctor).filter(Doctor.id == doctor_id).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        department_id: Optional[int] = None,
        is_available: Optional[bool] = None
    ) -> List[Doctor]:
        query = db.query(Doctor)
        if department_id is not None:
            query = query.filter(Doctor.department_id == department_id)
        if is_available is not None:
            query = query.filter(Doctor.is_available == is_available)
        return query.order_by(Doctor.id.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, doctor_in: DoctorCreate, current_user: Optional[User] = None) -> Doctor:
        # Check license uniqueness
        existing_doc = db.query(Doctor).filter(Doctor.license_number == doctor_in.license_number).first()
        if existing_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor with license number '{doctor_in.license_number}' already exists."
            )
        
        doctor = Doctor(**doctor_in.model_dump())
        db.add(doctor)
        db.commit()
        db.refresh(doctor)

        audit_service.log_action(
            db=db,
            action="DOCTOR_CREATED",
            resource="Doctor",
            user=current_user,
            resource_id=str(doctor.id),
            details={"license_number": doctor.license_number, "specialization": doctor.specialization}
        )

        return doctor

    @staticmethod
    def update(
        db: Session,
        doctor_id: int,
        doctor_in: DoctorUpdate,
        current_user: Optional[User] = None
    ) -> Doctor:
        doctor = DoctorService.get_by_id(db, doctor_id)
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        update_data = doctor_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(doctor, field, value)

        db.commit()
        db.refresh(doctor)

        audit_service.log_action(
            db=db,
            action="DOCTOR_UPDATED",
            resource="Doctor",
            user=current_user,
            resource_id=str(doctor.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return doctor

doctor_service = DoctorService()
