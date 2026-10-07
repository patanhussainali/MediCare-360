from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate
from app.services.audit_service import audit_service
from app.models.user import User

class MedicalRecordService:
    @staticmethod
    def get_by_id(db: Session, record_id: int) -> Optional[MedicalRecord]:
        return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

    @staticmethod
    def get_patient_history(db: Session, patient_id: int, skip: int = 0, limit: int = 50) -> List[MedicalRecord]:
        # Validate patient exists
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
        return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.visit_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_multi(db: Session, skip: int = 0, limit: int = 50) -> List[MedicalRecord]:
        return db.query(MedicalRecord).order_by(MedicalRecord.visit_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, record_in: MedicalRecordCreate, current_user: Optional[User] = None) -> MedicalRecord:
        patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        record = MedicalRecord(**record_in.model_dump())
        db.add(record)
        db.commit()
        db.refresh(record)

        audit_service.log_action(
            db=db,
            action="MEDICAL_RECORD_CREATED",
            resource="MedicalRecord",
            user=current_user,
            resource_id=str(record.id),
            details={"patient_id": record.patient_id, "diagnosis": record.diagnosis}
        )

        return record

    @staticmethod
    def update(
        db: Session,
        record_id: int,
        record_in: MedicalRecordUpdate,
        current_user: Optional[User] = None
    ) -> MedicalRecord:
        record = MedicalRecordService.get_by_id(db, record_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")

        update_data = record_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)

        db.commit()
        db.refresh(record)

        audit_service.log_action(
            db=db,
            action="MEDICAL_RECORD_UPDATED",
            resource="MedicalRecord",
            user=current_user,
            resource_id=str(record.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return record

medical_record_service = MedicalRecordService()
