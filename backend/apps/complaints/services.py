from sqlalchemy.orm import Session
from apps.complaints.models import Complaint
from apps.bookings.models import Booking
from apps.complaints.schemas import ComplaintCreate, ComplaintAdminUpdate, ComplaintResponse
from uuid import UUID
from datetime import datetime
from apps.admin_logs.services import log_admin_action
from apps.notifications.services import create_notification


def map_complaint_response(complaint: Complaint) -> ComplaintResponse:
    """Helper to map complaint to response schema with details."""
    booking = complaint.booking
    
    return ComplaintResponse(
        id=complaint.id,
        booking_id=complaint.booking_id,
        title=complaint.title,
        description=complaint.description,
        status=complaint.status,
        admin_response=complaint.admin_response,
        created_at=complaint.created_at,
        patient_name=booking.patient_name if booking else None,
        companion_name=booking.companion.full_name if booking and booking.companion else "Not Assigned",
        service_name=booking.service.name if booking and booking.service else None,
        nri_name=booking.nri.full_name if booking and booking.nri else None,
        booking_reference_id=booking.id if booking else None
    )


def create_complaint(db: Session, data: ComplaintCreate, current_user: dict):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role != "nri":
        raise ValueError("Only NRI users can create complaints")
    
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    if booking.nri_id != user_id:
        raise ValueError("You can only create complaints for your own bookings")
    
    complaint = Complaint(
        booking_id=data.booking_id,
        nri_user_id=user_id,
        title=data.title,
        description=data.description
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Notify Admin
    try:
        from auth.models import Admin
        admin = db.query(Admin).first()
        if admin:
             create_notification(
                db=db,
                user_id=str(admin.id),
                role="admin",
                title="New Complaint Filed",
                message=f"New complaint filed for booking {booking.id}. Status: Open.",
                related_entity="complaint",
                related_entity_id=complaint.id
            )
    except Exception as e:
        print(f"Failed to send notification: {e}")
    
    return map_complaint_response(complaint)



def get_my_complaints(db: Session, current_user: dict, page: int = 1, limit: int = 10):
    role = current_user.get("role")
    user_id = UUID(current_user.get("user_id"))
    
    if role != "nri":
        raise ValueError("Only NRI users can view their complaints")
    
    query = db.query(Complaint).filter(Complaint.nri_user_id == user_id)
    total = query.count()
    complaints = query.order_by(Complaint.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    items = [map_complaint_response(c) for c in complaints]
    return items, total


def get_all_complaints(db: Session, current_user: dict, page: int = 1, limit: int = 10):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can view all complaints")
    
    query = db.query(Complaint)
    total = query.count()
    complaints = query.order_by(Complaint.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    items = [map_complaint_response(c) for c in complaints]
    return items, total


def update_complaint(db: Session, complaint_id: UUID, data: ComplaintAdminUpdate, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can update complaints")
    
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise ValueError("Complaint not found")
    
    if data.status not in ["open", "in_review", "resolved", "rejected"]:
        raise ValueError("Invalid status value")
    
    complaint.status = data.status
    if data.admin_response is not None:
        complaint.admin_response = data.admin_response
    complaint.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(complaint)
    
    log_admin_action(
        db=db,
        current_user=current_user,
        action_type="update_status",
        entity_type="complaint",
        entity_id=complaint.id,
        description=f"Updated complaint status to: {complaint.status}"
    )
    
    return map_complaint_response(complaint)
