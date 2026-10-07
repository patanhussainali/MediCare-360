from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogResponse(AuditLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
