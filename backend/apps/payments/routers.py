from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.payments.schemas import PaymentCreate, PaymentResponse, PaymentStatusUpdate
from apps.payments.services import (
    create_payment, get_my_payments, get_all_payments, update_payment_status
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentResponse)
def create_payment_route(
    data: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_payment(db, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/me", response_model=List[PaymentResponse])
def get_my_payments_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_my_payments(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("", response_model=List[PaymentResponse])
def get_all_payments_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_all_payments(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status_route(
    payment_id: str,
    data: PaymentStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_payment_status(db, payment_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
