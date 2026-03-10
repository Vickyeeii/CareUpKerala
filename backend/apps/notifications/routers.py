from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.notifications.schemas import NotificationResponse, NotificationReadUpdate
from apps.notifications.services import get_my_notifications, mark_notification_read, create_notification
from uuid import UUID
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        notifications = get_my_notifications(db, current_user)
        return notifications
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: UUID,
    update: NotificationReadUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        notification = mark_notification_read(db, notification_id, current_user)
        return notification
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=403, detail=str(e))


#For testing we used temporary notification for it where admin create for testing purpose 

# @router.post("/test")
# def create_test_notification(
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_user),
# ):
#     if current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Forbidden")

#     create_notification(
#     db=db,
#     user_id=current_user["user_id"],
#     role="admin",
#     title="New Care Update",
#     message="A new live care update has been posted for your booking.",
#     related_entity="care_feed",
# )

#     return {"message": "Test notification created"}


#Notification 1 — Booking Created

# create_notification(
#     db=db,
#     user_id="7431c235-1fff-4502-ab58-98dbf65c41ad",
#     role="nri",
#     title="Booking Created",
#     message="Your booking has been successfully created and is awaiting confirmation.",
#     related_entity="booking",
# )

#Notification 2 — Companion Assigned

# create_notification(
#     db=db,
#     user_id="7431c235-1fff-4502-ab58-98dbf65c41ad",
#     role="nri",
#     title="Companion Assigned",
#     message="A companion has been assigned to your booking.",
#     related_entity="companion",
# )

# Notification 3 — Payment Pending

# create_notification(
#     db=db,
#     user_id="7431c235-1fff-4502-ab58-98dbf65c41ad",
#     role="nri",
#     title="Payment Pending",
#     message="Please complete the payment to proceed with your service.",
#     related_entity="payment",
# )

# Notification 4 — Payment Successful

# create_notification(
#     db=db,
#     user_id="7431c235-1fff-4502-ab58-98dbf65c41ad",
#     role="nri",
#     title="Payment Successful",
#     message="Your payment has been successfully processed.",
#     related_entity="payment",
# )

# Notification 5 — New Care Update

# create_notification(
#     db=db,
#     user_id="7431c235-1fff-4502-ab58-98dbf65c41ad",
#     role="nri",
#     title="New Care Update",
#     message="A new live care update has been posted for your booking.",
#     related_entity="care_feed",
# )
