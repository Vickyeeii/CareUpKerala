from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from middleware.db import Base


class AdminActionLog(Base):
    __tablename__ = "tbl_admin_action_log"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), nullable=False)
    action_type = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
