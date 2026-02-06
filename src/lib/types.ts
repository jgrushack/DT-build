// Shared TypeScript types for the Audius Artist Portal

// ============================================================================
// Enums
// ============================================================================

/**
 * Access tier determines who can access content
 */
export enum AccessTier {
    PUBLIC = 'public',           // Anyone can access
    AUTHENTICATED = 'authenticated', // Logged-in users only
    PATRON = 'patron',           // Patreon supporters only
}

/**
 * Content type distinguishes different kinds of audio content
 */
export enum ContentType {
    TRACK = 'track',             // Standard studio release
    DEMO = 'demo',               // Work in progress demo
    WIP = 'wip',                 // Work in progress
    LIVE_PERFORMANCE = 'live_performance', // Live recording
}

/**
 * Section determines which part of the site content belongs to
 */
export enum Section {
    MAIN = 'main',               // Primary catalog
    DREAMPEACE = 'dreampeace',   // Ambient/wellness section
    HEAVYDEVY = 'heavydevy',     // Heavy Devy section
}

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Artist profile information from Audius
 */
export interface Artist {
    id: string;
    handle: string;
    name: string;
    bio: string | null;
    profileImage: string | null;
    coverImage: string | null;
    followerCount: number;
    trackCount: number;
}

/**
 * Track information from Audius
 */
export interface Track {
    id: string;
    title: string;
    duration: number; // in seconds
    artwork: string | null;
    genre: string | null;
    mood: string | null;
    playCount: number;
    releaseDate: string | null;
    description: string | null;
}

/**
 * Playlist/Album information from Audius
 */
export interface Playlist {
    id: string;
    name: string;
    description: string | null;
    artwork: string | null;
    trackCount: number;
    tracks: Track[];
    isAlbum: boolean;
}

/**
 * Extended track with portal-specific metadata
 * This combines Audius track data with our access control layer
 */
export interface ContentItem extends Track {
    accessTier: AccessTier;
    contentType: ContentType;
    section: Section;
    displayTitle?: string; // Override title for special content
    displayOrder?: number; // Custom sorting order
    featured: boolean;
    notes?: string; // Admin notes
}

// ============================================================================
// Database Types (matching Supabase schema)
// ============================================================================

/**
 * User record from the database
 */
export interface User {
    id: string;
    email: string | null;
    audius_id: string | null;
    audius_handle: string | null;
    patreon_id: string | null;
    patreon_tier: string | null;
    display_name: string;
    avatar_url: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Content access configuration from the database
 */
export interface ContentAccess {
    id: string;
    audius_track_id: string;
    access_tier: string;
    content_type: string;
    section: string;
    display_order: number | null;
    featured: boolean;
    display_title: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Play event for tracking listens
 */
export interface PlayEvent {
    id: string;
    user_id: string | null;
    audius_track_id: string;
    started_at: string;
    duration_seconds: number;
    listened_percentage: number;
    completed: boolean;
    seek_count: number;
    source: string;
    device_type: string;
    session_id: string | null;
}

/**
 * Linked OAuth account
 */
export interface LinkedAccount {
    id: string;
    user_id: string;
    provider: 'audius' | 'patreon';
    provider_id: string;
    provider_data: Record<string, unknown> | null;
    linked_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated response from Audius API
 */
export interface PaginatedResponse<T> {
    data: T[];
    total?: number;
    offset?: number;
    limit?: number;
}

/**
 * Stream URL response
 */
export interface StreamUrlResult {
    url: string | null;
    error?: string;
}

// ============================================================================
// Session/Auth Types
// ============================================================================

/**
 * User session with resolved access tier
 */
export interface UserSession {
    user: User | null;
    tier: AccessTier;
    isAuthenticated: boolean;
    isPatron: boolean;
    linkedAccounts: LinkedAccount[];
}

// ============================================================================
// Player State Types
// ============================================================================

/**
 * Current player state
 */
export interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number; // 0-1
    duration: number; // seconds
    volume: number; // 0-1
    queue: Track[];
    isLoading: boolean;
    error: string | null;
}
