'use client';

import Image from 'next/image';
import type { Track } from '@/lib/types';
import { formatDuration, formatPlayCount } from '@/lib/audius';
import { usePlayerStore } from '@/store/playerStore';

interface PopularTracksProps {
    tracks: Track[];
}

export default function PopularTracks({ tracks }: PopularTracksProps) {
    const play = usePlayerStore((s) => s.play);
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);

    return (
        <div className="space-y-1">
            {tracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                    <div
                        key={track.id}
                        onClick={() => play(track)}
                        className={`group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isCurrent
                                ? 'bg-[var(--amber)]/10'
                                : 'hover:bg-white/5'
                        }`}
                    >
                        {/* Rank number */}
                        <div className="w-6 text-center flex-shrink-0">
                            {isCurrent && isPlaying ? (
                                <div className="flex items-end justify-center gap-[2px] h-4">
                                    <span className="w-[3px] bg-[var(--amber)] rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                                    <span className="w-[3px] bg-[var(--amber)] rounded-full animate-[equalizer_0.8s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
                                    <span className="w-[3px] bg-[var(--amber)] rounded-full animate-[equalizer_0.8s_ease-in-out_0.4s_infinite]" style={{ height: '40%' }} />
                                </div>
                            ) : (
                                <span className={`text-sm font-medium ${
                                    isCurrent ? 'text-[var(--amber)]' : 'text-[var(--sage)] group-hover:text-[var(--cream)]'
                                }`}>
                                    {index + 1}
                                </span>
                            )}
                        </div>

                        {/* Album art */}
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                            {track.artwork ? (
                                <Image
                                    src={track.artwork}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--forest-mid)] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[var(--sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Track info */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate transition-colors ${
                                isCurrent ? 'text-[var(--amber)]' : 'text-[var(--cream)] group-hover:text-[var(--amber)]'
                            }`}>
                                {track.title}
                            </p>
                            <p className="text-xs text-[var(--sage)] truncate">
                                {track.genre}
                            </p>
                        </div>

                        {/* Play count */}
                        <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--sage)] flex-shrink-0">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {formatPlayCount(track.playCount)}
                        </div>

                        {/* Duration */}
                        <div className="text-xs text-[var(--sage)] flex-shrink-0 w-12 text-right">
                            {formatDuration(track.duration)}
                        </div>

                        {/* Play button on hover */}
                        <div className="w-8 flex-shrink-0 flex justify-center">
                            <svg
                                className={`w-5 h-5 transition-all ${
                                    isCurrent && isPlaying
                                        ? 'text-[var(--amber)] opacity-100'
                                        : 'text-[var(--cream)] opacity-0 group-hover:opacity-100'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isCurrent && isPlaying ? (
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                ) : (
                                    <path d="M8 5v14l11-7z" />
                                )}
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
