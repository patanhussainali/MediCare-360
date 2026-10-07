from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pharmacy import Medicine, MedicineIssueRecord
from app.schemas.pharmacy import MedicineCreate, MedicineUpdate, MedicineIssueCreate
from app.services.audit_service import audit_service
from app.models.user import User

class PharmacyService:
    @staticmethod
    def get_medicine_by_id(db: Session, medicine_id: int) -> Optional[Medicine]:
        return db.query(Medicine).filter(Medicine.id == medicine_id).first()

    @staticmethod
    def get_medicines(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[Medicine]:
        query = db.query(Medicine)
        if search:
            query = query.filter(Medicine.name.ilike(f"%{search}%") | Medicine.generic_name.ilike(f"%{search}%"))
        if category:
            query = query.filter(Medicine.category.ilike(f"%{category}%"))
        return query.order_by(Medicine.name.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_low_stock_medicines(db: Session) -> List[Medicine]:
        return db.query(Medicine).filter(Medicine.stock_quantity <= Medicine.min_stock_threshold).all()

    @staticmethod
    def create_medicine(db: Session, medicine_in: MedicineCreate, current_user: Optional[User] = None) -> Medicine:
        existing = db.query(Medicine).filter(Medicine.name.ilike(medicine_in.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicine '{medicine_in.name}' already exists."
            )

        medicine = Medicine(**medicine_in.model_dump())
        db.add(medicine)
        db.commit()
        db.refresh(medicine)

        audit_service.log_action(
            db=db,
            action="MEDICINE_CREATED",
            resource="Medicine",
            user=current_user,
            resource_id=str(medicine.id),
            details={"name": medicine.name, "stock": medicine.stock_quantity}
        )

        return medicine

    @staticmethod
    def update_medicine(
        db: Session,
        medicine_id: int,
        medicine_in: MedicineUpdate,
        current_user: Optional[User] = None
    ) -> Medicine:
        medicine = PharmacyService.get_medicine_by_id(db, medicine_id)
        if not medicine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

        update_data = medicine_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(medicine, field, value)

        db.commit()
        db.refresh(medicine)

        audit_service.log_action(
            db=db,
            action="MEDICINE_UPDATED",
            resource="Medicine",
            user=current_user,
            resource_id=str(medicine.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return medicine

    @staticmethod
    def update_stock(
        db: Session,
        medicine_id: int,
        quantity_delta: int,
        current_user: Optional[User] = None
    ) -> Medicine:
        medicine = PharmacyService.get_medicine_by_id(db, medicine_id)
        if not medicine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

        new_stock = medicine.stock_quantity + quantity_delta
        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{medicine.name}'. Available: {medicine.stock_quantity}, requested change: {quantity_delta}"
            )

        medicine.stock_quantity = new_stock
        db.commit()
        db.refresh(medicine)

        audit_service.log_action(
            db=db,
            action="MEDICINE_STOCK_UPDATED",
            resource="Medicine",
            user=current_user,
            resource_id=str(medicine.id),
            details={"delta": quantity_delta, "new_stock": medicine.stock_quantity}
        )

        return medicine

    @staticmethod
    def issue_medicine(
        db: Session,
        issue_in: MedicineIssueCreate,
        current_user: Optional[User] = None
    ) -> MedicineIssueRecord:
        medicine = PharmacyService.get_medicine_by_id(db, issue_in.medicine_id)
        if not medicine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

        if medicine.stock_quantity < issue_in.quantity_issued:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot issue {issue_in.quantity_issued} units. Only {medicine.stock_quantity} in stock."
            )

        # Decrement stock
        medicine.stock_quantity -= issue_in.quantity_issued

        # Auto calculate total price if not provided
        total_price = issue_in.total_price if issue_in.total_price is not None else float(medicine.unit_price * issue_in.quantity_issued)

        record_data = issue_in.model_dump(exclude={"total_price"})
        record = MedicineIssueRecord(
            **record_data,
            total_price=total_price,
            issued_by_id=current_user.id if current_user else None
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        audit_service.log_action(
            db=db,
            action="MEDICINE_ISSUED",
            resource="MedicineIssueRecord",
            user=current_user,
            resource_id=str(record.id),
            details={
                "medicine_id": medicine.id,
                "medicine_name": medicine.name,
                "quantity": issue_in.quantity_issued,
                "remaining_stock": medicine.stock_quantity
            }
        )

        return record

    @staticmethod
    def get_issue_records(db: Session, skip: int = 0, limit: int = 50) -> List[MedicineIssueRecord]:
        return db.query(MedicineIssueRecord).order_by(MedicineIssueRecord.issued_at.desc()).offset(skip).limit(limit).all()

pharmacy_service = PharmacyService()
