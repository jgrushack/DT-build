'use client';

import Image from 'next/image';
import type { Track } from '@/lib/types';
import { formatDuration, formatPlayCount } from '@/lib/audius';

interface TrackCardProps {
    track: Track;
    onClick?: (track: Track) => void;
    isLocked?: boolean;
    lockMessage?: string;
}

export default function TrackCard({ track, onClick, isLocked = false, lockMessage }: TrackCardProps) {
    const handleClick = () => {
        if (onClick) {
            onClick(track);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group relative glass-interactive overflow-hidden cursor-pointer"
        >
            {/* Artwork */}
            <div className="relative aspect-square overflow-hidden rounded-t-[var(--radius-lg)]">
                {track.artwork ? (
                    <Image
                        src={track.artwork}
                        alt={track.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--forest-mid)] to-[var(--earth-dark)] flex items-center justify-center">
                        <svg className="w-12 h-12 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--amber)] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                        <svg className="w-6 h-6 text-[var(--forest-deep)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Lock overlay for restricted content */}
                {isLocked && (
                    <div className="absolute inset-0 bg-[var(--forest-deep)]/70 backdrop-blur-sm flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--sage)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-[var(--sage-light)] text-center px-4">
                            {lockMessage || 'Sign in to listen'}
                        </span>
                    </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-[var(--forest-deep)]/80 text-xs text-[var(--cream-soft)] backdrop-blur-sm">
                    {formatDuration(track.duration)}
                </div>
            </div>

            {/* Track info */}
            <div className="p-4">
                <h3 className="font-medium text-[var(--cream)] truncate group-hover:text-[var(--amber)] transition-colors">
                    {track.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-[var(--sage)]">
                    {track.genre && (
                        <span className="truncate">{track.genre}</span>
                    )}
                    {track.playCount > 0 && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {formatPlayCount(track.playCount)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
