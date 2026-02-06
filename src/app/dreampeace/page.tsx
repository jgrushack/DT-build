import Image from 'next/image';
import Link from 'next/link';
import VisualizerBackground from '@/components/dreampeace/VisualizerBackground';
import AmbientCard from '@/components/dreampeace/AmbientCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DREAMPEACE_ALBUMS } from '@/lib/dreampeace-data';

export const metadata = {
    title: 'Dreampeace | Devin Townsend',
    description: 'Immersive soundscapes for focus, meditation, and relaxation.',
};

export default function DreampeacePage() {
    return (
        <div className="theme-dreampeace min-h-screen text-[var(--foreground)] font-sans selection:bg-[var(--accent)] selection:text-white portal-frame relative">

            {/* Arrival Fade-In (Matches Portal Exit) */}
            <div className="fixed inset-0 bg-white z-[100] animate-arrival pointer-events-none" />

            {/* Background Visualizer */}
            <VisualizerBackground />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow">

                    {/* Hero Section with Logo & Promo */}
                    <section className="relative overflow-hidden pt-28 pb-16 px-6">
                        <div className="max-w-5xl mx-auto animate-fade-in">
                            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                                {/* Promo Image */}
                                <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-soft">
                                    <Image
                                        src="/images/dreampeace/promo.jpg"
                                        alt="Dreampeace by Devin Townsend"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>

                                {/* Title & Copy */}
                                <div className="text-center md:text-left flex-1">
                                    <div className="mb-6">
                                        <Image
                                            src="/images/dreampeace/logo.png"
                                            alt="Dreampeace"
                                            width={320}
                                            height={80}
                                            className="mx-auto md:mx-0"
                                            priority
                                        />
                                    </div>
                                    <p className="text-[var(--foreground-muted)] text-lg md:text-xl font-light leading-relaxed max-w-lg mb-6">
                                        A sanctuary for the mind. Infinite spaces for meditation, sleep, and deep focus.
                                    </p>
                                    <div className="flex items-center gap-3 justify-center md:justify-start text-sm text-[var(--foreground-muted)]">
                                        <span>{DREAMPEACE_ALBUMS.length} Albums</span>
                                        <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-60" />
                                        <span>{DREAMPEACE_ALBUMS.reduce((sum, a) => sum + a.trackCount, 0)} Tracks</span>
                                        <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-60" />
                                        <span>Ambient</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
                    </div>

                    {/* Moments / Album Grid */}
                    <section className="py-16 px-6">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12 animate-fade-in">
                                <span className="inline-block text-xs font-ethereal text-[var(--accent)] mb-3 tracking-[0.3em] uppercase opacity-80">
                                    Moments
                                </span>
                                <h2 className="text-3xl md:text-4xl font-thin text-[var(--foreground)] font-serif tracking-tight">
                                    Choose Your Space
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
                                {DREAMPEACE_ALBUMS.map((album, idx) => (
                                    <div key={album.id} className="animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
                                        <AmbientCard album={album} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Divider */}
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
                    </div>

                    {/* About Section with Intro Cover */}
                    <section className="py-16 px-6">
                        <div className="max-w-4xl mx-auto animate-fade-in">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-soft flex-shrink-0">
                                    <Image
                                        src="/images/dreampeace/intro-cover.jpg"
                                        alt="Dreampeace studio"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <span className="inline-block text-xs font-ethereal text-[var(--accent)] mb-3 tracking-[0.3em] uppercase opacity-80">
                                        About
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-thin text-[var(--foreground)] font-serif tracking-tight mb-4">
                                        The Story
                                    </h2>
                                    <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
                                        Dreampeace is Devin Townsend&apos;s ambient project — a collection of immersive
                                        soundscapes designed for meditation, sleep, focus, and relaxation.
                                    </p>
                                    <p className="text-[var(--foreground-muted)] leading-relaxed">
                                        Each album is a self-contained world. From the warm cocoon of Tryptophan to the
                                        cosmic expanse of Space Oyster, these are spaces to lose yourself in.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Return Link */}
                    <div className="text-center pb-20">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-[var(--glass-border)] hover:border-[var(--accent)] text-[var(--foreground-muted)] hover:text-[var(--accent)] text-xs font-ethereal tracking-[0.2em] transition-all duration-500 backdrop-blur-sm"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
                            RETURN TO REALITY
                        </Link>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
