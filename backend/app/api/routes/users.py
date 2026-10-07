"""
users.py — Admin User Management Routes

All endpoints require ADMIN role.
Backend enforces RBAC — role assignment cannot be escalated by client.
Passwords are always hashed with bcrypt — never stored or returned in plaintext.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.services.auth_service import auth_service
from app.core.dependencies import require_roles
from app.core.security import get_password_hash
from app.models.user import User, UserRole

router = APIRouter(prefix="/users", tags=["User Management"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Create a new user with specified role. Admin only.
    Password is automatically hashed with bcrypt.
    Role profiles are linked automatically.
    """
    return auth_service.register(db, user_in)


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    List all users. Admin only.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Get a specific user by ID. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Update user details (name, phone, is_active, role, password). Admin only.
    - Role assignment is backend-enforced — never trusted from client alone.
    - Passwords are hashed with bcrypt before storage.
    - password_hash is never returned.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if update_data.full_name is not None:
        user.full_name = update_data.full_name

    if update_data.phone is not None:
        user.phone = update_data.phone

    if update_data.is_active is not None:
        # Prevent admin from deactivating their own account
        if user.id == current_user.id and not update_data.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account."
            )
        user.is_active = update_data.is_active

    if update_data.role is not None:
        # Prevent non-superadmin from elevating to ADMIN (only existing admins can set ADMIN role)
        if update_data.role == UserRole.ADMIN and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to assign ADMIN role."
            )
        user.role = update_data.role

    if update_data.password is not None:
        if len(update_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )
        # Hash password with bcrypt — plaintext is discarded after this point
        user.hashed_password = get_password_hash(update_data.password)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Delete a user account. Admin only.
    Cannot delete own account.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own active administrator account."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
