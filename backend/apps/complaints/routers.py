from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.complaints.schemas import ComplaintCreate, ComplaintResponse, ComplaintAdminUpdate, ComplaintListResponse
from apps.complaints.services import create_complaint, get_my_complaints, get_all_complaints, update_complaint
from uuid import UUID
from typing import List

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_new_complaint(
    data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        complaint = create_complaint(db, data, current_user)
        return complaint
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/me", response_model=ComplaintListResponse)
def get_my_complaints_list(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        items, total = get_my_complaints(db, current_user, page, limit)
        return {"items": items, "total": total}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("", response_model=ComplaintListResponse)
def get_all_complaints_list(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        items, total = get_all_complaints(db, current_user, page, limit)
        return {"items": items, "total": total}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: UUID,
    data: ComplaintAdminUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        complaint = update_complaint(db, complaint_id, data, current_user)
        return complaint
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        if "Invalid status" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=403, detail=str(e))
