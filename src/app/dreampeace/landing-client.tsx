'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Playlist } from '@/lib/types';
import type { VisualizerTheme } from '@/lib/dreampeace-data';
import DreamText from '@/components/dreampeace/DreamText';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useVisualizerSignal } from '@/hooks/useVisualizerSignal';
import { usePlayerStore } from '@/store/playerStore';

interface Star {
    album: Playlist;
    theme: VisualizerTheme;
    pos: { x: number; y: number; size: number };
}

interface Props {
    stars: Star[];
}

const INTRO_VIDEO_ID = 'aMN1Kjyl0dU';

// Ink tokens — warmer graphite than pure --dp-ink so page reads "ethereal",
// but the hero wordmark sits darker (Dreampeace must be legible, not a ghost).
const INK_HERO = 'rgba(42, 38, 34, 0.92)';      // wordmark — strong but not stark
const INK_BODY = 'rgba(74, 66, 58, 0.82)';       // body copy
const INK_DIM = 'rgba(74, 66, 58, 0.55)';        // supporting / muted
const INK_WHISPER = 'rgba(74, 66, 58, 0.32)';    // credits line

const SLEEP_HERO = 'rgba(245, 240, 232, 0.92)';
const SLEEP_BODY = 'rgba(245, 240, 232, 0.75)';
const SLEEP_DIM = 'rgba(245, 240, 232, 0.48)';
const SLEEP_WHISPER = 'rgba(245, 240, 232, 0.28)';

export default function DreampeaceLandingClient({ stars }: Props) {
    const router = useRouter();
    const tier = useDeviceTier();
    const signal = useVisualizerSignal();
    const setVisualizerActive = usePlayerStore((s) => s.setVisualizerActive);
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);

    // Hide the global bottom PlayerWrapper while on /dreampeace surfaces —
    // it's the triangle + album-chip chrome that was clashing with the dream.
    useEffect(() => {
        setVisualizerActive(true);
        return () => setVisualizerActive(false);
    }, [setVisualizerActive]);

    const [sleep, setSleep] = useState(false); // global dark-mode toggle
    const [aboutOpen, setAboutOpen] = useState(false);
    const [entering, setEntering] = useState<{ id: string; rect: DOMRect; artSrc: string | null } | null>(null);

    const scatterRefs = useRef<Map<string, HTMLElement>>(new Map());
    const registerScatter = (id: string) => (el: HTMLElement | null) => {
        if (el) scatterRefs.current.set(id, el);
        else scatterRefs.current.delete(id);
    };

    useEffect(() => {
        stars.forEach((s) => router.prefetch(`/dreampeace/${s.album.id}`));
    }, [stars, router]);

    const handleEnter = (albumId: string, orbEl: HTMLButtonElement | null) => {
        if (entering || !orbEl) return;

        const star = stars.find((s) => s.album.id === albumId);
        if (!star) return;

        const rect = orbEl.getBoundingClientRect();
        setEntering({ id: albumId, rect, artSrc: star.album.artwork });

        const ocx = rect.left + rect.width / 2;
        const ocy = rect.top + rect.height / 2;

        // Scatter every registered non-orb element radially away from the impact.
        scatterRefs.current.forEach((el, id) => {
            if (id === `orb-${albumId}`) return;
            const r = el.getBoundingClientRect();
            const ex = r.left + r.width / 2;
            const ey = r.top + r.height / 2;
            const dx = ex - ocx;
            const dy = ey - ocy;
            const dist = Math.hypot(dx, dy) || 1;
            const distScale = Math.max(0.35, Math.min(1, 500 / dist));
            const force = 360 * distScale;
            const nx = (dx / dist) * force;
            const ny = (dy / dist) * force;
            el.style.transition =
                'transform 1200ms cubic-bezier(0.22,1,0.36,1), opacity 900ms cubic-bezier(0.4,0,0.2,1), filter 900ms';
            el.style.transform = `translate(${nx}px, ${ny}px) scale(0.85)`;
            el.style.opacity = '0';
            el.style.filter = 'blur(8px)';
        });

        const dest = sleep ? `/dreampeace/${albumId}?sleep=1` : `/dreampeace/${albumId}`;
        setTimeout(() => router.push(dest), 1200);
    };

    const enteringTheme = entering ? stars.find((s) => s.album.id === entering.id)!.theme : null;

    return (
        <div
            className={`${sleep ? 'theme-dreampeace-sleep' : 'theme-dreampeace'} fixed inset-0 overflow-hidden`}
            style={{
                background: sleep ? '#0a0908' : 'var(--dp-mist)',
                color: sleep ? SLEEP_BODY : INK_BODY,
                transition: 'background 1200ms cubic-bezier(0.4, 0, 0.6, 1), color 1200ms cubic-bezier(0.4, 0, 0.6, 1)',
            }}
        >
            {/* Arrival veil — held at substrate color, reverse-fades on mount */}
            <div
                className="absolute inset-0 z-[50] pointer-events-none"
                style={{
                    background: sleep ? '#0a0908' : 'var(--dp-mist)',
                    animation: 'dp-surface-field 1.8s cubic-bezier(0.22, 1, 0.36, 1) reverse forwards',
                }}
            />

            {/* Soft watercolor substrate */}
            <div className="absolute inset-0 bg-dreampeace opacity-90" />

            <div
                className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full animate-dp-orb-breathe"
                style={{
                    background: sleep
                        ? 'radial-gradient(circle, rgba(184, 168, 245, 0.10) 0%, transparent 65%)'
                        : 'radial-gradient(circle, rgba(124, 95, 196, 0.08) 0%, transparent 65%)',
                    filter: 'blur(60px)',
                    mixBlendMode: sleep ? 'screen' : 'multiply',
                }}
            />
            <div
                className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full animate-dp-orb-breathe"
                style={{
                    background: sleep
                        ? 'radial-gradient(circle, rgba(253, 186, 116, 0.06) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(217, 138, 92, 0.07) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    mixBlendMode: sleep ? 'screen' : 'multiply',
                    animationDelay: '2000ms',
                }}
            />

            {tier.grainEnabled && <div className="absolute inset-0 dp-grain z-[5]" />}

            {/* ========== Sleep toggle — top right, sits LEFT of PortalChrome's
                avatar (top-4 right-5, ~32px wide) so they don't stack. ======== */}
            <button
                type="button"
                onClick={() => setSleep((v) => !v)}
                aria-label={sleep ? 'Switch to day' : 'Switch to sleep'}
                className="fixed top-[18px] right-[60px] z-[95] w-9 h-9 flex items-center justify-center rounded-full focus:outline-none group opacity-0"
                style={{
                    animation: 'dp-surface-content 1.4s cubic-bezier(0.22, 1, 0.36, 1) 2200ms forwards',
                }}
            >
                {/* Sun / Moon glyph — crescent when sleep is on, circle when off */}
                <span
                    className="relative block w-5 h-5"
                    style={{
                        color: sleep ? SLEEP_HERO : INK_HERO,
                        opacity: 0.55,
                        transition: 'opacity 500ms',
                    }}
                >
                    {sleep ? (
                        // Crescent moon — simple SVG
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-full h-full">
                            <path d="M20 14.5a8 8 0 01-10.5-10.5A8 8 0 1020 14.5z" />
                        </svg>
                    ) : (
                        // Sun / sparkle
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-full h-full">
                            <circle cx="12" cy="12" r="3.5" />
                            <path strokeLinecap="round" d="M12 4v2M12 18v2M4 12h2M18 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4" />
                        </svg>
                    )}
                </span>
            </button>

            {/* ========== Home content — Moments is the default ========== */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 py-20 overflow-y-auto">

                {/* Hero wordmark row — Dreampeace · About */}
                <div
                    ref={registerScatter('wordmark-row')}
                    className="flex items-baseline gap-5 mb-3 opacity-0"
                    style={{
                        animation: 'dp-surface-content 1.4s cubic-bezier(0.22, 1, 0.36, 1) 1500ms forwards',
                    }}
                >
                    {/* Pretext-kerned wordmark, darker ink for legibility on cream */}
                    <DreamText
                        text="Dreampeace"
                        as="h1"
                        uppercase
                        tracking="0.22em"
                        color={sleep ? SLEEP_HERO : INK_HERO}
                        opacity={Math.max(signal, 0.75)}
                        vwScale={0.055}
                        minPx={36}
                        maxPx={68}
                        breathe
                        emergeMs={1600}
                        staggerMs={80}
                    />

                    <button
                        type="button"
                        onClick={() => setAboutOpen(true)}
                        className="text-[10px] md:text-[11px] font-light tracking-[0.3em] uppercase transition-opacity duration-500 hover:opacity-100"
                        style={{
                            color: sleep ? SLEEP_DIM : INK_DIM,
                            opacity: 0.65,
                            alignSelf: 'center',
                            marginLeft: '8px',
                            marginTop: '8px',
                        }}
                    >
                        · About
                    </button>
                </div>

                {/* "by Devin Townsend" intentionally omitted here — lives only on
                    the pre-auth splash (/). Home shouldn't re-credit; it should feel
                    inhabited. Spacer below preserves the breathing distance to the
                    constellation that the credit line used to provide. */}
                <div className="mb-14 md:mb-16" />

                {/* Constellation */}
                <ConstellationGrid
                    stars={stars}
                    entering={entering?.id ?? null}
                    signal={signal}
                    isSleep={sleep}
                    onEnter={handleEnter}
                    registerScatter={registerScatter}
                />

                {/* Credits intentionally omitted on the home — they vary by
                    album (Beautiful Day has a guest co-composer + a different
                    mastering engineer), so the per-album credits drawer is the
                    only place they belong. */}
            </div>

            {/* Now Playing — subtle chip at the bottom of the constellation.
                Appears only when audio is active so the constellation feels
                empty when it is. Click returns the user to the moment the
                track lives in. */}
            {currentTrack && (() => {
                const owningStar = stars.find((s) =>
                    s.album.tracks.some((t) => t.id === currentTrack.id),
                );
                return (
                    <button
                        type="button"
                        onClick={() => {
                            if (!owningStar) return;
                            const dest = sleep
                                ? `/dreampeace/${owningStar.album.id}?sleep=1`
                                : `/dreampeace/${owningStar.album.id}`;
                            router.push(dest);
                        }}
                        aria-label={`Now playing: ${currentTrack.title}${owningStar ? ` from ${owningStar.album.name}` : ''}`}
                        className="dp-home-chip fixed bottom-5 left-1/2 -translate-x-1/2 z-[65] flex items-center gap-3 focus:outline-none"
                        style={{ cursor: owningStar ? 'pointer' : 'default' }}
                    >
                        <span
                            aria-hidden
                            className="relative flex items-center justify-center"
                            style={{ width: 10, height: 10 }}
                        >
                            <span
                                className="absolute rounded-full"
                                style={{
                                    width: 10,
                                    height: 10,
                                    background: 'radial-gradient(circle, currentColor 0%, transparent 65%)',
                                    opacity: isPlaying ? 0.35 : 0.15,
                                    animation: isPlaying ? 'dp-glyph-idle 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined,
                                }}
                            />
                            <span
                                className="relative block rounded-full"
                                style={{ width: 4, height: 4, background: 'currentColor', opacity: isPlaying ? 1 : 0.5 }}
                            />
                        </span>
                        <span
                            className="text-[10px] font-light uppercase whitespace-nowrap"
                            style={{
                                letterSpacing: '0.28em',
                                color: 'currentColor',
                                opacity: 0.82,
                                maxWidth: '50vw',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {currentTrack.title}
                            {owningStar && (
                                <span style={{ opacity: 0.55, marginLeft: 10 }}>· {owningStar.album.name}</span>
                            )}
                        </span>
                    </button>
                );
            })()}

            {/* ========== Album art expansion overlay — hero transition ========== */}
            {entering && entering.artSrc && (
                <ArtExpansionOverlay
                    artSrc={entering.artSrc}
                    fromRect={entering.rect}
                    theme={enteringTheme!}
                    isSleep={sleep}
                />
            )}

            {/* ========== About overlay ========== */}
            {aboutOpen && (
                <AboutOverlay isSleep={sleep} onClose={() => setAboutOpen(false)} />
            )}
        </div>
    );
}

// ============================================================================
// ConstellationGrid — 7 orbs. Each orb now always shows its album art beneath
// the ember bloom. On click, the art scales up to become the transition hero.
// ============================================================================

function ConstellationGrid({
    stars,
    entering,
    signal,
    isSleep,
    onEnter,
    registerScatter,
}: {
    stars: Star[];
    entering: string | null;
    signal: number;
    isSleep: boolean;
    onEnter: (albumId: string, el: HTMLButtonElement | null) => void;
    registerScatter: (id: string) => (el: HTMLElement | null) => void;
}) {
    return (
        <div
            className="relative w-full aspect-[4/3] max-w-[720px] opacity-0"
            style={{
                animation: 'dp-surface-content 2s cubic-bezier(0.22, 1, 0.36, 1) 3000ms forwards',
            }}
        >
            {stars.map((s, i) => {
                const isEntering = entering === s.album.id;
                const orbSize = 72 * s.pos.size;
                const artBaseOpacity = isSleep ? 0.28 : 0.38;
                const artOpacity = artBaseOpacity * signal;

                return (
                    <button
                        key={s.album.id}
                        type="button"
                        ref={registerScatter(`orb-${s.album.id}`)}
                        onClick={(e) => onEnter(s.album.id, e.currentTarget)}
                        aria-label={s.album.name}
                        className="absolute group focus:outline-none"
                        style={{
                            left: `${s.pos.x}%`,
                            top: `${s.pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            willChange: 'transform, opacity, filter',
                            opacity: isEntering ? 0 : 1,
                            transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.6, 1)',
                        }}
                    >
                        <span
                            className="relative block rounded-full animate-dp-orb-breathe"
                            style={{
                                width: `${orbSize}px`,
                                height: `${orbSize}px`,
                                animationDelay: `${i * 400}ms`,
                                boxShadow: isSleep
                                    ? `0 0 ${28 * s.pos.size}px ${6 * s.pos.size}px ${s.theme.ember}55`
                                    : `0 0 ${28 * s.pos.size}px ${6 * s.pos.size}px ${s.theme.ember}33`,
                                overflow: 'hidden',
                            }}
                        >
                            {s.album.artwork && (
                                <Image
                                    src={s.album.artwork}
                                    alt=""
                                    fill
                                    sizes="96px"
                                    className="object-cover pointer-events-none"
                                    style={{
                                        opacity: artOpacity,
                                        transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.6, 1)',
                                        filter: isSleep ? 'saturate(1.05) brightness(0.85)' : 'saturate(0.9)',
                                    }}
                                />
                            )}
                            <span
                                className="absolute inset-0 rounded-full pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle, ${s.theme.ember}99 0%, ${s.theme.ember}44 45%, ${s.theme.ember}00 80%)`,
                                    mixBlendMode: isSleep ? 'screen' : 'multiply',
                                }}
                            />
                            <span
                                className="absolute inset-[30%] rounded-full pointer-events-none"
                                style={{
                                    background: s.theme.ember,
                                    opacity: 0.55,
                                    filter: 'blur(6px)',
                                }}
                            />
                        </span>

                        <span
                            ref={registerScatter(`label-${s.album.id}`)}
                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] md:text-xs font-light tracking-[0.25em] uppercase transition-opacity duration-700 group-hover:opacity-100 group-focus:opacity-100"
                            style={{
                                top: `calc(${orbSize}px + 18px)`,
                                color: isSleep ? SLEEP_BODY : INK_BODY,
                                opacity: 0.7,
                                willChange: 'transform, opacity, filter',
                            }}
                        >
                            {s.album.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ============================================================================
// ArtExpansionOverlay — on orb click, the art image animates from the orb's
// exact position/size to fill the viewport, then fades. This is the hero
// transition: continuous, expensive-looking, natural.
// ============================================================================

function ArtExpansionOverlay({
    artSrc,
    fromRect,
    theme,
    isSleep,
}: {
    artSrc: string;
    fromRect: DOMRect;
    theme: VisualizerTheme;
    isSleep: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Kick off the expansion on next frame so initial styles commit first.
        requestAnimationFrame(() => {
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.width = '100vw';
            el.style.height = '100vh';
            el.style.borderRadius = '0px';
            // IMPORTANT: do NOT fade opacity during expansion. The expansion's
            // final state should be a fully-visible, viewport-covering art so
            // the album page's arrival veil (which shows the same art) can pick
            // up visually without any luminance shift at the navigation boundary.
        });
    }, []);

    return (
        <div
            ref={ref}
            className="fixed z-[55] pointer-events-none"
            style={{
                left: `${fromRect.left}px`,
                top: `${fromRect.top}px`,
                width: `${fromRect.width}px`,
                height: `${fromRect.height}px`,
                borderRadius: '50%',
                overflow: 'hidden',
                opacity: 1,
                transition:
                    'left 1200ms cubic-bezier(0.22,1,0.36,1), top 1200ms cubic-bezier(0.22,1,0.36,1), width 1200ms cubic-bezier(0.22,1,0.36,1), height 1200ms cubic-bezier(0.22,1,0.36,1), border-radius 900ms cubic-bezier(0.4,0,0.6,1)',
                background: theme.bgColor,
            }}
        >
            {/* The art, centered & covering */}
            <Image
                src={artSrc}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
                style={{
                    filter: isSleep ? 'saturate(1.05) brightness(0.6)' : 'saturate(1.0)',
                }}
            />
            {/* Tint wash that GROWS during expansion — starts transparent, ends in
                the theme's ember + bgColor palette. By the time this hits the album
                page, the art already wears the theme's palette as a halo. */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${theme.ember}55 0%, ${theme.bgColor}aa 100%)`,
                    mixBlendMode: isSleep ? 'screen' : 'multiply',
                    animation: 'dp-expand-tint 1200ms cubic-bezier(0.4, 0, 0.6, 1) forwards',
                }}
            />
        </div>
    );
}

// ============================================================================
// AboutOverlay — full-viewport modal with Welcome / Dreampeace / by Devin /
// video / description. Close returns to Moments.
// ============================================================================

function AboutOverlay({ isSleep, onClose }: { isSleep: boolean; onClose: () => void }) {
    const bodyInk = isSleep ? SLEEP_BODY : INK_BODY;
    const dimInk = isSleep ? SLEEP_DIM : INK_DIM;
    const heroInk = isSleep ? SLEEP_HERO : INK_HERO;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[70] overflow-y-auto"
            onClick={onClose}
            style={{
                background: isSleep ? 'rgba(10, 9, 8, 0.94)' : 'rgba(245, 240, 232, 0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                animation: 'dp-surface-field 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                opacity: 0,
            }}
        >
            {/* Close button — same chip style as the home glyph so it reads
                as a real affordance, not just a glyph that fades into the blur. */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="dp-home-chip absolute top-5 right-5 z-[75] flex items-center gap-2.5 focus:outline-none"
                style={{ cursor: 'pointer' }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-4 h-4">
                    <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
                <span
                    className="text-[10px] font-light uppercase whitespace-nowrap"
                    style={{ letterSpacing: '0.32em', opacity: 0.78 }}
                >
                    Close
                </span>
            </button>

            <div
                className="w-full max-w-2xl mx-auto px-6 py-20 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* "Welcome to" kicker */}
                <p
                    className="text-[10px] md:text-[11px] font-light tracking-[0.5em] uppercase mb-5"
                    style={{ color: dimInk }}
                >
                    Welcome to
                </p>

                {/* Hero wordmark — pretext-kerned */}
                <div className="mb-4 flex justify-center">
                    <DreamText
                        text="Dreampeace"
                        as="h1"
                        uppercase
                        tracking="0.22em"
                        color={heroInk}
                        vwScale={0.06}
                        minPx={40}
                        maxPx={72}
                        breathe
                        emergeMs={1400}
                        staggerMs={70}
                    />
                </div>

                <p
                    className="text-[11px] md:text-xs font-light tracking-[0.3em] italic mb-12"
                    style={{ fontFamily: 'Georgia, serif', color: dimInk }}
                >
                    by Devin Townsend
                </p>

                {/* Video */}
                <div
                    className="relative w-full aspect-video rounded-xl overflow-hidden mb-10"
                    style={{
                        boxShadow: isSleep
                            ? '0 10px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 240, 232, 0.05)'
                            : '0 10px 60px rgba(74, 66, 58, 0.10), 0 0 0 1px rgba(74, 66, 58, 0.06)',
                    }}
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}?rel=0&modestbranding=1`}
                        title="Welcome to the DreamPeace Channel"
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                {/* Description */}
                <div className="space-y-5 text-sm md:text-base font-light leading-relaxed text-left" style={{ color: bodyInk }}>
                    <p>
                        Dreampeace is a longstanding project of Devin Townsend&apos;s that he intends to keep producing
                        — music for sleeping, meditation, and relaxing. It is not meant to be focused on or directly
                        paid attention to. It is meant to be a sonic background to your day.
                    </p>
                    <p style={{ color: dimInk }}>
                        A longtime insomniac, Devin began writing this material to help himself sleep and calm anxious
                        minds. Each album is built using guitar and handmade tools — no generative AI — and each one
                        is a self-contained world: from the warm cocoon of <em>Tryptophan</em> to the cosmic expanse
                        of <em>Space Oyster</em>.
                    </p>
                </div>

                <p
                    className="text-[10px] md:text-[11px] font-light tracking-[0.4em] uppercase mt-12"
                    style={{ color: dimInk }}
                >
                    Music for anxious minds
                </p>
            </div>
        </div>
    );
}
