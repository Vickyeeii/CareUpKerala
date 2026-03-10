from sqlalchemy.orm import Session
from uuid import UUID
from apps.services.models import Service, ServicePricing
from apps.services.schemas import (
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ServicePricingCreate, ServicePricingUpdate, ServicePricingResponse
)


def create_service(db: Session, data: ServiceCreate, current_user: dict) -> ServiceResponse:
    """Create new service. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can create services")
    
    service = Service(
        name=data.name,
        description=data.description,
        is_active=data.is_active
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return ServiceResponse(
        id=service.id,
        name=service.name,
        description=service.description,
        is_active=service.is_active,
        created_at=service.created_at
    )


def update_service(db: Session, service_id: str, data: ServiceUpdate, current_user: dict) -> ServiceResponse:
    """Update service. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can update services")
    
    service_uuid = UUID(service_id)
    service = db.query(Service).filter(Service.id == service_uuid).first()
    
    if not service:
        raise ValueError("Service not found")
    
    if data.name is not None:
        service.name = data.name
    if data.description is not None:
        service.description = data.description
    if data.is_active is not None:
        service.is_active = data.is_active
    
    db.commit()
    db.refresh(service)
    
    return ServiceResponse(
        id=service.id,
        name=service.name,
        description=service.description,
        is_active=service.is_active,
        created_at=service.created_at
    )


def add_pricing(db: Session, data: ServicePricingCreate, current_user: dict) -> ServicePricingResponse:
    """Add pricing for a service. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can add pricing")
    
    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise ValueError("Service not found")
    
    pricing = ServicePricing(
        service_id=data.service_id,
        price=data.price,
        currency=data.currency
    )
    db.add(pricing)
    db.commit()
    db.refresh(pricing)
    
    return ServicePricingResponse(
        id=pricing.id,
        service_id=pricing.service_id,
        price=pricing.price,
        currency=pricing.currency,
        created_at=pricing.created_at
    )


def update_pricing(db: Session, pricing_id: str, data: ServicePricingUpdate, current_user: dict) -> ServicePricingResponse:
    """Update pricing. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can update pricing")
    
    pricing_uuid = UUID(pricing_id)
    pricing = db.query(ServicePricing).filter(ServicePricing.id == pricing_uuid).first()
    
    if not pricing:
        raise ValueError("Pricing not found")
    
    if data.price is not None:
        pricing.price = data.price
    if data.currency is not None:
        pricing.currency = data.currency
    
    db.commit()
    db.refresh(pricing)
    
    return ServicePricingResponse(
        id=pricing.id,
        service_id=pricing.service_id,
        price=pricing.price,
        currency=pricing.currency,
        created_at=pricing.created_at
    )


def list_services(db: Session, current_user: dict | None) -> list[ServiceResponse]:
    """List all services. Public access allowed."""
    # Optional: If you want to show inactive services only to admins, use current_user check here.
    # For now, let's return all active services for public, or just all.
    # Assuming public page needs all active ones. Admin dashboard needs all.
    # Let's filter active only for non-admins?
    
    query = db.query(Service)
    
    # If user is guest or not admin, show only active services?
    # Given the landing page uses this, it makes sense.
    if not current_user or current_user.get("role") != "admin":
        query = query.filter(Service.is_active == True)
        
    services = query.all()
    return [
        ServiceResponse(
            id=s.id,
            name=s.name,
            description=s.description,
            is_active=s.is_active,
            created_at=s.created_at,
            pricing=[
                ServicePricingResponse(
                    id=p.id,
                    service_id=p.service_id,
                    price=p.price,
                    currency=p.currency,
                    created_at=p.created_at
                ) for p in s.pricing
            ]
        )
        for s in services
    ]


def delete_service(db: Session, service_id: str, current_user: dict) -> bool:
    """Delete service. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can delete services")
    
    service_uuid = UUID(service_id)
    service = db.query(Service).filter(Service.id == service_uuid).first()
    
    if not service:
        raise ValueError("Service not found")
    
    db.delete(service)
    db.commit()
    return True
