from typing import Optional
from datetime import datetime

from pydantic import BaseModel


class TrafficAlertResponse(BaseModel):
    """Read schema returned by GET/DELETE /alerts endpoints."""

    id: int

    source: str
    destination: str

    category: str
    severity: str

    title: str
    message: str

    congestion: str
    congestion_percentage: float
    accident_risk_score: float

    recommended_route: Optional[str] = None
    expected_delay: float

    is_read: bool
    read_at: Optional[datetime] = None

    # Whether an accident-risk notification email was actually delivered
    # for this alert (False for alerts below the email threshold, or if
    # the send failed/was skipped by the cooldown).
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None

    created_at: datetime

    class Config:
        from_attributes = True


class AlertSummary(BaseModel):
    """Compact alert payload embedded in the prediction response so the
    frontend can show a toast notification without a second request."""

    id: int
    category: str
    severity: str
    title: str
    message: str

    class Config:
        from_attributes = True
