import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PODCAST_SERIES } from '@/lib/podcast-data';
import PodcastCard from '@/components/podcast/PodcastCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function PodcastsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token) redirect('/login');

  return (
    <div className="min-h-screen bg-natural text-[var(--cream)] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--sage)] hover:text-[var(--cream)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--amber)] font-medium mb-2">
              Podcasts
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--cream)] leading-tight mb-3">
              Devin Townsend Podcasts
            </h1>
            <p className="text-[var(--sage-light)] text-sm max-w-lg leading-relaxed">
              Deep dives into albums, conversations with fellow musicians, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PODCAST_SERIES.map((series) => (
              <PodcastCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
