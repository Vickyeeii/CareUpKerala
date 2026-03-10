from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.admin_logs.schemas import AdminActionLogResponse, AdminLogListResponse
from apps.admin_logs.services import get_admin_logs
from typing import List

router = APIRouter(prefix="/admin-logs", tags=["admin-logs"])


@router.get("", response_model=AdminLogListResponse)
def get_all_admin_logs(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        skip = (page - 1) * limit
        logs, total = get_admin_logs(db, current_user, skip=skip, limit=limit)
        return AdminLogListResponse(logs=logs, total=total)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
