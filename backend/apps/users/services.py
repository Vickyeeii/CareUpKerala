from sqlalchemy.orm import Session
from uuid import UUID
from apps.users.models import Admin, NRIUser, Companion
from apps.users.schemas import UserProfileResponse, UserProfileUpdate


def get_user_profile(db: Session, user_id: str, role: str) -> UserProfileResponse:
    """Fetch user profile based on role and user_id"""
    user_uuid = UUID(user_id)
    
    if role == "admin":
        user = db.query(Admin).filter(Admin.id == user_uuid).first()
        if not user:
            raise ValueError("User not found")
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=role,
            created_at=user.created_at
        )
    
    elif role == "nri":
        user = db.query(NRIUser).filter(NRIUser.id == user_uuid).first()
        if not user:
            raise ValueError("User not found")
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=role,
            created_at=user.created_at,
            country=user.country
        )
    
    elif role == "companion":
        user = db.query(Companion).filter(Companion.id == user_uuid).first()
        if not user:
            raise ValueError("User not found")
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=role,
            created_at=user.created_at,
            status=user.status
        )
    
    raise ValueError("Invalid role")


def update_user_profile(db: Session, user_id: str, role: str, update_data: UserProfileUpdate) -> UserProfileResponse:
    """Update user profile with role-based field restrictions"""
    user_uuid = UUID(user_id)
    
    if role == "admin":
        raise ValueError("Admin profile updates not allowed")
    
    elif role == "nri":
        user = db.query(NRIUser).filter(NRIUser.id == user_uuid).first()
        if not user:
            raise ValueError("User not found")
        
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.phone is not None:
            user.phone = update_data.phone
        if update_data.country is not None:
            user.country = update_data.country
        
        db.commit()
        db.refresh(user)
        
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=role,
            created_at=user.created_at,
            country=user.country
        )
    
    elif role == "companion":
        user = db.query(Companion).filter(Companion.id == user_uuid).first()
        if not user:
            raise ValueError("User not found")
        
        if update_data.country is not None:
            raise ValueError("Companions cannot update country field")
        
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.phone is not None:
            user.phone = update_data.phone
        
        db.commit()
        db.refresh(user)
        
        return UserProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=role,
            created_at=user.created_at,
            status=user.status
        )
    
    raise ValueError("Invalid role")
