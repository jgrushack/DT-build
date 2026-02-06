import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabasePublishableKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable');
}

/**
 * Supabase client for browser/client-side usage
 * Uses the publishable key with RLS policies
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

/**
 * Supabase admin client for server-side usage
 * Bypasses RLS policies - use with caution
 * Only available on server-side (API routes, server components)
 */
export const supabaseAdmin = supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey)
    : null;

// Type exports for database schema
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
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
                };
                Insert: {
                    id?: string;
                    email?: string | null;
                    audius_id?: string | null;
                    audius_handle?: string | null;
                    patreon_id?: string | null;
                    patreon_tier?: string | null;
                    display_name: string;
                    avatar_url?: string | null;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    audius_id?: string | null;
                    audius_handle?: string | null;
                    patreon_id?: string | null;
                    patreon_tier?: string | null;
                    display_name?: string;
                    avatar_url?: string | null;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            content_access: {
                Row: {
                    id: string;
                    audius_track_id: string;
                    access_tier: 'public' | 'authenticated' | 'patron';
                    content_type: 'track' | 'demo' | 'wip' | 'live_performance';
                    section: 'main' | 'dreampeace' | 'heavydevy';
                    display_order: number | null;
                    featured: boolean;
                    display_title: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    audius_track_id: string;
                    access_tier: 'public' | 'authenticated' | 'patron';
                    content_type?: 'track' | 'demo' | 'wip' | 'live_performance';
                    section?: 'main' | 'dreampeace' | 'heavydevy';
                    display_order?: number | null;
                    featured?: boolean;
                    display_title?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    audius_track_id?: string;
                    access_tier?: 'public' | 'authenticated' | 'patron';
                    content_type?: 'track' | 'demo' | 'wip' | 'live_performance';
                    section?: 'main' | 'dreampeace' | 'heavydevy';
                    display_order?: number | null;
                    featured?: boolean;
                    display_title?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            play_events: {
                Row: {
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
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    audius_track_id: string;
                    started_at?: string;
                    duration_seconds?: number;
                    listened_percentage?: number;
                    completed?: boolean;
                    seek_count?: number;
                    source?: string;
                    device_type?: string;
                    session_id?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    audius_track_id?: string;
                    started_at?: string;
                    duration_seconds?: number;
                    listened_percentage?: number;
                    completed?: boolean;
                    seek_count?: number;
                    source?: string;
                    device_type?: string;
                    session_id?: string | null;
                };
            };
            linked_accounts: {
                Row: {
                    id: string;
                    user_id: string;
                    provider: 'audius' | 'patreon';
                    provider_id: string;
                    provider_data: Record<string, any> | null;
                    linked_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    provider: 'audius' | 'patreon';
                    provider_id: string;
                    provider_data?: Record<string, any> | null;
                    linked_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    provider?: 'audius' | 'patreon';
                    provider_id?: string;
                    provider_data?: Record<string, any> | null;
                    linked_at?: string;
                };
            };
        };
    };
};
