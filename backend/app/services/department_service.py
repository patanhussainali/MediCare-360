from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.services.audit_service import audit_service
from app.models.user import User

class DepartmentService:
    @staticmethod
    def get_by_id(db: Session, dept_id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.id == dept_id).first()

    @staticmethod
    def get_multi(db: Session, skip: int = 0, limit: int = 50, is_active: Optional[bool] = None) -> List[Department]:
        query = db.query(Department)
        if is_active is not None:
            query = query.filter(Department.is_active == is_active)
        return query.order_by(Department.name.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, dept_in: DepartmentCreate, current_user: Optional[User] = None) -> Department:
        existing = db.query(Department).filter(Department.name.ilike(dept_in.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department '{dept_in.name}' already exists."
            )

        dept_dict = dept_in.model_dump()
        if not dept_dict.get("code"):
            import re
            clean_name = re.sub(r'[^A-Za-z0-9]', '', dept_dict["name"]).upper()
            dept_dict["code"] = clean_name[:6] if clean_name else "DEPT"

        if "is_active" in dept_dict and "status" not in dept_dict:
            dept_dict["status"] = "Active" if dept_dict["is_active"] else "Inactive"
        elif "status" in dept_dict and "is_active" not in dept_dict:
            dept_dict["is_active"] = (dept_dict["status"].lower() == "active")

        department = Department(**dept_dict)
        db.add(department)
        db.commit()
        db.refresh(department)

        audit_service.log_action(
            db=db,
            action="DEPARTMENT_CREATED",
            resource="Department",
            user=current_user,
            resource_id=str(department.id),
            details={"name": department.name, "code": department.code}
        )

        return department

    @staticmethod
    def update(
        db: Session,
        dept_id: int,
        dept_in: DepartmentUpdate,
        current_user: Optional[User] = None
    ) -> Department:
        department = DepartmentService.get_by_id(db, dept_id)
        if not department:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

        update_data = dept_in.model_dump(exclude_unset=True)
        if "is_active" in update_data and "status" not in update_data:
            update_data["status"] = "Active" if update_data["is_active"] else "Inactive"
        elif "status" in update_data and "is_active" not in update_data:
            update_data["is_active"] = (update_data["status"].lower() == "active")

        for field, value in update_data.items():
            setattr(department, field, value)

        db.commit()
        db.refresh(department)

        audit_service.log_action(
            db=db,
            action="DEPARTMENT_UPDATED",
            resource="Department",
            user=current_user,
            resource_id=str(department.id),
            details={"updated_fields": list(update_data.keys())}
        )

        return department

department_service = DepartmentService()
