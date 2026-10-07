from datetime import datetime
from typing import Optional, Union, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole = UserRole.PATIENT
    phone: Optional[str] = None
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole = UserRole.PATIENT
    phone_number: Optional[str] = None  # Alias used for convenience; stored as phone

    @property
    def phone(self) -> Optional[str]:
        return self.phone_number

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v: Any):
        if isinstance(v, str) and v.strip():
            role_key = v.strip().upper()
            if role_key in UserRole.__members__:
                return UserRole[role_key]
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v: Any):
        if isinstance(v, str) and v.strip():
            role_key = v.strip().upper()
            if role_key in UserRole.__members__:
                return UserRole[role_key]
        return v


class UserResponse(UserBase):
    id: int
    is_verified: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    profile_id: Optional[str] = None
    department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def extract_profile_fields(cls, data: Any):
        if hasattr(data, "doctor_profile") and getattr(data, "doctor_profile"):
            dp = data.doctor_profile
            data_dict = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            data_dict["profile_id"] = getattr(dp, "doctor_id", None)
            if hasattr(dp, "department") and dp.department:
                data_dict["department"] = getattr(dp.department, "name", None)
            elif getattr(dp, "specialization", None):
                data_dict["department"] = dp.specialization
            return data_dict
        elif hasattr(data, "patient_profile") and getattr(data, "patient_profile"):
            pp = data.patient_profile
            data_dict = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            data_dict["profile_id"] = getattr(pp, "patient_id", None)
            return data_dict
        return data


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Union[UserRole, str]] = None

    @field_validator("role", mode="before")
    @classmethod
    def normalize_login_role(cls, v: Any):
        if isinstance(v, str) and v.strip():
            role_key = v.strip().upper()
            if role_key in UserRole.__members__:
                return UserRole[role_key]
        return v


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Alias for TokenPayload — used in dependencies."""
    sub: str
    role: str
    type: str
    exp: int


# Keep old name for backward compat
TokenPayload = TokenData


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# Keep old name for backward compat
RefreshTokenRequest = TokenRefreshRequest
