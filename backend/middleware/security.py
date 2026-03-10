import hashlib
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from middleware.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS


def hash_password(password: str) -> str:
    """Hash password using SHA256 pre-hash + bcrypt"""
    sha256_hash = hashlib.sha256(password.encode()).hexdigest()
    return bcrypt.hashpw(sha256_hash.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return bcrypt.checkpw(sha256_hash.encode(), hashed_password.encode())


def create_access_token(user_id: str, role: str) -> str:
    """Create short-lived access token"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"user_id": user_id, "role": role, "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str, role: str) -> tuple[str, datetime]:
    """Create long-lived refresh token and return token + expiry"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"user_id": user_id, "role": role, "exp": expire, "type": "refresh"}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token, expire


def verify_access_token(token: str) -> dict:
    """Verify access token and return payload, reject refresh tokens"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError("Invalid token type")
        return payload
    except JWTError:
        raise ValueError("Invalid token")
