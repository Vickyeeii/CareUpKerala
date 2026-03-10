from pydantic import BaseModel
from typing import List, Literal, Optional
from uuid import UUID
from datetime import datetime


class CompanionResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str
    status: bool
    availability_status: str
    created_at: datetime


class CompanionApprovalRequest(BaseModel):
    status: bool


class CompanionListResponse(BaseModel):
    companions: List[CompanionResponse]
    total: int


class CompanionAvailabilityUpdate(BaseModel):
    availability_status: Literal["available", "unavailable"]


class CompanionUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class CompanionAvailabilityResponse(BaseModel):
    id: UUID
    full_name: str
    availability_status: str
    status: bool

    class Config:
        from_attributes = True
