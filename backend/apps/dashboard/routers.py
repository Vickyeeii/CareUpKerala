from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.dashboard.schemas import (
    OverviewResponse,
    RevenueResponse,
    BookingStatusResponse,
    ComplaintSummaryResponse,
    CompanionSummaryResponse
)
from apps.dashboard.services import (
    get_overview,
    get_revenue,
    get_bookings_by_status,
    get_complaints_summary,
    get_companions_summary
)

router = APIRouter(prefix="/dashboard/admin", tags=["dashboard"])


@router.get("/overview", response_model=OverviewResponse)
def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        data = get_overview(db, current_user)
        return data
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/revenue", response_model=RevenueResponse)
def get_admin_revenue(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        data = get_revenue(db, current_user)
        return data
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/bookings/status", response_model=BookingStatusResponse)
def get_bookings_status(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        data = get_bookings_by_status(db, current_user)
        return data
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/complaints/summary", response_model=ComplaintSummaryResponse)
def get_complaints_summary_data(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        data = get_complaints_summary(db, current_user)
        return data
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/companions/summary", response_model=CompanionSummaryResponse)
def get_companions_summary_data(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        data = get_companions_summary(db, current_user)
        return data
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
