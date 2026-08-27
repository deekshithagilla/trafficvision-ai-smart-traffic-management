-- Run this against your existing PostgreSQL database BEFORE starting the
-- backend with the accident-risk email notification feature. Your project
-- has no Alembic/migration runner, and SQLAlchemy's Base.metadata.create_all()
-- only creates tables that don't exist yet - it will NOT add new columns to
-- a table that's already there (same reasoning as migration_accident_alert.sql,
-- which added accident_risk_score/is_read/read_at earlier).
--
-- Without running this, the app will throw
-- "column traffic_alerts.email_sent does not exist" as soon as a
-- high/critical-risk prediction is made.

ALTER TABLE traffic_alerts
    ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS ix_traffic_alerts_email_sent
    ON traffic_alerts (email_sent);

-- Existing rows will get email_sent = false, which is the correct, safe
-- default (no accident-risk email was ever sent for alerts created before
-- this feature existed).
