import json
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MediCare360 Hospital Management Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security — must be overridden via environment variable in production
    # Never hardcode a real SECRET_KEY here; set it in .env (ignored by git)
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database — default to local SQLite for development
    DATABASE_URL: str = "sqlite:///./medicare360.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        elif isinstance(v, list):
            return v
        return []

    # Initial superuser seed — loaded from environment variables only.
    # Set FIRST_SUPERUSER_EMAIL and FIRST_SUPERUSER_PASSWORD in .env (never commit real values).
    # If left empty, database seeding is skipped and admin must be created via the setup-admin endpoint.
    FIRST_SUPERUSER_EMAIL: str = ""
    FIRST_SUPERUSER_PASSWORD: str = ""
    FIRST_SUPERUSER_NAME: str = "Hospital Administrator"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return self.BACKEND_CORS_ORIGINS

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
