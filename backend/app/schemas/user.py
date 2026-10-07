from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
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


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_verified: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[UserRole] = None


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
