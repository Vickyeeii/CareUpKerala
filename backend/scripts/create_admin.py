#!/usr/bin/env python3
"""
Create Admin User Script
Run: python scripts/create_admin.py
"""
import sys
import os
import getpass

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from middleware.db import SessionLocal
from middleware.security import hash_password
from auth.models import Admin


def create_admin():
    print("=== Create Admin User ===\n")
    
    # Get input
    full_name = input("Full Name: ").strip()
    email = input("Email: ").strip()
    password = getpass.getpass("Password: ")
    phone = input("Phone: ").strip()
    
    if not all([full_name, email, password, phone]):
        print("Error: All fields are required")
        return
    
    db = SessionLocal()
    try:
        # Check if admin exists
        existing = db.query(Admin).filter(Admin.email == email).first()
        if existing:
            print("Admin already exists with this email")
            return
        
        # Create admin
        admin = Admin(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            phone=phone
        )
        db.add(admin)
        db.commit()
        
        print(f"\nAdmin created successfully\nEmail: {email}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
