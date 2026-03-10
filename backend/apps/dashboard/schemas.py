from pydantic import BaseModel
from typing import Dict


class OverviewResponse(BaseModel):
    total_bookings: int
    active_bookings: int
    completed_bookings: int
    total_nri_users: int
    total_companions: int
    pending_companions: int
    total_hospitals: int


class RevenueResponse(BaseModel):
    total_revenue: float
    pending_payments: int
    failed_payments: int


class BookingStatusResponse(BaseModel):
    status_counts: Dict[str, int]


class ComplaintSummaryResponse(BaseModel):
    status_counts: Dict[str, int]


class CompanionSummaryResponse(BaseModel):
    approved: int
    pending: int
    deactivated: int
