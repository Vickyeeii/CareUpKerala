from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CareFeedCreate(BaseModel):
    booking_id: UUID
    message: str


class CareFeedResponse(BaseModel):
    id: UUID
    booking_id: UUID
    companion_id: UUID
    message: str
    created_at: datetime
    nri_name: str | None = None
    companion_name: str | None = None
