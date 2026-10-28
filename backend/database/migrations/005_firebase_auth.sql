-- ============================================================================
-- Migration 005: Firebase Authentication Support & Firebase UID Mapping
-- Database: period_tracker (PostgreSQL)
-- ============================================================================

DO $$
BEGIN
    -- 1. Add firebase_uid column if not already present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'firebase_uid'
    ) THEN
        ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;
    END IF;

    -- 2. Create index on firebase_uid for fast authentication lookup
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users' AND indexname = 'idx_users_firebase_uid'
    ) THEN
        CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
    END IF;

    -- 3. Populate existing users' firebase_uid with google_id where google_id is set
    UPDATE users SET firebase_uid = google_id WHERE firebase_uid IS NULL AND google_id IS NOT NULL;
END $$;
