'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalTransition({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Prefetch on mount for instant availability
    useEffect(() => {
        router.prefetch('/dreampeace');
    }, [router]);

    const handleEnter = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTransitioning(true);

        // Wait for the full tunnel effect (3s), then navigate
        setTimeout(() => {
            router.push('/dreampeace');
        }, 3200);
    };

    return (
        <>
            {/* Trigger Button (The Child) */}
            <div onClick={handleEnter} className="inline-block cursor-pointer">
                {children}
            </div>

            {/* The Portal Overlay */}
            {isTransitioning && (
                <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">

                    {/* 1. White Light Overlay (Starts transparent, fades to white) */}
                    <div className="absolute inset-0 bg-white animate-portal-fade-in" />

                    {/* 2. Expanding Tunnel Orb (Starts small, consumes screen) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-100 rounded-full shadow-[0_0_150px_100px_rgba(255,255,255,0.9)] animate-portal-expand mix-blend-screen" />
                    </div>

                    {/* 3. Text appearing in the void (During whiteout) */}
                    <div className="relative z-50 text-center opacity-0 animate-portal-text">
                        <span className="block text-sm font-ethereal tracking-[0.6em] text-slate-800 mb-2">Entering</span>
                        <h2 className="text-4xl font-thin font-serif text-slate-900 tracking-[0.3em]">DREAMPEACE</h2>
                    </div>

                </div>
            )}
        </>
    );
}
