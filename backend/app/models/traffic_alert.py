from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class TrafficAlert(Base):

    __tablename__ = "traffic_alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    prediction_id = Column(
        Integer,
        ForeignKey("prediction_history.id"),
        nullable=True,
        index=True
    )

    source = Column(
        String,
        nullable=False
    )

    destination = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False,
        default="Congestion",
        index=True
    )

    severity = Column(
        String,
        nullable=False,
        default="Low",
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    congestion = Column(
        String,
        nullable=False
    )

    congestion_percentage = Column(
        Float,
        nullable=False,
        default=0.0
    )

    accident_risk_score = Column(
        Float,
        nullable=False,
        default=0.0,
        index=True
    )

    recommended_route = Column(
        String,
        nullable=True
    )

    expected_delay = Column(
        Float,
        nullable=False,
        default=0.0
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True
    )

    read_at = Column(DateTime(timezone=True), nullable=True)

    # -----------------------------------------------------------------
    # Accident-risk email notification tracking.
    #
    # A TrafficAlert row is created for every prediction regardless of
    # risk, so "an alert exists" cannot answer "was a notification email
    # actually delivered". These two columns record the real outcome of
    # the SMTP send so traffic_alert_service's cooldown/dedup check can
    # tell a successfully-notified route apart from one where the alert
    # was created but the email failed (and should still be eligible to
    # retry on the next high-risk prediction rather than being silently
    # suppressed for the full cooldown window).
    # -----------------------------------------------------------------
    email_sent = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True
    )

    email_sent_at = Column(DateTime(timezone=True), nullable=True)

    # Always store alert creation time as timezone-aware UTC.
    #
    # IMPORTANT: default must be a tz-aware datetime (datetime.now(timezone.utc)),
    # not datetime.utcnow(). utcnow() returns a naive datetime with no tzinfo -
    # when inserted into a DateTime(timezone=True) column, PostgreSQL then
    # interprets that naive value using the DB session's local timezone
    # instead of treating it as UTC, silently shifting every stored
    # timestamp by the session's UTC offset. Wrapping it in a lambda keeps
    # SQLAlchemy calling this at insert time (a bare function reference
    # would also work, but the lambda makes the "always UTC-aware" intent
    # explicit here).
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    user = relationship(
        "User",
        backref="traffic_alerts"
    )