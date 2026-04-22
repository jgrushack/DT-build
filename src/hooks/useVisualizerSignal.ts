'use client';

import { useEffect, useState, useRef } from 'react';
import { getEnergyBands } from '@/lib/audio-analyser';

// Returns a 0..1 opacity value that fades AS the visualizer/audio takes over.
// No audio => 1 (text fully readable). Loud audio => ~0.25 (text dimmed but not gone).
//
// Rationale: backend Claude's ReactiveText has an `opacity` prop that multiplies
// per-word signal opacity. Piping amplitude through this hook lets display copy
// fade out when the music is "alive" and reassert during quiet passages. The
// floor of 0.25 is deliberate — we want the dream to dim, not lose its handholds.
export function useVisualizerSignal(options?: { floor?: number; strength?: number; fps?: number }): number {
    const floor = options?.floor ?? 0.25;
    const strength = options?.strength ?? 0.9;
    const fps = options?.fps ?? 20; // 20Hz re-renders; text opacity doesn't need 60Hz

    const [signal, setSignal] = useState(1);
    const smoothedRef = useRef(1);

    useEffect(() => {
        let raf = 0;
        let lastTick = 0;
        const frameBudget = 1000 / fps;

        const loop = (now: number) => {
            if (now - lastTick >= frameBudget) {
                lastTick = now;
                const e = getEnergyBands();
                if (e) {
                    // Weighted amplitude — bass dominates because it's the most
                    // perceptible "the music is loud" signal for ambient tracks.
                    const amp = Math.min(1, e.bass * 1.2 + e.mids * 0.7 + e.highs * 0.4);
                    const target = Math.max(floor, 1 - amp * strength);
                    smoothedRef.current += (target - smoothedRef.current) * 0.1;
                    setSignal(smoothedRef.current);
                } else {
                    // No analyser connected (landing, or before first gesture).
                    // Target 1; smooth from current.
                    smoothedRef.current += (1 - smoothedRef.current) * 0.05;
                    if (Math.abs(smoothedRef.current - 1) > 0.005) {
                        setSignal(smoothedRef.current);
                    }
                }
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [floor, strength, fps]);

    return signal;
}
