'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HomeGlyphProps {
    // Where to go when dismissed. For /dreampeace/[albumId] → "/dreampeace".
    href: string;
    label?: string;
    idleDelayMs?: number;
}

// Home glyph — a tiny three-dot constellation in a glass chip. Inside a
// moment the user is absorbed; these three dots are the *other moments*
// still out there, breathing. On click the dots scatter apart and an ember
// bloom rises from the corner, reading as zooming out into the constellation.
// No arrow — the dots are the destination, and the label carries the intent.
export default function HomeGlyph({ href, label = 'Return', idleDelayMs = 3200 }: HomeGlyphProps) {
    const router = useRouter();
    const [idle, setIdle] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [exiting, setExiting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        router.prefetch(href);
    }, [href, router]);

    useEffect(() => {
        const reset = () => {
            setIdle(false);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIdle(true), idleDelayMs);
        };
        reset();
        window.addEventListener('pointermove', reset);
        window.addEventListener('touchstart', reset, { passive: true });
        window.addEventListener('keydown', reset);
        return () => {
            window.removeEventListener('pointermove', reset);
            window.removeEventListener('touchstart', reset);
            window.removeEventListener('keydown', reset);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [idleDelayMs]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (exiting) return;
        setExiting(true);
        setTimeout(() => router.push(href), 820);
    };

    const active = hovering || exiting;
    const opacity = exiting ? 1 : idle && !active ? 0.5 : 1;

    return (
        <>
            {exiting && (
                <div
                    className="fixed inset-0 z-[60] pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse at 40px 40px, var(--dp-ember, #7c5fc4) 0%, transparent 70%)',
                        opacity: 0,
                        animation: 'dp-glyph-bloom 820ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    }}
                />
            )}

            <button
                type="button"
                onClick={handleClick}
                onPointerEnter={() => setHovering(true)}
                onPointerLeave={() => setHovering(false)}
                onFocus={() => setHovering(true)}
                onBlur={() => setHovering(false)}
                aria-label={label}
                className="dp-home-chip fixed top-5 left-5 z-[70] flex items-center gap-3 focus:outline-none"
                style={{
                    opacity,
                    transition: 'opacity 900ms cubic-bezier(0.4, 0, 0.6, 1), background 400ms',
                    cursor: 'pointer',
                }}
            >
                {/* The constellation — three breathing dots. Staggered phase
                    so they never pulse in unison. On exit they scatter. */}
                <span
                    aria-hidden
                    className="dp-constellation"
                    data-active={active ? 'true' : 'false'}
                    data-exiting={exiting ? 'true' : 'false'}
                >
                    <span className="dp-constellation-dot dp-constellation-dot--a" />
                    <span className="dp-constellation-dot dp-constellation-dot--b" />
                    <span className="dp-constellation-dot dp-constellation-dot--c" />
                </span>

                {/* Label — always readable, tightens at rest, opens on active. */}
                <span
                    aria-hidden
                    className="text-[10px] font-light uppercase whitespace-nowrap"
                    style={{
                        letterSpacing: active ? '0.38em' : '0.32em',
                        color: 'currentColor',
                        transition: 'letter-spacing 500ms, opacity 400ms',
                        opacity: exiting ? 0 : 0.78,
                    }}
                >
                    {label}
                </span>
            </button>
        </>
    );
}
