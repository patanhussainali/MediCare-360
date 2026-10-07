from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

class NotificationService:
    @staticmethod
    def create_notification(db: Session, notification_in: NotificationCreate) -> Notification:
        notif = Notification(**notification_in.model_dump())
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def send(db: Session, user_id: int, title: str, message: str, type: str = "general", link: Optional[str] = None) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif and not notif.is_read:
            notif.is_read = True
            notif.read_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        count = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({
            Notification.is_read: True,
            Notification.read_at: now
        })
        db.commit()
        return count

notification_service = NotificationService()
