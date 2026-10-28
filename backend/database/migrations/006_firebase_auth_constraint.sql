-- ============================================================================
-- Migration 006: Update check_user_has_auth_method to include firebase_uid
-- Database: period_tracker (PostgreSQL)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_user_has_auth_method'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT check_user_has_auth_method;
    END IF;

    ALTER TABLE users ADD CONSTRAINT check_user_has_auth_method
        CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL OR firebase_uid IS NOT NULL);
END $$;
