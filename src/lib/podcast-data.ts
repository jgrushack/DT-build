export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  youtubeId: string;
  episodeNumber: number;
  publishDate: string;
}

export interface PodcastSeries {
  id: string;
  name: string;
  description: string;
  artwork: string;
  episodes: PodcastEpisode[];
}

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

export const PODCAST_SERIES: PodcastSeries[] = [
  {
    id: 'album-commentary',
    name: 'Album Commentary',
    description:
      'Devin deep-dives into the story behind each album — the writing, the production, the chaos, and the breakthroughs.',
    artwork: '/images/podcast-commentary.jpg',
    episodes: [
      {
        id: 'ac-01',
        title: 'Ocean Machine: Biomech',
        description: 'The making of Ocean Machine — Devin\'s debut solo album and the beginning of everything.',
        duration: '1:46:11',
        youtubeId: 'q2vpT_8zKp4',
        episodeNumber: 1,
        publishDate: '2024-01-01',
      },
      {
        id: 'ac-02',
        title: 'City',
        description: 'The story behind Strapping Young Lad\'s most intense album.',
        duration: '1:32:45',
        youtubeId: 'pJRHj_3e50Y',
        episodeNumber: 2,
        publishDate: '2024-01-15',
      },
      {
        id: 'ac-03',
        title: 'Infinity',
        description: 'Exploring the ambitious and psychedelic Infinity.',
        duration: '1:28:30',
        youtubeId: '6hCr8brn40Y',
        episodeNumber: 3,
        publishDate: '2024-02-01',
      },
      {
        id: 'ac-04',
        title: 'Physicist',
        description: 'Devin discusses the heavy, raw energy of Physicist.',
        duration: '1:15:22',
        youtubeId: '9d-zBptOlQ4',
        episodeNumber: 4,
        publishDate: '2024-02-15',
      },
      {
        id: 'ac-05',
        title: 'Terria',
        description: 'The making of Terria — one of Devin\'s most beloved albums.',
        duration: '1:52:08',
        youtubeId: 't-qR0H9t5I4',
        episodeNumber: 5,
        publishDate: '2024-03-01',
      },
      {
        id: 'ac-06',
        title: 'Accelerated Evolution',
        description: 'Behind the scenes of the Devin Townsend Band\'s debut.',
        duration: '1:38:44',
        youtubeId: 'Oy2kZ_xUA7Y',
        episodeNumber: 6,
        publishDate: '2024-03-15',
      },
      {
        id: 'ac-07',
        title: 'Alien',
        description: 'The chaotic creation of Strapping Young Lad\'s Alien.',
        duration: '1:22:16',
        youtubeId: 'K4IXJVWRJqU',
        episodeNumber: 7,
        publishDate: '2024-04-01',
      },
      {
        id: 'ac-08',
        title: 'Synchestra',
        description: 'The orchestral ambition and layered production of Synchestra.',
        duration: '1:41:33',
        youtubeId: 'xIgafW2K6z4',
        episodeNumber: 8,
        publishDate: '2024-04-15',
      },
      {
        id: 'ac-09',
        title: 'The New Black',
        description: 'Strapping Young Lad\'s final album and the end of an era.',
        duration: '1:18:50',
        youtubeId: 'Nwr5mq7JJ6I',
        episodeNumber: 9,
        publishDate: '2024-05-01',
      },
      {
        id: 'ac-10',
        title: 'Ziltoid the Omniscient',
        description: 'The absurd genius of Ziltoid — Devin\'s one-man sci-fi rock opera.',
        duration: '1:35:27',
        youtubeId: 'kpNUDSeWJ70',
        episodeNumber: 10,
        publishDate: '2024-05-15',
      },
      {
        id: 'ac-11',
        title: 'Ki',
        description: 'The quiet revolution of Ki and the beginning of the DTP era.',
        duration: '1:44:19',
        youtubeId: 'pr5e9S_9aJw',
        episodeNumber: 11,
        publishDate: '2024-06-01',
      },
      {
        id: 'ac-12',
        title: 'Addicted',
        description: 'Pop hooks meet wall-of-sound production in Addicted.',
        duration: '1:12:55',
        youtubeId: 'pG0Vdi2vbds',
        episodeNumber: 12,
        publishDate: '2024-06-15',
      },
      {
        id: 'ac-13',
        title: 'Deconstruction',
        description: 'The heaviest, most ambitious DTP album dissected.',
        duration: '1:58:42',
        youtubeId: 'MHc7LtLwCls',
        episodeNumber: 13,
        publishDate: '2024-07-01',
      },
      {
        id: 'ac-14',
        title: 'Ghost',
        description: 'The serene counterpart to Deconstruction.',
        duration: '1:26:38',
        youtubeId: 'dr6EocbscVg',
        episodeNumber: 14,
        publishDate: '2024-07-15',
      },
      {
        id: 'ac-15',
        title: 'Deconstruction Revisited',
        description: 'A fresh look at Deconstruction years later.',
        duration: '1:33:10',
        youtubeId: 'ea2VM1zuFdE',
        episodeNumber: 15,
        publishDate: '2024-08-01',
      },
      {
        id: 'ac-16',
        title: 'Ghost Revisited',
        description: 'Returning to Ghost with new perspective.',
        duration: '1:29:05',
        youtubeId: 'iHcT5xcEEQk',
        episodeNumber: 16,
        publishDate: '2024-08-15',
      },
    ],
  },
  {
    id: 'interview-series',
    name: 'Interview Series',
    description:
      'Devin sits down with fellow musicians for deep conversations about music, creativity, and life.',
    artwork: '/images/podcast-interviews.jpg',
    episodes: [
      {
        id: 'is-01',
        title: 'Synesthesia',
        description: 'An exploration of synesthesia and how it shapes musical perception.',
        duration: '1:05:30',
        youtubeId: '5SI17axSWko',
        episodeNumber: 1,
        publishDate: '2024-09-01',
      },
      {
        id: 'is-02',
        title: 'Steve Vai',
        description: 'Guitar legend Steve Vai on technique, spirituality, and decades of innovation.',
        duration: '1:42:18',
        youtubeId: 'QzOPq6A6NVY',
        episodeNumber: 2,
        publishDate: '2024-09-15',
      },
      {
        id: 'is-03',
        title: 'Tosin Abasi',
        description: 'Animals as Leaders\' Tosin Abasi on progressive guitar and modern metal.',
        duration: '1:18:45',
        youtubeId: 'yQq7wWrWQr4',
        episodeNumber: 3,
        publishDate: '2024-10-01',
      },
      {
        id: 'is-04',
        title: 'Joe Satriani',
        description: 'Joe Satriani on melody, tone, and a lifetime of instrumental rock.',
        duration: '1:35:22',
        youtubeId: '1SHtIbmzsBw',
        episodeNumber: 4,
        publishDate: '2024-10-15',
      },
      {
        id: 'is-05',
        title: 'Mike Keneally',
        description: 'Mike Keneally on Zappa, collaboration, and musical versatility.',
        duration: '1:28:10',
        youtubeId: '-vzI_fPji1Q',
        episodeNumber: 5,
        publishDate: '2024-11-01',
      },
      {
        id: 'is-06',
        title: 'Blindboy Boatclub',
        description: 'Blindboy Boatclub on creativity, mental health, and artistic expression.',
        duration: '1:22:55',
        youtubeId: 'mBbAwJc0Df4',
        episodeNumber: 6,
        publishDate: '2024-11-15',
      },
      {
        id: 'is-07',
        title: 'Jordan Rudess',
        description: 'Dream Theater\'s Jordan Rudess on keyboards, prog, and pushing boundaries.',
        duration: '1:31:40',
        youtubeId: 'csqWz2SwEWg',
        episodeNumber: 7,
        publishDate: '2024-12-01',
      },
      {
        id: 'is-08',
        title: 'Tomas Haake',
        description: 'Meshuggah\'s Tomas Haake on polyrhythms, discipline, and extreme music.',
        duration: '1:19:33',
        youtubeId: '8ImJf1OXu3g',
        episodeNumber: 8,
        publishDate: '2024-12-15',
      },
      {
        id: 'is-09',
        title: 'Ihsahn',
        description: 'Emperor\'s Ihsahn on black metal, solo artistry, and musical evolution.',
        duration: '1:25:48',
        youtubeId: 'C7T0Mc44JBY',
        episodeNumber: 9,
        publishDate: '2025-01-01',
      },
    ],
  },
];

export function getPodcastSeries(seriesId: string): PodcastSeries | undefined {
  return PODCAST_SERIES.find((s) => s.id === seriesId);
}

export function getLatestEpisodes(count: number): (PodcastEpisode & { seriesId: string; seriesName: string })[] {
  const all = PODCAST_SERIES.flatMap((s) =>
    s.episodes.map((ep) => ({ ...ep, seriesId: s.id, seriesName: s.name }))
  );
  all.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return all.slice(0, count);
}
