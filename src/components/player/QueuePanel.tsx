'use client';

import type { Track } from '@/lib/types';
import { formatDuration } from '@/lib/format';

interface QueuePanelProps {
    queue: Track[];
    onPlayTrack: (index: number) => void;
    onRemoveTrack: (index: number) => void;
    onClearQueue: () => void;
    onClose: () => void;
}

export default function QueuePanel({ queue, onPlayTrack, onRemoveTrack, onClearQueue, onClose }: QueuePanelProps) {
    return (
        <div className="fixed bottom-20 right-4 w-80 max-h-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-200">Queue</h3>
                <div className="flex items-center gap-2">
                    {queue.length > 0 && (
                        <button
                            onClick={onClearQueue}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="Close queue"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Track list */}
            <div className="flex-1 overflow-y-auto">
                {queue.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-600">
                        Queue is empty
                    </div>
                ) : (
                    queue.map((track, index) => (
                        <div
                            key={`${track.id}-${index}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors group"
                        >
                            {/* Artwork */}
                            <div
                                className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => onPlayTrack(index)}
                            >
                                {track.artwork ? (
                                    <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                                {/* Play overlay on hover */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Track info */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlayTrack(index)}>
                                <p className="text-sm text-zinc-300 truncate group-hover:text-violet-400 transition-colors">
                                    {track.title}
                                </p>
                                <p className="text-xs text-zinc-600">{formatDuration(track.duration)}</p>
                            </div>

                            {/* Remove button */}
                            <button
                                onClick={() => onRemoveTrack(index)}
                                className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Remove from queue"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
