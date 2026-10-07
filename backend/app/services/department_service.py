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

        department = Department(**dept_in.model_dump())
        db.add(department)
        db.commit()
        db.refresh(department)

        audit_service.log_action(
            db=db,
            action="DEPARTMENT_CREATED",
            resource="Department",
            user=current_user,
            resource_id=str(department.id),
            details={"name": department.name}
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
