from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from middleware.db import Base


class Booking(Base):
    __tablename__ = "tbl_booking"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nri_id = Column(UUID(as_uuid=True), ForeignKey("nri_users.id"), nullable=False)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("tbl_hospital.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("tbl_service.id"), nullable=False)
    pricing_id = Column(UUID(as_uuid=True), ForeignKey("tbl_service_pricing.id"), nullable=False)
    companion_id = Column(UUID(as_uuid=True), ForeignKey("companions.id"), nullable=True)
    status = Column(String, default="pending", nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    
    # Patient Details
    patient_name = Column(String, nullable=True) # Making nullable=True initially to avoid migration issues with existing data, or default=""
    patient_age = Column(String, nullable=True)
    patient_gender = Column(String, nullable=True)
    patient_phone = Column(String, nullable=True)
    patient_notes = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    
    nri = relationship("NRIUser")
    hospital = relationship("Hospital")
    service = relationship("Service")
    pricing = relationship("ServicePricing")
    companion = relationship("Companion")
