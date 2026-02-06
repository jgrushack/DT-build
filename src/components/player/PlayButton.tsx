'use client';

import type { Track } from '@/lib/types';
import { usePlayerStore } from '@/store/playerStore';

interface PlayButtonProps {
    track: Track;
}

export default function PlayButton({ track }: PlayButtonProps) {
    const play = usePlayerStore((s) => s.play);

    return (
        <button
            onClick={() => play(track)}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 mb-6"
        >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
            </svg>
            Play Track
        </button>
    );
}
