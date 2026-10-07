from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Tuple
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    is_token_blacklisted
)
from app.services.audit_service import audit_service

class AuthService:
    @staticmethod
    def register(db: Session, user_in: UserCreate, ip_address: Optional[str] = None) -> User:
        # Check if email already registered
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        
        # Check password constraints
        if len(user_in.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )
        
        user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role or UserRole.PATIENT,
            phone=user_in.phone_number,
            is_active=True,
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        audit_service.log_action(
            db=db,
            action="USER_REGISTERED",
            resource="User",
            user=user,
            resource_id=str(user.id),
            details={"email": user.email, "role": user.role.value},
            ip_address=ip_address
        )

        return user

    @staticmethod
    def authenticate(db: Session, login_data: UserLogin, ip_address: Optional[str] = None) -> Tuple[Token, User]:
        user = db.query(User).filter(User.email == login_data.email.lower()).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or unauthorized role",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify role against database source of truth (Prevent Role Switching)
        if login_data.role is not None and user.role != login_data.role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or unauthorized role",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is deactivated. Please contact Hospital Administration."
            )
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value)

        audit_service.log_action(
            db=db,
            action="USER_LOGIN",
            resource="User",
            user=user,
            resource_id=str(user.id),
            details={"email": user.email, "role": user.role.value},
            ip_address=ip_address
        )

        token = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user
        )
        return token, user

    @staticmethod
    def refresh_token(db: Session, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
        user = db.query(User).filter(User.id == int(user_id_str)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
        
        # Blacklist used refresh token (rotation)
        blacklist_token(refresh_token)

        new_access_token = create_access_token(subject=str(user.id), role=user.role.value)
        new_refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value)

        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=user
        )

    @staticmethod
    def logout(db: Session, token: str, user: User, ip_address: Optional[str] = None) -> None:
        blacklist_token(token)
        audit_service.log_action(
            db=db,
            action="USER_LOGOUT",
            resource="User",
            user=user,
            resource_id=str(user.id),
            details={"email": user.email},
            ip_address=ip_address
        )

auth_service = AuthService()
