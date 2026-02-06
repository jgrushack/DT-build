'use client';

import Image from 'next/image';
import type { Playlist, Track } from '@/lib/types';
import { formatPlayCount } from '@/lib/audius';
import { useState } from 'react';

interface PlaylistCardProps {
    playlist: Playlist;
    onTrackClick?: (track: Track) => void;
}

export default function PlaylistCard({ playlist, onTrackClick }: PlaylistCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="glass-interactive rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Artwork */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {playlist.artwork ? (
                        <Image
                            src={playlist.artwork}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--sage)] to-[var(--forest-mid)] flex items-center justify-center">
                            <svg className="w-6 h-6 text-[var(--cream)]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--cream)] truncate">{playlist.name}</h3>
                        {playlist.isAlbum && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--amber)]/20 text-[var(--amber)] text-xs font-medium">
                                Album
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-[var(--sage)]">
                        {playlist.trackCount} track{playlist.trackCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Expand icon */}
                <svg
                    className={`w-5 h-5 text-[var(--sage)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Expanded track list */}
            {isExpanded && playlist.tracks.length > 0 && (
                <div className="border-t border-[var(--glass-border)]">
                    {playlist.tracks.map((track, index) => (
                        <div
                            key={track.id}
                            onClick={() => onTrackClick?.(track)}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--glass-bg-light)] cursor-pointer transition-colors group"
                        >
                            <span className="w-6 text-center text-sm text-[var(--sage)] group-hover:hidden">
                                {index + 1}
                            </span>
                            <span className="w-6 text-center text-sm text-[var(--amber)] hidden group-hover:block">
                                <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </span>
                            <span className="flex-grow truncate text-[var(--cream-soft)] text-sm group-hover:text-[var(--amber)] transition-colors">
                                {track.title}
                            </span>
                            {track.playCount > 0 && (
                                <span className="text-xs text-[var(--sage)]">
                                    {formatPlayCount(track.playCount)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
