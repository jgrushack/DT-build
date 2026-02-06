import type { Playlist } from '@/lib/types';

const PLACEHOLDER_TRACK: Partial<Playlist['tracks'][0]> = {
    id: '5K29J',
    title: 'Ambient Stream',
    duration: 2093,
    artwork: null,
    genre: 'Ambient',
    mood: 'Peaceful',
    playCount: 1200,
    releaseDate: '2023-01-01',
    description: 'Placeholder ambient stream for Dreampeace experience'
};

export const DREAMPEACE_ALBUMS: Playlist[] = [
    {
        id: 'dp1',
        name: 'Tryptophan',
        description: 'A cozy, warm, light purple vibe. The first ambient collection.',
        tracks: Array(9).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp1-t${i}`, title: `Tryptophan Pt. ${i + 1}` })) as any,
        artwork: '/images/dreampeace/tryptophan.jpg',
        trackCount: 9,
        isAlbum: true
    },
    {
        id: 'dp2',
        name: 'Sky Gods',
        description: 'Features unique sweeps created using a custom-built tool.',
        tracks: Array(10).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp2-t${i}`, title: `Sky Gods Pt. ${i + 1}` })) as any,
        artwork: '/images/dreampeace/skygods.jpg',
        trackCount: 10,
        isAlbum: true
    },
    {
        id: 'dp3',
        name: 'Dawn Shifter',
        description: 'Ethereal morning soundscapes.',
        tracks: Array(8).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp3-t${i}`, title: `Shift ${i + 1}` })) as any,
        artwork: '/images/dreampeace/dawnshifter.jpg',
        trackCount: 8,
        isAlbum: true
    },
    {
        id: 'dp4',
        name: 'Space Oyster',
        description: 'Deep space meditation.',
        tracks: Array(6).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp4-t${i}`, title: `Movement ${i + 1}` })) as any,
        artwork: '/images/dreampeace/spaceoyster.jpg',
        trackCount: 6,
        isAlbum: true
    },
    {
        id: 'dp5',
        name: 'Snow Day',
        description: 'Quiet winter reflection.',
        tracks: Array(7).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp5-t${i}`, title: `Snow ${i + 1}` })) as any,
        artwork: '/images/dreampeace/snowday.jpg',
        trackCount: 7,
        isAlbum: true
    },
    {
        id: 'dp6',
        name: 'Beautiful Day',
        description: 'Uplifting and light.',
        tracks: Array(5).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp6-t${i}`, title: `Ray ${i + 1}` })) as any,
        artwork: '/images/dreampeace/beautifulday.jpg',
        trackCount: 5,
        isAlbum: true
    },
    {
        id: 'dp7',
        name: 'Pond Skimmer',
        description: 'Tranquil stillness at the water\'s edge.',
        tracks: Array(6).fill(PLACEHOLDER_TRACK).map((t, i) => ({ ...t, id: `dp7-t${i}`, title: `Skim ${i + 1}` })) as any,
        artwork: '/images/dreampeace/pondskimmer.jpg',
        trackCount: 6,
        isAlbum: true
    },
];

export function getDreampeaceAlbum(albumId: string): Playlist | undefined {
    return DREAMPEACE_ALBUMS.find(a => a.id === albumId);
}
