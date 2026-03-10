from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.feedback.schemas import FeedbackCreate, FeedbackResponse
from apps.feedback.services import create_feedback, get_my_feedback, get_all_feedback
from typing import List

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse, status_code=201)
def submit_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        feedback = create_feedback(db, data, current_user)
        return feedback
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        if "already submitted" in str(e):
            raise HTTPException(status_code=409, detail=str(e))
        if "completed" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/me", response_model=List[FeedbackResponse])
def get_my_feedback_list(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        feedback_list = get_my_feedback(db, current_user)
        return feedback_list
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback_list(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        feedback_list = get_all_feedback(db, current_user)
        return feedback_list
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
