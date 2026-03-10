from sqlalchemy.orm import Session
from uuid import UUID
from apps.hospitals.models import Hospital
from apps.hospitals.schemas import HospitalCreate, HospitalUpdate, HospitalResponse


def create_hospital(db: Session, data: HospitalCreate, current_user: dict) -> HospitalResponse:
    """Create new hospital. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can create hospitals")
    
    hospital = Hospital(
        name=data.name,
        location=data.location,
        address=data.address,
        phone=data.phone
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    
    return HospitalResponse(
        id=hospital.id,
        name=hospital.name,
        location=hospital.location,
        address=hospital.address,
        phone=hospital.phone,
        created_at=hospital.created_at
    )


def update_hospital(db: Session, hospital_id: str, data: HospitalUpdate, current_user: dict) -> HospitalResponse:
    """Update hospital. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can update hospitals")
    
    hospital_uuid = UUID(hospital_id)
    hospital = db.query(Hospital).filter(Hospital.id == hospital_uuid).first()
    
    if not hospital:
        raise ValueError("Hospital not found")
    
    if data.name is not None:
        hospital.name = data.name
    if data.location is not None:
        hospital.location = data.location
    if data.address is not None:
        hospital.address = data.address
    if data.phone is not None:
        hospital.phone = data.phone
    
    db.commit()
    db.refresh(hospital)
    
    return HospitalResponse(
        id=hospital.id,
        name=hospital.name,
        location=hospital.location,
        address=hospital.address,
        phone=hospital.phone,
        created_at=hospital.created_at
    )


def list_hospitals(db: Session, current_user: dict) -> list[HospitalResponse]:
    """List all hospitals. Authenticated users only."""
    if current_user["role"] not in ["admin", "nri", "companion"]:
        raise ValueError("Authentication required")
    
    hospitals = db.query(Hospital).all()
    return [
        HospitalResponse(
            id=h.id,
            name=h.name,
            location=h.location,
            address=h.address,
            phone=h.phone,
            created_at=h.created_at
        )
        for h in hospitals
    ]


def delete_hospital(db: Session, hospital_id: str, current_user: dict) -> bool:
    """Delete hospital. Admin-only."""
    if current_user["role"] != "admin":
        raise ValueError("Only admins can delete hospitals")
    
    hospital_uuid = UUID(hospital_id)
    hospital = db.query(Hospital).filter(Hospital.id == hospital_uuid).first()
    
    if not hospital:
        raise ValueError("Hospital not found")
    
    db.delete(hospital)
    db.commit()
    return True
