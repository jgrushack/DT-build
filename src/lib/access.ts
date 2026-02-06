import { supabase } from '@/lib/supabase';
import { AccessTier, ContentAccess } from '@/lib/types';

// In-memory cache for content access rules
// Map<audiusTrackId, ContentAccess>
const accessCache = new Map<string, ContentAccess>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let lastCacheUpdate = 0;

/**
 * Fetch all content access rules from Supabase and cache them
 */
async function refreshAccessCache() {
    const now = Date.now();
    if (accessCache.size > 0 && now - lastCacheUpdate < CACHE_TTL) {
        return;
    }

    try {
        const { data, error } = await supabase
            .from('content_access')
            .select('*');

        if (error) throw error;

        accessCache.clear();
        data.forEach((item) => {
            // Map database fields to ContentAccess type
            const contentAccess: ContentAccess = {
                ...item,
                // Ensure enums are cast correctly
                access_tier: item.access_tier as string,
                content_type: item.content_type as string,
                section: item.section as string,
            };
            accessCache.set(item.audius_track_id, contentAccess);
        });

        lastCacheUpdate = now;
    } catch (error) {
        console.error('Failed to fetch content access rules:', error);
    }
}

/**
 * Get all content access rules as a plain object
 * Useful for passing to client components
 */
export async function getAllContentAccess(): Promise<Record<string, ContentAccess>> {
    await refreshAccessCache();
    return Object.fromEntries(accessCache);
}

/**
 * Get access rules for a specific track
 */
export async function getContentAccess(trackId: string): Promise<ContentAccess | null> {
    await refreshAccessCache();
    return accessCache.get(trackId) || null;
}

/**
 * Check if a user can access specific content
 */
export function canUserAccess(
    userTiers: string[] | null,
    requiredTier: string,
    isAuthenticated: boolean
): boolean {
    // 1. Public content requires login (per user request)
    if (requiredTier === AccessTier.PUBLIC) {
        return isAuthenticated;
    }

    // 2. Authenticated tier requires login (any tier)
    if (requiredTier === AccessTier.AUTHENTICATED) {
        return isAuthenticated;
    }

    // 3. Patron tier requires active subscription
    if (requiredTier === AccessTier.PATRON) {
        if (!userTiers || !isAuthenticated) return false;
        // Check if user has any patron tiers
        // This depends on how we name tiers in the auth provider
        // For now, we assume if they have 'patreon-tier' or 'isSubscribed' logic passed down
        return userTiers.some(t => t.includes('patron') || t.includes('supporter') || t.includes('premium'));
    }

    // Default deny
    return false;
}

/**
 * Get the lock message for a specific tier
 */
export function getLockMessage(requiredTier: string): string {
    switch (requiredTier) {
        case AccessTier.PUBLIC:
        case AccessTier.AUTHENTICATED:
            return 'Sign in to listen';
        case AccessTier.PATRON:
            return 'Exclusive for Patreon supporters';
        default:
            return 'Locked';
    }
}
