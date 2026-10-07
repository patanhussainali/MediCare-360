import json
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from app.models.audit_log import AuditLog
from app.models.user import User

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        resource: str,
        user: Optional[User] = None,
        user_id: Optional[int] = None,
        user_email: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        actual_user_id = user.id if user else user_id
        actual_user_email = user.email if user else user_email
        actual_user_name = user.full_name if user else (user_email or "System")
        
        details_str = json.dumps(details) if isinstance(details, (dict, list)) else (str(details) if details else None)
        
        log = AuditLog(
            user_id=actual_user_id,
            user_email=actual_user_email,
            user_name=actual_user_name,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details_str,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_logs(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        action: Optional[str] = None,
        resource: Optional[str] = None
    ) -> List[AuditLog]:
        query = db.query(AuditLog)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource:
            query = query.filter(AuditLog.resource == resource)
        return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

audit_service = AuditService()
