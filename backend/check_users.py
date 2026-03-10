
from middleware.db import SessionLocal
from auth.models import Admin, NRIUser, Companion

db = SessionLocal()

print("--- ADMINS ---")
for u in db.query(Admin).all():
    print(f"ID: {u.id}, Email: {u.email}")

print("\n--- NRI USERS ---")
for u in db.query(NRIUser).all():
    print(f"ID: {u.id}, Email: {u.email}")

print("\n--- COMPANIONS ---")
for u in db.query(Companion).all():
    print(f"ID: {u.id}, Email: {u.email}, Status: {u.status}")

db.close()
