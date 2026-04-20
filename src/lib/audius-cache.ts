import { supabaseAdmin } from '@/lib/supabase';
import { getTrack, getPlaylistTracks } from '@/lib/audius';
import type { Track, Playlist } from '@/lib/types';

const TTL_MS = 24 * 60 * 60 * 1000;

function isFresh(fetchedAt: string): boolean {
    return Date.now() - new Date(fetchedAt).getTime() < TTL_MS;
}

export async function getCachedTrack(trackId: string): Promise<Track | null> {
    if (supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from('audius_track_cache')
            .select('payload, fetched_at')
            .eq('track_id', trackId)
            .maybeSingle();

        if (data && isFresh(data.fetched_at as string)) {
            return data.payload as Track;
        }
    }

    const fresh = await getTrack(trackId);
    if (fresh && supabaseAdmin) {
        await supabaseAdmin
            .from('audius_track_cache')
            .upsert(
                { track_id: trackId, payload: fresh, fetched_at: new Date().toISOString() },
                { onConflict: 'track_id' },
            );
    }
    return fresh;
}

export async function getCachedAlbum(albumId: string): Promise<Playlist | null> {
    if (supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from('audius_album_cache')
            .select('payload, fetched_at')
            .eq('album_id', albumId)
            .maybeSingle();

        if (data && isFresh(data.fetched_at as string)) {
            return data.payload as Playlist;
        }
    }

    const fresh = await getPlaylistTracks(albumId);
    if (fresh && supabaseAdmin) {
        await supabaseAdmin
            .from('audius_album_cache')
            .upsert(
                { album_id: albumId, payload: fresh, fetched_at: new Date().toISOString() },
                { onConflict: 'album_id' },
            );
    }
    return fresh;
}
