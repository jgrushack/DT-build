'use client';

import type { Track } from '@/lib/types';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration, formatPlayCount } from '@/lib/audius';

interface AlbumTracksProps {
    tracks: Track[];
}

export default function AlbumTracks({ tracks }: AlbumTracksProps) {
    const { play, addToQueue, currentTrack, isPlaying } = usePlayerStore();

    const handlePlay = (track: Track) => {
        play(track);
        // Queue the rest of the album after this track
        const trackIndex = tracks.indexOf(track);
        const remaining = tracks.slice(trackIndex + 1);
        remaining.forEach((t) => addToQueue(t));
    };

    const handlePlayAll = () => {
        if (tracks.length === 0) return;
        play(tracks[0]);
        tracks.slice(1).forEach((t) => addToQueue(t));
    };

    return (
        <div>
            {/* Play all button */}
            <button
                onClick={handlePlayAll}
                className="group inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-[var(--amber)] hover:bg-[var(--amber-light)] text-[var(--stone-deep)] font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,164,92,0.3)] hover:-translate-y-0.5"
            >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
                Play Album
            </button>

            {/* Track list */}
            <div className="space-y-px">
                {tracks.map((track, index) => {
                    const isActive = currentTrack?.id === track.id;

                    return (
                        <button
                            key={track.id}
                            onClick={() => handlePlay(track)}
                            className={`group w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                isActive
                                    ? 'bg-[var(--amber)]/10 border border-[var(--amber)]/20'
                                    : 'hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            {/* Track number / play indicator */}
                            <div className="w-8 text-center flex-shrink-0">
                                {isActive && isPlaying ? (
                                    <div className="flex items-center justify-center gap-0.5">
                                        <span className="w-0.5 h-3 bg-[var(--amber)] rounded-full animate-pulse" />
                                        <span className="w-0.5 h-4 bg-[var(--amber)] rounded-full animate-pulse animation-delay-200" />
                                        <span className="w-0.5 h-2.5 bg-[var(--amber)] rounded-full animate-pulse animation-delay-500" />
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm text-[var(--sage)] group-hover:hidden">
                                            {index + 1}
                                        </span>
                                        <svg className="w-4 h-4 text-[var(--cream)] hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </>
                                )}
                            </div>

                            {/* Title */}
                            <span className={`flex-1 text-sm font-medium truncate transition-colors ${
                                isActive ? 'text-[var(--amber)]' : 'text-[var(--cream)] group-hover:text-[var(--amber)]'
                            }`}>
                                {track.title}
                            </span>

                            {/* Play count */}
                            {track.playCount > 0 && (
                                <span className="text-xs text-[var(--sage)] hidden sm:block">
                                    {formatPlayCount(track.playCount)}
                                </span>
                            )}

                            {/* Duration */}
                            <span className="text-xs text-[var(--sage)] w-12 text-right flex-shrink-0">
                                {formatDuration(track.duration)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
