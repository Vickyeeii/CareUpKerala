from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from middleware.db import Base


class CareFeed(Base):
    __tablename__ = "tbl_care_feed"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("tbl_booking.id"), nullable=False)
    companion_id = Column(UUID(as_uuid=True), ForeignKey("companions.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    booking = relationship("Booking")
    companion = relationship("Companion")
