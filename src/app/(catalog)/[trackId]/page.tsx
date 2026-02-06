import Image from 'next/image';
import Link from 'next/link';
import { getTrack, formatDuration, formatPlayCount } from '@/lib/audius';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';

interface TrackDetailPageProps {
    params: Promise<{ trackId: string }>;
}

export const revalidate = 300; // ISR

export async function generateMetadata({ params }: TrackDetailPageProps) {
    const { trackId } = await params;
    const track = await getTrack(trackId);

    if (!track) {
        return { title: 'Track Not Found' };
    }

    return {
        title: `${track.title} | Devin Townsend`,
        description: track.description || `Listen to ${track.title}`,
        openGraph: {
            title: track.title,
            description: track.description || `Listen to ${track.title}`,
            images: track.artwork ? [{ url: track.artwork }] : [],
        },
    };
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
    const { trackId } = await params;
    const track = await getTrack(trackId);

    if (!track) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-stone-ambient text-[var(--cream)] flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back link */}
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-[var(--sage)] hover:text-[var(--sage-light)] mb-8 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Catalog
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Artwork */}
                        <div className="flex-shrink-0">
                            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-[var(--amber)]/10 ring-1 ring-[var(--glass-border)]">
                                {track.artwork ? (
                                    <Image
                                        src={track.artwork}
                                        alt={track.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 320px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--sage)] to-[var(--forest-mid)] flex items-center justify-center">
                                        <svg className="w-24 h-24 text-[var(--cream)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Track info */}
                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
                                {track.title}
                            </h1>

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {track.genre && (
                                    <div className="glass-light p-3 rounded-lg">
                                        <span className="text-xs text-[var(--sage)] uppercase tracking-wider">Genre</span>
                                        <p className="text-[var(--cream-soft)]">{track.genre}</p>
                                    </div>
                                )}
                                {track.mood && (
                                    <div className="glass-light p-3 rounded-lg">
                                        <span className="text-xs text-[var(--sage)] uppercase tracking-wider">Mood</span>
                                        <p className="text-[var(--cream-soft)]">{track.mood}</p>
                                    </div>
                                )}
                                <div className="glass-light p-3 rounded-lg">
                                    <span className="text-xs text-[var(--sage)] uppercase tracking-wider">Duration</span>
                                    <p className="text-[var(--cream-soft)]">{formatDuration(track.duration)}</p>
                                </div>
                                <div className="glass-light p-3 rounded-lg">
                                    <span className="text-xs text-[var(--sage)] uppercase tracking-wider">Play Count</span>
                                    <p className="text-[var(--cream-soft)]">{track.playCount.toLocaleString()}</p>
                                </div>
                                {track.releaseDate && (
                                    <div className="col-span-2 glass-light p-3 rounded-lg">
                                        <span className="text-xs text-[var(--sage)] uppercase tracking-wider">Released</span>
                                        <p className="text-[var(--cream-soft)]">
                                            {new Date(track.releaseDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Play button */}
                            <button className="btn-primary text-base mb-6">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Play Track
                            </button>

                            {/* Description */}
                            {track.description && (
                                <div className="mt-6 glass-light p-4 rounded-xl">
                                    <span className="text-xs text-[var(--sage)] uppercase tracking-wider block mb-2">
                                        About this track
                                    </span>
                                    <p className="text-[var(--sage-light)] whitespace-pre-wrap leading-relaxed text-sm">
                                        {track.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
