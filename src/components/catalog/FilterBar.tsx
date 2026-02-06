'use client';

import { useState } from 'react';

type SortOption = 'date' | 'playCount' | 'title';
type ViewMode = 'grid' | 'list';
type ContentTypeFilter = 'all' | 'track' | 'demo' | 'wip' | 'live';

interface FilterBarProps {
    onSortChange?: (sort: SortOption) => void;
    onViewChange?: (view: ViewMode) => void;
    onContentTypeChange?: (type: ContentTypeFilter) => void;
    onGenreChange?: (genre: string | null) => void;
    genres?: string[];
    contentTypeCounts?: Record<ContentTypeFilter, number>;
    currentSort?: SortOption;
    currentView?: ViewMode;
    currentContentType?: ContentTypeFilter;
    currentGenre?: string | null;
}

export default function FilterBar({
    onSortChange,
    onViewChange,
    onContentTypeChange,
    onGenreChange,
    genres = [],
    contentTypeCounts,
    currentSort = 'date',
    currentView = 'grid',
    currentContentType = 'all',
    currentGenre = null,
}: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'date', label: 'Newest' },
        { value: 'playCount', label: 'Most Played' },
        { value: 'title', label: 'Title A-Z' },
    ];

    const contentTypes: { value: ContentTypeFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'track', label: 'Tracks' },
        { value: 'demo', label: 'Demos' },
        { value: 'wip', label: 'WIP' },
        { value: 'live', label: 'Live' },
    ];

    return (
        <div className="glass rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Content Type Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {contentTypes.map((type) => {
                        const count = contentTypeCounts?.[type.value];
                        // Hide filter buttons that have 0 tracks (except All and Tracks)
                        if (contentTypeCounts && type.value !== 'all' && type.value !== 'track' && count === 0) return null;
                        return (
                            <button
                                key={type.value}
                                onClick={() => onContentTypeChange?.(type.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentContentType === type.value
                                        ? 'bg-[var(--amber)] text-[var(--forest-deep)]'
                                        : 'bg-[var(--glass-bg-light)] text-[var(--sage-light)] hover:bg-[var(--forest-mid)] hover:text-[var(--cream)]'
                                    }`}
                            >
                                {type.label}
                                {count !== undefined && count > 0 && type.value !== 'all' && (
                                    <span className="ml-1.5 opacity-70">({count})</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={currentSort}
                            onChange={(e) => onSortChange?.(e.target.value as SortOption)}
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

                    {/* View Toggle */}
                    <div className="flex items-center bg-[var(--forest-mid)] rounded-lg p-1 border border-[var(--glass-border)]">
                        <button
                            onClick={() => onViewChange?.('grid')}
                            className={`p-2 rounded-md transition-colors ${currentView === 'grid' ? 'bg-[var(--forest-light)] text-[var(--cream)]' : 'text-[var(--sage)] hover:text-[var(--cream)]'
                                }`}
                            title="Grid view"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onViewChange?.('list')}
                            className={`p-2 rounded-md transition-colors ${currentView === 'list' ? 'bg-[var(--forest-light)] text-[var(--cream)]' : 'text-[var(--sage)] hover:text-[var(--cream)]'
                                }`}
                            title="List view"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                            </svg>
                        </button>
                    </div>

                    {/* More filters toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-colors border ${isExpanded ? 'bg-[var(--amber)]/20 text-[var(--amber)] border-[var(--amber)]/30' : 'bg-[var(--forest-mid)] text-[var(--sage)] hover:text-[var(--cream)] border-[var(--glass-border)]'
                            }`}
                        title="More filters"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Filters */}
            {isExpanded && genres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <label className="text-xs text-[var(--sage)] uppercase tracking-wider mb-2 block">
                        Genre
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onGenreChange?.(null)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${currentGenre === null
                                    ? 'bg-[var(--amber)] text-[var(--forest-deep)]'
                                    : 'bg-[var(--forest-mid)] text-[var(--sage-light)] hover:bg-[var(--forest-light)]'
                                }`}
                        >
                            All Genres
                        </button>
                        {genres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => onGenreChange?.(genre)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${currentGenre === genre
                                        ? 'bg-[var(--amber)] text-[var(--forest-deep)]'
                                        : 'bg-[var(--forest-mid)] text-[var(--sage-light)] hover:bg-[var(--forest-light)]'
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
