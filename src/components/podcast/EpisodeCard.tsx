'use client';

import { getYouTubeThumbnail } from '@/lib/podcast-data';
import type { PodcastEpisode } from '@/lib/podcast-data';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function EpisodeCard({ episode, isExpanded, onToggle }: EpisodeCardProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left group"
    >
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
        <div className="relative w-20 h-12 flex-shrink-0 rounded-md overflow-hidden bg-black/30">
          <img
            src={getYouTubeThumbnail(episode.youtubeId)}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
          {!isExpanded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[var(--amber)] tabular-nums">
              EP {episode.episodeNumber}
            </span>
            <span className="text-[10px] text-[var(--sage)]">{episode.duration}</span>
          </div>
          <h4 className="text-sm font-medium text-[var(--cream)] truncate group-hover:text-[var(--amber)] transition-colors">
            {episode.title}
          </h4>
          <p className="text-xs text-[var(--sage)] truncate">{episode.description}</p>
        </div>

        <svg
          className={`w-4 h-4 text-[var(--sage)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}
