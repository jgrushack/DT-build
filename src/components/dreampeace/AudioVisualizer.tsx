'use client';

import { useEffect, useMemo, useRef } from 'react';
import { getEnergyBands } from '@/lib/audio-analyser';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { getActiveEmissions } from '@/lib/visualizer-bus';
import type { VisualizerTheme } from '@/lib/dreampeace-data';

interface AudioVisualizerProps {
    theme: VisualizerTheme;
    isActive: boolean;
    className?: string;
}

// FlowField engine — one unified ink-in-water dream, tuned per album via theme.
//
// Per frame: the previous frame is redrawn into the history buffer with a small
// warp (translate + rotate + scale) and a slight alpha decay. This creates
// self-similar advection: color drags itself forward through time like dye in
// water. Fresh color blobs are drawn on top each frame; their ghosts persist
// in the feedback. Audio modulates warp intensity, blob pulsation, and flow
// push. The DOM text emission bus can inject rasterized letters into the same
// buffer, so text dissolves into color as the word is replaced on screen.

function hexOrColorToRgb(c: string): { r: number; g: number; b: number } {
    if (c.startsWith('#')) {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return { r, g, b };
    }
    const m = c.match(/rgba?\(([^)]+)\)/i);
    if (m) {
        const parts = m[1].split(',').map((s) => parseFloat(s));
        return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 };
    }
    return { r: 200, g: 180, b: 160 };
}

function rgba(c: { r: number; g: number; b: number }, a: number): string {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

const SPRITE_SIZE = 256;

function bakeSprite(color: string): HTMLCanvasElement {
    const cnv = document.createElement('canvas');
    cnv.width = SPRITE_SIZE;
    cnv.height = SPRITE_SIZE;
    const ctx = cnv.getContext('2d')!;
    const c = hexOrColorToRgb(color);
    const g = ctx.createRadialGradient(
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2,
    );
    g.addColorStop(0, rgba(c, 1));
    g.addColorStop(0.35, rgba(c, 0.55));
    g.addColorStop(0.7, rgba(c, 0.12));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    return cnv;
}

export default function AudioVisualizer({ theme, isActive, className }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef(0);
    const lastFrameRef = useRef(0);
    const timeRef = useRef(0);
    const smoothedRef = useRef({ bass: 0, mids: 0, highs: 0 });

    const tier = useDeviceTier();

    // Pre-bake one sprite per palette color. Avoids per-frame createRadialGradient.
    // Guarded behind `document` because useMemo runs during SSR; the sprites
    // are only needed at paint time, so we lazily bake on first client render.
    const sprites = useMemo(
        () => (typeof document === 'undefined' ? [] : theme.colors.map(bakeSprite)),
        [theme.colors],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Two offscreen feedback buffers (device-pixel sized).
        const buffA = document.createElement('canvas');
        const buffB = document.createElement('canvas');
        const ctxA = buffA.getContext('2d')!;
        const ctxB = buffB.getContext('2d')!;

        let dpr = 1;
        let cssW = 0;
        let cssH = 0;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, tier.dprCap);
            const rect = canvas.getBoundingClientRect();
            cssW = rect.width;
            cssH = rect.height;
            const pxW = Math.max(1, Math.round(rect.width * dpr));
            const pxH = Math.max(1, Math.round(rect.height * dpr));
            canvas.width = pxW;
            canvas.height = pxH;
            buffA.width = pxW;
            buffA.height = pxH;
            buffB.width = pxW;
            buffB.height = pxH;
            // Buffers start transparent — tint accumulates from blobs and text
            // emissions. Multiplying a transparent buffer onto cream is a no-op,
            // so the first reveal frame shows pure cream (zero color delta).
        };

        resize();
        window.addEventListener('resize', resize);

        const frameBudget = 1000 / tier.targetFps;
        const motionScale = tier.reducedMotion ? 0.33 : 1;
        const scaledBlobCount = Math.max(1, Math.round(theme.blobCount * tier.particleScale));

        const tick = (now: number) => {
            if (now - lastFrameRef.current < frameBudget - 2) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            const dt = lastFrameRef.current === 0 ? 1 / 60 : Math.min(0.05, (now - lastFrameRef.current) / 1000);
            lastFrameRef.current = now;
            timeRef.current += dt;
            const t = timeRef.current;

            // Audio smoothing
            const energy = getEnergyBands() || { bass: 0, mids: 0, highs: 0 };
            const s = smoothedRef.current;
            const lerp = 0.08;
            s.bass  += (energy.bass  * theme.intensity * motionScale - s.bass)  * lerp;
            s.mids  += (energy.mids  * theme.intensity * motionScale - s.mids)  * lerp;
            s.highs += (energy.highs * theme.intensity * motionScale - s.highs) * lerp;

            const pxW = buffB.width;
            const pxH = buffB.height;
            const w = cssW;
            const h = cssH;
            const cx = w / 2;
            const cy = h / 2;

            // --- Step 1: feedback warp — B := warp(A) * decay ---
            // Working in device pixels; transform drawImage target in CSS space.
            ctxB.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctxB.globalCompositeOperation = 'copy';
            ctxB.globalAlpha = theme.feedbackDecay;

            const zoom = 1
                + theme.warpZoom * 0.004 * motionScale
                + s.bass * theme.pulseGain * 0.012;
            const rot = theme.warpCurl * 0.003 * motionScale
                + (s.mids - 0.2) * 0.0014 * motionScale;
            const tx = theme.flowAxisX * theme.flowSpeed * 1.4 * motionScale;
            const ty = theme.flowAxisY * theme.flowSpeed * 1.4 * motionScale;

            ctxB.translate(cx, cy);
            ctxB.rotate(rot);
            ctxB.scale(zoom, zoom);
            ctxB.translate(-cx + tx, -cy + ty);
            ctxB.drawImage(buffA, 0, 0, w, h);

            ctxB.globalAlpha = 1;
            ctxB.globalCompositeOperation = 'source-over';
            ctxB.setTransform(dpr, 0, 0, dpr, 0, 0);

            // --- Step 2: text emissions — stamp into the flow ---
            const emissions = getActiveEmissions(now);
            if (emissions.length > 0) {
                for (const e of emissions) {
                    const age = (now - e.createdAt) / e.durationMs;
                    if (age >= 1) continue;
                    // Fade profile: ghost in quickly, hold, then fade. Keeps text
                    // readable at the start of the dissolve, then lets feedback
                    // warp carry the ink away.
                    const alpha =
                        age < 0.08 ? age / 0.08 * 0.6 :
                        age < 0.35 ? 0.6 - (age - 0.08) * 0.3 :
                        Math.max(0, (1 - age) * 0.75);
                    // Subtle lift so letters begin to drift before the warp catches them
                    const lift = age * 6 * motionScale;
                    ctxB.globalAlpha = alpha;
                    ctxB.drawImage(e.source, e.x, e.y - lift, e.w, e.h);
                }
                ctxB.globalAlpha = 1;
            }

            // --- Step 3: color blobs — wander in slow Lissajous orbits ---
            const orbitR = Math.min(w, h) * theme.orbitRadius;
            const spriteSize = Math.min(w, h) * theme.blobScale * 0.9;
            ctxB.globalCompositeOperation = 'source-over';
            for (let i = 0; i < scaledBlobCount; i++) {
                const phase = i * 2.3;
                const ox = Math.sin(t * theme.orbitSpeed * (1 + i * 0.17) + phase) * orbitR;
                const oy = Math.cos(t * theme.orbitSpeed * (0.8 + i * 0.21) + phase * 1.4) * orbitR * 0.8;
                const breath = 1
                    + Math.sin(t * 0.4 + phase) * 0.12
                    + s.bass * theme.pulseGain * 0.7
                    + s.highs * 0.25;
                const size = spriteSize * breath;
                const x = cx + ox - size / 2;
                const y = cy + oy - size / 2;
                const alpha = 0.22 + s.mids * 0.18 + Math.sin(t * 0.6 + phase) * 0.05;
                ctxB.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctxB.drawImage(sprites[i % sprites.length], x, y, size, size);
            }
            ctxB.globalAlpha = 1;

            // --- Step 4: history update — A := B ---
            ctxA.setTransform(1, 0, 0, 1, 0, 0);
            ctxA.globalCompositeOperation = 'copy';
            ctxA.drawImage(buffB, 0, 0);
            ctxA.globalCompositeOperation = 'source-over';

            // --- Step 5: main canvas — cream substrate * multiply(B) ---
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = theme.bgColor;
            ctx.fillRect(0, 0, pxW, pxH);
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(buffB, 0, 0);
            ctx.globalCompositeOperation = 'source-over';

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
            lastFrameRef.current = 0;
        };
    }, [isActive, theme, sprites, tier]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
}
