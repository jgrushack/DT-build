// Zustand store for audio player state

import { create } from 'zustand';
import type { Track, PlayerState } from '@/lib/types';

interface PlayerActions {
    play: (track: Track) => void;
    pause: () => void;
    resume: () => void;
    next: () => void;
    previous: () => void;
    seek: (position: number) => void;
    setVolume: (vol: number) => void;
    addToQueue: (track: Track) => void;
    addToQueueBulk: (tracks: Track[]) => void;
    clearQueue: () => void;
    removeFromQueue: (index: number) => void;
    setProgress: (p: number) => void;
    setDuration: (d: number) => void;
    setIsLoading: (b: boolean) => void;
    setError: (e: string | null) => void;
    setVisualizerActive: (b: boolean) => void;
}

export type PlayerStore = PlayerState & PlayerActions & {
    /** Internal: incremented each time seek() is called so the hook can detect it */
    _seekVersion: number;
    /** Whether the Dreampeace visualizer is active (hides bottom player bar) */
    visualizerActive: boolean;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    // State
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    queue: [],
    isLoading: false,
    error: null,
    _seekVersion: 0,
    visualizerActive: false,

    // Actions
    play: (track) => {
        set({
            currentTrack: track,
            isPlaying: true,
            progress: 0,
            duration: 0,
            isLoading: true,
            error: null,
        });
    },

    pause: () => set({ isPlaying: false }),

    resume: () => set({ isPlaying: true }),

    next: () => {
        const { queue } = get();
        if (queue.length > 0) {
            const [nextTrack, ...rest] = queue;
            set({ queue: rest });
            get().play(nextTrack);
        } else {
            set({ isPlaying: false });
        }
    },

    previous: () => {
        const { progress, currentTrack } = get();
        if (currentTrack && progress > 3 / (get().duration || 1)) {
            // Restart current track if more than 3 seconds in
            set({ progress: 0 });
            get().seek(0);
        }
    },

    seek: (position) => set((state) => ({ progress: position, _seekVersion: state._seekVersion + 1 })),

    setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),

    addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

    addToQueueBulk: (tracks) => set((state) => ({ queue: [...state.queue, ...tracks] })),

    clearQueue: () => set({ queue: [] }),

    removeFromQueue: (index) =>
        set((state) => ({
            queue: state.queue.filter((_, i) => i !== index),
        })),

    setProgress: (p) => set({ progress: p }),

    setDuration: (d) => set({ duration: d }),

    setIsLoading: (b) => set({ isLoading: b }),

    setError: (e) => set({ error: e }),

    setVisualizerActive: (b) => set({ visualizerActive: b }),
}));
