'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface VolumeControlProps {
    volume: number; // 0-1
    onVolumeChange: (vol: number) => void;
}

export default function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [prevVolume, setPrevVolume] = useState(0.8);

    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            onVolumeChange(0);
        } else {
            onVolumeChange(prevVolume || 0.8);
        }
    };

    const getPositionFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!barRef.current) return 0;
        const rect = barRef.current.getBoundingClientRect();
        return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        onVolumeChange(getPositionFromEvent(e));
    }, [getPositionFromEvent, onVolumeChange]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            onVolumeChange(getPositionFromEvent(e));
        };

        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, getPositionFromEvent, onVolumeChange]);

    const VolumeIcon = () => {
        if (volume === 0) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
            );
        }
        if (volume < 0.5) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
            </svg>
        );
    };

    return (
        <div className="hidden md:flex items-center gap-2">
            <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
                <VolumeIcon />
            </button>
            <div
                ref={barRef}
                className="relative w-24 h-1 bg-zinc-700 rounded-full cursor-pointer group"
                onMouseDown={handleMouseDown}
            >
                <div
                    className="absolute inset-y-0 left-0 bg-zinc-300 rounded-full group-hover:bg-violet-400 transition-colors"
                    style={{ width: `${volume * 100}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${volume * 100}%`, marginLeft: '-6px' }}
                />
            </div>
        </div>
    );
}
