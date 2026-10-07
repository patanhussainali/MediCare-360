#!/usr/bin/env python3
"""
create_admin.py — MediCare360 Secure Admin Creation Script

Creates the initial system administrator account securely.
Reads credentials from environment variables or interactive prompts.
Passwords are hashed with bcrypt before storage — never stored in plaintext.

Usage:
    # Option A — Use environment variables (recommended for CI/CD):
    FIRST_SUPERUSER_EMAIL="admin@hospital.com" \
    FIRST_SUPERUSER_PASSWORD="StrongPass@2024" \
    FIRST_SUPERUSER_NAME="Hospital Administrator" \
    python create_admin.py

    # Option B — Interactive (local setup):
    python create_admin.py

    # Option C — Windows PowerShell:
    $env:FIRST_SUPERUSER_EMAIL="admin@hospital.com"
    $env:FIRST_SUPERUSER_PASSWORD="StrongPass@2024"
    python create_admin.py
"""

import os
import sys
import getpass
import re

# Ensure the backend app is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> bool:
    return len(password) >= 8


def get_credentials_from_env() -> dict:
    """Read admin credentials from environment variables."""
    return {
        'email': os.environ.get('FIRST_SUPERUSER_EMAIL', '').strip(),
        'password': os.environ.get('FIRST_SUPERUSER_PASSWORD', '').strip(),
        'name': os.environ.get('FIRST_SUPERUSER_NAME', 'Hospital Administrator').strip(),
    }


def get_credentials_interactive() -> dict:
    """Prompt user interactively for admin credentials."""
    print("\n--- MediCare360 Admin Account Setup ---")
    print("This will create the initial administrator account.\n")

    while True:
        email = input("Admin email: ").strip().lower()
        if validate_email(email):
            break
        print("  ✗ Invalid email format. Please try again.")

    name = input("Admin full name [Hospital Administrator]: ").strip()
    if not name:
        name = "Hospital Administrator"

    while True:
        password = getpass.getpass("Admin password (min 8 characters): ")
        if not validate_password(password):
            print("  ✗ Password must be at least 8 characters long.")
            continue
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("  ✗ Passwords do not match. Please try again.")
            continue
        break

    return {'email': email, 'password': password, 'name': name}


def main():
    # Try environment variables first
    creds = get_credentials_from_env()

    if creds['email'] and creds['password']:
        print(f"Using credentials from environment variables for: {creds['email']}")
    else:
        # Fall back to interactive mode
        creds = get_credentials_interactive()

    # Validate before proceeding
    if not validate_email(creds['email']):
        print(f"✗ Invalid email address: {creds['email']}")
        sys.exit(1)

    if not validate_password(creds['password']):
        print("✗ Password must be at least 8 characters long.")
        sys.exit(1)

    # Import app dependencies after validation
    print("\nConnecting to database...")
    try:
        from app.database.session import SessionLocal, engine
        from app.database.base import Base
        from app.models.user import User, UserRole
        from app.core.security import get_password_hash
    except ImportError as e:
        print(f"✗ Import error: {e}")
        print("  Make sure you run this script from the 'backend/' directory.")
        sys.exit(1)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing:
            print(f"\n✗ An administrator account already exists: {existing.email}")
            print("  If you need to reset it, deactivate the existing account first.")
            sys.exit(0)

        # Also check for email conflict with any user
        email_conflict = db.query(User).filter(User.email == creds['email'].lower()).first()
        if email_conflict:
            print(f"\n✗ An account with email '{creds['email']}' already exists (role: {email_conflict.role.value}).")
            sys.exit(1)

        # Hash password and create admin
        hashed = get_password_hash(creds['password'])
        admin = User(
            email=creds['email'].lower(),
            hashed_password=hashed,
            full_name=creds['name'],
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            phone=None,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"\n✓ Administrator account created successfully!")
        print(f"  Email:    {admin.email}")
        print(f"  Name:     {admin.full_name}")
        print(f"  Role:     {admin.role.value}")
        print(f"  Active:   {admin.is_active}")
        print(f"  DB ID:    {admin.id}")
        print(f"\n  Password stored as bcrypt hash — plaintext is NOT retained.")
        print(f"\nYou can now log in at: /api/v1/auth/login")

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error creating admin: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
