'use client';

import { useState, useMemo } from 'react';
import type { Track, Playlist, ContentAccess } from '@/lib/types';
import TrackCard from '@/components/catalog/TrackCard';
import PlaylistCard from '@/components/catalog/PlaylistCard';
import AlbumCard from '@/components/catalog/AlbumCard';
import FilterBar from '@/components/catalog/FilterBar';
import { formatDuration, formatPlayCount } from '@/lib/audius';
import { useAuth } from '@/contexts/AuthContext';
import { canUserAccess, getLockMessage } from '@/lib/access';
import { usePlayerStore } from '@/store/playerStore';

type SortOption = 'date' | 'playCount' | 'title';
type ViewMode = 'grid' | 'list';
type ContentTypeFilter = 'all' | 'track' | 'demo' | 'wip' | 'live';

interface CatalogClientProps {
    tracks: Track[];
    albums: Playlist[];
    playlists: Playlist[];
    genres: string[];
    accessRules: Record<string, ContentAccess>;
}

export default function CatalogClient({ tracks, albums, playlists, genres, accessRules }: CatalogClientProps) {
    const { user, isAuthenticated } = useAuth();
    const play = usePlayerStore((state) => state.play);

    const [sort, setSort] = useState<SortOption>('date');
    const [view, setView] = useState<ViewMode>('grid');
    const [contentType, setContentType] = useState<ContentTypeFilter>('all');
    const [genre, setGenre] = useState<string | null>(null);
    const [showPlaylists, setShowPlaylists] = useState(true);

    // Infer content type from Supabase rules first, then fall back to track metadata
    const getTrackContentType = (track: Track): string => {
        const rule = accessRules[track.id];
        if (rule) return rule.content_type;

        const title = track.title.toLowerCase();
        const trackGenre = (track.genre || '').toLowerCase();

        if (title.includes('(live)') || title.includes('[live]') || title.includes('live version') || title.includes('live at') || trackGenre === 'live') {
            return 'live_performance';
        }
        if (title.includes('demo') || title.includes('(demo)') || title.includes('[demo]')) {
            return 'demo';
        }
        if (title.includes('wip') || title.includes('work in progress') || title.includes('(rough)') || title.includes('[rough]')) {
            return 'wip';
        }
        return 'track';
    };

    // Map filter button values to content_type values
    const filterToContentType: Record<string, string> = {
        track: 'track',
        demo: 'demo',
        wip: 'wip',
        live: 'live_performance',
    };

    // Filter and sort tracks
    const filteredTracks = useMemo(() => {
        let result = [...tracks];

        // Filter by content type
        if (contentType !== 'all') {
            const targetType = filterToContentType[contentType];
            result = result.filter(t => getTrackContentType(t) === targetType);
        }

        // Filter by genre
        if (genre) {
            result = result.filter(t => t.genre === genre);
        }

        // Sort
        switch (sort) {
            case 'date':
                result.sort((a, b) => {
                    if (!a.releaseDate) return 1;
                    if (!b.releaseDate) return -1;
                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                });
                break;
            case 'playCount':
                result.sort((a, b) => b.playCount - a.playCount);
                break;
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [tracks, sort, genre, contentType, accessRules]);

    // Compute content type counts for filter badges
    const contentTypeCounts = useMemo(() => {
        const counts = { all: tracks.length, track: 0, demo: 0, wip: 0, live: 0 } as Record<string, number>;
        for (const t of tracks) {
            const ct = getTrackContentType(t);
            if (ct === 'track') counts.track++;
            else if (ct === 'demo') counts.demo++;
            else if (ct === 'wip') counts.wip++;
            else if (ct === 'live_performance') counts.live++;
        }
        return counts;
    }, [tracks, accessRules]);

    const handleTrackClick = (track: Track) => {
        const rule = accessRules[track.id];
        const requiredTier = rule ? rule.access_tier : 'public';
        const hasAccess = canUserAccess(user?.tiers || [], requiredTier, isAuthenticated);

        if (hasAccess) {
            play(track);
        }
    };

    // Helper to get lock state for render
    const getTrackLockState = (trackId: string) => {
        const rule = accessRules[trackId];
        const requiredTier = rule ? rule.access_tier : 'public';
        const hasAccess = canUserAccess(user?.tiers || [], requiredTier, isAuthenticated);
        return {
            isLocked: !hasAccess,
            lockMessage: !hasAccess ? getLockMessage(requiredTier) : undefined
        };
    };

    return (
        <div>
            {/* Filters */}
            <FilterBar
                currentSort={sort}
                currentView={view}
                currentContentType={contentType}
                currentGenre={genre}
                genres={genres}
                contentTypeCounts={contentTypeCounts}
                onSortChange={setSort}
                onViewChange={setView}
                onContentTypeChange={setContentType}
                onGenreChange={setGenre}
            />

            {/* Albums Section */}
            {albums.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-[var(--cream)] mb-4">
                        Albums
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                </div>
            )}

            {/* Playlists Section */}
            {showPlaylists && playlists.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[var(--cream)]">
                            Playlists
                        </h2>
                        <button
                            onClick={() => setShowPlaylists(false)}
                            className="text-sm text-[var(--sage)] hover:text-[var(--sage-light)] transition-colors"
                        >
                            Hide
                        </button>
                    </div>
                    <div className="space-y-3">
                        {playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onTrackClick={handleTrackClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Tracks Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[var(--cream)]">
                        All Tracks
                        <span className="text-[var(--sage)] font-normal ml-2">({filteredTracks.length})</span>
                    </h2>
                    {!showPlaylists && playlists.length > 0 && (
                        <button
                            onClick={() => setShowPlaylists(true)}
                            className="text-sm text-[var(--amber)] hover:text-[var(--amber-light)] transition-colors"
                        >
                            Show Playlists
                        </button>
                    )}
                </div>

                {view === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredTracks.map((track) => {
                            const { isLocked, lockMessage } = getTrackLockState(track.id);
                            return (
                                <TrackCard
                                    key={track.id}
                                    track={track}
                                    onClick={handleTrackClick}
                                    isLocked={isLocked}
                                    lockMessage={lockMessage}
                                />
                            );
                        })}
                    </div>
                ) : (
                    // List View
                    <div className="glass rounded-xl overflow-hidden">
                        {/* List header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--glass-border)] text-xs text-[var(--sage)] uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Genre</div>
                            <div className="col-span-2">Plays</div>
                            <div className="col-span-2 text-right">Duration</div>
                        </div>

                        {/* List items */}
                        {filteredTracks.map((track, index) => {
                            const { isLocked, lockMessage } = getTrackLockState(track.id);
                            return (
                                <div
                                    key={track.id}
                                    onClick={() => handleTrackClick(track)}
                                    className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[var(--glass-bg-light)] cursor-pointer transition-colors group border-b border-[var(--glass-border)]/50 last:border-0 ${isLocked ? 'opacity-70' : ''}`}
                                    title={isLocked ? lockMessage : undefined}
                                >
                                    <div className="col-span-1 text-[var(--sage)] group-hover:text-[var(--amber)] flex items-center">
                                        <span className="group-hover:hidden">{index + 1}</span>
                                        <svg className="w-4 h-4 hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                                        {track.artwork ? (
                                            <img
                                                src={track.artwork}
                                                alt=""
                                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-[var(--forest-mid)] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                        )}

                                        <span className="truncate text-[var(--cream-soft)] group-hover:text-[var(--amber)] transition-colors">
                                            {track.title}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-[var(--sage)] flex items-center truncate">
                                        {track.genre || '-'}
                                    </div>
                                    <div className="col-span-2 text-[var(--sage)] flex items-center">
                                        {formatPlayCount(track.playCount)}
                                    </div>
                                    <div className="col-span-2 text-[var(--sage)] flex items-center justify-end">
                                        {formatDuration(track.duration)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {filteredTracks.length === 0 && (
                    <div className="text-center py-16 text-[var(--sage)]">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p>No tracks found matching your filters.</p>
                        <button
                            onClick={() => setGenre(null)}
                            className="mt-4 text-[var(--amber)] hover:text-[var(--amber-light)] text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
