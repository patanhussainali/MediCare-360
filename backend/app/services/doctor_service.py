import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.user import User, UserRole
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.services.audit_service import audit_service
from app.core.security import get_password_hash


class DoctorService:
    @staticmethod
    def get_by_id(db: Session, doctor_id: int) -> Optional[Doctor]:
        return db.query(Doctor).filter(Doctor.id == doctor_id).first()

    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        department_id: Optional[int] = None,
        is_available: Optional[bool] = None
    ) -> List[Doctor]:
        query = db.query(Doctor)
        if department_id is not None:
            query = query.filter(Doctor.department_id == department_id)
        if is_available is not None:
            if is_available:
                query = query.filter(Doctor.status == "Available")
            else:
                query = query.filter(Doctor.status != "Available")
        return query.order_by(Doctor.id.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, doctor_in: DoctorCreate, current_user: Optional[User] = None) -> Doctor:
        clean_email = doctor_in.email.strip().lower()

        # Check email uniqueness across doctors
        existing_doc = db.query(Doctor).filter(Doctor.email.ilike(clean_email)).first()
        if existing_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor with email '{doctor_in.email}' already exists."
            )

        # Resolve department if department name or code was supplied
        resolved_dept_id = doctor_in.department_id
        if not resolved_dept_id and getattr(doctor_in, "department", None):
            dept_val = str(doctor_in.department).strip()
            if dept_val.isdigit():
                resolved_dept_id = int(dept_val)
            else:
                dept_obj = db.query(Department).filter(
                    (Department.name.ilike(dept_val)) | (Department.code.ilike(dept_val))
                ).first()
                if dept_obj:
                    resolved_dept_id = dept_obj.id

        # Ensure user account exists with bcrypt-hashed password
        user = db.query(User).filter(User.email.ilike(clean_email)).first()
        raw_password = doctor_in.password or "Doctor@123"
        hashed = get_password_hash(raw_password)

        if not user:
            user = User(
                email=clean_email,
                hashed_password=hashed,
                full_name=doctor_in.full_name,
                role=UserRole.DOCTOR,
                phone=doctor_in.phone,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Upgrade existing user to DOCTOR role and sync credentials
            user.role = UserRole.DOCTOR
            user.is_active = True
            user.is_verified = True
            if doctor_in.password:
                user.hashed_password = hashed
            db.commit()
            db.refresh(user)

        # Prepare Doctor model fields
        doc_dict = doctor_in.model_dump(exclude={"password", "department"})
        doc_dict["department_id"] = resolved_dept_id
        doc_dict["email"] = clean_email
        doctor_id_code = f"DOC-{uuid.uuid4().hex[:6].upper()}"

        doctor = Doctor(
            doctor_id=doctor_id_code,
            user_id=user.id,
            **doc_dict
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)

        audit_service.log_action(
            db=db,
            action="DOCTOR_CREATED",
            resource="Doctor",
            user=current_user,
            resource_id=str(doctor.id),
            details={"email": doctor.email, "specialization": doctor.specialization}
        )

        return doctor

    @staticmethod
    def update(
        db: Session,
        doctor_id: int,
        doctor_in: DoctorUpdate,
        current_user: Optional[User] = None
    ) -> Doctor:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        update_data = doctor_in.model_dump(exclude_unset=True, exclude={"department"})

        # Resolve department if updated
        if getattr(doctor_in, "department", None):
            dept_val = str(doctor_in.department).strip()
            if dept_val.isdigit():
                update_data["department_id"] = int(dept_val)
            else:
                dept_obj = db.query(Department).filter(
                    (Department.name.ilike(dept_val)) | (Department.code.ilike(dept_val))
                ).first()
                if dept_obj:
                    update_data["department_id"] = dept_obj.id

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
