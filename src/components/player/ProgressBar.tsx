'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { formatDuration } from '@/lib/format';

interface ProgressBarProps {
    progress: number; // 0-1
    duration: number; // seconds
    onSeek: (position: number) => void;
}

export default function ProgressBar({ progress, duration, onSeek }: ProgressBarProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverPosition, setHoverPosition] = useState<number | null>(null);

    const getPositionFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!barRef.current) return 0;
        const rect = barRef.current.getBoundingClientRect();
        return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        const pos = getPositionFromEvent(e);
        onSeek(pos);
    }, [getPositionFromEvent, onSeek]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const pos = getPositionFromEvent(e);
            onSeek(pos);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, getPositionFromEvent, onSeek]);

    const elapsed = Math.floor(progress * duration);
    const displayProgress = hoverPosition !== null && !isDragging ? hoverPosition : progress;

    return (
        <div className="w-full flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 tabular-nums w-10 text-right">
                {formatDuration(elapsed)}
            </span>
            <div
                ref={barRef}
                className="relative flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer group"
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => {
                    if (!barRef.current) return;
                    const rect = barRef.current.getBoundingClientRect();
                    setHoverPosition((e.clientX - rect.left) / rect.width);
                }}
                onMouseLeave={() => setHoverPosition(null)}
            >
                {/* Filled portion */}
                <div
                    className="absolute inset-y-0 left-0 bg-violet-500 rounded-full group-hover:bg-violet-400 transition-colors"
                    style={{ width: `${(isDragging ? progress : displayProgress) * 100}%` }}
                />
                {/* Handle */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(isDragging ? progress : displayProgress) * 100}%`, marginLeft: '-6px' }}
                />
            </div>
            <span className="text-[11px] text-zinc-500 tabular-nums w-10">
                {formatDuration(Math.floor(duration))}
            </span>
        </div>
    );
}
