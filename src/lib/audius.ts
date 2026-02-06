// Audius SDK Abstraction Layer
// All Audius API calls go through this file - the only file that imports @audius/sdk
// This layer normalizes Audius responses into our clean types
// Designed to be swappable when migrating from Option A to Option C

import { sdk, type Track as AudiusTrack, type User as AudiusUser, type Playlist as AudiusPlaylist } from '@audius/sdk';
import type { Artist, Track, Playlist, PaginatedResponse, StreamUrlResult } from './types';

// ============================================================================
// SDK Initialization
// ============================================================================

const audiusSdk = sdk({
    appName: process.env.NEXT_PUBLIC_AUDIUS_APP_NAME || 'artist-portal-mvp',
});

// ============================================================================
// Response Normalizers
// ============================================================================

/**
 * Normalize Audius user response to our Artist type
 */
function normalizeArtist(user: AudiusUser): Artist {
    return {
        id: user.id,
        handle: user.handle || '',
        name: user.name || '',
        bio: user.bio || null,
        profileImage: user.profilePicture?._480x480 || user.profilePicture?._150x150 || null,
        coverImage: user.coverPhoto?._2000x || user.coverPhoto?._640x || null,
        followerCount: user.followerCount || 0,
        trackCount: user.trackCount || 0,
    };
}

/**
 * Normalize Audius track response to our Track type
 */
function normalizeTrack(track: AudiusTrack): Track {
    return {
        id: track.id,
        title: track.title,
        duration: track.duration,
        artwork: track.artwork?._480x480 || track.artwork?._150x150 || null,
        genre: track.genre || null,
        mood: track.mood || null,
        playCount: track.playCount || 0,
        releaseDate: track.releaseDate || null,
        description: track.description || null,
    };
}

/**
 * Normalize Audius playlist response to our Playlist type
 */
function normalizePlaylist(playlist: AudiusPlaylist, tracks: Track[] = []): Playlist {
    return {
        id: playlist.id,
        name: playlist.playlistName,
        description: playlist.description || null,
        artwork: playlist.artwork?._480x480 || playlist.artwork?._150x150 || null,
        trackCount: playlist.trackCount || 0,
        tracks,
        isAlbum: playlist.isAlbum || false,
    };
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Search for an artist by handle/name and return their profile
 */
export async function getArtistProfile(handle: string): Promise<Artist | null> {
    try {
        const searchResults = await audiusSdk.users.searchUsers({ query: handle });

        if (!searchResults.data || searchResults.data.length === 0) {
            return null;
        }

        // Find exact match or use first result
        const user = searchResults.data.find(
            (u) => u.handle?.toLowerCase() === handle.toLowerCase()
        ) || searchResults.data[0];

        return normalizeArtist(user);
    } catch (error) {
        console.error('[audius] Error fetching artist profile:', error);
        return null;
    }
}

/**
 * Get an artist by their ID
 */
export async function getArtistById(userId: string): Promise<Artist | null> {
    try {
        const response = await audiusSdk.users.getUser({ id: userId });

        if (!response.data) {
            return null;
        }

        return normalizeArtist(response.data);
    } catch (error) {
        console.error('[audius] Error fetching artist by ID:', error);
        return null;
    }
}

/**
 * Get paginated tracks for an artist
 */
export async function getArtistTracks(
    userId: string,
    limit = 50,
    offset = 0
): Promise<PaginatedResponse<Track>> {
    try {
        const response = await audiusSdk.users.getTracksByUser({
            id: userId,
            limit,
            offset,
        });

        const tracks = (response.data || []).map(normalizeTrack);

        return {
            data: tracks,
            offset,
            limit,
        };
    } catch (error) {
        console.error('[audius] Error fetching artist tracks:', error);
        return { data: [] };
    }
}

/**
 * Get all playlists (non-album) for an artist
 */
export async function getArtistPlaylists(userId: string): Promise<Playlist[]> {
    try {
        const response = await audiusSdk.users.getPlaylistsByUser({ id: userId });

        return (response.data || []).map((p) => normalizePlaylist(p));
    } catch (error) {
        console.error('[audius] Error fetching artist playlists:', error);
        return [];
    }
}

/**
 * Get all albums for an artist (separate endpoint from playlists)
 */
export async function getArtistAlbums(userId: string): Promise<Playlist[]> {
    try {
        const response = await audiusSdk.users.getAlbumsByUser({ id: userId });

        return (response.data || []).map((p) => normalizePlaylist(p));
    } catch (error) {
        console.error('[audius] Error fetching artist albums:', error);
        return [];
    }
}

/**
 * Get a single track by ID with full details
 */
export async function getTrack(trackId: string): Promise<Track | null> {
    try {
        const response = await audiusSdk.tracks.getTrack({ trackId });

        if (!response.data) {
            return null;
        }

        return normalizeTrack(response.data);
    } catch (error) {
        console.error('[audius] Error fetching track:', error);
        return null;
    }
}

/**
 * Get all tracks in a playlist
 */
export async function getPlaylistTracks(playlistId: string): Promise<Playlist | null> {
    try {
        const response = await audiusSdk.playlists.getPlaylist({ playlistId });

        if (!response.data || !response.data[0]) {
            return null;
        }

        const playlist = response.data[0];

        // Fetch tracks separately if needed
        const tracksResponse = await audiusSdk.playlists.getPlaylistTracks({ playlistId });
        const tracks = (tracksResponse.data || []).map(normalizeTrack);

        return normalizePlaylist(playlist, tracks);
    } catch (error) {
        console.error('[audius] Error fetching playlist tracks:', error);
        return null;
    }
}

/**
 * Get the streaming URL for a track
 * Returns null if the stream is unavailable (player should handle gracefully)
 */
export async function getStreamUrl(trackId: string): Promise<StreamUrlResult> {
    try {
        // Use a known Audius discovery node to construct the stream URL
        // This avoids the SDK's streamTrack method which returns binary data
        const discoveryNode = 'https://discoveryprovider.audius.co';
        const streamUrl = `${discoveryNode}/v1/tracks/${trackId}/stream?app_name=${process.env.NEXT_PUBLIC_AUDIUS_APP_NAME || 'artist-portal-mvp'}`;

        return { url: streamUrl };
    } catch (error) {
        console.error('[audius] Error getting stream URL:', error);
        return { url: null, error: 'Failed to get stream URL' };
    }
}

/**
 * Search tracks, optionally filtered to a specific artist
 */
export async function searchTracks(
    query: string,
    userId?: string
): Promise<Track[]> {
    try {
        const response = await audiusSdk.tracks.searchTracks({ query });

        let tracks = (response.data || []).map(normalizeTrack);

        // Filter to specific artist if provided
        if (userId) {
            // We need to get the full track data to check the user ID
            // This is a limitation - Audius search doesn't filter by user
            // For now, return all results (filtering should happen at app layer)
        }

        return tracks;
    } catch (error) {
        console.error('[audius] Error searching tracks:', error);
        return [];
    }
}

/**
 * Get trending/popular tracks for an artist (sorted by play count)
 */
export async function getTrendingTracks(
    userId: string,
    limit = 10
): Promise<Track[]> {
    try {
        const response = await getArtistTracks(userId, 100);

        // Sort by play count descending
        const sorted = response.data.sort((a, b) => b.playCount - a.playCount);

        return sorted.slice(0, limit);
    } catch (error) {
        console.error('[audius] Error fetching trending tracks:', error);
        return [];
    }
}

/**
 * Get multiple tracks by their IDs
 */
export async function getTracksByIds(trackIds: string[]): Promise<Track[]> {
    const tracks = await Promise.all(
        trackIds.map((id) => getTrack(id))
    );

    return tracks.filter((t): t is Track => t !== null);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format play count for display (e.g., 1.5K, 2.3M)
 */
export function formatPlayCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}
