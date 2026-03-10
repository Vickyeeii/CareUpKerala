from sqlalchemy.orm import Session
from apps.notifications.models import Notification
from uuid import UUID


def get_my_notifications(db: Session, current_user: dict):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role not in ["nri", "admin", "companion"]:
        raise ValueError("Role unauthorized to view notifications")
    
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.role == role
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications


def mark_notification_read(db: Session, notification_id: UUID, current_user: dict):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role not in ["nri", "admin", "companion"]:
        raise ValueError("Role unauthorized to mark notifications as read")
    
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise ValueError("Notification not found")
    
    if notification.user_id != user_id or notification.role != role:
        raise ValueError("You can only mark your own notifications as read")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification


def create_notification(
    db: Session,
    user_id: UUID,
    role: str,
    title: str,
    message: str,
    related_entity: str = None,
    related_entity_id: UUID = None
):
    notification = Notification(
        user_id=user_id,
        role=role,
        title=title,
        message=message,
        related_entity=related_entity,
        related_entity_id=related_entity_id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification
