from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class PaymentCreate(BaseModel):
    booking_id: UUID
    payment_method: Optional[str] = None


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str]
    created_at: datetime


class PaymentStatusUpdate(BaseModel):
    status: str
