"""Reusable helpers for the email flows (forgot-password, accident alerts, admin invitations).

Supports two email delivery methods:
1. Resend HTTPS API: Used if RESEND_API_KEY environment variable is configured (works on Railway).
2. Gmail SMTP: Used as a fallback or for local development.
"""

import os
import secrets
import smtplib
from email.mime.text import MIMEText
import requests

from app.config import (
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_STARTTLS,
    MAIL_SSL_TLS,
    FRONTEND_URL,
    ADMIN_INVITATION_EXPIRE_HOURS,
)


def _send_email_http_or_smtp(to_email: str, subject: str, body: str) -> None:
    """Dispatches email via Resend HTTP API (if configured) or falls back to SMTP."""
    resend_key = os.getenv("RESEND_API_KEY")
    if resend_key:
        print(f"Attempting to send email via Resend API to {to_email}...")
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_key}",
            "Content-Type": "application/json"
        }
        # Send from custom verified domain if MAIL_FROM is configured (and is not a public domain like gmail.com).
        # Otherwise, fall back to the default onboarding email onboarding@resend.dev.
        from_address = "TrafficVision <onboarding@resend.dev>"
        if MAIL_FROM and "gmail.com" not in MAIL_FROM and "yahoo.com" not in MAIL_FROM:
            from_address = f"TrafficVision <{MAIL_FROM}>"

        payload = {
            "from": from_address,
            "to": to_email,
            "subject": subject,
            "text": body
        }
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=5)
            if response.status_code in (200, 201):
                print(f"Email sent successfully to {to_email} via Resend API.")
                return
            else:
                print(f"Resend API error: {response.status_code} - {response.text}. Falling back to SMTP...")
        except Exception as e:
            print(f"Resend HTTP API failed: {e}. Falling back to SMTP...")

    # Fallback SMTP delivery
    try:
        print(f"Attempting to send email via SMTP to {to_email}...")
        message = MIMEText(body, "plain")
        message["Subject"] = subject
        message["From"] = MAIL_FROM
        message["To"] = to_email

        if MAIL_SSL_TLS:
            with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT, timeout=5) as server:
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], message.as_string())
        else:
            with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=5) as server:
                if MAIL_STARTTLS:
                    server.starttls()
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], message.as_string())
        print("Email sent successfully via SMTP.")
    except Exception as err:
        print(f"SMTP delivery failed: {err}")


def generate_reset_token() -> str:
    """Cryptographically secure, URL-safe token (not a JWT)."""
    return secrets.token_urlsafe(32)


def send_reset_email(to_email: str, token: str) -> None:
    """Sends the password-reset email."""
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    body = (
        "Hello,\n\n"
        "We received a request to reset your password.\n\n"
        "Click the link below:\n\n"
        f"{reset_link}\n\n"
        "This link expires in 15 minutes.\n\n"
        "If you did not request this, ignore this email.\n\n"
        "Regards,\n"
        "TrafficVision Team"
    )

    _send_email_http_or_smtp(to_email, "TrafficVision Password Reset", body)


def send_accident_risk_email(
    to_email: str,
    *,
    is_critical: bool,
    source: str,
    destination: str,
    severity: str,
    accident_risk_score: float,
    congestion: str,
    predicted_traffic: int,
    weather_summary: str,
    expected_delay: float,
    recommended_route: str,
) -> None:
    """Sends a software-generated accident-risk warning."""
    subject = (
        "TrafficVision AI \u2014 Critical Traffic Safety Alert"
        if is_critical
        else "TrafficVision AI \u2014 High Accident Risk Alert"
    )

    risk_label = "CRITICAL" if is_critical else "HIGH"

    body = (
        "TrafficVision AI\n"
        "Smart Traffic Safety Alert\n\n"
        "A high possibility of a traffic incident has been identified "
        "for your selected route.\n\n"
        f"Route:\n{source} \u2192 {destination}\n\n"
        f"Risk Level:\n{risk_label}\n\n"
        f"Accident Risk Score:\n{accident_risk_score:.0f}%\n\n"
        f"Congestion:\n{congestion}\n\n"
        f"Predicted Traffic:\n{predicted_traffic}\n\n"
        f"Weather:\n{weather_summary}\n\n"
        f"Expected Delay:\n{expected_delay:.0f} minutes\n\n"
        f"Recommended Route:\n{recommended_route}\n\n"
        "Safety Recommendation:\n"
        "Exercise caution and consider delaying travel or using the "
        "recommended alternative where appropriate.\n\n"
        "This is a predictive traffic-safety warning based on available "
        "traffic and contextual conditions. It does not confirm that an "
        "accident has occurred.\n\n"
        "Regards,\n"
        "TrafficVision Team"
    )

    _send_email_http_or_smtp(to_email, subject, body)


def generate_invitation_token() -> str:
    """Generates a secure admin invitation token."""
    return secrets.token_urlsafe(32)


def send_admin_invitation_email(to_email: str, token: str) -> None:
    """Sends the admin-invitation email."""
    invitation_link = f"{FRONTEND_URL}/accept-invitation?token={token}"

    body = (
        "Hello,\n\n"
        "You have been invited to become an administrator on "
        "TrafficVision AI.\n\n"
        "Click the link below to accept this invitation and set up "
        "your admin account:\n\n"
        f"{invitation_link}\n\n"
        f"This link expires in {ADMIN_INVITATION_EXPIRE_HOURS} hours "
        "and can only be used once.\n\n"
        "If you were not expecting this invitation, you can safely "
        "ignore this email.\n\n"
        "Regards,\n"
        "TrafficVision Team"
    )

    _send_email_http_or_smtp(to_email, "TrafficVision Admin Invitation", body)
