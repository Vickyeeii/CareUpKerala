from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.users.schemas import UserProfileResponse, UserProfileUpdate
from apps.users.services import get_user_profile, update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return get_user_profile(db, current_user["user_id"], current_user["role"])
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    update_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return update_user_profile(db, current_user["user_id"], current_user["role"], update_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
