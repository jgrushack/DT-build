'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import QueuePanel from './QueuePanel';

export default function Player() {
    const [showQueue, setShowQueue] = useState(false);

    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        isLoading,
        error,
    } = usePlayerStore();

    const { pause, resume, next, previous, seek, setVolume, clearQueue, removeFromQueue, play } = usePlayerStore();

    const handleSeek = (position: number) => {
        seek(position);
    };

    const handleQueuePlay = (index: number) => {
        // Play the selected track and remove preceding items from queue
        const track = queue[index];
        const newQueue = queue.slice(index + 1);
        usePlayerStore.setState({ queue: newQueue });
        play(track);
        setShowQueue(false);
    };

    if (!currentTrack) return null;

    return (
        <>
            {/* Queue panel */}
            {showQueue && (
                <QueuePanel
                    queue={queue}
                    onPlayTrack={handleQueuePlay}
                    onRemoveTrack={removeFromQueue}
                    onClearQueue={clearQueue}
                    onClose={() => setShowQueue(false)}
                />
            )}

            {/* Player bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 animate-slide-up">
                <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-4">
                    {/* Left section: track info */}
                    <div className="flex items-center gap-3 w-1/4 min-w-0">
                        <Link href={`/catalog/${currentTrack.id}`} className="flex-shrink-0">
                            {currentTrack.artwork ? (
                                <img
                                    src={currentTrack.artwork}
                                    alt={currentTrack.title}
                                    className="w-12 h-12 rounded-lg object-cover hover:opacity-80 transition-opacity"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </Link>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                                {currentTrack.title}
                            </p>
                            {error && (
                                <p className="text-xs text-red-400 truncate">{error}</p>
                            )}
                        </div>
                    </div>

                    {/* Center section: controls + progress */}
                    <div className="flex-1 flex flex-col items-center gap-1 max-w-xl">
                        {/* Transport controls */}
                        <div className="flex items-center gap-4">
                            {/* Previous */}
                            <button
                                onClick={previous}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                                aria-label="Previous"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={() => isPlaying ? pause() : resume()}
                                className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isLoading ? (
                                    <svg className="w-5 h-5 text-zinc-900 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : isPlaying ? (
                                    <svg className="w-5 h-5 text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-zinc-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Next */}
                            <button
                                onClick={next}
                                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                                aria-label="Next"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress bar */}
                        <ProgressBar
                            progress={progress}
                            duration={duration}
                            onSeek={handleSeek}
                        />
                    </div>

                    {/* Right section: volume + queue */}
                    <div className="flex items-center gap-3 w-1/4 justify-end">
                        <VolumeControl volume={volume} onVolumeChange={setVolume} />

                        {/* Queue toggle */}
                        <button
                            onClick={() => setShowQueue(!showQueue)}
                            className={`text-zinc-400 hover:text-zinc-200 transition-colors relative ${showQueue ? 'text-violet-400' : ''}`}
                            aria-label="Toggle queue"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h10" />
                            </svg>
                            {queue.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-[10px] text-white flex items-center justify-center font-medium">
                                    {queue.length > 9 ? '9+' : queue.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
