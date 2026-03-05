'use client';

import { useState } from 'react';
import type { PodcastEpisode } from '@/lib/podcast-data';
import EpisodeCard from '@/components/podcast/EpisodeCard';
import YouTubeEmbed from '@/components/podcast/YouTubeEmbed';

interface PodcastSeriesClientProps {
  episodes: PodcastEpisode[];
}

export default function PodcastSeriesClient({ episodes }: PodcastSeriesClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {episodes.map((episode) => {
        const isExpanded = expandedId === episode.id;
        return (
          <div key={episode.id}>
            <EpisodeCard
              episode={episode}
              isExpanded={isExpanded}
              onToggle={() => setExpandedId(isExpanded ? null : episode.id)}
            />
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 animate-fade-in">
                <YouTubeEmbed youtubeId={episode.youtubeId} title={episode.title} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
