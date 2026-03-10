from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.hospitals.schemas import HospitalCreate, HospitalUpdate, HospitalResponse
from apps.hospitals.services import create_hospital, update_hospital, list_hospitals, delete_hospital

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.post("", response_model=HospitalResponse)
def create_hospital_route(
    data: HospitalCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return create_hospital(db, data, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/{hospital_id}", response_model=HospitalResponse)
def update_hospital_route(
    hospital_id: str,
    data: HospitalUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_hospital(db, hospital_id, data, current_user)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("", response_model=List[HospitalResponse])
def list_hospitals_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return list_hospitals(db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hospital_route(
    hospital_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        delete_hospital(db, hospital_id, current_user)
        return
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
