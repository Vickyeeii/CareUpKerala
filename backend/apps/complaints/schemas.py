from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List


class ComplaintCreate(BaseModel):
    booking_id: UUID
    title: str
    description: str


class ComplaintResponse(BaseModel):
    id: UUID
    booking_id: UUID
    title: str
    description: str
    status: str
    admin_response: Optional[str]
    created_at: datetime
    
    # Enhanced Details
    patient_name: Optional[str] = None
    companion_name: Optional[str] = None
    service_name: Optional[str] = None
    nri_name: Optional[str] = None
    booking_reference_id: Optional[UUID] = None

    class Config:
        from_attributes = True



class ComplaintAdminUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None


class ComplaintListResponse(BaseModel):
    items: List[ComplaintResponse]
    total: int
