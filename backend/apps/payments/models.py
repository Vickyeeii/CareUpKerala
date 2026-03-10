from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from middleware.db import Base


class Payment(Base):
    __tablename__ = "tbl_payment"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("tbl_booking.id"), nullable=False, unique=True)
    amount = Column(Numeric, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    status = Column(String, default="pending", nullable=False)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    booking = relationship("Booking")
