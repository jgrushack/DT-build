'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReturnTransition({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        router.prefetch('/');
    }, [router]);

    const handleReturn = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTransitioning(true);

        // Navigate after the warm dissolve completes
        setTimeout(() => {
            router.push('/');
        }, 2400);
    };

    return (
        <>
            <div onClick={handleReturn} className="inline-block cursor-pointer">
                {children}
            </div>

            {isTransitioning && (
                <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">

                    {/* 1. Soft warm vignette — blurs and darkens the dreampeace world */}
                    <div className="absolute inset-0 bg-gradient-radial animate-return-vignette"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(37,34,30,0.6) 0%, rgba(37,34,30,0.85) 50%, rgba(37,34,30,0.95) 100%)',
                        }}
                    />

                    {/* 2. Gentle text — appears softly in the center */}
                    <div className="relative z-50 text-center opacity-0 animate-return-text">
                        <span className="block text-[11px] font-ethereal tracking-[0.5em] text-[var(--sage-light)] mb-3">
                            Returning to
                        </span>
                        <h2 className="text-3xl font-semibold text-[var(--cream)] tracking-[0.08em]">
                            Devin Townsend
                        </h2>
                    </div>

                    {/* 3. Final warm wash to the DT palette before nav */}
                    <div
                        className="absolute inset-0 opacity-0 animate-return-wash"
                        style={{ backgroundColor: '#25221e' }}
                    />
                </div>
            )}
        </>
    );
}
