from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.bookings.schemas import (
    BookingCreate, BookingResponse, BookingStatusUpdate, BookingAssignCompanion, BookingListResponse
)
from apps.bookings.services import (
    create_booking, get_my_bookings, get_all_bookings,
    update_booking_status, assign_companion
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse)
def create_booking_route(
    data: BookingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_booking(db, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/me", response_model=BookingListResponse)
def get_my_bookings_route(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        items, total = get_my_bookings(db, current_user, page, limit)
        return {"items": items, "total": total}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("", response_model=BookingListResponse)
def get_all_bookings_route(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        items, total = get_all_bookings(db, current_user, page, limit)
        return {"items": items, "total": total}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status_route(
    booking_id: str,
    data: BookingStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_booking_status(db, booking_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{booking_id}/assign-companion", response_model=BookingResponse)
def assign_companion_route(
    booking_id: str,
    data: BookingAssignCompanion,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return assign_companion(db, booking_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
