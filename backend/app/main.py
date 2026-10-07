import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.api.api import api_router
from app.database.session import SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown procedures."""
    # Startup
    logger.info("🚀 Starting MediCare360 Backend API...")
    db = SessionLocal()
    try:
        from app.database.init_db import init_db
        init_db(db)
        logger.info("✅ Database initialized and seeded.")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    finally:
        db.close()
    
    yield
    
    # Shutdown
    logger.info("🛑 MediCare360 Backend shutting down...")


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            "**MediCare360** – Full-Stack Hospital Management Platform REST API.\n\n"
            "### Features\n"
            "- 🔐 JWT Authentication with Role-Based Access Control (RBAC)\n"
            "- 👤 Roles: PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ADMIN\n"
            "- 🏥 Patient, Doctor, Appointment, and Medical Records management\n"
            "- 💊 Pharmacy inventory and prescription dispensing\n"
            "- 💰 Billing and Invoice lifecycle\n"
            "- 📊 Analytics and Reporting endpoints\n"
            "- 🔔 Notification system\n"
            "- 📋 Audit Logging for all important actions\n\n"
            "### Default Admin Credentials\n"
            "- **Email**: `hussainalipatan@gmail.com`\n"
            "- **Password**: `patan@02`\n"
        ),
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # CORS - configured for localhost development and Netlify / production deployments
    cors_origins = [str(origin) for origin in settings.CORS_ORIGINS]
    allow_all_origins = "*" in cors_origins

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all_origins else cors_origins,
        allow_origin_regex=None if allow_all_origins else r"^https:\/\/.*\.netlify\.app$",
        allow_credentials=not allow_all_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API router
    application.include_router(api_router, prefix=settings.API_V1_STR)

    # --- Global Exception Handlers ---

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validation error",
                "errors": exc.errors(),
                "body": str(exc.body) if hasattr(exc, "body") else None
            }
        )

    @application.exception_handler(SQLAlchemyError)
    async def database_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "A database error occurred. Please try again."}
        )

    @application.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred."}
        )

    # --- Health check endpoint ---
    @application.get("/health", tags=["Health"], summary="Health Check")
    async def health_check():
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION
        }

    return application


app = create_application()
