'use client';

import { useState } from 'react';
import { getYouTubeThumbnail } from '@/lib/podcast-data';

interface YouTubeEmbedProps {
  youtubeId: string;
  title: string;
}

export default function YouTubeEmbed({ youtubeId, title }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className="relative w-full aspect-video rounded-lg overflow-hidden group cursor-pointer bg-black/40"
      >
        <img
          src={getYouTubeThumbnail(youtubeId)}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
