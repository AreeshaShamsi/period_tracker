-- ============================================================================
-- Lunari Period Tracker - Database Schema Initialization
-- Database: period_tracker (PostgreSQL 18+)
-- ============================================================================
-- IMPORTANT SAFEGUARDS:
-- 1. This script is strictly non-destructive. No DROP or TRUNCATE commands are used.
-- 2. All table and index creations use IF NOT EXISTS to prevent overwriting existing data.
-- 3. Schema aligned with Lunari frontend onboarding and logging data models.
-- ============================================================================

-- Ensure standard UUID generation function is available (native in PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- Stores user identity and core profile info captured during onboarding.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    birthday_month SMALLINT CHECK (birthday_month BETWEEN 1 AND 12),
    birthday_day SMALLINT CHECK (birthday_day BETWEEN 1 AND 31),
    birthday_year SMALLINT CHECK (birthday_year BETWEEN 1900 AND 2100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. CYCLE PROFILES TABLE
-- Stores cycle configuration determined during user onboarding:
-- periodLength (1-10, default 4)
-- cycleType ('regular' | 'irregular')
-- cycleLength (21-45, default 28)
-- cycleLengthMin, cycleLengthMax
-- ============================================================================
CREATE TABLE IF NOT EXISTS cycle_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_length SMALLINT NOT NULL DEFAULT 4 CHECK (period_length BETWEEN 1 AND 15),
    cycle_type VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (cycle_type IN ('regular', 'irregular')),
    cycle_length SMALLINT NOT NULL DEFAULT 28 CHECK (cycle_length BETWEEN 15 AND 60),
    cycle_length_min SMALLINT DEFAULT 26 CHECK (cycle_length_min BETWEEN 15 AND 60),
    cycle_length_max SMALLINT DEFAULT 28 CHECK (cycle_length_max BETWEEN 15 AND 60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_cycle_profile UNIQUE (user_id)
);

-- ============================================================================
-- 3. DAILY LOGS TABLE
-- Stores daily tracking entries:
-- period days, logged symptoms, mood, and personal notes.
-- Aligned with frontend UserLogs model.
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    is_period_day BOOLEAN NOT NULL DEFAULT FALSE,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    mood VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, log_date)
);

-- Indexes for efficient querying by user and date ranges
CREATE INDEX IF NOT EXISTS idx_cycle_profiles_user_id ON cycle_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_period_days ON daily_logs(user_id, is_period_day) WHERE is_period_day = TRUE;

-- ============================================================================
-- MIGRATION PLACEHOLDER & FUTURE EXTENSIONS
-- Future migrations (e.g. notifications, partner sync, symptom catalogs)
-- should be added as incremental, non-destructive migration scripts.
-- ============================================================================
