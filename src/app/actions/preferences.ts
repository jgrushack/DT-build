'use server';

import { getAuthedUserId } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import type { DeviceTier, QualityOverride, UserPreferences } from '@/lib/types';

const DEFAULTS: UserPreferences = {
    deviceTier: 'mid',
    reducedMotion: false,
    qualityOverride: 'auto',
    lastAlbumId: null,
    lastTrackId: null,
};

export async function getPreferences(): Promise<UserPreferences | null> {
    const userId = await getAuthedUserId();
    if (!userId || !supabaseAdmin) return null;

    const { data } = await supabaseAdmin
        .from('user_preferences')
        .select('device_tier, reduced_motion, quality_override, last_album_id, last_track_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (!data) return DEFAULTS;
    return {
        deviceTier: data.device_tier as DeviceTier,
        reducedMotion: data.reduced_motion as boolean,
        qualityOverride: data.quality_override as QualityOverride,
        lastAlbumId: (data.last_album_id as string | null) ?? null,
        lastTrackId: (data.last_track_id as string | null) ?? null,
    };
}

export async function updatePreferences(
    patch: Partial<UserPreferences>,
): Promise<{ ok: true } | { error: string }> {
    const userId = await getAuthedUserId();
    if (!userId) return { error: 'unauthenticated' };
    if (!supabaseAdmin) return { error: 'server_misconfigured' };

    const row: Record<string, unknown> = { user_id: userId };
    if (patch.deviceTier !== undefined) row.device_tier = patch.deviceTier;
    if (patch.reducedMotion !== undefined) row.reduced_motion = patch.reducedMotion;
    if (patch.qualityOverride !== undefined) row.quality_override = patch.qualityOverride;
    if (patch.lastAlbumId !== undefined) row.last_album_id = patch.lastAlbumId;
    if (patch.lastTrackId !== undefined) row.last_track_id = patch.lastTrackId;

    const { error } = await supabaseAdmin
        .from('user_preferences')
        .upsert(row, { onConflict: 'user_id' });

    if (error) return { error: error.message };
    return { ok: true };
}
