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
    logger.info("Initializing database schema...")
    try:
        # Create all tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}", exc_info=True)
        raise e

    # 1. Seed Master Admins
    admins_to_seed = [
        {
            "email": settings.FIRST_SUPERUSER_EMAIL,
            "password": settings.FIRST_SUPERUSER_PASSWORD,
            "full_name": settings.FIRST_SUPERUSER_NAME,
        }
    ]
    # Also support standard admin if different
    if settings.FIRST_SUPERUSER_EMAIL.lower() != "admin@medicare360.com":
        admins_to_seed.append({
            "email": "admin@medicare360.com",
            "password": "Admin@123",
            "full_name": "MediCare360 System Admin",
        })

    for admin_info in admins_to_seed:
        admin_email = admin_info["email"].lower()
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            try:
                admin_user = User(
                    email=admin_email,
                    hashed_password=get_password_hash(admin_info["password"]),
                    full_name=admin_info["full_name"],
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_verified=True,
                    phone="+1-800-MED-360"
                )
                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)
                logger.info(f"Master admin seeded: {admin_email}")
            except Exception as e:
                db.rollback()
                logger.error(f"Error seeding admin user '{admin_email}': {e}", exc_info=True)
                raise e
        else:
            logger.info(f"Admin user already exists: {admin_email}")

    # 2. Seed Default Departments
    default_departments = [
        {"code": "CARD", "name": "Cardiology", "description": "Heart and vascular health care"},
        {"code": "NEUR", "name": "Neurology", "description": "Brain, spinal cord and nervous system care"},
        {"code": "PEDI", "name": "Pediatrics", "description": "Medical care for infants, children, and adolescents"},
        {"code": "ORTH", "name": "Orthopedics", "description": "Bones, joints, ligaments, tendons, and muscles care"},
        {"code": "GENM", "name": "General Medicine", "description": "Primary and comprehensive adult medical care"},
        {"code": "DERM", "name": "Dermatology", "description": "Skin, hair, and nail health care"},
        {"code": "EMER", "name": "Emergency", "description": "24/7 urgent and emergency trauma care"},
        {"code": "PHAR", "name": "Pharmacy", "description": "Medicinal supply, prescription dispensing and inventory"},
    ]

    for dept_data in default_departments:
        try:
            dept = db.query(Department).filter(
                (Department.name == dept_data["name"]) | (Department.code == dept_data["code"])
            ).first()
            if not dept:
                dept = Department(
                    code=dept_data["code"],
                    name=dept_data["name"],
                    description=dept_data["description"],
                    status="Active",
                    is_active=True
                )
                db.add(dept)
                db.commit()
                db.refresh(dept)
                logger.info(f"Seeded department: {dept.name} ({dept.code})")
            else:
                updated = False
                if not dept.is_active:
                    dept.is_active = True
                    updated = True
                if not dept.code:
                    dept.code = dept_data["code"]
                    updated = True
                if updated:
                    db.commit()
                logger.info(f"Department verified: {dept.name} ({dept.code})")
        except Exception as e:
            db.rollback()
            logger.error(f"Error seeding department '{dept_data.get('name')}': {e}", exc_info=True)
            raise e

    logger.info("Database initialization completed successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    db.close()
