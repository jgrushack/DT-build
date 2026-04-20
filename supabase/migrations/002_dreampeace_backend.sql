-- Migration 002: Dreampeace backend
-- Adds listening sessions, Audius metadata cache, user preferences.
-- No changes to existing tables.

-- ============================================================================
-- LISTENING_SESSIONS — start/heartbeat/end session tracking for analytics.
-- Complements play_events (which is an event log) with long-lived session rows.
-- ============================================================================
CREATE TABLE IF NOT EXISTS listening_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                       -- JWT subject (Patreon / Audius id)
    track_id TEXT NOT NULL,                      -- Audius track id
    album_id TEXT,                               -- Audius playlist id; null for standalone plays
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_ms BIGINT NOT NULL DEFAULT 0,
    device_tier TEXT CHECK (device_tier IN ('low', 'mid', 'high')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listening_sessions_user_time ON listening_sessions(user_id, started_at DESC);
CREATE INDEX idx_listening_sessions_track_time ON listening_sessions(track_id, started_at DESC);
CREATE INDEX idx_listening_sessions_active ON listening_sessions(user_id) WHERE ended_at IS NULL;

ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages listening sessions"
    ON listening_sessions FOR ALL
    TO service_role
    USING (true);

CREATE TRIGGER update_listening_sessions_updated_at
    BEFORE UPDATE ON listening_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE listening_sessions IS 'Long-lived listener sessions with heartbeat-updated duration';
COMMENT ON COLUMN listening_sessions.user_id IS 'JWT subject (provider-specific id)';
COMMENT ON COLUMN listening_sessions.duration_ms IS 'Total listening duration reported by heartbeat or end';


-- ============================================================================
-- AUDIUS_TRACK_CACHE — memoize Audius track lookups with 24h TTL.
-- payload stores the portal Track shape; freshness is derived from fetched_at.
-- ============================================================================
CREATE TABLE IF NOT EXISTS audius_track_cache (
    track_id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audius_track_cache_fetched ON audius_track_cache(fetched_at);

ALTER TABLE audius_track_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages track cache"
    ON audius_track_cache FOR ALL
    TO service_role
    USING (true);

COMMENT ON TABLE audius_track_cache IS 'Memoized Audius track metadata (24h TTL enforced in app layer)';


-- ============================================================================
-- AUDIUS_ALBUM_CACHE — memoize Audius playlist/album lookups with 24h TTL.
-- ============================================================================
CREATE TABLE IF NOT EXISTS audius_album_cache (
    album_id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audius_album_cache_fetched ON audius_album_cache(fetched_at);

ALTER TABLE audius_album_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages album cache"
    ON audius_album_cache FOR ALL
    TO service_role
    USING (true);

COMMENT ON TABLE audius_album_cache IS 'Memoized Audius album/playlist metadata (24h TTL enforced in app layer)';


-- ============================================================================
-- USER_PREFERENCES — per-user visualizer tier, motion pref, and resume state.
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,                    -- JWT subject
    device_tier TEXT NOT NULL DEFAULT 'mid' CHECK (device_tier IN ('low', 'mid', 'high')),
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    quality_override TEXT NOT NULL DEFAULT 'auto' CHECK (quality_override IN ('auto', 'low', 'mid', 'high')),
    last_album_id TEXT,
    last_track_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages preferences"
    ON user_preferences FOR ALL
    TO service_role
    USING (true);

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE user_preferences IS 'Visualizer tier, motion pref, and resume state keyed by JWT subject';
