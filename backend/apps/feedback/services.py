from sqlalchemy.orm import Session
from apps.feedback.models import Feedback
from apps.bookings.models import Booking
from apps.feedback.schemas import FeedbackCreate, FeedbackResponse
from uuid import UUID
from datetime import datetime
from apps.notifications.services import create_notification
from typing import List


def map_feedback_response(feedback: Feedback) -> FeedbackResponse:
    """Helper to map feedback to response schema with enriched details."""
    booking = feedback.booking
    
    return FeedbackResponse(
        id=feedback.id,
        booking_id=feedback.booking_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=feedback.created_at,
        service_name=booking.service.name if booking and booking.service else None,
        companion_name=booking.companion.full_name if booking and booking.companion else "Unassigned",
        nri_name=booking.nri.full_name if booking and booking.nri else None
    )


def create_feedback(db: Session, data: FeedbackCreate, current_user: dict):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role != "nri":
        raise ValueError("Only NRI users can submit feedback")
    
    # Check if booking exists and belongs to user
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise ValueError("Booking not found")
    
    if booking.nri_id != user_id:
        raise ValueError("You can only review your own bookings")
    
    if booking.status != "completed":
        raise ValueError("You can only review completed bookings")
        
    # Check if feedback already exists
    existing = db.query(Feedback).filter(Feedback.booking_id == data.booking_id).first()
    if existing:
        raise ValueError("You have already submitted feedback for this booking")
    
    feedback = Feedback(
        booking_id=data.booking_id,
        nri_user_id=user_id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Notify Admin
    try:
        from auth.models import Admin
        admin = db.query(Admin).first()
        if admin:
             create_notification(
                db=db,
                user_id=str(admin.id),
                role="admin",
                title="New User Review",
                message=f"New {data.rating}-star review received for booking {booking.id}.",
                related_entity="feedback",
                related_entity_id=feedback.id
            )
    except Exception as e:
        print(f"Failed to send notification: {e}")
        
    return map_feedback_response(feedback)


def get_my_feedback(db: Session, current_user: dict) -> List[FeedbackResponse]:
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role != "nri":
        raise ValueError("Only NRI users can view their feedback")
        
    # Join with Booking to filter by nri_user_id
    feedbacks = db.query(Feedback).join(Booking).filter(
        Booking.nri_id == user_id
    ).order_by(Feedback.created_at.desc()).all()
    
    return [map_feedback_response(f) for f in feedbacks]


def get_all_feedback(db: Session, current_user: dict) -> List[FeedbackResponse]:
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can view all feedback")
        
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    
    return [map_feedback_response(f) for f in feedbacks]
