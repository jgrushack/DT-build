'use client';

import Image from 'next/image';
import type { Playlist } from '@/lib/types';

interface AmbientCardProps {
    album: Playlist;
    onClick?: (album: Playlist) => void;
}

export default function AmbientCard({ album, onClick }: AmbientCardProps) {
    return (
        <div
            onClick={() => onClick?.(album)}
            className="group relative flex flex-col items-center text-center cursor-pointer"
        >
            {/* Card Image Container */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-soft transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-glow">
                {album.artwork ? (
                    <Image
                        src={album.artwork}
                        alt={album.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                        <span className="text-4xl text-purple-300 font-light opacity-50">?</span>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-[var(--accent)] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Track count badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {album.trackCount} tracks
                </div>
            </div>

            {/* Text Content */}
            <h3 className="text-base font-medium text-[var(--foreground)] tracking-wide mb-0.5 group-hover:text-[var(--accent)] transition-colors">
                {album.name}
            </h3>
            {album.description && (
                <p className="text-xs text-[var(--foreground-muted)] line-clamp-1 max-w-[90%]">
                    {album.description}
                </p>
            )}
        </div>
    );
}
