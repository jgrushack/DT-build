import { sdk } from '@audius/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Initialize the Audius SDK
const audiusSdk = sdk({
    appName: 'artist-portal-mvp',
});

interface ArtistData {
    artist: {
        id: string;
        handle: string;
        name: string;
        bio: string | null;
        followerCount: number;
        trackCount: number;
        profilePicture: string | null;
        coverPhoto: string | null;
    };
    tracks: Array<{
        id: string;
        title: string;
        duration: number;
        artwork: string | null;
        genre: string | null;
        mood: string | null;
        playCount: number;
        releaseDate: string | null;
        description: string | null;
    }>;
    playlists: Array<{
        id: string;
        name: string;
        description: string | null;
        artwork: string | null;
        trackCount: number;
        isAlbum: boolean;
    }>;
}

async function findArtist(handle: string): Promise<ArtistData | null> {
    console.log(`\n🔍 Searching for artist: ${handle}...`);

    try {
        // Search for the artist
        const searchResults = await audiusSdk.users.searchUsers({ query: handle });

        if (!searchResults.data || searchResults.data.length === 0) {
            console.log(`❌ No artist found with handle: ${handle}`);
            return null;
        }

        // Find the exact match or first result
        const artist = searchResults.data.find(
            (u) => u.handle?.toLowerCase() === handle.toLowerCase()
        ) || searchResults.data[0];

        console.log(`✅ Found artist: ${artist.name} (@${artist.handle})`);
        console.log(`   Followers: ${artist.followerCount}`);
        console.log(`   Track Count: ${artist.trackCount}`);

        // Fetch the artist's tracks
        console.log(`\n📀 Fetching tracks...`);
        const tracksResponse = await audiusSdk.users.getTracksByUser({
            id: artist.id,
            limit: 50,
        });

        const tracks = (tracksResponse.data || []).map((track) => ({
            id: track.id,
            title: track.title,
            duration: track.duration,
            artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || null,
            genre: track.genre || null,
            mood: track.mood || null,
            playCount: track.playCount || 0,
            releaseDate: track.releaseDate || null,
            description: track.description || null,
        }));

        console.log(`   Found ${tracks.length} tracks`);

        // Fetch the artist's playlists/albums
        console.log(`\n📁 Fetching playlists/albums...`);
        const playlistsResponse = await audiusSdk.users.getPlaylistsByUser({
            id: artist.id,
        });

        const playlists = (playlistsResponse.data || []).map((playlist) => ({
            id: playlist.id,
            name: playlist.playlistName,
            description: playlist.description || null,
            artwork: playlist.artwork?.['480x480'] || playlist.artwork?.['150x150'] || null,
            trackCount: playlist.trackCount || 0,
            isAlbum: playlist.isAlbum || false,
        }));

        console.log(`   Found ${playlists.length} playlists/albums`);

        const artistData: ArtistData = {
            artist: {
                id: artist.id,
                handle: artist.handle || '',
                name: artist.name || '',
                bio: artist.bio || null,
                followerCount: artist.followerCount || 0,
                trackCount: artist.trackCount || 0,
                profilePicture: artist.profilePicture?.['480x480'] || artist.profilePicture?.['150x150'] || null,
                coverPhoto: artist.coverPhoto?.['2000x'] || artist.coverPhoto?.['640x'] || null,
            },
            tracks,
            playlists,
        };

        return artistData;
    } catch (error) {
        console.error(`❌ Error fetching artist data:`, error);
        return null;
    }
}

async function main() {
    // List of artists to try (in order of preference)
    const artistsToTry = ['RAC', 'deadmau5', '3LAU', 'Skrillex'];

    let artistData: ArtistData | null = null;

    for (const artist of artistsToTry) {
        artistData = await findArtist(artist);

        if (artistData && artistData.tracks.length >= 15) {
            console.log(`\n✨ Using ${artistData.artist.name} - has ${artistData.tracks.length} tracks`);
            break;
        } else if (artistData) {
            console.log(`⚠️  ${artistData.artist.name} only has ${artistData.tracks.length} tracks, trying next...`);
            artistData = null;
        }
    }

    if (!artistData) {
        console.log('\n❌ Could not find a suitable artist with 15+ tracks');
        process.exit(1);
    }

    // Write the data to a JSON file
    const outputPath = path.join(__dirname, 'artist-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(artistData, null, 2));
    console.log(`\n📝 Saved artist data to ${outputPath}`);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('ARTIST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Name: ${artistData.artist.name}`);
    console.log(`Handle: @${artistData.artist.handle}`);
    console.log(`ID: ${artistData.artist.id}`);
    console.log(`Followers: ${artistData.artist.followerCount.toLocaleString()}`);
    console.log(`Tracks: ${artistData.tracks.length}`);
    console.log(`Playlists/Albums: ${artistData.playlists.length}`);
    console.log('\nTop 5 Tracks by Play Count:');
    artistData.tracks
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 5)
        .forEach((track, i) => {
            console.log(`  ${i + 1}. ${track.title} (${track.playCount.toLocaleString()} plays)`);
        });
}

main().catch(console.error);
