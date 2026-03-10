from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.companions.schemas import CompanionResponse, CompanionListResponse, CompanionAvailabilityUpdate, CompanionAvailabilityResponse, CompanionUpdate
from apps.companions.services import (
    get_pending_companions,
    approve_companion,
    deactivate_companion,
    get_my_companion_profile,
    update_my_companion_profile,
    update_my_availability,
    get_companions_availability,
    get_public_companions
)
from typing import List

router = APIRouter(prefix="/companions", tags=["companions"])


@router.get("/public", response_model=List[CompanionAvailabilityResponse])
def get_public_companions_route(
    db: Session = Depends(get_db)
):
    try:
        return get_public_companions(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/pending", response_model=CompanionListResponse)
def list_pending_companions(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        skip = (page - 1) * limit
        companions, total = get_pending_companions(db, current_user, skip=skip, limit=limit)
        return CompanionListResponse(companions=companions, total=total)
    except ValueError as e:
        print(f"DEBUG ERROR in pending companions: {str(e)}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch("/{companion_id}/approve", response_model=CompanionResponse)
def approve_companion_route(
    companion_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return approve_companion(db, companion_id, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch("/{companion_id}/deactivate", response_model=CompanionResponse)
def deactivate_companion_route(
    companion_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return deactivate_companion(db, companion_id, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/me", response_model=CompanionResponse)
def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_my_companion_profile(db, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/me", response_model=CompanionResponse)
def update_profile_route(
    data: CompanionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_my_companion_profile(db, current_user, data)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/me/availability", response_model=CompanionResponse)
def update_companion_availability(
    data: CompanionAvailabilityUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        companion = update_my_availability(db, current_user, data)
        return companion
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/availability", response_model=List[CompanionAvailabilityResponse])
def get_all_companions_availability(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        companions = get_companions_availability(db, current_user)
        return companions
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
