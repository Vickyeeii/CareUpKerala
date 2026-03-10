from sqlalchemy.orm import Session
from sqlalchemy import func
from auth.models import NRIUser, Companion
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.hospitals.models import Hospital
from apps.complaints.models import Complaint


def get_overview(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can access dashboard")
    
    total_bookings = db.query(func.count(Booking.id)).scalar()
    active_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status.in_(["pending", "confirmed", "in_progress"])
    ).scalar()
    completed_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status == "completed"
    ).scalar()
    
    total_nri_users = db.query(func.count(NRIUser.id)).scalar()
    total_companions = db.query(func.count(Companion.id)).scalar()
    pending_companions = db.query(func.count(Companion.id)).filter(
        Companion.status == False
    ).scalar()
    
    total_hospitals = db.query(func.count(Hospital.id)).scalar()
    
    return {
        "total_bookings": total_bookings or 0,
        "active_bookings": active_bookings or 0,
        "completed_bookings": completed_bookings or 0,
        "total_nri_users": total_nri_users or 0,
        "total_companions": total_companions or 0,
        "pending_companions": pending_companions or 0,
        "total_hospitals": total_hospitals or 0
    }


def get_revenue(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can access dashboard")
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "paid"
    ).scalar()
    
    pending_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == "pending"
    ).scalar()
    
    failed_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == "failed"
    ).scalar()
    
    return {
        "total_revenue": float(total_revenue or 0),
        "pending_payments": pending_payments or 0,
        "failed_payments": failed_payments or 0
    }


def get_bookings_by_status(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can access dashboard")
    
    results = db.query(
        Booking.status,
        func.count(Booking.id)
    ).group_by(Booking.status).all()
    
    status_counts = {status: count for status, count in results}
    
    return {"status_counts": status_counts}


def get_complaints_summary(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can access dashboard")
    
    results = db.query(
        Complaint.status,
        func.count(Complaint.id)
    ).group_by(Complaint.status).all()
    
    status_counts = {status: count for status, count in results}
    
    return {"status_counts": status_counts}


def get_companions_summary(db: Session, current_user: dict):
    role = current_user.get("role")
    
    if role != "admin":
        raise ValueError("Only Admin users can access dashboard")
    
    approved = db.query(func.count(Companion.id)).filter(
        Companion.status == True
    ).scalar()
    
    pending = db.query(func.count(Companion.id)).filter(
        Companion.status == False
    ).scalar()
    
    deactivated = 0
    
    return {
        "approved": approved or 0,
        "pending": pending or 0,
        "deactivated": deactivated
    }
