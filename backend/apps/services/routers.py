from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from middleware.db import get_db
from middleware.auth_utils import get_current_user, get_current_user_optional
from apps.services.schemas import (
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ServicePricingCreate, ServicePricingUpdate, ServicePricingResponse
)
from apps.services.services import (
    create_service, update_service, add_pricing, update_pricing, list_services, delete_service
)

router = APIRouter(prefix="/services", tags=["services"])


@router.post("", response_model=ServiceResponse)
def create_service_route(
    data: ServiceCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_service(db, data, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service_route(
    service_id: str,
    data: ServiceUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_service(db, service_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/pricing", response_model=ServicePricingResponse)
def add_pricing_route(
    data: ServicePricingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return add_pricing(db, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/pricing/{pricing_id}", response_model=ServicePricingResponse)
def update_pricing_route(
    pricing_id: str,
    data: ServicePricingUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_pricing(db, pricing_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("", response_model=List[ServiceResponse])
def list_services_route(
    current_user: dict = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        return list_services(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_route(
    service_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        delete_service(db, service_id, current_user)
        return
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
