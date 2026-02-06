'use client';

import { useState, useMemo } from 'react';
import type { Track, Playlist } from '@/lib/types';
import TrackCard from '@/components/catalog/TrackCard';
import PlaylistCard from '@/components/catalog/PlaylistCard';
import FilterBar from '@/components/catalog/FilterBar';
import { formatDuration, formatPlayCount } from '@/lib/format';
import { usePlayerStore } from '@/store/playerStore';

type SortOption = 'date' | 'playCount' | 'title';
type ViewMode = 'grid' | 'list';
type ContentTypeFilter = 'all' | 'track' | 'demo' | 'wip' | 'live';

interface CatalogClientProps {
    tracks: Track[];
    playlists: Playlist[];
    genres: string[];
}

export default function CatalogClient({ tracks, playlists, genres }: CatalogClientProps) {
    const [sort, setSort] = useState<SortOption>('date');
    const [view, setView] = useState<ViewMode>('grid');
    const [contentType, setContentType] = useState<ContentTypeFilter>('all');
    const [genre, setGenre] = useState<string | null>(null);
    const [showPlaylists, setShowPlaylists] = useState(true);

    // Filter and sort tracks
    const filteredTracks = useMemo(() => {
        let result = [...tracks];

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
    }, [tracks, sort, genre]);

    const { play, addToQueueBulk } = usePlayerStore();

    const handleTrackClick = (track: Track) => {
        play(track);
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
                onSortChange={setSort}
                onViewChange={setView}
                onContentTypeChange={setContentType}
                onGenreChange={setGenre}
            />

            {/* Playlists/Albums Section */}
            {showPlaylists && playlists.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-zinc-100">
                            Albums & Playlists
                        </h2>
                        <button
                            onClick={() => setShowPlaylists(false)}
                            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
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
                    <h2 className="text-xl font-semibold text-zinc-100">
                        All Tracks
                        <span className="text-zinc-500 font-normal ml-2">({filteredTracks.length})</span>
                    </h2>
                    {!showPlaylists && playlists.length > 0 && (
                        <button
                            onClick={() => setShowPlaylists(true)}
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Show Playlists
                        </button>
                    )}
                </div>

                {view === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredTracks.map((track) => (
                            <TrackCard
                                key={track.id}
                                track={track}
                                onClick={handleTrackClick}
                            />
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="bg-zinc-900/50 rounded-xl overflow-hidden">
                        {/* List header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Genre</div>
                            <div className="col-span-2">Plays</div>
                            <div className="col-span-2 text-right">Duration</div>
                        </div>

                        {/* List items */}
                        {filteredTracks.map((track, index) => (
                            <div
                                key={track.id}
                                onClick={() => handleTrackClick(track)}
                                className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors group border-b border-zinc-800/50 last:border-0"
                            >
                                <div className="col-span-1 text-zinc-600 group-hover:text-violet-500 flex items-center">
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
                                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                    )}
                                    <span className="truncate text-zinc-200 group-hover:text-violet-400 transition-colors">
                                        {track.title}
                                    </span>
                                </div>
                                <div className="col-span-2 text-zinc-500 flex items-center truncate">
                                    {track.genre || '-'}
                                </div>
                                <div className="col-span-2 text-zinc-500 flex items-center">
                                    {formatPlayCount(track.playCount)}
                                </div>
                                <div className="col-span-2 text-zinc-500 flex items-center justify-end">
                                    {formatDuration(track.duration)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {filteredTracks.length === 0 && (
                    <div className="text-center py-16 text-zinc-500">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p>No tracks found matching your filters.</p>
                        <button
                            onClick={() => setGenre(null)}
                            className="mt-4 text-violet-400 hover:text-violet-300 text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
