import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaylistTracks } from '@/lib/audius';
import { formatDuration } from '@/lib/audius';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AlbumTracks from './album-client';

export const revalidate = 300;

interface AlbumPageProps {
    params: Promise<{ albumId: string }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) redirect('/login');

    const { albumId } = await params;
    const album = await getPlaylistTracks(albumId);

    if (!album) notFound();

    const totalDuration = album.tracks.reduce((sum, t) => sum + t.duration, 0);

    return (
        <div className="min-h-screen bg-natural text-[var(--cream)] flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back link */}
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--sage)] hover:text-[var(--cream)] transition-colors mb-8"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>

                    {/* Album header */}
                    <div className="flex flex-col sm:flex-row gap-8 mb-12">
                        {/* Artwork */}
                        <div className="relative w-full sm:w-64 md:w-72 flex-shrink-0 aspect-square rounded-xl overflow-hidden shadow-2xl shadow-black/40">
                            {album.artwork ? (
                                <Image
                                    src={album.artwork}
                                    alt={album.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 640px) 100vw, 288px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--stone-mid)] to-[var(--earth-dark)] flex items-center justify-center">
                                    <svg className="w-16 h-16 text-[var(--sage)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-end">
                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--amber)] font-medium mb-2">
                                {album.isAlbum ? 'Album' : 'Playlist'}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--cream)] leading-tight mb-4">
                                {album.name}
                            </h1>
                            {album.description && (
                                <p className="text-[var(--sage-light)] text-sm mb-4 max-w-md leading-relaxed">
                                    {album.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 text-sm text-[var(--sage)]">
                                <span>{album.trackCount} tracks</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--sage)]/50" />
                                <span>{formatDuration(totalDuration)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-8" />

                    {/* Tracklist */}
                    <AlbumTracks tracks={album.tracks} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
