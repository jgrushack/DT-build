// Devin Townsend complete catalog with RAC placeholder audio
// Each track displays DT info but streams a RAC track from Audius

import type { Track, Playlist, Artist } from './types';

// RAC's Audius track IDs — cycled across all DT tracks for playback
const RAC_TRACK_IDS = [
    'bbzxO', 'yy8W57d', 'B5NlV9m', 'wQm7Wdb', 'bQQp4PW',
    'ENXv2gR', 'xzGgY', '82oW3', '7AlA9', '92jww',
    'NkA3p', 'JZ2kp', 'WxA36', 'QxAkW', 'n1zqQ',
];

let _trackIndex = 0;

function t(title: string, duration: number, artwork: string | null, genre: string, playCount: number, releaseDate: string): Track {
    const idx = _trackIndex++;
    return {
        id: `dt-${idx}`,
        streamId: RAC_TRACK_IDS[idx % RAC_TRACK_IDS.length],
        title,
        duration,
        artwork,
        genre,
        mood: null,
        playCount,
        releaseDate,
        description: null,
    };
}

function album(
    id: string, name: string, description: string, artwork: string | null,
    year: number, genre: string, basePlayCount: number,
    trackData: [string, number][]
): Playlist {
    const date = `${year}-01-01`;
    const tracks = trackData.map(([title, dur], i) =>
        t(title, dur, artwork, genre, basePlayCount + Math.floor(Math.random() * basePlayCount * 0.5), date)
    );
    return { id, name, description, artwork, trackCount: tracks.length, tracks, isAlbum: true };
}

// ============================================================================
// ALBUMS
// ============================================================================

export const DT_ALBUMS: Playlist[] = [
    album('ocean-machine', 'Ocean Machine: Biomech', 'Townsend\'s breakthrough solo work — progressive metal with ambient textures and soaring melodies about loss, hope, and transcendence.', '/images/albums/ocean-machine.jpg', 1997, 'Progressive Metal', 45000, [
        ['Seventh Wave', 410], ['Life', 271], ['Night', 285], ['Hide Nowhere', 300],
        ['Sister', 168], ['3 A.M.', 116], ['Voices in the Fan', 279], ['Greetings', 173],
        ['Regulator', 306], ['Funeral', 486], ['Bastard', 617],
        ['The Death of Music', 735], ['Things Beyond Things', 287],
    ]),
    album('infinity', 'Infinity', 'A manic, psychedelic wall-of-sound record born from intense creative frenzy. Dense layering and unconventional structures.', '/images/albums/infinity.jpg', 1998, 'Progressive Metal', 32000, [
        ['Truth', 238], ['Christeen', 221], ['Bad Devil', 292], ['War', 389],
        ['Soul Driven (Cadillac)', 314], ['Ants', 121], ['(Wild) Colonial Boy', 184],
        ['(Life is All) Dynamics', 308], ['Unity', 367], ['Noisy Pink Bubbles', 322],
    ]),
    album('physicist', 'Physicist', 'Aggressive, industrial-tinged metal recorded with the Strapping Young Lad lineup. Raw intensity through signature production.', '/images/albums/physicist.jpg', 2000, 'Industrial Metal', 28000, [
        ['Namaste', 223], ['Victim', 195], ['Material', 167], ['Kingdom', 354],
        ['Death', 146], ['Devoid', 88], ['The Complex', 210], ['Irish Maiden', 164],
        ['Jupiter', 216], ['Planet Rain', 668],
    ]),
    album('terria', 'Terria', 'An expansive, nature-inspired progressive metal epic evoking the vast Canadian landscape. Cinematic and deeply emotional.', '/images/albums/terria.jpg', 2001, 'Progressive Metal', 52000, [
        ['Olives', 201], ['Mountain', 392], ['Earth Day', 575], ['Deep Peace', 454],
        ['Canada', 413], ['Down and Under', 223], ['The Fluke', 436],
        ['Nobody\'s Here', 414], ['Tiny Tears', 552], ['Stagnant', 325], ['Humble', 330],
    ]),
    album('accelerated-evolution', 'Accelerated Evolution', 'The first Devin Townsend Band album. More song-oriented and accessible, with a balance of ambient passages and heavy riffs.', '/images/albums/accelerated-evolution.jpg', 2003, 'Progressive Metal', 38000, [
        ['Depth Charge', 364], ['Storm', 279], ['Random Analysis', 359],
        ['Deadhead', 485], ['Suicide', 405], ['Traveller', 253],
        ['Away', 469], ['Sunday Afternoon', 380], ['Slow Me Down', 275],
    ]),
    album('synchestra', 'Synchestra', 'A concept album about interconnectedness — the last track loops into the first. Intricate arrangements and orchestral elements.', '/images/albums/synchestra.jpg', 2006, 'Progressive Rock', 30000, [
        ['Let It Roll', 172], ['Hypergeek', 140], ['Triumph', 428], ['Babysong', 330],
        ['Vampolka', 96], ['Vampira', 207], ['Mental Tan', 135], ['Gaia', 363],
        ['Pixillate', 497], ['Judgement', 355], ['A Simple Lullaby', 429],
        ['Sunset', 151], ['Notes from Africa', 462], ['Sunshine and Happiness', 155],
    ]),
    album('ziltoid', 'Ziltoid the Omniscient', 'A comedic sci-fi concept album about an alien puppet demanding the universe\'s ultimate cup of coffee. Progressive metal meets theatrical absurdity.', '/images/albums/ziltoid.jpg', 2007, 'Progressive Metal', 42000, [
        ['ZTO', 77], ['By Your Command', 489], ['Ziltoidia Attaxx!!!', 222],
        ['Solar Winds', 586], ['Hyperdrive', 227], ['N9', 330],
        ['Planet Smasher', 345], ['Omnidimensional Creator', 48],
        ['Color Your World', 584], ['The Greys', 255], ['Tall Latte', 63],
    ]),
    album('ki', 'Ki', 'The first album in the four-part quadrology. Deliberately restrained, quiet, and introspective — exploring dynamics, space, and subtlety.', '/images/albums/ki.jpg', 2009, 'Progressive Rock', 35000, [
        ['A Monday', 103], ['Coast', 276], ['Disruptr', 349], ['Gato', 323],
        ['Terminal', 418], ['Heaven\'s End', 534], ['Ain\'t Never Gonna Win', 197],
        ['Winter', 288], ['Trainfire', 359], ['Lady Helen', 365],
        ['Ki', 441], ['Quiet Riot', 182], ['Demon League', 175],
    ]),
    album('addicted', 'Addicted', 'The polar opposite of Ki — joyful, hook-driven pop-metal featuring Anneke van Giersbergen. Catchy, upbeat, and unapologetically fun.', '/images/albums/addicted.jpg', 2009, 'Pop Metal', 55000, [
        ['Addicted!', 337], ['Universe in a Ball!', 249], ['Bend It Like Bender!', 217],
        ['Supercrush!', 313], ['Hyperdrive!', 216], ['Resolve!', 192],
        ['Ih-Ah!', 225], ['The Way Home!', 194], ['Numbered!', 295], ['Awake!!', 584],
    ]),
    album('deconstruction', 'Deconstruction', 'Townsend\'s heaviest, most complex solo work. A maximalist progressive metal opera about existence featuring a full orchestra and guest vocalists.', '/images/albums/deconstruction.jpg', 2011, 'Progressive Metal', 48000, [
        ['Praise the Lowered', 362], ['Stand', 576], ['Juular', 226],
        ['Planet of the Apes', 659], ['Sumeria', 397],
        ['The Mighty Masturbator', 988], ['Pandemic', 209],
        ['Deconstruction', 567], ['Poltergeist', 265], ['Ho Krll', 358],
    ]),
    album('ghost', 'Ghost', 'The final quadrology album — Townsend\'s most gentle and ambient work. Ethereal, meditative, and dreamlike with no metal elements.', '/images/albums/ghost.jpg', 2011, 'Ambient', 40000, [
        ['Fly', 255], ['Heart Baby', 355], ['Feather', 690], ['Kawaii', 172],
        ['Ghost', 384], ['Blackberry', 293], ['Monsoon', 277], ['Dark Matters', 117],
        ['Texada', 570], ['Seams', 244], ['Infinite Ocean', 481], ['As You Were', 527],
    ]),
    album('epicloud', 'Epicloud', 'Triumphant, anthemic arena-rock featuring Anneke van Giersbergen. Deliberately uplifting with massive choruses — Townsend\'s most accessible record.', '/images/albums/epicloud.jpg', 2012, 'Progressive Rock', 58000, [
        ['Effervescent!', 44], ['True North', 233], ['Lucky Animals', 201],
        ['Liberation', 201], ['Where We Belong', 267], ['Save Our Now', 248],
        ['Kingdom', 329], ['Divine', 197], ['Grace', 369],
        ['More!', 245], ['Lessons', 67], ['Hold On', 237], ['Angel', 354],
    ]),
    album('casualties-of-cool', 'Casualties of Cool', 'A haunting side project blending ambient, country, and blues. Dark, spacious, and cinematic — like a ghostly desert soundtrack.', '/images/albums/casualties-of-cool.jpg', 2014, 'Ambient Country', 25000, [
        ['Daddy', 311], ['Mountaintop', 333], ['Flight', 332], ['The Code', 281],
        ['Moon', 388], ['Pier', 219], ['Ether', 290], ['Hejda', 220],
        ['Forgive Me', 360], ['Broken', 119], ['Bones', 219],
        ['Deathscope', 373], ['The Field', 241], ['The Bridge', 493], ['Pure', 248],
    ]),
    album('z-squared', 'Z²', 'An ambitious double album: Sky Blue (melodic pop-metal with Anneke) and Dark Matters (the Ziltoid sequel). Spans Townsend\'s full range.', '/images/albums/z-squared.jpg', 2014, 'Progressive Metal', 36000, [
        ['Rejoice', 256], ['Fallout', 270], ['Midnight Sun', 298], ['A New Reign', 292],
        ['Universal Flame', 279], ['Warrior', 211], ['Sky Blue', 232],
        ['Silent Militia', 268], ['Rain City', 465], ['Forever', 225],
        ['Before We Die', 504], ['The Ones Who Love', 92],
        ['Z-Squared', 239], ['From Sleep Awake', 180], ['Ziltoidian Empire', 386],
        ['War Princess', 498], ['Deathray', 283], ['March of the Poozers', 385],
        ['Wandering Eye', 221], ['Earth', 459], ['Ziltoid Goes Home', 380],
        ['Through the Wormhole', 224], ['Dimension Z', 373],
    ]),
    album('transcendence', 'Transcendence', 'The final Devin Townsend Project album. Lush, orchestral progressive metal blending heaviness with ethereal beauty.', '/images/albums/transcendence.jpg', 2016, 'Progressive Metal', 44000, [
        ['Truth', 287], ['Stormbending', 322], ['Failure', 362],
        ['Secret Sciences', 448], ['Higher', 580], ['Stars', 258],
        ['Transcendence', 355], ['Offer Your Light', 238],
        ['From the Heart', 503], ['Transdermal Celebration', 506],
    ]),
    album('empath', 'Empath', 'Townsend\'s most genre-defying work — from brutal metal to Disney orchestral to new age, sometimes within a single song. The 23-minute "Singularity" suite is a career-defining epic.', '/images/albums/empath.jpg', 2019, 'Progressive Metal', 62000, [
        ['Castaway', 148], ['Genesis', 365], ['Spirits Will Collide', 279],
        ['Evermore', 330], ['Sprite', 397], ['Hear Me', 390],
        ['Why?', 299], ['Borderlands', 662], ['Requiem', 166], ['Singularity', 1413],
    ]),
    album('the-puzzle', 'The Puzzle', 'An eclectic, experimental singer-songwriter album with short-form compositions jumping between genres. Quirky, intimate, and unpredictable.', '/images/albums/the-puzzle.jpg', 2021, 'Art Rock', 18000, [
        ['Chromatic Ridge', 224], ['Life Is But a Dream', 210], ['Yucky Lung', 83],
        ['Kittenhead', 73], ['Shark in the Ice', 109], ['Devil in the Details', 58],
        ['Hammerhead Sugarplum', 227], ['Me and the Moon', 252],
        ['Anxiety in Pyjamas', 209], ['The Yugas', 181], ['Albert Hall', 239],
        ['Starchasm', 239], ['Perfect Owl', 138], ['Maybe Over the Void', 176],
        ['Light Year Whale', 271], ['Frogflowers', 71], ['Mother', 268],
        ['Southern Sky Geometry', 131], ['The Puzzle', 323], ['Monuments of Glitch', 443],
    ]),
    album('snuggles', 'Snuggles', 'A seamless ambient/new-age record designed as a continuous listening experience. Gentle, meditative, and flowing.', '/images/albums/snuggles.jpg', 2021, 'Ambient', 22000, [
        ['Beyond Measure', 91], ['Blue Dot', 188], ['Drifting and Dreaming', 267],
        ['Sundance', 53], ['Minds Are Changing', 226], ['The Ocean', 295],
        ['Distant, Elegant', 214], ['Replikiss', 213], ['I Agree', 204],
        ['Tryst', 210], ['Sunset Rump', 93], ['The Option', 264],
    ]),
    album('lightwork', 'Lightwork', 'A return to song-oriented, accessible progressive rock. Warm, melodic, and polished — mature, focused writing after years of experimental sprawl.', '/images/albums/lightwork.jpg', 2022, 'Progressive Rock', 34000, [
        ['Moonpeople', 284], ['Lightwork', 329], ['Equinox', 279],
        ['Call of the Void', 335], ['Heartbreaker', 420], ['Dimensions', 323],
        ['Celestial Signals', 312], ['Heavy Burden', 323],
        ['Vacation', 190], ['Children of God', 606],
    ]),
    album('powernerd', 'PowerNerd', 'Deliberately straightforward, riff-driven hard rock. Short songs, big hooks, minimal experimentation — a love letter to the joy of loud guitar music.', '/images/albums/powernerd.jpg', 2024, 'Hard Rock', 50000, [
        ['PowerNerd', 208], ['Falling Apart', 263], ['Knuckledragger', 270],
        ['Gratitude', 209], ['Dreams of Light', 54], ['Ubelia', 238],
        ['Jainism', 256], ['Younger Lover', 249], ['Glacier', 262],
        ['Goodbye', 358], ['Ruby Quaker', 272],
    ]),
];

// ============================================================================
// ARTIST
// ============================================================================

export const DT_ARTIST: Artist = {
    id: 'devin-townsend',
    handle: 'devintownsend',
    name: 'Devin Townsend',
    bio: 'Canadian musician, singer, songwriter, and producer known for his expansive sonic palette spanning progressive metal, ambient, pop, and everything in between.',
    profileImage: null,
    coverImage: null,
    followerCount: 0,
    trackCount: DT_ALBUMS.reduce((sum, a) => sum + a.trackCount, 0),
};

// ============================================================================
// QUERY HELPERS
// ============================================================================

/** All tracks across all albums */
export function getAllDTTracks(): Track[] {
    return DT_ALBUMS.flatMap(a => a.tracks);
}

/** Top tracks sorted by play count */
export function getPopularDTTracks(limit = 8): Track[] {
    return getAllDTTracks()
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, limit);
}

/** All unique genres */
export function getDTGenres(): string[] {
    const genres = new Set<string>();
    for (const track of getAllDTTracks()) {
        if (track.genre) genres.add(track.genre);
    }
    return [...genres];
}

/** Find album by ID */
export function getDTAlbum(albumId: string): Playlist | undefined {
    return DT_ALBUMS.find(a => a.id === albumId);
}
