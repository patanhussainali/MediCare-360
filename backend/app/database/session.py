from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings

import os

db_url = os.environ.get("DATABASE_URL") or os.environ.get("DATABASE_PUBLIC_URL") or settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure compatibility between SQLAlchemy 2.0 and installed PostgreSQL drivers
if db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    try:
        import psycopg  # noqa: F401
    except ImportError:
        try:
            import psycopg2  # noqa: F401
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        except ImportError:
            pass

from sqlalchemy.pool import NullPool
from sqlalchemy import event

engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if db_url.startswith("sqlite:///./medicare360.db") and not os.path.exists("medicare360.db") and os.path.exists("backend/medicare360.db"):
        db_url = "sqlite:///./backend/medicare360.db"
    # NullPool prevents QueuePool exhaustion on SQLite embedded databases
    engine_kwargs["poolclass"] = NullPool
    engine_kwargs["connect_args"] = connect_args
else:
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 40
    engine_kwargs["pool_timeout"] = 60

engine = create_engine(db_url, **engine_kwargs)

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
