import Link from 'next/link';
import type { PodcastSeries } from '@/lib/podcast-data';
import { getYouTubeThumbnail } from '@/lib/podcast-data';

interface PodcastCardProps {
  series: PodcastSeries;
}

export default function PodcastCard({ series }: PodcastCardProps) {
  const thumbnail = series.episodes[0]
    ? getYouTubeThumbnail(series.episodes[0].youtubeId)
    : undefined;

  return (
    <Link
      href={`/podcasts/${series.id}`}
      className="group relative block"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg shadow-black/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[var(--amber)]/10 group-hover:-translate-y-1">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={series.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--stone-mid)] to-[var(--earth-dark)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--sage)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-[var(--cream)] text-sm group-hover:text-[var(--amber)] transition-colors duration-300">
            {series.name}
          </h3>
          <p className="text-[var(--sage-light)] text-xs mt-0.5">
            {series.episodes.length} episodes
          </p>
        </div>

        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium text-[var(--cream-soft)]">
          Podcast
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <p className="text-[var(--sage)] text-xs leading-relaxed line-clamp-2">
          {series.description}
        </p>
      </div>
    </Link>
  );
}
