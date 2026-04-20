import { NextRequest, NextResponse } from 'next/server';
import type { DeviceTier, DeviceTierSignal } from '@/lib/types';

/**
 * Device-tier heuristic (server-side source of truth).
 *
 * Mirrors src/hooks/useDeviceTier.ts so both sides agree given identical
 * input. Scoring:
 *   cores:  >=8 +4, >=6 +3, >=4 +2, else +1
 *   memory: >=8GB +3, >=4GB +2, >=2GB +1, undefined +2 (Safari omits)
 *   dpr:   >=2 +1 (retina bonus)
 *   battery-low: demotes 'high' → 'mid' (don't push a draining device)
 *   prefersReducedMotion: returned verbatim by the client; not a tier input
 * Buckets: <=3 low, <=6 mid, >=7 high.
 */
export async function POST(request: NextRequest) {
    let signal: DeviceTierSignal = {};
    try {
        signal = (await request.json()) as DeviceTierSignal;
    } catch {
        // Empty / invalid body → defaults path
    }
    return NextResponse.json({ tier: detectTier(signal) });
}

function detectTier(s: DeviceTierSignal): DeviceTier {
    let score = 0;

    const cores = s.hardwareConcurrency ?? 4;
    if (cores >= 8) score += 4;
    else if (cores >= 6) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;

    if (s.deviceMemory !== undefined) {
        if (s.deviceMemory >= 8) score += 3;
        else if (s.deviceMemory >= 4) score += 2;
        else if (s.deviceMemory >= 2) score += 1;
    } else {
        score += 2;
    }

    if ((s.devicePixelRatio ?? 1) >= 2) score += 1;

    let tier: DeviceTier;
    if (score <= 3) tier = 'low';
    else if (score <= 6) tier = 'mid';
    else tier = 'high';

    if (s.hasLowBattery && tier === 'high') tier = 'mid';
    return tier;
}
