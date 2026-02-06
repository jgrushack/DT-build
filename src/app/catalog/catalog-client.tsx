'use client';

import { useState, useMemo } from 'react';
import type { Track, Playlist, ContentAccess } from '@/lib/types';
import TrackCard from '@/components/catalog/TrackCard';
import AlbumCard from '@/components/catalog/AlbumCard';
import { formatDuration, formatPlayCount } from '@/lib/audius';
import { usePlayerStore } from '@/store/playerStore';

type SortOption = 'date' | 'playCount' | 'title';
type ViewMode = 'grid' | 'list';
type TabView = 'albums' | 'tracks';

interface CatalogClientProps {
    tracks: Track[];
    albums: Playlist[];
    playlists: Playlist[];
    genres: string[];
    accessRules: Record<string, ContentAccess>;
}

export default function CatalogClient({ tracks, albums, genres, accessRules }: CatalogClientProps) {
    const play = usePlayerStore((state) => state.play);

    const [tab, setTab] = useState<TabView>('albums');
    const [sort, setSort] = useState<SortOption>('date');
    const [view, setView] = useState<ViewMode>('list');
    const [genre, setGenre] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // Filter and sort tracks
    const filteredTracks = useMemo(() => {
        let result = [...tracks];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                (t.genre && t.genre.toLowerCase().includes(q))
            );
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
    }, [tracks, sort, genre, search]);

    // Filter albums by genre
    const filteredAlbums = useMemo(() => {
        if (!genre) return albums;
        return albums.filter(a =>
            a.tracks.some(t => t.genre === genre)
        );
    }, [albums, genre]);

    const handleTrackClick = (track: Track) => {
        play(track);
    };

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'date', label: 'Newest' },
        { value: 'playCount', label: 'Most Played' },
        { value: 'title', label: 'Title A-Z' },
    ];

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6">
                <button
                    onClick={() => setTab('albums')}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        tab === 'albums'
                            ? 'bg-[var(--amber)] text-[var(--stone-deep)] shadow-md'
                            : 'text-[var(--sage-light)] hover:text-[var(--cream)] hover:bg-white/5'
                    }`}
                >
                    Albums
                    <span className="ml-1.5 opacity-70">({albums.length})</span>
                </button>
                <button
                    onClick={() => setTab('tracks')}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        tab === 'tracks'
                            ? 'bg-[var(--amber)] text-[var(--stone-deep)] shadow-md'
                            : 'text-[var(--sage-light)] hover:text-[var(--cream)] hover:bg-white/5'
                    }`}
                >
                    All Tracks
                    <span className="ml-1.5 opacity-70">({tracks.length})</span>
                </button>
            </div>

            {/* Controls bar */}
            <div className="glass rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search (tracks tab only) */}
                    {tab === 'tracks' && (
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tracks..."
                                className="w-full pl-10 pr-4 py-2 bg-[var(--forest-mid)] text-[var(--cream)] text-sm rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/50 placeholder:text-[var(--sage)]"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sage)] hover:text-[var(--cream)]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Genre chips */}
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                        <button
                            onClick={() => setGenre(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                genre === null
                                    ? 'bg-[var(--amber)] text-[var(--forest-deep)]'
                                    : 'bg-[var(--forest-mid)] text-[var(--sage-light)] hover:bg-[var(--forest-light)]'
                            }`}
                        >
                            All
                        </button>
                        {genres.map((g) => (
                            <button
                                key={g}
                                onClick={() => setGenre(g)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    genre === g
                                        ? 'bg-[var(--amber)] text-[var(--forest-deep)]'
                                        : 'bg-[var(--forest-mid)] text-[var(--sage-light)] hover:bg-[var(--forest-light)]'
                                }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>

                    {/* Sort + View (tracks tab only) */}
                    {tab === 'tracks' && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortOption)}
                                    className="appearance-none bg-[var(--forest-mid)] text-[var(--cream-soft)] text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/50 cursor-pointer border border-[var(--glass-border)]"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sage)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            <div className="flex items-center bg-[var(--forest-mid)] rounded-lg p-1 border border-[var(--glass-border)]">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-[var(--forest-light)] text-[var(--cream)]' : 'text-[var(--sage)] hover:text-[var(--cream)]'}`}
                                    title="Grid view"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-[var(--forest-light)] text-[var(--cream)]' : 'text-[var(--sage)] hover:text-[var(--cream)]'}`}
                                    title="List view"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== ALBUMS TAB ===== */}
            {tab === 'albums' && (
                <div>
                    {filteredAlbums.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {filteredAlbums.map((album) => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-[var(--sage)]">
                            <p>No albums found matching this genre.</p>
                            <button
                                onClick={() => setGenre(null)}
                                className="mt-4 text-[var(--amber)] hover:text-[var(--amber-light)] text-sm"
                            >
                                Clear filter
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ===== TRACKS TAB ===== */}
            {tab === 'tracks' && (
                <div>
                    {/* Results count */}
                    {(search || genre) && (
                        <p className="text-sm text-[var(--sage)] mb-4">
                            {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''} found
                            {search && <span> for &ldquo;{search}&rdquo;</span>}
                            {genre && <span> in {genre}</span>}
                        </p>
                    )}

                    {view === 'grid' ? (
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
                        <div className="glass rounded-xl overflow-hidden">
                            {/* List header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--glass-border)] text-xs text-[var(--sage)] uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Title</div>
                                <div className="col-span-2">Genre</div>
                                <div className="col-span-2">Plays</div>
                                <div className="col-span-2 text-right">Duration</div>
                            </div>

                            {filteredTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    onClick={() => handleTrackClick(track)}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[var(--glass-bg-light)] cursor-pointer transition-colors group border-b border-[var(--glass-border)]/50 last:border-0"
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
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {filteredTracks.length === 0 && (
                        <div className="text-center py-16 text-[var(--sage)]">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p>No tracks found.</p>
                            <button
                                onClick={() => { setGenre(null); setSearch(''); }}
                                className="mt-4 text-[var(--amber)] hover:text-[var(--amber-light)] text-sm"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
