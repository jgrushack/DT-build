import type { Track, Playlist } from '@/lib/types';

// ============================================================================
// Visualizer Theme Types — FlowField engine
//
// The visualizer is one unified ink-in-water engine driven per-album by a
// palette and a small set of flow parameters. There is no discrete "scene" —
// every album is the same dream, viewed under a different light.
// ============================================================================

export interface VisualizerTheme {
    colors: string[];           // 3-4 palette colors — drawn as soft luminous blobs
    bgColor: string;            // Cream substrate color — painted as the base of every frame
    glowColor: string;          // Retained for consumers (progress bar etc.); not used by engine
    intensity: number;          // 0-1, audio reactivity multiplier (bass/mids/highs → flow)

    // FlowField parameters
    flowAxisX: number;          // -1..1 — horizontal bias of feedback advection
    flowAxisY: number;          // -1..1 — vertical bias (positive = drift down)
    flowSpeed: number;          // 0..1 — how far the history canvas drifts per frame
    warpCurl: number;           // -1..1 — signed rotational component per frame
    warpZoom: number;           // 0..1 — slow outward (positive) or inward (negative) zoom
    blobCount: number;          // 2-4 — number of moving color blobs per frame
    blobScale: number;          // 0.5..2 — size multiplier on the pre-baked radial sprite
    pulseGain: number;          // 0..1 — how strongly bass contracts/expands the warp
    orbitRadius: number;        // 0..1 — how far blobs wander from center (as fraction of min(w,h))
    orbitSpeed: number;         // 0..1 — blob orbit speed
    feedbackDecay: number;      // 0.90..0.995 — how much history persists per frame (lower = shorter trails)

    // Page chrome tokens — unchanged
    fieldA: string;
    fieldB: string;
    ember: string;
}

// ============================================================================
// Per-Album Visualizer Themes — each album tunes the same engine to its mood.
// Color palettes preserved from the old discrete scenes so the art→visualizer
// handoff retains zero color delta.
// ============================================================================

export const VISUALIZER_THEMES: Record<string, VisualizerTheme> = {
    dp1: { // Tryptophan — warm lavender mist, cozy breath
        colors: ['#9a7fd8', '#7c5fc4', '#c89c6e', '#b39dd8'],
        bgColor: '#f5f0e8',
        glowColor: 'rgba(124, 95, 196, 0.35)',
        intensity: 0.7,
        flowAxisX: 0, flowAxisY: 0,
        flowSpeed: 0.28, warpCurl: 0.06, warpZoom: 0.12,
        blobCount: 3, blobScale: 1.3, pulseGain: 0.7,
        orbitRadius: 0.22, orbitSpeed: 0.18,
        feedbackDecay: 0.965,
        fieldA: 'rgba(124, 95, 196, 0.12)',
        fieldB: 'rgba(200, 156, 110, 0.08)',
        ember: '#7c5fc4',
    },
    dp2: { // Sky Gods — aurora, lateral sweep
        colors: ['#3fa9d6', '#4cb8a4', '#8a68c2', '#60b8d4'],
        bgColor: '#f2f4f0',
        glowColor: 'rgba(63, 169, 214, 0.35)',
        intensity: 0.8,
        flowAxisX: 0.75, flowAxisY: -0.15,
        flowSpeed: 0.48, warpCurl: 0.02, warpZoom: 0.04,
        blobCount: 3, blobScale: 1.6, pulseGain: 0.55,
        orbitRadius: 0.35, orbitSpeed: 0.22,
        feedbackDecay: 0.975,
        fieldA: 'rgba(76, 184, 164, 0.10)',
        fieldB: 'rgba(63, 169, 214, 0.08)',
        ember: '#3fa9d6',
    },
    dp3: { // Dawn Shifter — ember rising from horizon
        colors: ['#d98a5c', '#d4a257', '#c77f6a', '#9a7fd8'],
        bgColor: '#f7ede0',
        glowColor: 'rgba(217, 138, 92, 0.40)',
        intensity: 0.65,
        flowAxisX: 0.1, flowAxisY: -0.55,
        flowSpeed: 0.36, warpCurl: 0.12, warpZoom: 0.08,
        blobCount: 3, blobScale: 1.4, pulseGain: 0.65,
        orbitRadius: 0.24, orbitSpeed: 0.16,
        feedbackDecay: 0.97,
        fieldA: 'rgba(217, 138, 92, 0.14)',
        fieldB: 'rgba(154, 127, 216, 0.06)',
        ember: '#d98a5c',
    },
    dp4: { // Space Oyster — cosmic spiral, outward drift
        colors: ['#8a68c2', '#a87fd4', '#4fa8bc', '#b39dd8'],
        bgColor: '#f0ecf2',
        glowColor: 'rgba(138, 104, 194, 0.40)',
        intensity: 0.6,
        flowAxisX: 0, flowAxisY: 0,
        flowSpeed: 0.24, warpCurl: 0.28, warpZoom: 0.24,
        blobCount: 4, blobScale: 1.2, pulseGain: 0.5,
        orbitRadius: 0.38, orbitSpeed: 0.12,
        feedbackDecay: 0.98,
        fieldA: 'rgba(138, 104, 194, 0.12)',
        fieldB: 'rgba(79, 168, 188, 0.08)',
        ember: '#8a68c2',
    },
    dp5: { // Snow Day — still cold, slow downward drift
        colors: ['#6fa8c4', '#8a96c4', '#8b9ab0', '#9eb0c8'],
        bgColor: '#eff2f2',
        glowColor: 'rgba(111, 168, 196, 0.30)',
        intensity: 0.5,
        flowAxisX: 0.05, flowAxisY: 0.35,
        flowSpeed: 0.22, warpCurl: -0.04, warpZoom: 0.02,
        blobCount: 2, blobScale: 1.5, pulseGain: 0.4,
        orbitRadius: 0.18, orbitSpeed: 0.10,
        feedbackDecay: 0.955,
        fieldA: 'rgba(111, 168, 196, 0.10)',
        fieldB: 'rgba(138, 150, 196, 0.08)',
        ember: '#6fa8c4',
    },
    dp6: { // Beautiful Day — dusk bloom, warm upward lift
        colors: ['#d4a74a', '#d97f9e', '#d4a257', '#c77f6a'],
        bgColor: '#f7f0e4',
        glowColor: 'rgba(212, 167, 74, 0.35)',
        intensity: 0.75,
        flowAxisX: 0, flowAxisY: -0.28,
        flowSpeed: 0.32, warpCurl: 0.08, warpZoom: 0.14,
        blobCount: 3, blobScale: 1.5, pulseGain: 0.7,
        orbitRadius: 0.28, orbitSpeed: 0.2,
        feedbackDecay: 0.97,
        fieldA: 'rgba(212, 167, 74, 0.12)',
        fieldB: 'rgba(217, 127, 158, 0.08)',
        ember: '#d97f9e',
    },
    dp7: { // Pond Skimmer — calm water, breathing pulse
        colors: ['#3aa89a', '#5ca884', '#3fa9d6', '#6ac0a4'],
        bgColor: '#eef4f0',
        glowColor: 'rgba(58, 168, 154, 0.35)',
        intensity: 0.55,
        flowAxisX: 0, flowAxisY: 0,
        flowSpeed: 0.2, warpCurl: -0.02, warpZoom: -0.06,
        blobCount: 3, blobScale: 1.3, pulseGain: 0.8,
        orbitRadius: 0.16, orbitSpeed: 0.14,
        feedbackDecay: 0.96,
        fieldA: 'rgba(58, 168, 154, 0.10)',
        fieldB: 'rgba(92, 168, 132, 0.08)',
        ember: '#3aa89a',
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

// Track names scraped from dreampeace.net/{album-slug}/ on 2026-04-20.
// Album-to-tracks mapping preserves the exact canonical titles from each page.
function dpAlbumWithTracks(
    id: string,
    name: string,
    description: string,
    artwork: string,
    trackTitles: string[]
): Playlist {
    const tracks = trackTitles.map((title, i) =>
        dpTrack(id, i, title, 180 + Math.floor(Math.random() * 300), artwork)
    );
    return { id, name, description, artwork, trackCount: trackTitles.length, tracks, isAlbum: true };
}

export const DREAMPEACE_ALBUMS: Playlist[] = [
    dpAlbumWithTracks(
        'dp1',
        'Tryptophan',
        "Written around Thanksgiving, originally released as \u201CGuitar Improvisation #1.\u201D Reworked here \u2014 the first attempt at this format. A bit less developed than the others, but has a cozy, warm, light-purple vibe.",
        '/images/dreampeace/tryptophan.jpg',
        [
            'Sudden Sparks',
            'Reflecting Our Time',
            'To A Good Night',
            'Mysterious Wave',
            'Dusts and Chasma',
            'The Night Is An Alley',
            'For Your Health',
            'Syllables of Soft',
            'Torrid Balm',
        ]
    ),
    dpAlbumWithTracks(
        'dp2',
        'Sky Gods',
        "A reworked version of \u201CGuitar Improvisation #2,\u201D a bit more ominous than the prior album. Recorded in standard tuning, using a homemade box built from a repurposed wah pedal capacitor to control the sweeps. The first attempt at creating custom tools for this type of music.",
        '/images/dreampeace/skygods.jpg',
        [
            'Aakifa',
            'With Our Soul',
            'A Thousand Suns',
            'Bayan',
            'Towards The Moon',
            'In The Silence',
            'Answered',
            'Never Going Home',
            'Only Vibrations',
            'Aalaa',
        ]
    ),
    dpAlbumWithTracks(
        'dp3',
        'Dawn Shifter',
        "A reworked version of \u201CGuitar Improvisation #3,\u201D one of Devin\u2019s favourites of the bunch. Uses handmade instruments and a platform with a strangely wired pickup, fed ambient sound through several effects units.",
        '/images/dreampeace/dawnshifter.jpg',
        [
            'Silent Resignation',
            'Twilight Sensation',
            'Jarrah',
            'Kalina',
            'Morning Prayer',
            'Mind The Door',
            'Listen Through The Clouds',
            'Taquanee',
            'Fill The Baskets',
            'Let Go, Let God\u2026',
        ]
    ),
    dpAlbumWithTracks(
        'dp4',
        'Space Oyster',
        "Made during a snowy Vancouver winter, shoveling and listening on loop. The working title stuck. Accompanied him through touring as well.",
        '/images/dreampeace/spaceoyster.jpg',
        [
            'Cosmic Drifts',
            'Quiet Morning',
            'Be with Me',
            'Fear no Solace',
            'Deep Field',
            'To be with Her',
            'Nebula',
            'All is in the Echo',
            'Space Oyster',
        ]
    ),
    dpAlbumWithTracks(
        'dp5',
        'Snow Day',
        "Originally released online as \u201CDreampiece,\u201D reworked to fit the format. A minimal, evocative piece \u2014 the one where the footing was found. Listened to a lot.",
        '/images/dreampeace/snowday.jpg',
        [
            'I Remember This Path',
            'She Knows Me',
            'White Earth',
            'Deafened To Chaos',
            'Yindi Depths',
            'Silent Surrender',
        ]
    ),
    dpAlbumWithTracks(
        'dp6',
        'Beautiful Day',
        "\u201CSnuggles,\u201D put into the Dreampeace format because it needed a home. One of Devin\u2019s favourite pieces of music he\u2019s made \u2014 still a wonder to him.",
        '/images/dreampeace/beautifulday.jpg',
        [
            'Beyond Measure',
            'Blue Dot',
            'Drifting And Dreaming',
            'Sundance',
            'Minds Are Changing',
            'The Ocean',
            'Distant, Elegant',
            'Replikiss',
            'I Agree',
            'Tryst',
            'Sunset Rump',
            'The Option',
        ]
    ),
    dpAlbumWithTracks(
        'dp7',
        'Pond Skimmer',
        "A few friends needed to skim debris off a pond one summer. He worked on this in the mornings and played it from a speaker while they skimmed. A good memory.",
        '/images/dreampeace/pondskimmer.jpg',
        [
            'Dragonflies',
            'Puff 2',
            'Building A Deck',
            'Summer Sauna',
            'No Choice But To Submit',
            'New Friends, Old Issue',
            'Fishing Note',
            'Its All So Strange',
            'Dusk',
        ]
    ),
];

export function getDreampeaceAlbum(albumId: string): Playlist | undefined {
    return DREAMPEACE_ALBUMS.find(a => a.id === albumId);
}

// ============================================================================
// Per-album credits — scraped from dreampeace.net/{slug}/ on 2026-04-21.
// Credits vary album-to-album (different mastering engineers, guest composers,
// website designer, additional editors). `note` holds scope qualifiers like
// "(Blue Dot)" for track-specific credits.
// ============================================================================

export interface Credit {
    role: string;
    name: string;
    note?: string;
}

export const ALBUM_CREDITS: Record<string, Credit[]> = {
    dp1: [ // Tryptophan
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Recording', name: 'Devin Townsend' },
        { role: 'Performance', name: 'Devin Townsend' },
        { role: 'Writing', name: 'Devin Townsend' },
        { role: 'Mixing', name: 'Devin Townsend' },
        { role: 'Mastering', name: 'Ben Searles' },
        { role: 'Cover Art', name: 'Travis Smith' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
    dp2: [ // Sky Gods
        { role: 'Composition', name: 'Devin Townsend' },
        { role: 'Production', name: 'Devin Townsend' },
        { role: 'Recording', name: 'Devin Townsend' },
        { role: 'Performance', name: 'Devin Townsend' },
        { role: 'Mixing', name: 'Devin Townsend' },
        { role: 'Mastering', name: 'Ben Searles' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
    dp3: [ // Dawn Shifter
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Performer', name: 'Devin Townsend' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Recording Engineer', name: 'Devin Townsend' },
        { role: 'Mixer', name: 'Devin Townsend' },
        { role: 'Mastering', name: 'Ben Searles' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
    dp4: [ // Space Oyster
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Performer', name: 'Devin Townsend' },
        { role: 'Recording Engineer', name: 'Devin Townsend' },
        { role: 'Mixer', name: 'Devin Townsend' },
        { role: 'Mastering Engineer', name: 'Ben Searles' },
        { role: 'Artwork', name: 'Travis Smith' },
        { role: 'Publisher', name: 'HevyDevy Records' },
    ],
    dp5: [ // Snow Day
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Performer', name: 'Devin Townsend' },
        { role: 'Recorded by', name: 'Devin Townsend' },
        { role: 'Written by', name: 'Devin Townsend' },
        { role: 'Mixed by', name: 'Devin Townsend' },
        { role: 'Mastered by', name: 'Ben Searles' },
        { role: 'Artwork', name: 'Travis Smith' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
    dp6: [ // Beautiful Day — distinct: guest co-composer, different mastering engineer, additional editor
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Co-Composer', name: 'Ché Aimee Dorval', note: 'Blue Dot' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Engineer', name: 'Devin Townsend' },
        { role: 'Editor', name: 'Devin Townsend' },
        { role: 'Mixer', name: 'Devin Townsend' },
        { role: 'Additional Editor', name: 'Leonardo Delgado' },
        { role: 'Mastering Engineer', name: 'Troy Glessner' },
        { role: 'Artwork', name: 'Travis Smith' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
    dp7: [ // Pond Skimmer
        { role: 'Composer', name: 'Devin Townsend' },
        { role: 'Producer', name: 'Devin Townsend' },
        { role: 'Performer', name: 'Devin Townsend' },
        { role: 'Recording Engineer', name: 'Devin Townsend' },
        { role: 'Mixer', name: 'Devin Townsend' },
        { role: 'Mastering Engineer', name: 'Ben Searles' },
        { role: 'Cover Art', name: 'Travis Smith' },
        { role: 'Publisher', name: 'HevyDevy Records', note: 'administered by Kobalt Music, Ltd.' },
    ],
};

export function getAlbumCredits(albumId: string): Credit[] {
    return ALBUM_CREDITS[albumId] || [];
}
