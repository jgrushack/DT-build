'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import type { Track, Playlist } from '@/lib/types';
import type { VisualizerTheme, Credit } from '@/lib/dreampeace-data';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/audius';
import Image from 'next/image';
import AudioVisualizer from '@/components/dreampeace/AudioVisualizer';
import HomeGlyph from '@/components/dreampeace/HomeGlyph';
import StarText from '@/components/dreampeace/StarText';
import DreamText from '@/components/dreampeace/DreamText';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useVisualizerSignal } from '@/hooks/useVisualizerSignal';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

// Collapse credits by name so the drawer reads as liner notes (one entry per
// person, multiple roles joined) instead of repeating the same name once per
// hat they wore. `note` is a scope qualifier like a specific track title; it
// breaks out its own entry because pairing it to an aggregated role list loses
// meaning ("Co-Composer on Blue Dot" isn't the same as "Co-Composer").
function groupCredits(credits: Credit[]): Array<{ roles: string[]; name: string; note?: string }> {
    const out: Array<{ roles: string[]; name: string; note?: string }> = [];
    const index = new Map<string, number>();
    for (const c of credits) {
        const key = c.note ? `__scoped__${out.length}` : c.name;
        const existing = index.get(key);
        if (existing !== undefined) {
            out[existing].roles.push(c.role);
        } else {
            index.set(key, out.length);
            out.push({ roles: [c.role], name: c.name, note: c.note });
        }
    }
    return out;
}

interface Props {
    album: Playlist;
    visualizerTheme: VisualizerTheme;
    credits: Credit[];
}

// Album page = the dream itself. Visualizer is always active.
// Before first play: the whole screen is click-to-begin.
// After first play: tap toggles overlay chrome, music continues.
export default function DreampeaceAlbumClient({ album, visualizerTheme, credits }: Props) {
    const { play, pause, resume, next, previous, addToQueue, currentTrack, isPlaying, progress, duration, isLoading } =
        usePlayerStore();
    const setVisualizerActive = usePlayerStore((s) => s.setVisualizerActive);
    // Reading queue length (not the array itself) keeps us subscribed to size changes only.
    const queueLength = usePlayerStore((s) => s.queue.length);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const sleepMode = searchParams?.get('sleep') === '1';

    const toggleSleep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.replace(sleepMode ? pathname! : `${pathname}?sleep=1`, { scroll: false });
    };

    const tier = useDeviceTier();
    const signal = useVisualizerSignal();
    const containerRef = useRef<HTMLDivElement>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionStartRef = useRef<number | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    const [showOverlay, setShowOverlay] = useState(true);
    const [showTracklist, setShowTracklist] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const isAlbumPlaying = currentTrack ? album.tracks.some((t) => t.id === currentTrack.id) : false;
    const activeTrackTitle = isAlbumPlaying ? currentTrack?.title ?? null : null;

    // Visualizer is always active on this page
    useEffect(() => {
        setVisualizerActive(true);
        return () => setVisualizerActive(false);
    }, [setVisualizerActive]);

    // 8-hour session expiry for sleep mode. Timer starts when the user first
    // taps to begin (not on mount, so pre-play idle time doesn't count).
    useEffect(() => {
        if (!sleepMode || !hasStarted) return;
        if (sessionStartRef.current === null) {
            sessionStartRef.current = Date.now();
        }
        const elapsed = Date.now() - sessionStartRef.current;
        const remaining = EIGHT_HOURS_MS - elapsed;
        if (remaining <= 0) {
            setSessionExpired(true);
            return;
        }
        const t = setTimeout(() => setSessionExpired(true), remaining);
        return () => clearTimeout(t);
    }, [sleepMode, hasStarted]);

    // Loop refill — when sleep mode is active and the queue empties while the
    // user is on the last track, re-queue the whole album so `next()` keeps
    // playback going. Stops once the 8-hour session expires.
    useEffect(() => {
        if (!sleepMode || sessionExpired || !hasStarted) return;
        if (!currentTrack) return;
        const idx = album.tracks.findIndex((t) => t.id === currentTrack.id);
        if (idx === -1) return;

        const isLast = idx === album.tracks.length - 1;
        if (isLast && queueLength === 0) {
            // Re-queue the full album (current track keeps playing; the refill
            // lands behind it so next() picks up track 1 when this one ends).
            album.tracks.forEach((t) => addToQueue(t));
        }
    }, [sleepMode, sessionExpired, hasStarted, currentTrack, queueLength, album.tracks, addToQueue]);

    // Idle timeout — hide overlay chrome after 3.5s of no pointer activity,
    // but only AFTER the user has started the album. Pre-play, the welcome stays.
    const resetIdle = useCallback(() => {
        if (!hasStarted) return;
        setShowOverlay(true);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setShowOverlay(false), 3500);
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        resetIdle();
        const el = containerRef.current;
        if (!el) return;
        const events: Array<keyof DocumentEventMap> = ['pointermove', 'touchstart', 'keydown'];
        events.forEach((e) => el.addEventListener(e, resetIdle));
        return () => {
            events.forEach((e) => el.removeEventListener(e, resetIdle));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdle, hasStarted]);

    // Fullscreen listener
    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const startAlbum = () => {
        if (album.tracks.length === 0) return;
        play(album.tracks[0]);
        album.tracks.slice(1).forEach((t) => addToQueue(t));
        setHasStarted(true);
    };

    const handlePlayTrack = (track: Track) => {
        play(track);
        const trackIndex = album.tracks.indexOf(track);
        const remaining = album.tracks.slice(trackIndex + 1);
        remaining.forEach((t) => addToQueue(t));
        setHasStarted(true);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    // Pre-play: any click/tap on the main surface begins playback.
    // Post-play: tap toggles overlay (summons UI chrome).
    // Buttons inside the overlay stop propagation so they don't interfere.
    const handleSurfaceClick = () => {
        if (!hasStarted) {
            startAlbum();
            return;
        }
        setShowOverlay((v) => !v);
    };

    const progressPct = duration > 0 ? progress * 100 : 0;
    const currentTime = duration > 0 ? Math.floor(progress * duration) : 0;

    const albumStyle = {
        '--dp-ember': visualizerTheme.ember,
        '--dp-field-a': visualizerTheme.fieldA,
        '--dp-field-b': visualizerTheme.fieldB,
    } as React.CSSProperties;

    return (
        <div
            ref={containerRef}
            className={`${sleepMode ? 'theme-dreampeace-sleep' : 'theme-dreampeace'} fixed inset-0 overflow-hidden cursor-pointer`}
            onClick={handleSurfaceClick}
            style={{ ...albumStyle, background: sleepMode ? '#0a0908' : visualizerTheme.bgColor }}
        >
            {/* ============================================================
                ART → VISUALIZER seamless arrival
                Two layers, same 3800ms duration, locked in phase:
                  1. Art: blur + desaturate + scale + fade (dp-art-dream)
                  2. Theme tint: rises to full bgColor then fades revealing viz
                     (dp-tint-rise). Tint's solid color == viz's bgColor frame 1,
                     so the final reveal has zero color delta.
                ============================================================ */}
            {album.artwork && (
                <div className="absolute inset-0 z-[50] pointer-events-none overflow-hidden">
                    {/* Layer 1: the art, dreaming away */}
                    <div
                        className="absolute inset-0 dp-art-dream-anim"
                        style={{
                            animation: 'dp-art-dream 3800ms cubic-bezier(0.4, 0, 0.6, 1) forwards',
                        }}
                    >
                        <Image
                            src={album.artwork}
                            alt=""
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover"
                            style={{
                                filter: sleepMode ? 'saturate(1.05) brightness(0.55)' : 'saturate(0.95)',
                            }}
                        />
                    </div>

                    {/* Layer 2: theme tint — grows to full bgColor, then fades
                        revealing the visualizer. End color == viz bgColor. */}
                    <div
                        className="absolute inset-0 dp-tint-rise-anim"
                        style={{
                            background: sleepMode
                                ? `radial-gradient(circle at center, ${visualizerTheme.ember}40 0%, rgba(10, 9, 8, 1) 75%)`
                                : `radial-gradient(circle at center, ${visualizerTheme.ember}55 0%, ${visualizerTheme.bgColor} 75%)`,
                            animation: 'dp-tint-rise 3800ms cubic-bezier(0.4, 0, 0.6, 1) forwards',
                        }}
                    />
                </div>
            )}

            {/* Substrate fallback for albums without artwork */}
            {!album.artwork && (
                <div
                    className="absolute inset-0 z-[50] pointer-events-none"
                    style={{
                        background: sleepMode ? '#0a0908' : visualizerTheme.bgColor,
                        animation: 'dp-surface-field 1.8s cubic-bezier(0.22, 1, 0.36, 1) reverse forwards',
                    }}
                />
            )}

            {/* Visualizer — the dream itself */}
            <div className="absolute inset-0 z-0">
                <AudioVisualizer
                    theme={visualizerTheme}
                    isActive={true}
                    className="absolute inset-0"
                />
            </div>

            {/* Sleep scrim — darkens the cream visualizer into night.
                Screen-friendly for fall-asleep; no scene palette swap required. */}
            {sleepMode && (
                <div
                    className="absolute inset-0 z-[2] pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, rgba(5, 4, 10, 0.55) 0%, rgba(10, 9, 8, 0.78) 100%)',
                    }}
                />
            )}

            {/* Grain overlay */}
            {tier.grainEnabled && <div className="absolute inset-0 dp-grain z-[5]" />}

            {/* ========== Center stage ========== */}
            <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
                style={{
                    opacity: showOverlay || !hasStarted ? 1 : 0,
                    transition: 'opacity 1400ms cubic-bezier(0.4, 0, 0.6, 1)',
                }}
            >
                {/* Pre-play welcome */}
                {!hasStarted && (
                    <div
                        className="opacity-0 max-w-2xl"
                        style={{
                            animation: 'dp-surface-content 1.6s cubic-bezier(0.22, 1, 0.36, 1) 1200ms forwards',
                        }}
                    >
                        {/* A moment by — small, kerned, slow-emerging overline.
                            Gives the title something to rise up from. */}
                        <div className="flex justify-center mb-5 opacity-0"
                            style={{
                                animation: 'dp-surface-content 1.8s cubic-bezier(0.22, 1, 0.36, 1) 600ms forwards',
                            }}
                        >
                            <span
                                className="text-[9px] md:text-[10px] font-light tracking-[0.55em] uppercase"
                                style={{ color: 'var(--dp-ink-ember)' }}
                            >
                                A Dreampeace Moment
                            </span>
                        </div>

                        {/* Album title — kerned letter-by-letter, large, breathed.
                            The hero of the welcome. Size + emerge timing tuned so
                            it feels like the title is being dreamed, not rendered. */}
                        <div className="flex justify-center mb-4">
                            <DreamText
                                text={album.name}
                                as="h1"
                                uppercase
                                tracking="0.22em"
                                color={sleepMode ? 'rgba(245, 240, 232, 0.92)' : 'rgba(42, 38, 34, 0.92)'}
                                vwScale={0.065}
                                minPx={38}
                                maxPx={84}
                                breathe
                                emergeMs={2400}
                                staggerMs={95}
                                dissolveToFlow
                            />
                        </div>

                        {/* Artist — kerned DreamText under the title, quieter
                            but equally dreamed. Emerges after the title has settled. */}
                        <div className="flex justify-center mb-8"
                            style={{
                                animation: 'dp-surface-content 1.8s cubic-bezier(0.22, 1, 0.36, 1) 2200ms forwards',
                                opacity: 0,
                            }}
                        >
                            <DreamText
                                text="Devin Townsend"
                                as="span"
                                tracking="0.32em"
                                color={sleepMode ? 'rgba(245, 240, 232, 0.7)' : 'rgba(74, 66, 58, 0.72)'}
                                vwScale={0.014}
                                minPx={11}
                                maxPx={15}
                                breathe
                                emergeMs={1800}
                                staggerMs={55}
                                dissolveToFlow
                            />
                        </div>

                        {album.description && (
                            <p
                                className="text-center text-xs md:text-sm font-light leading-relaxed tracking-[0.05em] max-w-xl mx-auto opacity-0 mb-12 px-4"
                                style={{
                                    color: 'var(--dp-ink-dim)',
                                    animation:
                                        'dp-surface-content 2.2s cubic-bezier(0.22, 1, 0.36, 1) 3400ms forwards',
                                }}
                            >
                                {album.description}
                            </p>
                        )}
                        <p
                            className="text-center text-[10px] md:text-xs font-light tracking-[0.5em] uppercase opacity-0"
                            style={{
                                color: 'var(--dp-ink-ember)',
                                animation:
                                    'dp-surface-content 1.6s cubic-bezier(0.22, 1, 0.36, 1) 4600ms forwards, dp-glyph-idle 5s cubic-bezier(0.4, 0, 0.6, 1) 6400ms infinite',
                            }}
                        >
                            Touch to enter
                        </p>
                    </div>
                )}

                {/* Playing — centered breathing title. Opacity driven by visualizer
                    signal so music takes over gradually. Floor 0.5 per backend Claude's
                    "don't lose navigation" rule. */}
                {hasStarted && activeTrackTitle && (
                    <div
                        className="text-center"
                        style={{
                            opacity: Math.max(signal, 0.5),
                            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.6, 1)',
                        }}
                    >
                        <p
                            className="text-[10px] md:text-xs font-light tracking-[0.4em] uppercase mb-3"
                            style={{ color: 'var(--dp-ink-ember)' }}
                        >
                            Now Playing
                        </p>
                        <h2
                            key={activeTrackTitle}
                            className="text-xl md:text-3xl font-thin tracking-[0.15em]"
                            style={{
                                fontFamily: 'Georgia, serif',
                                color: 'var(--dp-ink)',
                            }}
                        >
                            <StarText mode="breathe" staggerMs={35} dissolveToFlow>
                                {activeTrackTitle}
                            </StarText>
                        </h2>
                    </div>
                )}
            </div>

            {/* ========== Transport controls — bottom center ========== */}
            {hasStarted && (
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                    style={{
                        opacity: showOverlay ? 1 : 0,
                        transform: `translate(-50%, ${showOverlay ? '0' : '16px'})`,
                        transition: 'opacity 700ms, transform 700ms',
                        pointerEvents: showOverlay ? 'auto' : 'none',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="flex items-center gap-4 px-5 py-3 rounded-full backdrop-blur-lg border"
                        style={{
                            background: 'rgba(245, 240, 232, 0.7)',
                            borderColor: 'rgba(58, 53, 48, 0.12)',
                        }}
                    >
                        <button
                            onClick={previous}
                            aria-label="Previous"
                            className="w-8 h-8 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--dp-ink)' }}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => (isPlaying ? pause() : resume())}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            className="w-11 h-11 flex items-center justify-center rounded-full transition-all"
                            style={{
                                background: `${visualizerTheme.ember}25`,
                                color: 'var(--dp-ink)',
                                border: `1px solid ${visualizerTheme.ember}60`,
                            }}
                        >
                            {isLoading ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                            ) : isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={next}
                            aria-label="Next"
                            className="w-8 h-8 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--dp-ink)' }}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>

                        <span className="w-px h-4 mx-1" style={{ background: 'rgba(58, 53, 48, 0.15)' }} />

                        <button
                            onClick={() => setShowTracklist((v) => !v)}
                            aria-label="Tracks"
                            className="text-[10px] font-light tracking-[0.25em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--dp-ink)' }}
                        >
                            {showTracklist ? 'Hide' : 'Tracks'}
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            className="w-7 h-7 flex items-center justify-center rounded-full opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--dp-ink)' }}
                        >
                            {isFullscreen ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 9L4 4m0 0v4m0-4h4m7 1l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-1l5 5m0 0v-4m0 4h-4"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {duration > 0 && (
                        <p
                            className="mt-3 text-center text-[10px] tracking-[0.3em] font-light"
                            style={{ color: 'var(--dp-ink-ember)' }}
                        >
                            {formatDuration(currentTime)} · {formatDuration(Math.floor(duration))}
                        </p>
                    )}
                </div>
            )}

            {/* Thin progress line — top */}
            {hasStarted && duration > 0 && (
                <div
                    className="absolute top-0 left-0 right-0 z-20 h-[2px]"
                    style={{
                        background: 'rgba(58, 53, 48, 0.08)',
                        opacity: showOverlay ? 1 : 0.25,
                        transition: 'opacity 700ms',
                    }}
                >
                    <div
                        className="h-full"
                        style={{
                            width: `${progressPct}%`,
                            background: visualizerTheme.ember,
                            boxShadow: `0 0 8px ${visualizerTheme.ember}80`,
                            transition: 'width 200ms linear',
                        }}
                    />
                </div>
            )}

            {/* Track list drawer */}
            <div
                className="absolute top-0 right-0 bottom-0 z-40 w-80 max-w-[85vw] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: showTracklist ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    background: 'rgba(245, 240, 232, 0.88)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderLeft: '1px solid rgba(58, 53, 48, 0.08)',
                }}
            >
                <div className="px-6 pt-8 pb-4">
                    <p
                        className="text-[10px] font-light tracking-[0.4em] uppercase mb-1"
                        style={{ color: 'var(--dp-ink-ember)' }}
                    >
                        {album.name}
                    </p>
                    <p
                        className="text-[9px] font-light tracking-[0.3em] uppercase"
                        style={{ color: 'var(--dp-ink-whisper)' }}
                    >
                        {album.trackCount} tracks
                    </p>
                </div>

                <div className="pb-20 px-3">
                    {album.tracks.map((track, index) => {
                        const isActive = currentTrack?.id === track.id;
                        return (
                            <button
                                key={track.id}
                                onClick={() => handlePlayTrack(track)}
                                className="group w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-300"
                                style={{
                                    background: isActive ? `${visualizerTheme.ember}12` : 'transparent',
                                    borderLeft: isActive
                                        ? `2px solid ${visualizerTheme.ember}`
                                        : '2px solid transparent',
                                }}
                            >
                                <span
                                    className="w-5 text-center text-[10px] font-light"
                                    style={{
                                        color: isActive
                                            ? visualizerTheme.ember
                                            : 'var(--dp-ink-ember)',
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <span
                                    className="flex-1 text-xs font-light tracking-[0.1em] truncate"
                                    style={{
                                        color: isActive ? 'var(--dp-ink)' : 'var(--dp-ink-dim)',
                                    }}
                                >
                                    {track.title}
                                </span>
                                <span
                                    className="text-[10px] font-light"
                                    style={{ color: 'var(--dp-ink-whisper)' }}
                                >
                                    {formatDuration(track.duration)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Credits — grouped by name, woven in rather than columnar.
                    Each album has its own set (different mastering engineers,
                    guest composers, etc.) so this panel isn't boilerplate. */}
                {credits.length > 0 && (
                    <div className="px-6 pt-6 pb-16 border-t" style={{ borderColor: 'rgba(58, 53, 48, 0.08)' }}>
                        <p
                            className="text-[9px] font-light tracking-[0.4em] uppercase mb-4"
                            style={{ color: 'var(--dp-ink-ember)' }}
                        >
                            Credits
                        </p>
                        <div className="space-y-2.5">
                            {groupCredits(credits).map((group, i) => (
                                <div key={i} className="text-[10px] font-light leading-relaxed">
                                    <div
                                        className="tracking-[0.2em] uppercase"
                                        style={{ color: 'var(--dp-ink-whisper)' }}
                                    >
                                        {group.roles.join(' · ')}
                                    </div>
                                    <div
                                        className="tracking-[0.08em]"
                                        style={{ color: 'var(--dp-ink-dim)' }}
                                    >
                                        {group.name}
                                        {group.note && (
                                            <span
                                                className="ml-1"
                                                style={{ color: 'var(--dp-ink-whisper)' }}
                                            >
                                                — {group.note}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sleep-mode loop hint — faint, bottom-right corner, breathing. */}
            {sleepMode && hasStarted && (
                <div
                    className="absolute bottom-6 right-6 z-30 flex items-center gap-2 animate-dp-glyph-idle pointer-events-none"
                    style={{
                        color: 'rgba(245, 240, 232, 0.35)',
                        opacity: showOverlay ? 1 : 0.25,
                        transition: 'opacity 900ms',
                    }}
                >
                    {/* Crescent-ish moon dot */}
                    <span
                        className="block w-1.5 h-1.5 rounded-full"
                        style={{
                            background: 'rgba(245, 240, 232, 0.5)',
                            boxShadow: '0 0 8px rgba(245, 240, 232, 0.35)',
                        }}
                    />
                    <span className="text-[9px] font-light tracking-[0.35em] uppercase">
                        {sessionExpired ? 'Rest complete' : 'Looping for rest · 8h'}
                    </span>
                </div>
            )}

            {/* Home glyph — stopPropagation so clicks on it don't toggle the page overlay */}
            <div onClick={(e) => e.stopPropagation()}>
                <HomeGlyph href="/dreampeace" label="Return" />
            </div>

            {/* Sleep toggle — top right, matches home-glyph chip. Persists via
                URL so refreshing / bookmarking keeps the mode. */}
            <button
                type="button"
                onClick={toggleSleep}
                aria-label={sleepMode ? 'Switch to day' : 'Switch to sleep'}
                className="dp-home-chip fixed top-5 right-5 z-[70] flex items-center gap-2.5 focus:outline-none"
                style={{
                    opacity: showOverlay || !hasStarted ? 1 : 0.35,
                    transition: 'opacity 900ms cubic-bezier(0.4, 0, 0.6, 1)',
                    cursor: 'pointer',
                }}
            >
                <span aria-hidden className="block w-4 h-4" style={{ color: 'currentColor' }}>
                    {sleepMode ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-full h-full">
                            <path d="M20 14.5a8 8 0 01-10.5-10.5A8 8 0 1020 14.5z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-full h-full">
                            <circle cx="12" cy="12" r="3.5" />
                            <path strokeLinecap="round" d="M12 4v2M12 18v2M4 12h2M18 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4" />
                        </svg>
                    )}
                </span>
                <span
                    aria-hidden
                    className="text-[10px] font-light uppercase whitespace-nowrap"
                    style={{ letterSpacing: '0.32em', opacity: 0.78 }}
                >
                    {sleepMode ? 'Day' : 'Sleep'}
                </span>
            </button>
        </div>
    );
}
