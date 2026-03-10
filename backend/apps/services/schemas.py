from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    pricing: Optional[list['ServicePricingResponse']] = []


class ServicePricingCreate(BaseModel):
    service_id: UUID
    price: Decimal
    currency: str = "INR"


class ServicePricingUpdate(BaseModel):
    price: Optional[Decimal] = None
    currency: Optional[str] = None


class ServicePricingResponse(BaseModel):
    id: UUID
    service_id: UUID
    price: Decimal
    currency: str
    created_at: datetime
