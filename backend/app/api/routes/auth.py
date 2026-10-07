from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Union
from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenRefreshRequest
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_user, oauth2_scheme
from app.models.user import User, UserRole
from app.core.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/check-admin", summary="Check whether a system admin exists")
def check_admin_exists(db: Session = Depends(get_db)):
    """
    Returns whether the system has at least one active ADMIN account.
    Used by the frontend first-run setup flow.
    """
    has_admin = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.is_active == True
    ).first() is not None
    return {"hasAdmin": has_admin}


@router.post("/setup-admin", response_model=Token, status_code=status.HTTP_201_CREATED,
             summary="Create the initial system administrator")
def setup_master_admin(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    One-time endpoint to create the first admin account.
    Rejected if any admin already exists.
    Password is hashed with bcrypt server-side — never stored in plaintext.
    """
    # Reject if admin already exists
    existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System administrator account is already configured."
        )

    # Force the role to ADMIN regardless of what client sends
    user_in_admin = UserCreate(
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        role=UserRole.ADMIN,
        phone_number=user_in.phone_number,
    )
    client_ip = request.client.host if request.client else None
    user = auth_service.register(db, user_in_admin, ip_address=client_ip)

    # Mark as verified immediately (admin sets up their own account)
    user.is_verified = True
    db.commit()
    db.refresh(user)

    from app.core.security import create_access_token, create_refresh_token
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user account with role selection (default PATIENT).
    """
    client_ip = request.client.host if request.client else None
    return auth_service.register(db, user_in, ip_address=client_ip)


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Standard JSON login endpoint returning access and refresh JWT tokens.
    """
    client_ip = request.client.host if request.client else None
    token, _ = auth_service.authenticate(db, login_data, ip_address=client_ip)
    return token


@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    OAuth2 form login compatible with Swagger UI 'Authorize' button.
    """
    client_ip = request.client.host if request and request.client else None
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    token, _ = auth_service.authenticate(db, login_data, ip_address=client_ip)
    return token


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_in: TokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Rotate and refresh access token using a valid refresh token.
    """
    return auth_service.refresh_token(db, refresh_in.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Invalidate current JWT access token via token blacklisting and audit the logout.
    """
    client_ip = request.client.host if request.client else None
    auth_service.logout(db, token, current_user, ip_address=client_ip)
    return {"message": "Successfully logged out and token invalidated."}


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve profile details of the currently authenticated user.
    """
    return current_user
