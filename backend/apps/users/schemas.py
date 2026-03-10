from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserProfileResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str
    role: str
    created_at: datetime
    country: Optional[str] = None
    status: Optional[bool] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
