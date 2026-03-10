from sqlalchemy.orm import Session
from uuid import UUID
from apps.companions.models import Companion
from apps.companions.schemas import CompanionResponse, CompanionAvailabilityUpdate, CompanionUpdate, CompanionAvailabilityResponse
from apps.admin_logs.services import log_admin_action


def get_pending_companions(db: Session, current_user: dict, skip: int = 0, limit: int = 10):
    """Get all pending companions (status=false). Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can view pending companions")
    
    query = db.query(Companion).filter(Companion.status == False)
    total = query.count()
    companions = query.offset(skip).limit(limit).all()
    
    items = [
        CompanionResponse(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            phone=c.phone,
            status=c.status,
            availability_status=c.availability_status,
            created_at=c.created_at
        )
        for c in companions
    ]
    return items, total


def approve_companion(db: Session, companion_id: str, current_user: dict) -> CompanionResponse:
    """Approve companion by setting status=true. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can approve companions")
    
    companion_uuid = UUID(companion_id)
    companion = db.query(Companion).filter(Companion.id == companion_uuid).first()
    
    if not companion:
        raise ValueError("Companion not found")
    
    companion.status = True
    db.commit()
    db.refresh(companion)
    
    log_admin_action(
        db=db,
        current_user=current_user,
        action_type="approve",
        entity_type="companion",
        entity_id=companion.id,
        description=f"Approved companion: {companion.full_name}"
    )
    
    return CompanionResponse(
        id=companion.id,
        full_name=companion.full_name,
        email=companion.email,
        phone=companion.phone,
        status=companion.status,
        availability_status=companion.availability_status,
        created_at=companion.created_at
    )


def deactivate_companion(db: Session, companion_id: str, current_user: dict) -> CompanionResponse:
    """Deactivate companion by setting status=false. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can deactivate companions")
    
    companion_uuid = UUID(companion_id)
    companion = db.query(Companion).filter(Companion.id == companion_uuid).first()
    
    if not companion:
        raise ValueError("Companion not found")
    
    companion.status = False
    db.commit()
    db.refresh(companion)
    
    log_admin_action(
        db=db,
        current_user=current_user,
        action_type="deactivate",
        entity_type="companion",
        entity_id=companion.id,
        description=f"Deactivated companion: {companion.full_name}"
    )
    
    return CompanionResponse(
        id=companion.id,
        full_name=companion.full_name,
        email=companion.email,
        phone=companion.phone,
        status=companion.status,
        availability_status=companion.availability_status,
        created_at=companion.created_at
    )


def get_my_companion_profile(db: Session, current_user: dict) -> CompanionResponse:
    """Get own companion profile. Companion-only."""
    if current_user["role"] != "companion":
        raise ValueError("Only companions can view companion profile")
    
    companion_uuid = UUID(current_user["user_id"])
    companion = db.query(Companion).filter(Companion.id == companion_uuid).first()
    
    if not companion:
        raise ValueError("Companion not found")
    
    return CompanionResponse(
        id=companion.id,
        full_name=companion.full_name,
        email=companion.email,
        phone=companion.phone,
        status=companion.status,
        availability_status=companion.availability_status,
        created_at=companion.created_at
    )



def update_my_companion_profile(db: Session, current_user: dict, data: CompanionUpdate) -> CompanionResponse:
    """Update own companion profile. Companion-only."""
    if current_user["role"] != "companion":
        raise ValueError("Only companions can update their profile")
    
    companion_uuid = UUID(current_user["user_id"])
    companion = db.query(Companion).filter(Companion.id == companion_uuid).first()
    
    if not companion:
        raise ValueError("Companion not found")
    
    if data.full_name:
        companion.full_name = data.full_name
    if data.phone:
        companion.phone = data.phone
        
    db.commit()
    db.refresh(companion)
    
    return CompanionResponse(
        id=companion.id,
        full_name=companion.full_name,
        email=companion.email,
        phone=companion.phone,
        status=companion.status,
        availability_status=companion.availability_status,
        created_at=companion.created_at
    )


def update_my_availability(db: Session, current_user: dict, data: CompanionAvailabilityUpdate):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role != "companion":
        raise ValueError("Only companions can update their availability")
    
    companion = db.query(Companion).filter(Companion.id == user_id).first()
    
    if not companion:
        raise ValueError("Companion not found")
    
    companion.availability_status = data.availability_status
    db.commit()
    db.refresh(companion)
    
    return CompanionResponse(
        id=companion.id,
        full_name=companion.full_name,
        email=companion.email,
        phone=companion.phone,
        status=companion.status,
        availability_status=companion.availability_status,
        created_at=companion.created_at
    )



def get_companions_availability(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can view companions availability")
    
    companions = db.query(Companion).all()
    
    return companions


def get_public_companions(db: Session):
    """Get all public available companions. No auth required."""
    companions = db.query(Companion).filter(
        Companion.status == True,
        Companion.availability_status == "available"
    ).all()
    
    return [
        CompanionAvailabilityResponse(
            id=c.id,
            full_name=c.full_name,
            availability_status=c.availability_status,
            status=c.status
        )
        for c in companions
    ]
