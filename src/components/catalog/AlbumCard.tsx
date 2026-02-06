'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Playlist } from '@/lib/types';

interface AlbumCardProps {
    album: Playlist;
}

export default function AlbumCard({ album }: AlbumCardProps) {
    return (
        <Link
            href={`/album/${album.id}`}
            className="group relative block"
        >
            {/* Artwork */}
            <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg shadow-black/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[var(--amber)]/10 group-hover:-translate-y-1">
                {album.artwork ? (
                    <Image
                        src={album.artwork}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--stone-mid)] to-[var(--earth-dark)] flex items-center justify-center">
                        <svg className="w-12 h-12 text-[var(--sage)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Track count badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium text-[var(--cream-soft)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {album.trackCount} tracks
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 px-0.5">
                <h3 className="font-semibold text-[var(--cream)] text-sm truncate group-hover:text-[var(--amber)] transition-colors duration-300">
                    {album.name}
                </h3>
                {album.isAlbum && (
                    <p className="text-[var(--sage)] text-xs mt-0.5">Album</p>
                )}
                {!album.isAlbum && (
                    <p className="text-[var(--sage)] text-xs mt-0.5">Playlist</p>
                )}
            </div>
        </Link>
    );
}
