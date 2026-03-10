from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from middleware.db import Base


class Service(Base):
    __tablename__ = "tbl_service"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pricing = relationship("ServicePricing", back_populates="service", cascade="all, delete-orphan")


class ServicePricing(Base):
    __tablename__ = "tbl_service_pricing"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("tbl_service.id", ondelete="CASCADE"), nullable=False)
    price = Column(Numeric, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    service = relationship("Service", back_populates="pricing")
