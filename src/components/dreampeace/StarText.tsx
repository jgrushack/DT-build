'use client';

import { useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { pushEmission, rasterizeTextElement } from '@/lib/visualizer-bus';

interface StarTextProps {
    children: string;
    className?: string;
    // 'emerge' fades letters in with stagger on mount.
    // 'breathe' also applies the slow breath loop AFTER emerge fully completes.
    // 'dissolve' fades letters out with drift when `visible={false}`.
    mode?: 'emerge' | 'breathe' | 'dissolve';
    visible?: boolean;      // default true. Set false to trigger dissolve (when mode='dissolve')
    staggerMs?: number;     // per-letter delay (default 45 — slower = more like script appearing)
    delayMs?: number;       // base delay before first letter (default 0)
    as?: keyof React.JSX.IntrinsicElements;
    // When true, on unmount or when `visible` flips false in dissolve mode, the
    // component rasterizes its current rendered text into the visualizer's
    // feedback buffer. The DOM letters fade via CSS; the canvas mirror is
    // caught by the warp and smeared into the color flow.
    dissolveToFlow?: boolean;
}

const EMERGE_DURATION = 2200;
const DISSOLVE_DURATION = 1800;

function emitFromHost(host: HTMLElement): void {
    const snap = rasterizeTextElement(host);
    if (!snap) return;
    pushEmission({
        source: snap.canvas,
        x: snap.x,
        y: snap.y,
        w: snap.w,
        h: snap.h,
        durationMs: DISSOLVE_DURATION + 600,
    });
}

// Text treated as a star: letters emerge from blur/mist individually with a
// staggered delay, then (optionally) share the slow breath of the dream.
// On unmount they ripple apart and drift away.
//
// Why per-letter: a whole-word fade feels like a UI transition.
// A letter-staggered emerge feels like dream-script resolving on paper.
export default function StarText({
    children,
    className = '',
    mode = 'emerge',
    visible = true,
    staggerMs = 45,
    delayMs = 0,
    as = 'span',
    dissolveToFlow = false,
}: StarTextProps) {
    const hostRef = useRef<HTMLElement | null>(null);
    // Derived: no state needed. When dissolve-mode + not-visible, the dissolved
    // branch renders the fade-out animation directly.
    const dissolved = mode === 'dissolve' && !visible;

    // When dissolved flips on, emit a canvas mirror so the visualizer catches
    // the letters as the DOM fades. Fires exactly once per flip.
    useEffect(() => {
        if (dissolved && dissolveToFlow && hostRef.current) {
            emitFromHost(hostRef.current);
        }
    }, [dissolved, dissolveToFlow]);

    // On unmount (e.g. keyed remount when track changes), emit a mirror so the
    // outgoing word dissolves into the flow. useLayoutEffect cleanup runs before
    // React removes the DOM node, so getBoundingClientRect still returns a real rect.
    useLayoutEffect(() => {
        const el = hostRef.current;
        return () => {
            if (dissolveToFlow && el) emitFromHost(el);
        };
    }, [dissolveToFlow]);

    const letters = useMemo(() => children.split(''), [children]);

    // Per-letter horizontal drift for dissolve — deterministic from index so SSR matches
    const letterDrift = (i: number) => {
        const n = Math.sin(i * 12.9898) * 43758.5453;
        return Math.round((n - Math.floor(n)) * 40 - 20);
    };

    const Tag = as as React.ElementType;

    // For breath mode, wait until EVERY letter has fully emerged before starting
    // the breath loop — avoids collision between the two animations, which would
    // otherwise cause a visible opacity hitch at ~900ms of the emerge phase.
    const breathStartMs = delayMs + letters.length * staggerMs + EMERGE_DURATION;

    return (
        <Tag
            ref={hostRef as React.Ref<HTMLElement>}
            className={className}
            style={{ display: 'inline-block' }}
            aria-label={children}
        >
            {letters.map((ch, i) => {
                const isSpace = ch === ' ';
                if (isSpace) return <span key={i}>&nbsp;</span>;

                const letterDelay = delayMs + i * staggerMs;

                const style: React.CSSProperties = {
                    display: 'inline-block',
                    '--dp-drift': `${letterDrift(i)}px`,
                } as React.CSSProperties;

                if (dissolved) {
                    style.animation = `dp-star-dissolve ${DISSOLVE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`;
                    // Per-letter stagger on dissolve too — scatter feels more organic
                    style.animationDelay = `${i * 20}ms`;
                } else if (mode === 'breathe') {
                    // Two animations chained cleanly: emerge first (staggered), then
                    // breath loop starts after ALL emerges complete. The breath uses
                    // the same delay for every letter so the word breathes as a whole.
                    style.animation = [
                        `dp-star-emerge ${EMERGE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) ${letterDelay}ms forwards`,
                        `dp-breathe 6s cubic-bezier(0.4, 0, 0.6, 1) ${breathStartMs}ms infinite`,
                    ].join(', ');
                } else {
                    style.animation = `dp-star-emerge ${EMERGE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) ${letterDelay}ms forwards`;
                }

                return (
                    <span key={i} style={style} aria-hidden="true">
                        {ch}
                    </span>
                );
            })}
        </Tag>
    );
}
