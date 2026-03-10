from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class AdminActionLogResponse(BaseModel):
    id: UUID
    action_type: str
    entity_type: str
    entity_id: Optional[UUID]
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogListResponse(BaseModel):
    logs: list[AdminActionLogResponse]
    total: int
