from dotenv import load_dotenv
import os

# Load .env from backend folder or current working directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "trafficvision_secret_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# Gmail SMTP
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True") == "True"
MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False") == "True"
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Frontend
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Admin invitations (Step 3 RBAC) - how long a SUPER_ADMIN's
# invitation link stays valid before it must be re-sent. Configurable
# via env, not hardcoded, with a reasonable default.
ADMIN_INVITATION_EXPIRE_HOURS = int(
    os.getenv("ADMIN_INVITATION_EXPIRE_HOURS", "48")
)

# Accident-risk email notifications.
#
# ACCIDENT_ALERT_EMAIL_ENABLED - kill switch. When False, the accident
# risk score/alert/severity logic in traffic_alert_service still runs
# exactly as before; only the outbound email is skipped.
#
# ACCIDENT_ALERT_EMAIL_THRESHOLD - accident_risk_score (0-100) at or
# above which an email is sent. Defaults to the same 75.0 value already
# used by CRITICAL_RISK_THRESHOLD in traffic_alert_service.py, so by
# default "email-worthy" lines up with "Critical-severity-worthy" - but
# it is a separate, independently configurable setting.
#
# ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES - minimum time between two
# accident-risk emails for the same user + source + destination, to
# avoid spamming a user who repeatedly predicts the same high-risk
# route.
ACCIDENT_ALERT_EMAIL_ENABLED = (
    os.getenv("ACCIDENT_ALERT_EMAIL_ENABLED", "True") == "True"
)
ACCIDENT_ALERT_EMAIL_THRESHOLD = float(
    os.getenv("ACCIDENT_ALERT_EMAIL_THRESHOLD", "75")
)
ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES = int(
    os.getenv("ACCIDENT_ALERT_EMAIL_COOLDOWN_MINUTES", "30")
)