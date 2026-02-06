-- Audius Artist Portal Database Schema
-- Migration 001: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    audius_id TEXT UNIQUE,
    audius_handle TEXT,
    patreon_id TEXT UNIQUE,
    patreon_tier TEXT, -- 'free', 'supporter', 'premium'
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- At least one OAuth provider must be linked
    CONSTRAINT at_least_one_provider CHECK (
        audius_id IS NOT NULL OR patreon_id IS NOT NULL
    )
);

-- ============================================================================
-- CONTENT ACCESS TABLE
-- Defines which tracks are available and to whom
-- ============================================================================
CREATE TABLE content_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audius_track_id TEXT NOT NULL UNIQUE,
    access_tier TEXT NOT NULL CHECK (access_tier IN ('public', 'authenticated', 'patron')),
    content_type TEXT NOT NULL DEFAULT 'track' CHECK (content_type IN ('track', 'demo', 'wip', 'live_performance')),
    section TEXT NOT NULL DEFAULT 'main' CHECK (section IN ('main', 'dreampeace', 'heavydevy')),
    display_order INTEGER,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_title TEXT, -- Override title for special content
    notes TEXT, -- Admin notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PLAY EVENTS TABLE
-- Track all playback events for analytics
-- ============================================================================
CREATE TABLE play_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    audius_track_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    listened_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE, -- >90% listened
    seek_count INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'web',
    device_type TEXT NOT NULL DEFAULT 'desktop',
    session_id TEXT
);

-- ============================================================================
-- LINKED ACCOUNTS TABLE
-- Store raw OAuth provider data for account linking
-- ============================================================================
CREATE TABLE linked_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('audius', 'patreon')),
    provider_id TEXT NOT NULL,
    provider_data JSONB,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_provider_account UNIQUE (provider, provider_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Play events analytics
CREATE INDEX idx_play_events_track_time ON play_events(audius_track_id, started_at);
CREATE INDEX idx_play_events_user_time ON play_events(user_id, started_at);
CREATE INDEX idx_play_events_completed ON play_events(completed);
CREATE INDEX idx_play_events_session ON play_events(session_id);

-- Content access filtering
CREATE INDEX idx_content_tier ON content_access(access_tier);
CREATE INDEX idx_content_section ON content_access(section);
CREATE INDEX idx_content_section_tier ON content_access(section, access_tier);
CREATE INDEX idx_content_type ON content_access(content_type);

-- User lookups
CREATE INDEX idx_users_audius_id ON users(audius_id);
CREATE INDEX idx_users_patreon_id ON users(patreon_id);

-- Linked accounts
CREATE INDEX idx_linked_accounts_user ON linked_accounts(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- CONTENT_ACCESS policies (public read, admin only write)
CREATE POLICY "Anyone can view content access rules"
    ON content_access FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can manage content access"
    ON content_access FOR ALL
    TO service_role
    USING (true);

-- PLAY_EVENTS policies (anyone can insert, users can view their own)
CREATE POLICY "Anyone can track play events"
    ON play_events FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Users can view their own play events"
    ON play_events FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role can view all play events"
    ON play_events FOR SELECT
    TO service_role
    USING (true);

-- LINKED_ACCOUNTS policies
CREATE POLICY "Users can view their own linked accounts"
    ON linked_accounts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can link new accounts"
    ON linked_accounts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage linked accounts"
    ON linked_accounts FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_access_updated_at
    BEFORE UPDATE ON content_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts with OAuth provider linking';
COMMENT ON TABLE content_access IS 'Defines access tiers and metadata for Audius tracks';
COMMENT ON TABLE play_events IS 'Playback analytics and usage tracking';
COMMENT ON TABLE linked_accounts IS 'Raw OAuth provider data for account linking';

COMMENT ON COLUMN users.patreon_tier IS 'Current Patreon subscription tier';
COMMENT ON COLUMN content_access.access_tier IS 'Minimum tier required to access this content';
COMMENT ON COLUMN content_access.section IS 'Which section of the site this content appears in';
COMMENT ON COLUMN play_events.listened_percentage IS 'Percentage of track duration that was played';
COMMENT ON COLUMN play_events.completed IS 'True if user listened to >90% of the track';
