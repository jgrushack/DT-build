'use client';

/**
 * ReactiveText — text rendered through @chenglou/pretext's measurement pipeline
 * so each word can be absolutely positioned and animated per-frame without
 * triggering DOM reflow.
 *
 * Renders a plain-text fallback during SSR and before fonts settle, then swaps
 * to per-word spans on hydrate. aria-label on the container preserves screen
 * reader access; per-word spans are aria-hidden.
 *
 * The `signal` prop drives per-word translate/opacity each frame. Default is a
 * slow sine breath with a per-word phase offset. Pass your own to wire in the
 * Dreampeace audio analyser, pointer, scroll, etc.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext';

export type WordSignal = (
    wordIndex: number,
    phaseMs: number,
    totalWords: number,
) => {
    x?: number;
    y?: number;
    opacity?: number;
    scale?: number;
};

type Props = {
    text: string;
    /** CSS font shorthand, e.g. `600 56px "Geist", sans-serif`. */
    font: string;
    /** Optional className applied to the container. */
    className?: string;
    /** Inline styles for the container (e.g. letterSpacing). */
    style?: React.CSSProperties;
    /** Per-word signal driving translate/opacity/scale each frame. */
    signal?: WordSignal;
    /** External opacity gate (0..1). Multiplies per-word signal opacity. */
    opacity?: number;
    /**
     * If set, each word renders with this CSS `background-image` clipped to
     * the text (enables gradient wordmarks).
     */
    gradientBg?: string;
    /** Container tag. Defaults to `span`. */
    as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
};

const defaultSignal: WordSignal = (i, t) => {
    const phase = t / 1000 + i * 0.35;
    const breath = Math.sin(phase * 0.35 * 2 * Math.PI);
    return {
        y: breath * 1.4,
        opacity: 0.92 + 0.08 * ((breath + 1) / 2),
    };
};

export default function ReactiveText({
    text,
    font,
    className,
    style,
    signal = defaultSignal,
    opacity: externalOpacity = 1,
    gradientBg,
    as: Tag = 'span',
}: Props) {
    const [measured, setMeasured] = useState<
        Array<{ word: string; x: number; width: number }> | null
    >(null);
    const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (typeof document !== 'undefined' && 'fonts' in document) {
                try {
                    await document.fonts.ready;
                } catch {
                    /* Font Loading API unavailable — proceed with current metrics */
                }
            }
            if (cancelled) return;

            const words = text.split(/\s+/).filter(Boolean);
            if (words.length === 0) {
                setMeasured([]);
                return;
            }

            const spaceWidth = measureNaturalWidth(prepareWithSegments(' ', font));

            let x = 0;
            const result = words.map((word, i) => {
                const width = measureNaturalWidth(prepareWithSegments(word, font));
                const entry = { word, x, width };
                x += width + (i < words.length - 1 ? spaceWidth : 0);
                return entry;
            });

            if (!cancelled) setMeasured(result);
        })();

        return () => {
            cancelled = true;
        };
    }, [text, font]);

    useEffect(() => {
        if (!measured) return;

        let rafId = 0;
        const start = performance.now();

        const tick = () => {
            const phaseMs = performance.now() - start;
            for (let i = 0; i < wordRefs.current.length; i++) {
                const el = wordRefs.current[i];
                if (!el) continue;
                const s = signal(i, phaseMs, wordRefs.current.length);
                const x = s.x ?? 0;
                const y = s.y ?? 0;
                const scale = s.scale ?? 1;
                const o = (s.opacity ?? 1) * externalOpacity;
                el.style.transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) scale(${scale})`;
                el.style.opacity = o.toFixed(3);
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [measured, signal, externalOpacity]);

    const totalWidth = useMemo(() => {
        if (!measured || measured.length === 0) return 0;
        const last = measured[measured.length - 1];
        return last.x + last.width;
    }, [measured]);

    const containerStyle: React.CSSProperties = {
        font,
        opacity: externalOpacity,
        ...style,
    };

    const gradientStyle: React.CSSProperties | undefined = gradientBg
        ? {
                backgroundImage: gradientBg,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
          }
        : undefined;

    if (!measured) {
        return (
            <Tag className={className} style={{ ...containerStyle, ...(gradientStyle ?? {}) }} aria-label={text}>
                {text}
            </Tag>
        );
    }

    return (
        <Tag
            className={className}
            style={{
                ...containerStyle,
                display: 'inline-block',
                position: 'relative',
                width: totalWidth,
                lineHeight: 1,
            }}
            aria-label={text}
        >
            {measured.map((w, i) => (
                <span
                    key={`${w.word}-${i}`}
                    ref={(el) => {
                        wordRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: w.x,
                        top: 0,
                        whiteSpace: 'pre',
                        willChange: 'transform, opacity',
                        ...(gradientStyle ?? {}),
                    }}
                >
                    {w.word}
                </span>
            ))}
        </Tag>
    );
}
