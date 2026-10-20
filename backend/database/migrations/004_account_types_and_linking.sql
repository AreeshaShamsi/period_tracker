-- ============================================================================
-- Migration 004: Multi-Provider Authentication Support & Account Linking
-- Database: period_tracker (PostgreSQL)
-- ============================================================================

-- 1. Ensure user has at least one valid authentication credential
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_user_has_auth_method'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT check_user_has_auth_method 
        CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL);
    END IF;
END $$;
