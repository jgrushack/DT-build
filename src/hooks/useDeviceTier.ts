'use client';

import { useEffect, useState } from 'react';

export type DeviceTier = 'low' | 'mid' | 'high';

export interface TierBudget {
    tier: DeviceTier;
    dprCap: number;          // max devicePixelRatio to render at
    particleScale: number;   // multiplier applied to theme.particleCount
    targetFps: number;       // RAF throttle target (60 uncapped, 30 for throttle)
    reducedMotion: boolean;  // user pref — suppresses breath/drift animations
    grainEnabled: boolean;   // cheap, but off for low tier
}

// Heuristic: score device from hardwareConcurrency + deviceMemory + DPR.
// Reason: no single signal is reliable alone. Low-end phones often have
// high DPR (retina) but 2-4 cores / 2GB RAM, so we weight cores + memory heavier.
// High-end phones tell the same story in reverse (8+ cores, 6+GB). Tiers cluster
// around score 0-3 (low), 4-6 (mid), 7+ (high).
function scoreDevice(): number {
    if (typeof navigator === 'undefined') return 5; // SSR — assume mid

    let score = 0;

    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) score += 4;
    else if (cores >= 6) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;

    // deviceMemory is a Chrome/Android signal — Safari returns undefined
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (mem !== undefined) {
        if (mem >= 8) score += 3;
        else if (mem >= 4) score += 2;
        else if (mem >= 2) score += 1;
    } else {
        // No signal — don't penalize. Assume mid contribution.
        score += 2;
    }

    const dpr = window.devicePixelRatio || 1;
    // High DPR on a weak device is a trap (many pixels to push). Neutral signal;
    // only add a small bonus if it's a clean 1 (likely desktop) or 2 (likely modern).
    if (dpr >= 2) score += 1;

    return score;
}

function detectTier(): DeviceTier {
    const score = scoreDevice();
    if (score <= 3) return 'low';
    if (score <= 6) return 'mid';
    return 'high';
}

const BUDGETS: Record<DeviceTier, Omit<TierBudget, 'tier' | 'reducedMotion'>> = {
    low:  { dprCap: 1,   particleScale: 0.4, targetFps: 30, grainEnabled: false },
    mid:  { dprCap: 1.5, particleScale: 0.7, targetFps: 60, grainEnabled: true  },
    high: { dprCap: 2,   particleScale: 1.0, targetFps: 60, grainEnabled: true  },
};

export function useDeviceTier(): TierBudget {
    // SSR-safe default: mid tier, motion allowed. Hydrates to real value on mount.
    const [budget, setBudget] = useState<TierBudget>({
        tier: 'mid',
        reducedMotion: false,
        ...BUDGETS.mid,
    });

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const reducedMotion = mq.matches;
        const tier = detectTier();

        setBudget({
            tier,
            reducedMotion,
            ...BUDGETS[tier],
        });

        // Watch for pref changes — user can toggle mid-session
        const onChange = (e: MediaQueryListEvent) => {
            setBudget((prev) => ({ ...prev, reducedMotion: e.matches }));
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return budget;
}
