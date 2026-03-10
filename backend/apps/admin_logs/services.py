from sqlalchemy.orm import Session
from apps.admin_logs.models import AdminActionLog
from uuid import UUID


def log_admin_action(
    db: Session,
    current_user: dict,
    action_type: str,
    entity_type: str,
    entity_id: UUID,
    description: str
):
    role = current_user.get("role")
    admin_id = UUID(current_user.get("user_id"))
    
    if role != "admin":
        raise ValueError("Only Admin users can create action logs")
    
    log_entry = AdminActionLog(
        admin_id=admin_id,
        action_type=action_type,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description
    )
    
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    
    return log_entry


def get_admin_logs(db: Session, current_user: dict, skip: int = 0, limit: int = 10):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can view action logs")
    
    query = db.query(AdminActionLog).order_by(AdminActionLog.created_at.desc())
    total = query.count()
    logs = query.offset(skip).limit(limit).all()
    
    return logs, total
