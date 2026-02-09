'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Track, Playlist } from '@/lib/types';
import type { VisualizerTheme } from '@/lib/dreampeace-data';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/audius';
import VisualizerBackground from '@/components/dreampeace/VisualizerBackground';
import AudioVisualizer from '@/components/dreampeace/AudioVisualizer';
import Navbar from '@/components/layout/Navbar';

interface DreampeaceAlbumClientProps {
    album: Playlist;
    visualizerTheme: VisualizerTheme;
}

export default function DreampeaceAlbumClient({ album, visualizerTheme }: DreampeaceAlbumClientProps) {
    const { play, pause, resume, next, previous, addToQueue, currentTrack, isPlaying, progress, duration, isLoading } = usePlayerStore();
    const setVisualizerActive = usePlayerStore((s) => s.setVisualizerActive);

    const [visualizerMode, setVisualizerMode] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const sidebarTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Check if current track belongs to this album
    const isAlbumPlaying = currentTrack ? album.tracks.some(t => t.id === currentTrack.id) : false;

    // Enter visualizer mode when this album starts playing
    useEffect(() => {
        if (isAlbumPlaying && isPlaying) {
            setVisualizerMode(true);
            setVisualizerActive(true);
        }
    }, [isAlbumPlaying, isPlaying, setVisualizerActive]);

    // Auto-open sidebar when entering visualizer mode, then auto-close after 4s
    useEffect(() => {
        if (visualizerMode) {
            setShowSidebar(true);
            if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current);
            sidebarTimerRef.current = setTimeout(() => setShowSidebar(false), 4000);
        }
        return () => {
            if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current);
        };
    }, [visualizerMode]);

    // Exit visualizer mode on pause
    useEffect(() => {
        if (!isPlaying && visualizerMode) {
            // Small delay so the transition feels intentional
            const timer = setTimeout(() => {
                setVisualizerMode(false);
                setVisualizerActive(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, visualizerMode, setVisualizerActive]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            setVisualizerActive(false);
        };
    }, [setVisualizerActive]);

    // Fullscreen controls auto-hide
    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        if (isFullscreen) {
            controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [isFullscreen]);

    useEffect(() => {
        if (!isFullscreen) {
            setShowControls(true);
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        } else {
            resetControlsTimer();
        }
    }, [isFullscreen, resetControlsTimer]);

    // Listen for fullscreen changes
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const handlePlay = (track: Track) => {
        play(track);
        const trackIndex = album.tracks.indexOf(track);
        const remaining = album.tracks.slice(trackIndex + 1);
        remaining.forEach((t) => addToQueue(t));
    };

    const handlePlayAll = () => {
        if (album.tracks.length === 0) return;
        play(album.tracks[0]);
        album.tracks.slice(1).forEach((t) => addToQueue(t));
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    const totalDuration = album.tracks.reduce((sum, t) => sum + t.duration, 0);

    // Format current time
    const currentTime = duration > 0 ? Math.floor(progress * duration) : 0;

    return (
        <div
            ref={containerRef}
            className={`theme-dreampeace min-h-screen text-[var(--foreground)] font-sans selection:bg-[var(--accent)] selection:text-white relative ${
                isFullscreen ? 'bg-white' : ''
            }`}
            onMouseMove={isFullscreen ? resetControlsTimer : undefined}
        >
            {/* Dreampeace background (visible when not in visualizer mode) */}
            <div className={`transition-opacity duration-700 ${visualizerMode ? 'opacity-0' : 'opacity-100'}`}>
                <VisualizerBackground />
            </div>

            {/* ================================================================
                VISUALIZER MODE (fullscreen canvas + floating UI)
                ================================================================ */}
            <div
                className={`fixed inset-0 z-20 transition-all duration-700 ${
                    visualizerMode
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Canvas */}
                <AudioVisualizer
                    theme={visualizerTheme}
                    isActive={visualizerMode}
                    className="absolute inset-0"
                />

                {/* Back arrow (top-left) */}
                <div
                    className={`absolute top-5 left-5 z-30 transition-all duration-500 ${
                        isFullscreen && !showControls ? 'opacity-0 -translate-y-4' : 'opacity-100'
                    }`}
                >
                    <Link
                        href="/dreampeace"
                        className="group flex items-center gap-2 px-3 py-2 rounded-full liquid-glass-light hover:bg-white/80 transition-all !rounded-full !py-2 !px-3"
                    >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-xs text-gray-400 group-hover:text-gray-500 font-medium transition-colors tracking-wide">
                            Dreampeace
                        </span>
                    </Link>
                </div>

                {/* Floating album art + track info (bottom-left) */}
                <div
                    className={`absolute bottom-6 left-6 z-30 flex items-center gap-4 transition-all duration-500 ${
                        isFullscreen && !showControls ? 'opacity-0 translate-y-4' : 'opacity-100'
                    }`}
                >
                    {album.artwork && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 flex-shrink-0">
                            <Image
                                src={album.artwork}
                                alt={album.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-gray-500 text-sm font-medium truncate max-w-[200px]">
                            {currentTrack?.title || album.name}
                        </p>
                        <p className="text-gray-300 text-xs truncate">
                            {album.name}
                        </p>
                        {duration > 0 && (
                            <p className="text-gray-300 text-[10px] mt-1">
                                {formatDuration(currentTime)} / {formatDuration(Math.floor(duration))}
                            </p>
                        )}
                    </div>
                </div>

                {/* Transport controls (bottom center) */}
                <div
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${
                        isFullscreen && !showControls ? 'opacity-0 translate-y-4' : 'opacity-100'
                    }`}
                >
                    <div className="liquid-glass-light flex items-center gap-3 px-5 py-3">
                        <button
                            onClick={previous}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-all"
                            aria-label="Previous"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => isPlaying ? pause() : resume()}
                            className="w-12 h-12 rounded-full bg-white/60 border border-white/80 shadow-sm flex items-center justify-center hover:bg-white/80 transition-all"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isLoading ? (
                                <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : isPlaying ? (
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={next}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-all"
                            aria-label="Next"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Top-right: fullscreen + sidebar toggle tab */}
                <div
                    className={`absolute top-5 right-5 z-30 flex items-center gap-2 transition-all duration-500 ${
                        isFullscreen && !showControls ? 'opacity-0 -translate-y-4' : 'opacity-100'
                    }`}
                >
                    <button
                        onClick={toggleFullscreen}
                        className="w-9 h-9 liquid-glass-light !rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9L4 4m0 0v4m0-4h4m7 1l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-1l5 5m0 0v-4m0 4h-4" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Sidebar tracklist (slides in from right) */}
                <div
                    className={`absolute top-0 right-0 bottom-0 z-30 w-72 bg-white/70 backdrop-blur-2xl border-l border-black/5 transition-transform duration-500 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.05)] ${
                        showSidebar && visualizerMode ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Close button */}
                    <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-between px-4 pt-4 pb-2">
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium">
                            Tracklist
                        </p>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-all"
                            aria-label="Close tracklist"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="pb-24 px-3">
                        <div className="space-y-px">
                            {album.tracks.map((track, index) => {
                                const isActive = currentTrack?.id === track.id;
                                return (
                                    <button
                                        key={track.id}
                                        onClick={() => handlePlay(track)}
                                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                                            isActive
                                                ? 'bg-[var(--accent)]/10'
                                                : 'hover:bg-black/5'
                                        }`}
                                    >
                                        <div className="w-5 text-center flex-shrink-0">
                                            {isActive && isPlaying ? (
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <span className="w-0.5 h-2.5 bg-[var(--accent)] rounded-full animate-pulse" />
                                                    <span className="w-0.5 h-3.5 bg-[var(--accent)] rounded-full animate-pulse animation-delay-200" />
                                                    <span className="w-0.5 h-2 bg-[var(--accent)] rounded-full animate-pulse animation-delay-500" />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 group-hover:text-gray-500">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`flex-1 text-xs font-medium truncate transition-colors ${
                                            isActive ? 'text-[var(--accent)]' : 'text-gray-600 group-hover:text-gray-800'
                                        }`}>
                                            {track.title}
                                        </span>
                                        <span className="text-[10px] text-gray-300 flex-shrink-0">
                                            {formatDuration(track.duration)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar toggle tab (visible when sidebar is closed) */}
                {!showSidebar && visualizerMode && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/5 backdrop-blur-sm border border-r-0 border-black/10 rounded-l-lg px-1.5 py-4 text-gray-400 hover:text-gray-600 hover:bg-black/10 transition-all ${
                            isFullscreen && !showControls ? 'opacity-0' : 'opacity-100'
                        }`}
                        aria-label="Open tracklist"
                        title="Open tracklist"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ================================================================
                NORMAL MODE (standard album page)
                ================================================================ */}
            <div
                className={`relative z-10 flex flex-col min-h-screen transition-all duration-700 ${
                    visualizerMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
                }`}
            >
                <Navbar />

                <main className="flex-grow pt-24 pb-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Back link */}
                        <Link
                            href="/dreampeace"
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors mb-8"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dreampeace
                        </Link>

                        {/* Album header */}
                        <div className="flex flex-col sm:flex-row gap-8 mb-12 animate-fade-in">
                            <div className="relative w-full sm:w-64 md:w-72 flex-shrink-0 aspect-square rounded-2xl overflow-hidden shadow-soft">
                                {album.artwork ? (
                                    <Image
                                        src={album.artwork}
                                        alt={album.name}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 640px) 100vw, 288px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-purple-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-end">
                                <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-medium mb-2">
                                    Dreampeace Album
                                </p>
                                <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight mb-4">
                                    {album.name}
                                </h1>
                                {album.description && (
                                    <p className="text-[var(--foreground-muted)] text-sm mb-4 max-w-md leading-relaxed">
                                        {album.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                                    <span>{album.trackCount} tracks</span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--accent)]/50" />
                                    <span>{formatDuration(totalDuration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent mb-8" />

                        {/* Play all + tracklist */}
                        <div>
                            <button
                                onClick={handlePlayAll}
                                className="group inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(128,90,213,0.3)] hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Play Album
                            </button>

                            <div className="space-y-px">
                                {album.tracks.map((track, index) => {
                                    const isActive = currentTrack?.id === track.id;
                                    return (
                                        <button
                                            key={track.id}
                                            onClick={() => handlePlay(track)}
                                            className={`group w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20'
                                                    : 'hover:bg-[var(--accent)]/5 border border-transparent'
                                            }`}
                                        >
                                            <div className="w-8 text-center flex-shrink-0">
                                                {isActive && isPlaying ? (
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        <span className="w-0.5 h-3 bg-[var(--accent)] rounded-full animate-pulse" />
                                                        <span className="w-0.5 h-4 bg-[var(--accent)] rounded-full animate-pulse animation-delay-200" />
                                                        <span className="w-0.5 h-2.5 bg-[var(--accent)] rounded-full animate-pulse animation-delay-500" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-sm text-[var(--foreground-muted)] group-hover:hidden">
                                                            {index + 1}
                                                        </span>
                                                        <svg className="w-4 h-4 text-[var(--foreground)] hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </>
                                                )}
                                            </div>
                                            <span className={`flex-1 text-sm font-medium truncate transition-colors ${
                                                isActive ? 'text-[var(--accent)]' : 'text-[var(--foreground)] group-hover:text-[var(--accent)]'
                                            }`}>
                                                {track.title}
                                            </span>
                                            <span className="text-xs text-[var(--foreground-muted)] w-12 text-right flex-shrink-0">
                                                {formatDuration(track.duration)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
