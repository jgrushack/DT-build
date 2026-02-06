'use client';

import React from 'react';

/**
 * VisualizerBackground Component
 * Renders a slow-moving, breathing gradient background ("Aurora")
 * Optimized for performance using CSS keyframes instead of heavy WebGL for MVP
 */
export default function VisualizerBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base gradient mesh */}
            <div className="absolute inset-0 bg-dreampeace" />

            {/* Moving Orb 1 - Soft Cyan */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-[100px] animate-float animation-delay-0" />

            {/* Moving Orb 2 - Soft Purple */}
            <div className="absolute bottom-[10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-purple-200/30 blur-[120px] animate-float animation-delay-2000" />

            {/* Moving Orb 3 - Warm Pink */}
            <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-pink-200/20 blur-[90px] animate-pulse-soft animation-delay-1000" />

            {/* Overlay Texture (optional noise or subtle pattern) */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>
    );
}
