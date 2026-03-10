from sqlalchemy.orm import Session
from uuid import UUID
from apps.payments.models import Payment
from apps.payments.schemas import PaymentCreate, PaymentResponse, PaymentStatusUpdate
from apps.bookings.models import Booking
from apps.services.models import ServicePricing
from apps.admin_logs.services import log_admin_action
from apps.notifications.services import create_notification


def create_payment(db: Session, data: PaymentCreate, current_user: dict) -> PaymentResponse:
    """Create payment for booking. NRI only."""
    if current_user["role"] != "nri":
        raise ValueError("Only NRI users can create payments")
    
    nri_uuid = UUID(current_user["user_id"])
    
    # Validate booking exists and belongs to NRI
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise ValueError("Booking not found")
    
    if booking.nri_id != nri_uuid:
        raise ValueError("Booking does not belong to you")
    
    # Check if payment already exists for this booking
    existing_payment = db.query(Payment).filter(Payment.booking_id == data.booking_id).first()
    if existing_payment:
        raise ValueError("Payment already exists for this booking")
    
    # Get amount from booking pricing
    pricing = db.query(ServicePricing).filter(ServicePricing.id == booking.pricing_id).first()
    if not pricing:
        raise ValueError("Pricing not found")
    
    payment = Payment(
        booking_id=data.booking_id,
        amount=pricing.price,
        currency="INR",
        status="pending",
        payment_method=data.payment_method
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Notify Admin
    try:
        from auth.models import Admin
        admin = db.query(Admin).first()
        if admin:
             create_notification(
                db=db,
                user_id=str(admin.id),
                role="admin",
                title="Payment Received",
                message=f"Payment of {payment.currency} {payment.amount} received via {payment.payment_method}",
                related_entity="payment",
                related_entity_id=payment.id
            )
    except Exception as e:
        print(f"Failed to send notification: {e}")
    
    return PaymentResponse(
        id=payment.id,
        booking_id=payment.booking_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        created_at=payment.created_at
    )


def get_my_payments(db: Session, current_user: dict) -> list[PaymentResponse]:
    """Get own payments. NRI only."""
    if current_user["role"] != "nri":
        raise ValueError("Only NRI users can view their payments")
    
    nri_uuid = UUID(current_user["user_id"])
    
    # Get payments for bookings belonging to this NRI
    payments = db.query(Payment).join(Booking).filter(Booking.nri_id == nri_uuid).all()
    
    return [
        PaymentResponse(
            id=p.id,
            booking_id=p.booking_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            payment_method=p.payment_method,
            created_at=p.created_at
        )
        for p in payments
    ]


def get_all_payments(db: Session, current_user: dict) -> list[PaymentResponse]:
    """Get all payments. Admin only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can view all payments")
    
    payments = db.query(Payment).all()
    
    return [
        PaymentResponse(
            id=p.id,
            booking_id=p.booking_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            payment_method=p.payment_method,
            created_at=p.created_at
        )
        for p in payments
    ]


def update_payment_status(db: Session, payment_id: str, data: PaymentStatusUpdate, current_user: dict) -> PaymentResponse:
    """Update payment status. Admin only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can update payment status")
    
    allowed_statuses = ["pending", "paid", "failed"]
    if data.status not in allowed_statuses:
        raise ValueError(f"Invalid status. Allowed: {', '.join(allowed_statuses)}")
    
    payment_uuid = UUID(payment_id)
    payment = db.query(Payment).filter(Payment.id == payment_uuid).first()
    
    if not payment:
        raise ValueError("Payment not found")
    
    payment.status = data.status
    db.commit()
    db.refresh(payment)
    
    log_admin_action(
        db=db,
        current_user=current_user,
        action_type="update_status",
        entity_type="payment",
        entity_id=payment.id,
        description=f"Updated payment status to: {payment.status}"
    )
    
    return PaymentResponse(
        id=payment.id,
        booking_id=payment.booking_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        created_at=payment.created_at
    )
