-- ============================================================================
-- Migration 003: Prevent Duplicate Users, Duplicate Google IDs, and Account Takeover
-- Database: period_tracker (PostgreSQL)
-- ============================================================================

-- 1. Case-insensitive unique index on LOWER(email) to prevent duplicate accounts via differing casing
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- 2. Prevent empty or blank string google_id values (must be NULL or non-empty string)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_google_id_not_blank'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT check_google_id_not_blank 
        CHECK (google_id IS NULL OR length(trim(google_id)) > 0);
    END IF;
END $$;

-- 3. Prevent empty or blank string email values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_email_not_blank'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT check_email_not_blank 
        CHECK (length(trim(email)) > 0);
    END IF;
END $$;
