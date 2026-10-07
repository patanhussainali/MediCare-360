from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.notification import NotificationResponse
from app.services.notification_service import notification_service
from app.core.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all notifications for the currently authenticated user."""
    return notification_service.get_user_notifications(db, current_user.id, skip=skip, limit=limit)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a single notification as read."""
    notif = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notif:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notif

@router.patch("/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark all of the current user's unread notifications as read."""
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"message": f"{count} notifications marked as read"}
