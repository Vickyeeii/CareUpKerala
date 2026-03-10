from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from middleware.db import Base


class Feedback(Base):
    __tablename__ = "tbl_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("tbl_booking.id"), nullable=False, unique=True)
    nri_user_id = Column(UUID(as_uuid=True), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    booking = relationship("Booking")
