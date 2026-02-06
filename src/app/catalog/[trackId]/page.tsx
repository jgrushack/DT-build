import Image from 'next/image';
import Link from 'next/link';
import { getTrack, formatDuration, formatPlayCount } from '@/lib/audius';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PlayButton from '@/components/player/PlayButton';
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
        title: `${track.title} | Artist Portal`,
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back link */}
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-8 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Catalog
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Artwork */}
                        <div className="flex-shrink-0">
                            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20">
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
                                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                                        <svg className="w-24 h-24 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Track info */}
                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                                {track.title}
                            </h1>

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {track.genre && (
                                    <div>
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Genre</span>
                                        <p className="text-zinc-200">{track.genre}</p>
                                    </div>
                                )}
                                {track.mood && (
                                    <div>
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Mood</span>
                                        <p className="text-zinc-200">{track.mood}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Duration</span>
                                    <p className="text-zinc-200">{formatDuration(track.duration)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Play Count</span>
                                    <p className="text-zinc-200">{track.playCount.toLocaleString()}</p>
                                </div>
                                {track.releaseDate && (
                                    <div className="col-span-2">
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Released</span>
                                        <p className="text-zinc-200">
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
                            <PlayButton track={track} />

                            {/* Description */}
                            {track.description && (
                                <div className="mt-6">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                                        About this track
                                    </span>
                                    <div className="prose prose-invert prose-zinc max-w-none">
                                        <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
                                            {track.description}
                                        </p>
                                    </div>
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
