from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.care_feed.schemas import CareFeedCreate, CareFeedResponse
from apps.care_feed.services import (
    create_care_feed, get_assigned_care_feeds, get_booking_care_feed,
    get_all_care_feeds, delete_care_feed
)

router = APIRouter(prefix="/care-feed", tags=["care-feed"])


@router.post("", response_model=CareFeedResponse)
def create_care_feed_route(
    data: CareFeedCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_care_feed(db, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/assigned", response_model=List[CareFeedResponse])
def get_assigned_care_feeds_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_assigned_care_feeds(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/{booking_id}", response_model=List[CareFeedResponse])
def get_booking_care_feed_route(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_booking_care_feed(db, booking_id, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("", response_model=List[CareFeedResponse])
def get_all_care_feeds_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_all_care_feeds(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/{care_feed_id}")
def delete_care_feed_route(
    care_feed_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        delete_care_feed(db, care_feed_id, current_user)
        return {"message": "Care feed entry deleted successfully"}
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
