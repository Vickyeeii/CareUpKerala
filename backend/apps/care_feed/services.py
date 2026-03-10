from sqlalchemy.orm import Session
from uuid import UUID
from apps.care_feed.models import CareFeed
from apps.care_feed.schemas import CareFeedCreate, CareFeedResponse
from apps.bookings.models import Booking
from apps.notifications.services import create_notification


def create_care_feed(db: Session, data: CareFeedCreate, current_user: dict) -> CareFeedResponse:
    """Create care feed entry. Companion only."""
    if current_user["role"] != "companion":
        raise ValueError("Only companions can create care feed entries")
    
    companion_uuid = UUID(current_user["user_id"])
    
    # Validate booking exists
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise ValueError("Booking not found")
    
    # Validate companion is assigned to this booking
    if booking.companion_id != companion_uuid:
        raise ValueError("You are not assigned to this booking")
    
    care_feed = CareFeed(
        booking_id=data.booking_id,
        companion_id=companion_uuid,
        message=data.message
    )
    db.add(care_feed)
    db.commit()
    db.refresh(care_feed)

    # Notify NRI User
    try:
        if booking.nri_id:
            create_notification(
                db=db,
                user_id=str(booking.nri_id),
                role="nri",
                title="New Care Update",
                message=f"New update posted for your booking: {data.message[:50]}...",
                related_entity="care_feed",
                related_entity_id=care_feed.id
            )
        
        # Notify Admin
        from auth.models import Admin
        admin = db.query(Admin).first()
        if admin:
             create_notification(
                db=db,
                user_id=str(admin.id),
                role="admin",
                title="New Care Feed Posted",
                message=f"New update for booking {booking.id} by companion: {data.message[:50]}...",
                related_entity="care_feed",
                related_entity_id=care_feed.id
            )
    except Exception as e:
        print(f"Failed to send notification: {e}")
    
    return CareFeedResponse(
        id=care_feed.id,
        booking_id=care_feed.booking_id,
        companion_id=care_feed.companion_id,
        message=care_feed.message,
        created_at=care_feed.created_at
    )


def get_assigned_care_feeds(db: Session, current_user: dict) -> list[CareFeedResponse]:
    """Get care feeds for assigned bookings. Companion only."""
    if current_user["role"] != "companion":
        raise ValueError("Only companions can view assigned care feeds")
    
    companion_uuid = UUID(current_user["user_id"])
    
    # Get feeds for bookings assigned to this companion
    feeds = db.query(CareFeed).filter(CareFeed.companion_id == companion_uuid).all()
    
    return [
        CareFeedResponse(
            id=f.id,
            booking_id=f.booking_id,
            companion_id=f.companion_id,
            message=f.message,
            created_at=f.created_at
        )
        for f in feeds
    ]


def get_booking_care_feed(db: Session, booking_id: str, current_user: dict) -> list[CareFeedResponse]:
    """Get care feed for a specific booking. NRI or Companion."""
    if current_user["role"] not in ["nri", "companion"]:
        raise ValueError("Role unauthorized to view booking care feeds")
    
    user_uuid = UUID(current_user["user_id"])
    booking_uuid = UUID(booking_id)
    
    # Validate booking exists
    booking = db.query(Booking).filter(Booking.id == booking_uuid).first()
    if not booking:
        raise ValueError("Booking not found")
    
    # Check access based on role
    if current_user["role"] == "nri" and booking.nri_id != user_uuid:
        raise ValueError("Booking does not belong to you")
    elif current_user["role"] == "companion" and booking.companion_id != user_uuid:
        raise ValueError("You are not assigned to this booking")
    
    # Get feeds for this booking
    feeds = db.query(CareFeed).filter(CareFeed.booking_id == booking_uuid).all()
    
    return [
        CareFeedResponse(
            id=f.id,
            booking_id=f.booking_id,
            companion_id=f.companion_id,
            message=f.message,
            created_at=f.created_at,
            nri_name=f.booking.nri.full_name if f.booking and f.booking.nri else None,
            companion_name=f.companion.full_name if f.companion else None
        )
        for f in feeds
    ]


def get_all_care_feeds(db: Session, current_user: dict) -> list[CareFeedResponse]:
    """Get all care feeds. Admin only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can view all care feeds")
    
    feeds = db.query(CareFeed).all()
    
    return [
        CareFeedResponse(
            id=f.id,
            booking_id=f.booking_id,
            companion_id=f.companion_id,
            message=f.message,
            created_at=f.created_at,
            nri_name=f.booking.nri.full_name if f.booking and f.booking.nri else "Unknown",
            companion_name=f.companion.full_name if f.companion else "Unknown"
        )
        for f in feeds
    ]


def delete_care_feed(db: Session, care_feed_id: str, current_user: dict) -> None:
    """Delete care feed entry. Admin only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can delete care feed entries")
    
    feed_uuid = UUID(care_feed_id)
    feed = db.query(CareFeed).filter(CareFeed.id == feed_uuid).first()
    
    if not feed:
        raise ValueError("Care feed entry not found")
    
    db.delete(feed)
    db.commit()
