import type { Track, Playlist } from '@/lib/types';

// ============================================================================
// Visualizer Theme Types
// ============================================================================

export type DrawStyle =
    | 'warm-pulse'     // Concentric rings breathing with bass
    | 'aurora-sweep'   // Horizontal flowing wave bands
    | 'sunrise-rays'   // Radial light rays from horizon
    | 'nebula-field'   // Star particles + glowing central orb
    | 'falling-snow'   // Snowflake particles + crystalline shapes
    | 'rising-bubbles' // Luminous orbs floating upward
    | 'water-ripples'; // Concentric ripple rings expanding

export interface VisualizerTheme {
    drawStyle: DrawStyle;
    colors: string[];           // Primary palette (3-4 colors)
    bgColor: string;            // Canvas background
    glowColor: string;          // Glow/shadow color
    particleCount: number;      // Base particle count (scales with canvas size)
    intensity: number;          // 0-1, how responsive to audio
}

// ============================================================================
// Per-Album Visualizer Themes
// ============================================================================

export const VISUALIZER_THEMES: Record<string, VisualizerTheme> = {
    dp1: { // Tryptophan — cozy, warm, light purple
        drawStyle: 'warm-pulse',
        colors: ['#c4b5fd', '#a78bfa', '#d4a574', '#e9d5ff'],
        bgColor: '#faf8ff',
        glowColor: 'rgba(167, 139, 250, 0.35)',
        particleCount: 40,
        intensity: 0.7,
    },
    dp2: { // Sky Gods — unique sweeps
        drawStyle: 'aurora-sweep',
        colors: ['#7dd3fc', '#2dd4bf', '#c084fc', '#67e8f9'],
        bgColor: '#f0fdfa',
        glowColor: 'rgba(45, 212, 191, 0.25)',
        particleCount: 30,
        intensity: 0.8,
    },
    dp3: { // Dawn Shifter — ethereal morning
        drawStyle: 'sunrise-rays',
        colors: ['#fdba74', '#fcd34d', '#fda4af', '#c4b5fd'],
        bgColor: '#fffbf5',
        glowColor: 'rgba(253, 186, 116, 0.3)',
        particleCount: 25,
        intensity: 0.65,
    },
    dp4: { // Space Oyster — deep space meditation
        drawStyle: 'nebula-field',
        colors: ['#a78bfa', '#c084fc', '#67e8f9', '#e9d5ff'],
        bgColor: '#faf5ff',
        glowColor: 'rgba(167, 139, 250, 0.3)',
        particleCount: 80,
        intensity: 0.6,
    },
    dp5: { // Snow Day — quiet winter reflection
        drawStyle: 'falling-snow',
        colors: ['#bae6fd', '#a5b4fc', '#cbd5e1', '#c7d2fe'],
        bgColor: '#f8fafc',
        glowColor: 'rgba(186, 230, 253, 0.3)',
        particleCount: 100,
        intensity: 0.5,
    },
    dp6: { // Beautiful Day — uplifting and light
        drawStyle: 'rising-bubbles',
        colors: ['#fde68a', '#fbcfe8', '#bfdbfe', '#c4b5fd'],
        bgColor: '#fefce8',
        glowColor: 'rgba(254, 240, 138, 0.3)',
        particleCount: 50,
        intensity: 0.75,
    },
    dp7: { // Pond Skimmer — stillness at water's edge
        drawStyle: 'water-ripples',
        colors: ['#5eead4', '#86efac', '#7dd3fc', '#a7f3d0'],
        bgColor: '#f0fdf4',
        glowColor: 'rgba(94, 234, 212, 0.3)',
        particleCount: 20,
        intensity: 0.55,
    },
};

// ============================================================================
// Album Data
// ============================================================================

// RAC Audius track IDs — cycled across Dreampeace tracks for audio playback
const STREAM_IDS = [
    'bbzxO', 'yy8W57d', 'B5NlV9m', 'wQm7Wdb', 'bQQp4PW',
    'ENXv2gR', 'xzGgY', '82oW3', '7AlA9', '92jww',
    'NkA3p', 'JZ2kp', 'WxA36', 'QxAkW', 'n1zqQ',
];

let _dpTrackIdx = 0;

function dpTrack(albumId: string, index: number, title: string, duration: number, artwork: string | null): Track {
    const idx = _dpTrackIdx++;
    return {
        id: `${albumId}-t${index}`,
        streamId: STREAM_IDS[idx % STREAM_IDS.length],
        title,
        duration,
        artwork,
        genre: 'Ambient',
        mood: 'Peaceful',
        playCount: 800 + Math.floor(Math.random() * 600),
        releaseDate: '2023-01-01',
        description: null,
    };
}

function dpAlbum(
    id: string, name: string, description: string, artwork: string | null,
    trackCount: number, titleFn: (i: number) => string
): Playlist {
    const tracks = Array.from({ length: trackCount }, (_, i) =>
        dpTrack(id, i, titleFn(i), 180 + Math.floor(Math.random() * 300), artwork)
    );
    return { id, name, description, artwork, trackCount, tracks, isAlbum: true };
}

export const DREAMPEACE_ALBUMS: Playlist[] = [
    dpAlbum('dp1', 'Tryptophan', 'A cozy, warm, light purple vibe. The first ambient collection.',
        '/images/dreampeace/tryptophan.jpg', 9, (i) => `Tryptophan Pt. ${i + 1}`),
    dpAlbum('dp2', 'Sky Gods', 'Features unique sweeps created using a custom-built tool.',
        '/images/dreampeace/skygods.jpg', 10, (i) => `Sky Gods Pt. ${i + 1}`),
    dpAlbum('dp3', 'Dawn Shifter', 'Ethereal morning soundscapes.',
        '/images/dreampeace/dawnshifter.jpg', 8, (i) => `Shift ${i + 1}`),
    dpAlbum('dp4', 'Space Oyster', 'Deep space meditation.',
        '/images/dreampeace/spaceoyster.jpg', 6, (i) => `Movement ${i + 1}`),
    dpAlbum('dp5', 'Snow Day', 'Quiet winter reflection.',
        '/images/dreampeace/snowday.jpg', 7, (i) => `Snow ${i + 1}`),
    dpAlbum('dp6', 'Beautiful Day', 'Uplifting and light.',
        '/images/dreampeace/beautifulday.jpg', 5, (i) => `Ray ${i + 1}`),
    dpAlbum('dp7', 'Pond Skimmer', 'Tranquil stillness at the water\'s edge.',
        '/images/dreampeace/pondskimmer.jpg', 6, (i) => `Skim ${i + 1}`),
];

export function getDreampeaceAlbum(albumId: string): Playlist | undefined {
    return DREAMPEACE_ALBUMS.find(a => a.id === albumId);
}
