from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.pharmacy import MedicineCreate, MedicineUpdate, MedicineResponse, MedicineIssueCreate, MedicineIssueResponse
from app.services.pharmacy_service import pharmacy_service
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import UserRole, User
from pydantic import BaseModel

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])

class StockUpdateRequest(BaseModel):
    quantity_delta: int
    reason: Optional[str] = None

@router.post("/medicines", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine_in: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """Add a new medicine to inventory. Admin/Pharmacist only."""
    return pharmacy_service.create_medicine(db, medicine_in, current_user)

@router.get("/medicines", response_model=List[MedicineResponse])
def list_medicines(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all medicines with optional search and category filter."""
    return pharmacy_service.get_medicines(db, skip=skip, limit=limit, search=search, category=category)

@router.get("/medicines/low-stock", response_model=List[MedicineResponse])
def get_low_stock_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """List medicines at or below minimum stock threshold for procurement alert."""
    return pharmacy_service.get_low_stock_medicines(db)

@router.get("/medicines/{medicine_id}", response_model=MedicineResponse)
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a medicine by ID."""
    medicine = pharmacy_service.get_medicine_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")
    return medicine

@router.put("/medicines/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    medicine_in: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """Update medicine details."""
    return pharmacy_service.update_medicine(db, medicine_id, medicine_in, current_user)

@router.patch("/medicines/{medicine_id}/stock", response_model=MedicineResponse)
def update_medicine_stock(
    medicine_id: int,
    stock_update: StockUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """Adjust medicine stock level by a delta value (positive=restock, negative=usage)."""
    return pharmacy_service.update_stock(db, medicine_id, stock_update.quantity_delta, current_user)

@router.post("/issue", response_model=MedicineIssueResponse, status_code=status.HTTP_201_CREATED)
def issue_medicine(
    issue_in: MedicineIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """Record a medicine issue/dispense transaction. Decrements inventory automatically."""
    return pharmacy_service.issue_medicine(db, issue_in, current_user)

@router.get("/issue", response_model=List[MedicineIssueResponse])
def list_issue_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PHARMACIST))
):
    """List all medicine issue/dispense records."""
    return pharmacy_service.get_issue_records(db, skip=skip, limit=limit)
