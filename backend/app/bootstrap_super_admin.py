import os
import sys
from app.database import SessionLocal
from app.models.user import User
from app.constants import SUPER_ADMIN

def bootstrap():
    email = os.getenv("SUPER_ADMIN_EMAIL")
    if not email:
        print("SUPER_ADMIN_EMAIL environment variable not set. Please set it to promote your user.")
        return
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found. Please register this account on the frontend first, then run this bootstrap script to promote them.")
            return
            
        if user.role != SUPER_ADMIN:
            user.role = SUPER_ADMIN
            db.commit()
            print(f"User {email} successfully promoted to super_admin!")
        else:
            print(f"User {email} is already a super_admin.")
    except Exception as e:
        db.rollback()
        print(f"Error promoting user to super_admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    bootstrap()
