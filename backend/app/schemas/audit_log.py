import json
from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Any, Dict, Union
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[Union[Dict[str, Any], str]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogResponse(AuditLogBase):
    id: int
    created_at: datetime

    @field_validator("details", mode="before")
    @classmethod
    def parse_details(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {"message": v}
        return v

    model_config = ConfigDict(from_attributes=True)
