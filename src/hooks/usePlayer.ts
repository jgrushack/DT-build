// Player hook - connects Zustand store to HTML5 Audio API

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';

const STREAM_BASE = 'https://discoveryprovider.audius.co/v1/tracks';
const APP_NAME = 'artist-portal-mvp';

function getStreamUrl(trackId: string): string {
    return `${STREAM_BASE}/${trackId}/stream?app_name=${APP_NAME}`;
}

export function usePlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackIdRef = useRef<string | null>(null);

    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        isLoading,
        error,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        setVolume,
        addToQueue,
        addToQueueBulk,
        clearQueue,
        removeFromQueue,
        setProgress,
        setDuration,
        setIsLoading,
        setError,
    } = usePlayerStore();

    // Initialize audio element once
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'auto';
        }

        const audio = audioRef.current;

        const onTimeUpdate = () => {
            if (audio.duration && isFinite(audio.duration)) {
                usePlayerStore.getState().setProgress(audio.currentTime / audio.duration);
            }
        };

        const onLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                usePlayerStore.getState().setDuration(audio.duration);
            }
        };

        const onCanPlay = () => {
            usePlayerStore.getState().setIsLoading(false);
        };

        const onLoadStart = () => {
            usePlayerStore.getState().setIsLoading(true);
        };

        const onEnded = () => {
            usePlayerStore.getState().next();
        };

        const onError = () => {
            const state = usePlayerStore.getState();
            state.setError('Failed to load audio');
            state.setIsLoading(false);
            // Auto-skip after a brief delay
            setTimeout(() => {
                const s = usePlayerStore.getState();
                if (s.error) {
                    s.next();
                }
            }, 2000);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('loadstart', onLoadStart);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('loadstart', onLoadStart);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, []);

    // When currentTrack changes, load new audio source
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack && currentTrack.id !== currentTrackIdRef.current) {
            currentTrackIdRef.current = currentTrack.id;
            audio.src = getStreamUrl(currentTrack.id);
            audio.load();
        } else if (!currentTrack) {
            currentTrackIdRef.current = null;
            audio.src = '';
        }
    }, [currentTrack]);

    // When isPlaying changes, play or pause audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        if (isPlaying) {
            audio.play().catch(() => {
                // Browser may block autoplay; pause the store
                usePlayerStore.getState().pause();
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrack]);

    // Sync volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Subscribe to seek events from the store (any component can call store.seek())
    const seekVersion = usePlayerStore((s) => s._seekVersion);
    useEffect(() => {
        if (seekVersion === 0) return; // Skip initial mount
        const audio = audioRef.current;
        const state = usePlayerStore.getState();
        if (audio && audio.duration && isFinite(audio.duration)) {
            audio.currentTime = state.progress * audio.duration;
        }
    }, [seekVersion]);

    // Seek handler that also moves the audio element
    const handleSeek = useCallback((position: number) => {
        seek(position); // This updates store progress + increments _seekVersion, triggering the effect above
    }, [seek]);

    // Volume handler that also sets the audio element
    const handleSetVolume = useCallback((vol: number) => {
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        setVolume(vol);
    }, [setVolume]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't interfere with inputs
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            const state = usePlayerStore.getState();

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (state.currentTrack) {
                        state.isPlaying ? state.pause() : state.resume();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (state.currentTrack && state.duration > 0) {
                        const newPos = Math.min(1, state.progress + 5 / state.duration);
                        handleSeek(newPos);
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (state.currentTrack && state.duration > 0) {
                        const newPos = Math.max(0, state.progress - 5 / state.duration);
                        handleSeek(newPos);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleSetVolume(Math.min(1, state.volume + 0.05));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleSetVolume(Math.max(0, state.volume - 0.05));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSeek, handleSetVolume]);

    return {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        isLoading,
        error,
        play,
        pause,
        resume,
        next,
        previous,
        seek: handleSeek,
        setVolume: handleSetVolume,
        addToQueue,
        addToQueueBulk,
        clearQueue,
        removeFromQueue,
    };
}
