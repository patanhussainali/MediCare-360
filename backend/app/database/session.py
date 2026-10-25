from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


def _is_dummy_placeholder(url: str) -> bool:
    """Check if the DATABASE_URL contains documentation placeholder tokens."""
    if not url:
        return True
    dummy_indicators = [
        "@host:", "@host/", "postgres:password@host", "user:password@host",
        "@your-db-host", "@database-host", "@your-host", "password@host"
    ]
    return any(dummy in url for dummy in dummy_indicators)


def resolve_db_engine():
    """
    Resolves the active database URL and builds a resilient SQLAlchemy engine.
    - Automatically detects and replaces documentation placeholder URLs (like '@host').
    - Ensures driver compatibility (psycopg vs psycopg2).
    - Falls back to SQLite if remote PostgreSQL is misconfigured or unreachable.
    """
    raw_url = os.environ.get("DATABASE_URL") or os.environ.get("DATABASE_PUBLIC_URL") or settings.DATABASE_URL

    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)

    # 1. Fall back if dummy placeholder host is present
    if _is_dummy_placeholder(raw_url):
        logger.warning(
            f"Detected unconfigured placeholder DATABASE_URL ('{raw_url}'). "
            "Falling back to embedded SQLite database (sqlite:///./medicare360.db)."
        )
        raw_url = "sqlite:///./medicare360.db"

    # 2. Driver normalization for PostgreSQL
    if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        try:
            import psycopg  # noqa: F401
        except ImportError:
            try:
                import psycopg2  # noqa: F401
                raw_url = raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            except ImportError:
                pass

    def build_engine_instance(url: str):
        kwargs = {"echo": False, "pool_pre_ping": True}
        if url.startswith("sqlite"):
            if url.startswith("sqlite:///./medicare360.db") and not os.path.exists("medicare360.db") and os.path.exists("backend/medicare360.db"):
                url = "sqlite:///./backend/medicare360.db"
            kwargs["poolclass"] = NullPool
            kwargs["connect_args"] = {"check_same_thread": False}
        else:
            kwargs["pool_size"] = 20
            kwargs["max_overflow"] = 40
            kwargs["pool_timeout"] = 60
        return create_engine(url, **kwargs), url

    if raw_url.startswith("sqlite"):
        return build_engine_instance(raw_url)

    # 3. For remote databases (e.g. PostgreSQL), verify connectivity eagerly
    try:
        eng, final_url = build_engine_instance(raw_url)
        with eng.connect() as conn:
            pass
        logger.info("Successfully connected to primary PostgreSQL database.")
        return eng, final_url
    except Exception as exc:
        logger.warning(
            f"Could not connect to configured database at '{raw_url}': {exc}. "
            "Falling back to embedded SQLite database (sqlite:///./medicare360.db) to ensure service availability."
        )
        return build_engine_instance("sqlite:///./medicare360.db")


engine, db_url = resolve_db_engine()


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if db_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=15000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
