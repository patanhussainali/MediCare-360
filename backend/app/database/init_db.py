import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.user import User, UserRole
from app.models.department import Department
from app.core.security import get_password_hash
from app.core.config import settings

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed Master Admin
    admin_user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
    if not admin_user:
        admin_user = User(
            email=settings.FIRST_SUPERUSER_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="MediCare360 Master Admin",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            phone="+1-800-MED-360"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info(f"Master admin created: {settings.FIRST_SUPERUSER_EMAIL}")
    
    # 2. Seed Default Departments
    default_departments = [
        {"name": "Cardiology", "description": "Heart and vascular health care"},
        {"name": "Neurology", "description": "Brain, spinal cord and nervous system care"},
        {"name": "Pediatrics", "description": "Medical care for infants, children, and adolescents"},
        {"name": "Orthopedics", "description": "Bones, joints, ligaments, tendons, and muscles care"},
        {"name": "General Medicine", "description": "Primary and comprehensive adult medical care"},
        {"name": "Dermatology", "description": "Skin, hair, and nail health care"},
        {"name": "Emergency", "description": "24/7 urgent and emergency trauma care"},
        {"name": "Pharmacy", "description": "Medicinal supply, prescription dispensing and inventory"},
    ]
    for dept_data in default_departments:
        dept = db.query(Department).filter(Department.name == dept_data["name"]).first()
        if not dept:
            dept = Department(**dept_data, is_active=True)
            db.add(dept)
    
    db.commit()
    logger.info("Database initialized with seed data successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    db.close()
