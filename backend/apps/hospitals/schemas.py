from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class HospitalCreate(BaseModel):
    name: str
    location: str
    address: str
    phone: str


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class HospitalResponse(BaseModel):
    id: UUID
    name: str
    location: str
    address: str
    phone: str
    created_at: datetime
