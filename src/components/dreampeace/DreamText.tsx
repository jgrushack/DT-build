'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { pushEmission, rasterizeTextElement } from '@/lib/visualizer-bus';

// Shared offscreen measurement canvas — pretext's prepareWithSegments was
// dropping trailing whitespace from prefix measurements, so "Sky Gods" rendered
// as "SKYG ODS" (space collapsed between letters 3 and 4, shoving G left).
// Direct ctx.measureText preserves space advance exactly and still honors the
// browser's kerning engine, which is what we actually wanted pretext for.
let _measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D | null {
    if (_measureCtx) return _measureCtx;
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas').getContext('2d');
    if (!c) return null;
    _measureCtx = c;
    return c;
}

/**
 * DreamText — pretext-kerned letter-positioned text.
 *
 * Why this exists: StarText splits text into inline-block per-letter spans so
 * each letter can breathe/emerge individually. But inline-blocks break kerning
 * pairs (AV, re, ea) — the browser stops treating them as adjacent characters.
 * That's the "kerning looks off" problem on the hero wordmark.
 *
 * DreamText fixes it by using pretext (browser's canvas font engine as ground
 * truth) to measure letter-prefix widths. Letter i's left edge is the measured
 * width of text[0..i], so adjacent letters sit at their properly kerned x. Each
 * letter is then absolutely positioned at its real kerned x and animated via
 * transform only — layout is stable, kerning is preserved, animation is cheap.
 *
 * Font must be a valid canvas ctx.font string — no clamp(), no CSS vars.
 * Per pretext docs: system-ui is unsafe on macOS — use a named font (Georgia).
 */

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// URW Avernus is the Dreampeace / site-wide display typeface.
// Matches the landing-card wordmark (see LoginCard.tsx → WORDMARK_FONT).
// Pretext requires a named font (system-ui is unsafe on macOS per its docs).
const DEFAULT_FONT_FAMILY = '"Avernus URW", system-ui, -apple-system, sans-serif';

interface DreamTextProps {
    text: string;
    fontFamily?: string;
    fontWeight?: number | string;
    /**
     * Font size in px. If omitted, computed from viewport with the vwScale
     * (so "6vw" → 6% of window.innerWidth, clamped to [minPx, maxPx]).
     */
    sizePx?: number;
    vwScale?: number;
    minPx?: number;
    maxPx?: number;
    /** Uppercase + letter-tracking tuning applied via CSS letterSpacing. */
    tracking?: string;
    uppercase?: boolean;
    color?: string;
    /** 0..1 multiplier on the container opacity (external visualizer signal). */
    opacity?: number;
    /** If true, each letter breathes on a staggered sine (subtle y + opacity pulse). */
    breathe?: boolean;
    /** Total duration of the per-letter stagger emerge on mount, ms. */
    emergeMs?: number;
    /** Per-letter stagger between emerges, ms. */
    staggerMs?: number;
    className?: string;
    style?: React.CSSProperties;
    as?: keyof React.JSX.IntrinsicElements;
    /** On unmount, rasterize the current rendered text into the visualizer feedback buffer. */
    dissolveToFlow?: boolean;
}

export default function DreamText({
    text,
    fontFamily = DEFAULT_FONT_FAMILY,
    fontWeight = 300,
    sizePx,
    vwScale = 0.06,
    minPx = 36,
    maxPx = 88,
    tracking = '0',
    uppercase = false,
    color = 'currentColor',
    opacity = 1,
    breathe = true,
    emergeMs = 1400,
    staggerMs = 60,
    className,
    style,
    as = 'span',
    dissolveToFlow = false,
}: DreamTextProps) {
    const [measured, setMeasured] = useState<{ xs: number[]; total: number; sizePx: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const emergeStartRef = useRef<number>(0);
    const hostRef = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        const el = hostRef.current;
        return () => {
            if (!dissolveToFlow || !el) return;
            const snap = rasterizeTextElement(el);
            if (!snap) return;
            pushEmission({
                source: snap.canvas,
                x: snap.x,
                y: snap.y,
                w: snap.w,
                h: snap.h,
                durationMs: 2400,
            });
        };
    }, [dissolveToFlow]);

    // The text we actually measure/display (uppercase vs raw)
    const displayText = uppercase ? text.toUpperCase() : text;

    // Font size: SSR renders with an SSR-safe fallback so initial client render
    // matches the server (no hydration mismatch). The real viewport-derived
    // size is computed inside the measurement effect and stored on `measured`.
    const ssrFallbackPx = sizePx ?? Math.max(minPx, Math.min(maxPx, minPx + 16));
    const computeSize = () => {
        if (sizePx != null) return sizePx;
        if (typeof window === 'undefined') return ssrFallbackPx;
        const target = window.innerWidth * vwScale;
        return Math.max(minPx, Math.min(maxPx, Math.round(target)));
    };

    // Measure letter-prefix widths with pretext, giving each letter a kerning-correct x.
    useIsoLayoutEffect(() => {
        let cancelled = false;

        const measure = async () => {
            if (typeof document !== 'undefined' && 'fonts' in document) {
                try {
                    await document.fonts.ready;
                } catch {
                    /* no-op */
                }
            }
            if (cancelled) return;

            const px = computeSize();
            const fontStr = `${fontWeight} ${px}px ${fontFamily}`;

            const mctx = getMeasureCtx();
            if (!mctx) return;
            mctx.font = fontStr;
            // xs[i] = left edge of letter i. xs[n] = total width of full string.
            // ctx.measureText respects kerning AND keeps trailing-space advance,
            // so multi-word titles like "Sky Gods" align correctly.
            const xs: number[] = [0];
            for (let i = 1; i <= displayText.length; i++) {
                xs.push(mctx.measureText(displayText.slice(0, i)).width);
            }
            const total = xs[xs.length - 1];

            if (!cancelled) {
                setMeasured({ xs, total, sizePx: px });
                if (!mounted) {
                    emergeStartRef.current = performance.now();
                    setMounted(true);
                }
            }
        };

        void measure();

        // Remeasure on window resize (rerun prepare because font size changes).
        if (sizePx == null && typeof window !== 'undefined') {
            let resizeTimer: ReturnType<typeof setTimeout> | null = null;
            const onResize = () => {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => void measure(), 120);
            };
            window.addEventListener('resize', onResize);
            return () => {
                cancelled = true;
                window.removeEventListener('resize', onResize);
                if (resizeTimer) clearTimeout(resizeTimer);
            };
        }

        return () => {
            cancelled = true;
        };
    }, [displayText, fontFamily, fontWeight, sizePx, vwScale, minPx, maxPx]);

    // Per-letter breath via RAF — updates transform/opacity directly on the DOM
    // nodes, never triggers re-render. Only fires if `breathe` is true.
    useEffect(() => {
        if (!breathe || !measured || !mounted) return;
        let rafId = 0;
        const start = emergeStartRef.current || performance.now();

        const tick = () => {
            const phaseMs = performance.now() - start;
            const n = letterRefs.current.length;

            for (let i = 0; i < n; i++) {
                const el = letterRefs.current[i];
                if (!el) continue;

                // Emerge phase — fades in per-letter with stagger
                const letterStart = i * staggerMs;
                const emergeT = Math.max(0, Math.min(1, (phaseMs - letterStart) / emergeMs));
                const emergeEase = 1 - Math.pow(1 - emergeT, 3); // ease-out-cubic
                const emergeOpacity = emergeEase;
                const emergeY = (1 - emergeEase) * 10;
                const emergeBlur = (1 - emergeEase) * 18;

                // Breath phase — subtle sine after emerge completes
                let breathY = 0;
                let breathOpacity = 1;
                if (emergeT >= 1) {
                    const phase = phaseMs / 1000 + i * 0.28;
                    const s = Math.sin(phase * 0.35 * 2 * Math.PI);
                    breathY = s * 0.8;
                    breathOpacity = 0.94 + 0.06 * ((s + 1) / 2);
                }

                const y = emergeY + breathY;
                const o = emergeOpacity * breathOpacity;

                el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
                el.style.opacity = o.toFixed(3);
                if (emergeBlur > 0.1) {
                    el.style.filter = `blur(${emergeBlur.toFixed(2)}px)`;
                } else if (el.style.filter) {
                    el.style.filter = '';
                }
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [breathe, measured, mounted, emergeMs, staggerMs]);

    const Tag = as as React.ElementType;

    // Fallback while measuring — plain text with correct font + color so SSR
    // and the unmeasured first-paint don't look broken.
    if (!measured) {
        return (
            <Tag
                ref={hostRef as React.Ref<HTMLElement>}
                className={className}
                style={{
                    fontFamily,
                    fontWeight,
                    // SSR-safe constant — no window access during render. The
                    // measurement effect will rerender with the real viewport-
                    // derived size via the `measured` branch below.
                    fontSize: `${ssrFallbackPx}px`,
                    letterSpacing: tracking,
                    textTransform: uppercase ? 'uppercase' : undefined,
                    color,
                    opacity: 0, // hold invisible until measured; emerge will take over
                    ...style,
                }}
                aria-label={text}
            >
                {displayText}
            </Tag>
        );
    }

    return (
        <Tag
            ref={hostRef as React.Ref<HTMLElement>}
            className={className}
            style={{
                display: 'inline-block',
                position: 'relative',
                width: measured.total,
                height: measured.sizePx * 1.2,
                fontFamily,
                fontWeight,
                fontSize: `${measured.sizePx}px`,
                letterSpacing: tracking,
                textTransform: uppercase ? 'uppercase' : undefined,
                color,
                opacity,
                lineHeight: 1,
                ...style,
            }}
            aria-label={text}
        >
            {displayText.split('').map((ch, i) => {
                const x = measured.xs[i];
                const w = measured.xs[i + 1] - measured.xs[i];
                return (
                    <span
                        key={i}
                        ref={(el) => {
                            letterRefs.current[i] = el;
                        }}
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: x,
                            top: 0,
                            width: w,
                            whiteSpace: 'pre',
                            willChange: 'transform, opacity, filter',
                            // Start invisible — breath RAF takes over on next tick
                            opacity: 0,
                        }}
                    >
                        {ch === ' ' ? '\u00A0' : ch}
                    </span>
                );
            })}
        </Tag>
    );
}
