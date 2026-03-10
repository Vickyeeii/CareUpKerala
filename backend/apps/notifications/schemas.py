from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    related_entity: Optional[str]
    related_entity_id: Optional[UUID]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationReadUpdate(BaseModel):
    is_read: bool
