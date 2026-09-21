import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
 
from app.database import Base, engine
 
from app.routes.auth import router as auth_router
from app.routes.traffic import router as traffic_router
from app.routes.dashboard import router as dashboard_router
from app.routes.prediction import router as prediction_router
from app.routes.analytics import router as analytics_router
from app.routes.alerts import router as alerts_router
from app.routes.super_admin import router as super_admin_router
from app.routes.admin_requests import router as admin_requests_router
from app.routes.admin import router as admin_router
 
from app.exceptions.handlers import (
    http_exception_handler,
    validation_exception_handler,
    internal_exception_handler,
)
 
# Importing app.models registers every model class on Base's metadata
# before create_all() runs below.
from app.models import *  # noqa: F401,F403
 
Base.metadata.create_all(bind=engine)

def run_migrations():
    import glob
    from sqlalchemy import text
    from app.database import SessionLocal
    
    # migrations/ is at the repo root level
    migrations_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "migrations")
    )
    
    migration_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))
    if not migration_files:
        print(f"No migrations found in: {migrations_dir}")
        
    db = SessionLocal()
    try:
        if migration_files:
            for filepath in migration_files:
                print(f"Running database migration DDL: {os.path.basename(filepath)}...")
                with open(filepath, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                    db.execute(text(sql_content))
            db.commit()
            print("All DDL migrations executed successfully.")
            
        # Bootstrap super_admin if requested in env (supports multiple comma-separated emails)
        super_admin_emails = os.getenv("SUPER_ADMIN_EMAIL")
        if super_admin_emails:
            from app.models.user import User
            from app.constants import SUPER_ADMIN
            emails = [e.strip() for e in super_admin_emails.split(",") if e.strip()]
            for email in emails:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    if user.role != SUPER_ADMIN:
                        user.role = SUPER_ADMIN
                        db.commit()
                        print(f"AUTOMATIC BOOTSTRAP: Promoted {email} to super_admin.")
                    else:
                        print(f"AUTOMATIC BOOTSTRAP: {email} is already a super_admin.")
                else:
                    print(f"AUTOMATIC BOOTSTRAP: User {email} not found yet in database. Register first.")
    except Exception as e:
        db.rollback()
        print(f"Database initialization warning/error: {e}")
    finally:
        db.close()

run_migrations()
 
app = FastAPI(title="TrafficVision AI")
 
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

print("FRONTEND_URL loaded by backend:", repr(FRONTEND_URL))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, internal_exception_handler)
 
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(traffic_router)
app.include_router(dashboard_router)
app.include_router(prediction_router)
app.include_router(alerts_router)
app.include_router(super_admin_router)
app.include_router(admin_requests_router)
app.include_router(admin_router)
 
 
@app.get("/")
def home():
    return {"message": "TrafficVision AI Backend Running Successfully 🚦"}


@app.get("/diagnostic/email")
def diagnostic_email(test_to: str = "deekshithagilla@gmail.com"):
    import smtplib
    import requests
    from app.config import (
        MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_SERVER, MAIL_PORT,
        MAIL_STARTTLS, MAIL_SSL_TLS, BREVO_API_KEY, RESEND_API_KEY,
        ACCIDENT_ALERT_EMAIL_ENABLED, ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES,
        ACCIDENT_ALERT_EMAIL_THRESHOLD
    )
    
    results = {
        "config": {
            "MAIL_SERVER": MAIL_SERVER,
            "MAIL_PORT": MAIL_PORT,
            "MAIL_USERNAME_SET": bool(MAIL_USERNAME),
            "MAIL_PASSWORD_SET": bool(MAIL_PASSWORD),
            "MAIL_FROM": MAIL_FROM,
            "BREVO_API_KEY_SET": bool(BREVO_API_KEY),
            "RESEND_API_KEY_SET": bool(RESEND_API_KEY),
            "ACCIDENT_ALERT_EMAIL_ENABLED": ACCIDENT_ALERT_EMAIL_ENABLED,
            "ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES": ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES,
            "ACCIDENT_ALERT_EMAIL_THRESHOLD": ACCIDENT_ALERT_EMAIL_THRESHOLD
        }
    }
    
    if BREVO_API_KEY:
        try:
            r = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                json={
                    "sender": {"name": "TrafficVision AI", "email": MAIL_FROM or "deekshithagilla@gmail.com"},
                    "to": [{"email": test_to}],
                    "subject": "Diagnostic Brevo Test",
                    "textContent": "Diagnostic Brevo test"
                },
                headers={"accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json"},
                timeout=5
            )
            results["brevo_test"] = {"status_code": r.status_code, "text": r.text}
        except Exception as e:
            results["brevo_test"] = {"error": str(e)}
            
    try:
        if MAIL_SSL_TLS:
            with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT, timeout=5) as s:
                s.login(MAIL_USERNAME, MAIL_PASSWORD)
            results["smtp_test"] = "Success (SSL)"
        else:
            with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=5) as s:
                if MAIL_STARTTLS:
                    s.starttls()
                s.login(MAIL_USERNAME, MAIL_PASSWORD)
            results["smtp_test"] = "Success (STARTTLS)"
    except Exception as e:
        results["smtp_test"] = {"error": str(e)}
        
    return results

 