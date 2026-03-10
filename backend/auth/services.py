from sqlalchemy.orm import Session
from datetime import datetime
from jose import jwt, JWTError
from auth.models import Admin, NRIUser, Companion, RefreshToken
from middleware.security import verify_password, hash_password, create_access_token, create_refresh_token
from middleware.config import SECRET_KEY, ALGORITHM
from middleware.auth_utils import get_user_by_email


def authenticate_user(db: Session, email: str, password: str) -> tuple[str, str, str]:
    """Authenticate user and return (user_id, role, access_token, refresh_token)"""
    result = get_user_by_email(db, email)
    if not result:
        raise ValueError("Invalid email or password")
    
    user, role = result
    
    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    
    if role == "companion" and not user.status:
        raise ValueError("Companion account not approved")
    
    # Delete old refresh tokens for this user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.role == role
    ).delete()
    
    # Create tokens
    access_token = create_access_token(str(user.id), role)
    refresh_token_str, expires_at = create_refresh_token(str(user.id), role)
    
    # Store refresh token
    refresh_token = RefreshToken(
        user_id=user.id,
        role=role,
        token=refresh_token_str,
        expires_at=expires_at
    )
    db.add(refresh_token)
    db.commit()
    
    return str(user.id), role, access_token, refresh_token_str


def refresh_access_token(db: Session, refresh_token: str) -> str:
    """Validate refresh token and issue new access token"""
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")
    except JWTError:
        raise ValueError("Invalid refresh token")
    
    # Check if token exists in database and not expired
    token_record = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not token_record:
        raise ValueError("Invalid or expired refresh token")
    
    return create_access_token(str(token_record.user_id), token_record.role)


def register_nri(db: Session, full_name: str, email: str, password: str, phone: str, country: str) -> str:
    """Register new NRI user and return user_id"""
    if get_user_by_email(db, email):
        raise ValueError("Email already registered")
    
    user = NRIUser(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        phone=phone,
        country=country
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return str(user.id)


def register_companion(db: Session, full_name: str, email: str, password: str, phone: str) -> str:
    """Register new companion and return user_id"""
    if get_user_by_email(db, email):
        raise ValueError("Email already registered")
    
    user = Companion(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        phone=phone,
        status=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return str(user.id)


def logout_user(db: Session, refresh_token: str) -> None:
    """Revoke refresh token"""
    deleted = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).delete()
    db.commit()
    if not deleted:
        raise ValueError("Invalid refresh token")
