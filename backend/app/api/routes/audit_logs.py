from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_service import audit_service
from app.core.dependencies import require_roles
from app.models.user import UserRole, User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = Query(None, description="Filter by action type e.g. USER_LOGIN"),
    resource: Optional[str] = Query(None, description="Filter by resource type e.g. Patient"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Retrieve system audit logs. Admin only.
    Tracks login, logout, patient creation, record updates, billing changes and more.
    """
    return audit_service.get_logs(db, skip=skip, limit=limit, action=action, resource=resource)
