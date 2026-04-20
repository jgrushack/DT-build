'use server';

import { getAuthedUserId } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import type { DeviceTier } from '@/lib/types';

type Err = { error: string };
type Ok<T> = T & { error?: undefined };

export async function startListeningSession(input: {
    trackId: string;
    albumId?: string | null;
    deviceTier?: DeviceTier;
}): Promise<Ok<{ sessionId: string }> | Err> {
    const userId = await getAuthedUserId();
    if (!userId) return { error: 'unauthenticated' };
    if (!supabaseAdmin) return { error: 'server_misconfigured' };

    const { data, error } = await supabaseAdmin
        .from('listening_sessions')
        .insert({
            user_id: userId,
            track_id: input.trackId,
            album_id: input.albumId ?? null,
            device_tier: input.deviceTier ?? null,
        })
        .select('id')
        .single();

    if (error || !data) return { error: error?.message ?? 'insert_failed' };
    return { sessionId: data.id };
}

export async function heartbeatListeningSession(input: {
    sessionId: string;
    durationMs: number;
}): Promise<Ok<{ ok: true }> | Err> {
    const userId = await getAuthedUserId();
    if (!userId) return { error: 'unauthenticated' };
    if (!supabaseAdmin) return { error: 'server_misconfigured' };

    const { error } = await supabaseAdmin
        .from('listening_sessions')
        .update({ duration_ms: input.durationMs })
        .eq('id', input.sessionId)
        .eq('user_id', userId);

    if (error) return { error: error.message };
    return { ok: true };
}

export async function endListeningSession(input: {
    sessionId: string;
    durationMs: number;
}): Promise<Ok<{ ok: true }> | Err> {
    const userId = await getAuthedUserId();
    if (!userId) return { error: 'unauthenticated' };
    if (!supabaseAdmin) return { error: 'server_misconfigured' };

    const { error } = await supabaseAdmin
        .from('listening_sessions')
        .update({
            duration_ms: input.durationMs,
            ended_at: new Date().toISOString(),
        })
        .eq('id', input.sessionId)
        .eq('user_id', userId);

    if (error) return { error: error.message };
    return { ok: true };
}
