import random
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.audit_service import audit_service
from app.models.user import User

class PatientService:
    @staticmethod
    def generate_mrn() -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_num = random.randint(1000, 9999)
        return f"MRN-{date_str}-{rand_num}"

    @staticmethod
    def get_by_id(db: Session, patient_id: int) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.id == patient_id).first()

    @staticmethod
    def get_by_mrn(db: Session, mrn: str) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.medical_record_number == mrn).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None
    ) -> List[Patient]:
        query = db.query(Patient)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Patient.first_name.ilike(search_filter),
                    Patient.last_name.ilike(search_filter),
                    Patient.medical_record_number.ilike(search_filter),
                    Patient.phone_number.ilike(search_filter),
                    Patient.email.ilike(search_filter)
                )
            )
        return query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, patient_in: PatientCreate, current_user: Optional[User] = None) -> Patient:
        # Check MRN collision or generate
        mrn = patient_in.medical_record_number
        if not mrn:
            mrn = PatientService.generate_mrn()
            while db.query(Patient).filter(Patient.medical_record_number == mrn).first():
                mrn = PatientService.generate_mrn()
        else:
            if db.query(Patient).filter(Patient.medical_record_number == mrn).first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Patient with MRN {mrn} already exists."
                )

        patient_dict = patient_in.model_dump(exclude={"medical_record_number"})
        patient = Patient(**patient_dict, medical_record_number=mrn)
        db.add(patient)
        db.commit()
        db.refresh(patient)

        audit_service.log_action(
            db=db,
            action="PATIENT_CREATED",
            resource="Patient",
            user=current_user,
            resource_id=str(patient.id),
            details={"mrn": patient.medical_record_number, "name": f"{patient.first_name} {patient.last_name}"}
        )

        return patient

    @staticmethod
    def update(
        db: Session,
        patient_id: int,
        patient_in: PatientUpdate,
        current_user: Optional[User] = None
    ) -> Patient:
        patient = PatientService.get_by_id(db, patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        update_data = patient_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)

        db.commit()
        db.refresh(patient)

        audit_service.log_action(
            db=db,
            action="PATIENT_UPDATED",
            resource="Patient",
            user=current_user,
            resource_id=str(patient.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return patient

    @staticmethod
    def delete(db: Session, patient_id: int, current_user: Optional[User] = None) -> Patient:
        patient = PatientService.get_by_id(db, patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        db.delete(patient)
        db.commit()

        audit_service.log_action(
            db=db,
            action="PATIENT_DELETED",
            resource="Patient",
            user=current_user,
            resource_id=str(patient_id)
        )

        return patient

patient_service = PatientService()
