import { DREAMPEACE_ALBUMS, VISUALIZER_THEMES } from '@/lib/dreampeace-data';
import DreampeaceLandingClient from './landing-client';

export const metadata = {
    title: 'Dreampeace | Devin Townsend',
    description: 'A sanctuary for the mind. Ambient soundscapes for sleep, meditation, focus.',
};

// Loose constellation layout — 7 points, deterministic, in % of container.
// Hand-tuned to feel like stars, not a grid. Duplicated on every render for SSR match.
// `labelPos` flips a star's label above the orb when below would collide with a
// neighbor label. Lower-half stars use 'below', upper-half + the center star use
// 'above' so labels never land on top of another star's label.
const CONSTELLATION: Array<{ x: number; y: number; size: number; labelPos: 'above' | 'below' }> = [
    { x: 16, y: 24, size: 1.00, labelPos: 'below' }, // dp1 Tryptophan
    { x: 50, y: 12, size: 0.85, labelPos: 'below' }, // dp2 Sky Gods
    { x: 84, y: 26, size: 0.95, labelPos: 'below' }, // dp3 Dawn Shifter
    { x: 82, y: 64, size: 1.05, labelPos: 'below' }, // dp4 Space Oyster
    { x: 50, y: 84, size: 0.80, labelPos: 'above' }, // dp5 Snow Day  (above so it doesn't fall off the bottom)
    { x: 16, y: 64, size: 0.90, labelPos: 'below' }, // dp6 Beautiful Day
    { x: 50, y: 46, size: 1.00, labelPos: 'above' }, // dp7 Pond Skimmer (above so its label doesn't crowd dp4/dp5)
];

export default function DreampeacePage() {
    const stars = DREAMPEACE_ALBUMS.map((album, i) => ({
        album,
        theme: VISUALIZER_THEMES[album.id],
        pos: CONSTELLATION[i],
    }));

    return <DreampeaceLandingClient stars={stars} />;
}
