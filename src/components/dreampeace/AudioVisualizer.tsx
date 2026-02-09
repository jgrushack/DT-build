'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getEnergyBands, isAnalyserReady } from '@/lib/audio-analyser';
import type { VisualizerTheme } from '@/lib/dreampeace-data';

interface AudioVisualizerProps {
    theme: VisualizerTheme;
    isActive: boolean;
    className?: string;
}

// Particle for various effects
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
    colorIndex: number;
}

// Smoothed energy values for fluid animation
interface SmoothedEnergy {
    bass: number;
    mids: number;
    highs: number;
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AudioVisualizer({ theme, isActive, className }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const smoothedRef = useRef<SmoothedEnergy>({ bass: 0, mids: 0, highs: 0 });
    const timeRef = useRef(0);
    const prevThemeRef = useRef(theme.drawStyle);

    // Initialize particles when theme changes
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        const count = theme.particleCount;
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(width, height, theme));
        }
        particlesRef.current = particles;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle resize
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            initParticles(rect.width, rect.height);
        };

        resize();
        window.addEventListener('resize', resize);

        // Reset particles on theme change
        if (prevThemeRef.current !== theme.drawStyle) {
            prevThemeRef.current = theme.drawStyle;
            const rect = canvas.getBoundingClientRect();
            initParticles(rect.width, rect.height);
        }

        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;

            // Get audio energy or use idle values
            const energy = getEnergyBands();
            const target = energy || { bass: 0, mids: 0, highs: 0 };
            const s = smoothedRef.current;
            const lerpSpeed = 0.08;
            s.bass = lerp(s.bass, target.bass * theme.intensity, lerpSpeed);
            s.mids = lerp(s.mids, target.mids * theme.intensity, lerpSpeed);
            s.highs = lerp(s.highs, target.highs * theme.intensity, lerpSpeed);

            timeRef.current += 0.016; // ~60fps

            // Clear
            ctx.fillStyle = theme.bgColor;
            ctx.fillRect(0, 0, w, h);

            // Draw based on theme
            switch (theme.drawStyle) {
                case 'warm-pulse':
                    drawWarmPulse(ctx, w, h, s, theme, timeRef.current);
                    break;
                case 'aurora-sweep':
                    drawAuroraSweep(ctx, w, h, s, theme, timeRef.current);
                    break;
                case 'sunrise-rays':
                    drawSunriseRays(ctx, w, h, s, theme, timeRef.current);
                    break;
                case 'nebula-field':
                    drawNebulaField(ctx, w, h, s, theme, timeRef.current, particlesRef.current);
                    break;
                case 'falling-snow':
                    drawFallingSnow(ctx, w, h, s, theme, timeRef.current, particlesRef.current);
                    break;
                case 'rising-bubbles':
                    drawRisingBubbles(ctx, w, h, s, theme, timeRef.current, particlesRef.current);
                    break;
                case 'water-ripples':
                    drawWaterRipples(ctx, w, h, s, theme, timeRef.current);
                    break;
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        animFrameRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [isActive, theme, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
}

// ============================================================================
// Particle Factory
// ============================================================================

function createParticle(w: number, h: number, theme: VisualizerTheme): Particle {
    switch (theme.drawStyle) {
        case 'falling-snow':
            return {
                x: Math.random() * w,
                y: Math.random() * h - h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: 0.3 + Math.random() * 0.8,
                size: 1 + Math.random() * 3,
                opacity: 0.3 + Math.random() * 0.5,
                life: 0,
                maxLife: 1000,
                colorIndex: Math.floor(Math.random() * theme.colors.length),
            };
        case 'rising-bubbles':
            return {
                x: Math.random() * w,
                y: h + Math.random() * 100,
                vx: (Math.random() - 0.5) * 0.2,
                vy: -(0.5 + Math.random() * 1.2),
                size: 3 + Math.random() * 8,
                opacity: 0.15 + Math.random() * 0.35,
                life: 0,
                maxLife: 500,
                colorIndex: Math.floor(Math.random() * theme.colors.length),
            };
        case 'nebula-field':
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                size: 0.5 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7,
                life: 0,
                maxLife: 2000,
                colorIndex: Math.floor(Math.random() * theme.colors.length),
            };
        default:
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: 0,
                vy: 0,
                size: 2,
                opacity: 0.5,
                life: 0,
                maxLife: 500,
                colorIndex: 0,
            };
    }
}

// ============================================================================
// THEME 1: Warm Pulse (Tryptophan)
// Soft concentric rings that breathe in/out with bass
// ============================================================================

function drawWarmPulse(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number
) {
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.15;
    const breathe = Math.sin(time * 0.5) * 0.05; // Idle breathing

    const ringCount = 6;
    for (let i = ringCount; i >= 0; i--) {
        const t = i / ringCount;
        const audioScale = 1 + energy.bass * 0.6 + energy.mids * 0.3 * Math.sin(time + i);
        const radius = baseRadius * (1 + t * 1.5) * audioScale + breathe * baseRadius;
        const alpha = (1 - t) * 0.25 + energy.mids * 0.15;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(theme.colors[i % theme.colors.length], alpha);
        ctx.lineWidth = 2 + energy.bass * 4;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 20 + energy.bass * 30;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Central glow orb
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.8);
    gradient.addColorStop(0, hexToRgba(theme.colors[0], 0.15 + energy.bass * 0.2));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
}

// ============================================================================
// THEME 2: Aurora Sweep (Sky Gods)
// Horizontal flowing wave bands
// ============================================================================

function drawAuroraSweep(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number
) {
    const bandCount = 5;

    for (let band = 0; band < bandCount; band++) {
        const yBase = h * (0.25 + band * 0.12);
        const amplitude = 30 + energy.mids * 80 + energy.bass * 40;
        const color = theme.colors[band % theme.colors.length];
        const alpha = 0.12 + energy.mids * 0.15;

        ctx.beginPath();
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= w; x += 4) {
            const wave1 = Math.sin((x / w) * 4 + time * 0.3 + band * 1.2) * amplitude;
            const wave2 = Math.sin((x / w) * 7 + time * 0.5 + band * 0.8) * amplitude * 0.4;
            const wave3 = Math.sin((x / w) * 2 + time * 0.15) * amplitude * 0.6;
            ctx.lineTo(x, yBase + wave1 + wave2 + wave3);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, yBase - amplitude, 0, h);
        gradient.addColorStop(0, hexToRgba(color, alpha));
        gradient.addColorStop(0.5, hexToRgba(color, alpha * 0.3));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Top glow
    const topGlow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.5);
    topGlow.addColorStop(0, hexToRgba(theme.colors[2], 0.08 + energy.highs * 0.1));
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h);
}

// ============================================================================
// THEME 3: Sunrise Rays (Dawn Shifter)
// Radial light rays from a central horizon point
// ============================================================================

function drawSunriseRays(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number
) {
    const cx = w / 2;
    const cy = h * 0.65; // Horizon point slightly below center
    const rayCount = 24;

    // Sun glow
    const sunRadius = 40 + energy.bass * 60;
    const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * 3);
    sunGlow.addColorStop(0, hexToRgba(theme.colors[1], 0.3 + energy.bass * 0.2));
    sunGlow.addColorStop(0.3, hexToRgba(theme.colors[0], 0.15));
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);

    // Light rays
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.02;
        const length = Math.max(w, h) * (0.5 + energy.mids * 0.5 + Math.sin(time * 0.3 + i * 0.5) * 0.15);
        const width = 0.04 + energy.highs * 0.03 + Math.sin(time * 0.2 + i) * 0.01;
        const color = theme.colors[i % theme.colors.length];
        const alpha = 0.04 + energy.bass * 0.06;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle - width) * length,
            cy + Math.sin(angle - width) * length
        );
        ctx.lineTo(
            cx + Math.cos(angle + width) * length,
            cy + Math.sin(angle + width) * length
        );
        ctx.closePath();
        ctx.fillStyle = hexToRgba(color, alpha);
        ctx.fill();
    }

    // Horizon line glow
    const horizonGlow = ctx.createLinearGradient(0, cy - 20, 0, cy + 40);
    horizonGlow.addColorStop(0, 'transparent');
    horizonGlow.addColorStop(0.5, hexToRgba(theme.colors[0], 0.15 + energy.mids * 0.1));
    horizonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, cy - 20, w, 60);
}

// ============================================================================
// THEME 4: Nebula Field (Space Oyster)
// Star particles + glowing central orb
// ============================================================================

function drawNebulaField(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number,
    particles: Particle[]
) {
    const cx = w / 2;
    const cy = h / 2;

    // Central orb
    const orbRadius = 30 + energy.bass * 50;
    const orbGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 3);
    orbGlow.addColorStop(0, hexToRgba(theme.colors[2], 0.3 + energy.bass * 0.3));
    orbGlow.addColorStop(0.3, hexToRgba(theme.colors[1], 0.15));
    orbGlow.addColorStop(0.6, hexToRgba(theme.colors[0], 0.05));
    orbGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGlow;
    ctx.fillRect(0, 0, w, h);

    // Nebula clouds
    for (let i = 0; i < 3; i++) {
        const nx = cx + Math.sin(time * 0.1 + i * 2) * w * 0.2;
        const ny = cy + Math.cos(time * 0.08 + i * 1.5) * h * 0.15;
        const nr = 80 + energy.mids * 60;
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        nGlow.addColorStop(0, hexToRgba(theme.colors[i % theme.colors.length], 0.06 + energy.mids * 0.05));
        nGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow;
        ctx.fillRect(0, 0, w, h);
    }

    // Star particles
    for (const p of particles) {
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.05;
        p.y += p.vy + Math.cos(time + p.x * 0.01) * 0.05;
        p.life++;

        // Twinkle
        const twinkle = 0.5 + Math.sin(time * 2 + p.x + p.y) * 0.5;
        const size = p.size * (1 + energy.highs * 2) * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(theme.colors[p.colorIndex], p.opacity * twinkle);
        ctx.fill();

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
    }
}

// ============================================================================
// THEME 5: Falling Snow (Snow Day)
// Gentle snowflake particles + crystalline geometric shapes
// ============================================================================

function drawFallingSnow(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number,
    particles: Particle[]
) {
    // Ambient top glow
    const topGlow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.6);
    topGlow.addColorStop(0, hexToRgba(theme.colors[1], 0.08 + energy.mids * 0.06));
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h);

    // Crystalline hexagons (frequency-reactive)
    const hexCount = 3;
    for (let i = 0; i < hexCount; i++) {
        const hx = w * (0.3 + i * 0.2) + Math.sin(time * 0.2 + i) * 30;
        const hy = h * 0.5 + Math.cos(time * 0.15 + i) * 40;
        const hSize = 20 + energy.bass * 60 + Math.sin(time * 0.3 + i * 2) * 10;
        const hAlpha = 0.05 + energy.bass * 0.1;

        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2 - Math.PI / 6 + time * 0.02;
            const px = hx + Math.cos(angle) * hSize;
            const py = hy + Math.sin(angle) * hSize;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = hexToRgba(theme.colors[i % theme.colors.length], hAlpha);
        ctx.lineWidth = 1;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Snow particles
    for (const p of particles) {
        const windX = Math.sin(time * 0.5 + p.y * 0.005) * 0.5;
        p.x += p.vx + windX + energy.highs * (Math.random() - 0.5) * 0.5;
        p.y += p.vy + energy.bass * 0.3;
        p.life++;

        const drift = Math.sin(time + p.x * 0.01) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x + drift, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(theme.colors[p.colorIndex], p.opacity);
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reset at bottom
        if (p.y > h + 10) {
            p.y = -10;
            p.x = Math.random() * w;
        }
    }
}

// ============================================================================
// THEME 6: Rising Bubbles (Beautiful Day)
// Luminous orbs floating upward + expanding rings
// ============================================================================

function drawRisingBubbles(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number,
    particles: Particle[]
) {
    const cx = w / 2;
    const cy = h / 2;

    // Central expanding rings
    const ringCount = 4;
    for (let i = 0; i < ringCount; i++) {
        const phase = (time * 0.3 + i * 0.8) % 3;
        const radius = phase * Math.min(w, h) * 0.2 + energy.bass * 30;
        const alpha = Math.max(0, 0.15 - phase * 0.05);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(theme.colors[i % theme.colors.length], alpha);
        ctx.lineWidth = 2;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Rising bubble particles
    for (const p of particles) {
        p.x += p.vx + Math.sin(time + p.x * 0.01) * 0.3;
        p.y += p.vy - energy.bass * 0.5;
        p.life++;

        const shimmer = 0.7 + Math.sin(time * 3 + p.x) * 0.3;
        const bGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        bGlow.addColorStop(0, hexToRgba(theme.colors[p.colorIndex], p.opacity * shimmer));
        bGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bGlow;
        ctx.fillRect(p.x - p.size * 2, p.y - p.size * 2, p.size * 4, p.size * 4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(theme.colors[p.colorIndex], p.opacity * shimmer * 0.6);
        ctx.fill();

        // Reset at top
        if (p.y < -20) {
            p.y = h + 20;
            p.x = Math.random() * w;
            p.size = 3 + Math.random() * 8;
        }
    }

    // Warm center glow
    const warmGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.3);
    warmGlow.addColorStop(0, hexToRgba(theme.colors[0], 0.06 + energy.bass * 0.08));
    warmGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, w, h);
}

// ============================================================================
// THEME 7: Water Ripples (Pond Skimmer)
// Concentric ripple rings expanding outward
// ============================================================================

function drawWaterRipples(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    energy: SmoothedEnergy, theme: VisualizerTheme, time: number
) {
    const cx = w / 2;
    const cy = h / 2;

    // Ripple rings
    const rippleCount = 8;
    for (let i = 0; i < rippleCount; i++) {
        const phase = (time * 0.2 + i * 0.5) % 4;
        const maxRadius = Math.min(w, h) * 0.45;
        const radius = phase * maxRadius * 0.25 + energy.bass * 20;
        const alpha = Math.max(0, 0.2 - phase * 0.05) + energy.mids * 0.05;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(theme.colors[i % theme.colors.length], alpha);
        ctx.lineWidth = 1.5 + energy.bass * 2;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Surface shimmer (horizontal wavy lines)
    const lineCount = 6;
    for (let i = 0; i < lineCount; i++) {
        const yBase = h * (0.3 + i * 0.08);
        const amplitude = 5 + energy.mids * 15;

        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 6) {
            const wave = Math.sin((x / w) * 8 + time * 0.4 + i * 1.5) * amplitude;
            ctx.lineTo(x, yBase + wave);
        }
        ctx.strokeStyle = hexToRgba(theme.colors[i % theme.colors.length], 0.06 + energy.mids * 0.04);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Central still point glow
    const stillGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + energy.bass * 30);
    stillGlow.addColorStop(0, hexToRgba(theme.colors[3], 0.15 + energy.bass * 0.1));
    stillGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = stillGlow;
    ctx.fillRect(0, 0, w, h);

    // Reflection shimmer
    const reflGlow = ctx.createLinearGradient(0, h * 0.6, 0, h);
    reflGlow.addColorStop(0, 'transparent');
    reflGlow.addColorStop(0.5, hexToRgba(theme.colors[0], 0.04 + energy.highs * 0.03));
    reflGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = reflGlow;
    ctx.fillRect(0, 0, w, h);
}
