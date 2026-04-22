import { DREAMPEACE_ALBUMS, VISUALIZER_THEMES } from '@/lib/dreampeace-data';
import DreampeaceLandingClient from './landing-client';

export const metadata = {
    title: 'Dreampeace | Devin Townsend',
    description: 'A sanctuary for the mind. Ambient soundscapes for sleep, meditation, focus.',
};

// Loose constellation layout — 7 points, deterministic, in % of container.
// Hand-tuned to feel like stars, not a grid. Duplicated on every render for SSR match.
const CONSTELLATION: Array<{ x: number; y: number; size: number }> = [
    { x: 22, y: 28, size: 1.00 }, // dp1 Tryptophan
    { x: 55, y: 16, size: 0.85 }, // dp2 Sky Gods
    { x: 82, y: 36, size: 0.95 }, // dp3 Dawn Shifter
    { x: 72, y: 64, size: 1.05 }, // dp4 Space Oyster
    { x: 42, y: 78, size: 0.80 }, // dp5 Snow Day
    { x: 14, y: 62, size: 0.90 }, // dp6 Beautiful Day
    { x: 50, y: 46, size: 1.00 }, // dp7 Pond Skimmer
];

export default function DreampeacePage() {
    const stars = DREAMPEACE_ALBUMS.map((album, i) => ({
        album,
        theme: VISUALIZER_THEMES[album.id],
        pos: CONSTELLATION[i],
    }));

    return <DreampeaceLandingClient stars={stars} />;
}
