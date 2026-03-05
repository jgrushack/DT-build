import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { PODCAST_SERIES, getPodcastSeries } from '@/lib/podcast-data';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PodcastSeriesClient from './podcast-client';

export async function generateStaticParams() {
  return PODCAST_SERIES.map((s) => ({ seriesId: s.id }));
}

interface PodcastSeriesPageProps {
  params: Promise<{ seriesId: string }>;
}

export default async function PodcastSeriesPage({ params }: PodcastSeriesPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token) redirect('/login');

  const { seriesId } = await params;
  const series = getPodcastSeries(seriesId);
  if (!series) notFound();

  return (
    <div className="min-h-screen bg-natural text-[var(--cream)] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/podcasts"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--sage)] hover:text-[var(--cream)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Podcasts
          </Link>

          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--amber)] font-medium mb-2">
              {series.episodes.length} Episodes
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--cream)] leading-tight mb-3">
              {series.name}
            </h1>
            <p className="text-[var(--sage-light)] text-sm max-w-lg leading-relaxed">
              {series.description}
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-8" />

          <PodcastSeriesClient episodes={series.episodes} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
