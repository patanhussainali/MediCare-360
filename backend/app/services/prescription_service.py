from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.prescription import Prescription, PrescriptionItem
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionItemCreate
from app.services.audit_service import audit_service
from app.models.user import User

class PrescriptionService:
    @staticmethod
    def get_by_id(db: Session, prescription_id: int) -> Optional[Prescription]:
        return db.query(Prescription).filter(Prescription.id == prescription_id).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        patient_id: Optional[int] = None,
        doctor_id: Optional[int] = None
    ) -> List[Prescription]:
        query = db.query(Prescription)
        if patient_id is not None:
            query = query.filter(Prescription.patient_id == patient_id)
        if doctor_id is not None:
            query = query.filter(Prescription.doctor_id == doctor_id)
        return query.order_by(Prescription.issue_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, prescription_in: PrescriptionCreate, current_user: Optional[User] = None) -> Prescription:
        patient = db.query(Patient).filter(Patient.id == prescription_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        doctor = db.query(Doctor).filter(Doctor.id == prescription_in.doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        # Create prescription
        prescription_data = prescription_in.model_dump(exclude={"items"})
        prescription = Prescription(**prescription_data)
        db.add(prescription)
        db.flush()

        # Add items
        for item_in in prescription_in.items:
            item = PrescriptionItem(**item_in.model_dump(), prescription_id=prescription.id)
            db.add(item)

        db.commit()
        db.refresh(prescription)

        audit_service.log_action(
            db=db,
            action="PRESCRIPTION_CREATED",
            resource="Prescription",
            user=current_user,
            resource_id=str(prescription.id),
            details={"patient_id": prescription.patient_id, "items_count": len(prescription_in.items)}
        )

        return prescription

    @staticmethod
    def update(
        db: Session,
        prescription_id: int,
        prescription_in: PrescriptionUpdate,
        current_user: Optional[User] = None
    ) -> Prescription:
        prescription = PrescriptionService.get_by_id(db, prescription_id)
        if not prescription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

        update_data = prescription_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(prescription, field, value)

        db.commit()
        db.refresh(prescription)

        audit_service.log_action(
            db=db,
            action="PRESCRIPTION_UPDATED",
            resource="Prescription",
            user=current_user,
            resource_id=str(prescription.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return prescription

    @staticmethod
    def add_item(
        db: Session,
        prescription_id: int,
        item_in: PrescriptionItemCreate,
        current_user: Optional[User] = None
    ) -> PrescriptionItem:
        prescription = PrescriptionService.get_by_id(db, prescription_id)
        if not prescription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

        item = PrescriptionItem(**item_in.model_dump(), prescription_id=prescription_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

prescription_service = PrescriptionService()
