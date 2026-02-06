import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDuration } from '@/lib/audius';
import { getDreampeaceAlbum, DREAMPEACE_ALBUMS } from '@/lib/dreampeace-data';
import VisualizerBackground from '@/components/dreampeace/VisualizerBackground';
import DreampeaceAlbumTracks from './album-client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface DreampeaceAlbumPageProps {
    params: Promise<{ albumId: string }>;
}

export async function generateStaticParams() {
    return DREAMPEACE_ALBUMS.map((album) => ({ albumId: album.id }));
}

export default async function DreampeaceAlbumPage({ params }: DreampeaceAlbumPageProps) {
    const { albumId } = await params;
    const album = getDreampeaceAlbum(albumId);

    if (!album) notFound();

    const totalDuration = album.tracks.reduce((sum, t) => sum + t.duration, 0);

    return (
        <div className="theme-dreampeace min-h-screen text-[var(--foreground)] font-sans selection:bg-[var(--accent)] selection:text-white relative">
            <VisualizerBackground />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow pt-24 pb-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Back link */}
                        <Link
                            href="/dreampeace"
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors mb-8"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dreampeace
                        </Link>

                        {/* Album header */}
                        <div className="flex flex-col sm:flex-row gap-8 mb-12 animate-fade-in">
                            {/* Artwork */}
                            <div className="relative w-full sm:w-64 md:w-72 flex-shrink-0 aspect-square rounded-2xl overflow-hidden shadow-soft">
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
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-purple-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-end">
                                <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-medium mb-2">
                                    Dreampeace Album
                                </p>
                                <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight mb-4">
                                    {album.name}
                                </h1>
                                {album.description && (
                                    <p className="text-[var(--foreground-muted)] text-sm mb-4 max-w-md leading-relaxed">
                                        {album.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                                    <span>{album.trackCount} tracks</span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--accent)]/50" />
                                    <span>{formatDuration(totalDuration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent mb-8" />

                        {/* Tracklist */}
                        <DreampeaceAlbumTracks tracks={album.tracks} />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
