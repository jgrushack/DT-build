// Test script for the Audius SDK abstraction layer
// Run with: npx tsx scripts/test-audius.ts

import * as fs from 'fs';
import * as path from 'path';
import {
    getArtistProfile,
    getArtistById,
    getArtistTracks,
    getArtistPlaylists,
    getTrack,
    getStreamUrl,
    getTrendingTracks,
    searchTracks,
    formatDuration,
    formatPlayCount,
} from '../src/lib/audius';

// Load artist data from the discovery script
const artistDataPath = path.join(__dirname, 'artist-data.json');
const artistData = JSON.parse(fs.readFileSync(artistDataPath, 'utf-8'));

const ARTIST_ID = artistData.artist.id; // nkwv1 (RAC)
const ARTIST_HANDLE = artistData.artist.handle; // RAC
const SAMPLE_TRACK_ID = artistData.tracks[0]?.id; // First track

async function runTests() {
    console.log('🧪 Testing Audius SDK Abstraction Layer\n');
    console.log('='.repeat(60));

    // Test 1: getArtistProfile
    console.log('\n📋 Test 1: getArtistProfile("' + ARTIST_HANDLE + '")');
    const artist = await getArtistProfile(ARTIST_HANDLE);
    if (artist) {
        console.log('✅ Success!');
        console.log(`   Name: ${artist.name}`);
        console.log(`   Handle: @${artist.handle}`);
        console.log(`   ID: ${artist.id}`);
        console.log(`   Followers: ${formatPlayCount(artist.followerCount)}`);
        console.log(`   Tracks: ${artist.trackCount}`);
        console.log(`   Bio: ${artist.bio?.substring(0, 50)}...`);
    } else {
        console.log('❌ Failed to fetch artist profile');
    }

    // Test 2: getArtistById
    console.log('\n📋 Test 2: getArtistById("' + ARTIST_ID + '")');
    const artistById = await getArtistById(ARTIST_ID);
    if (artistById) {
        console.log('✅ Success!');
        console.log(`   Name: ${artistById.name}`);
    } else {
        console.log('❌ Failed to fetch artist by ID');
    }

    // Test 3: getArtistTracks
    console.log('\n📋 Test 3: getArtistTracks("' + ARTIST_ID + '", 10)');
    const tracksResponse = await getArtistTracks(ARTIST_ID, 10);
    console.log(`✅ Found ${tracksResponse.data.length} tracks`);
    tracksResponse.data.slice(0, 3).forEach((track, i) => {
        console.log(`   ${i + 1}. ${track.title} (${formatDuration(track.duration)}) - ${formatPlayCount(track.playCount)} plays`);
    });

    // Test 4: getArtistPlaylists
    console.log('\n📋 Test 4: getArtistPlaylists("' + ARTIST_ID + '")');
    const playlists = await getArtistPlaylists(ARTIST_ID);
    console.log(`✅ Found ${playlists.length} playlists`);
    playlists.slice(0, 3).forEach((playlist) => {
        console.log(`   - ${playlist.name} (${playlist.trackCount} tracks) ${playlist.isAlbum ? '[Album]' : ''}`);
    });

    // Test 5: getTrack
    if (SAMPLE_TRACK_ID) {
        console.log('\n📋 Test 5: getTrack("' + SAMPLE_TRACK_ID + '")');
        const track = await getTrack(SAMPLE_TRACK_ID);
        if (track) {
            console.log('✅ Success!');
            console.log(`   Title: ${track.title}`);
            console.log(`   Duration: ${formatDuration(track.duration)}`);
            console.log(`   Genre: ${track.genre || 'N/A'}`);
            console.log(`   Mood: ${track.mood || 'N/A'}`);
            console.log(`   Play Count: ${formatPlayCount(track.playCount)}`);
            console.log(`   Release Date: ${track.releaseDate || 'N/A'}`);
            console.log(`   Artwork: ${track.artwork ? 'Yes' : 'No'}`);
        } else {
            console.log('❌ Failed to fetch track');
        }
    }

    // Test 6: getStreamUrl
    if (SAMPLE_TRACK_ID) {
        console.log('\n📋 Test 6: getStreamUrl("' + SAMPLE_TRACK_ID + '")');
        const streamResult = await getStreamUrl(SAMPLE_TRACK_ID);
        if (streamResult.url) {
            console.log('✅ Success!');
            console.log(`   URL: ${streamResult.url.substring(0, 80)}...`);
        } else {
            console.log(`⚠️  Stream unavailable: ${streamResult.error}`);
        }
    }

    // Test 7: getTrendingTracks
    console.log('\n📋 Test 7: getTrendingTracks("' + ARTIST_ID + '", 5)');
    const trending = await getTrendingTracks(ARTIST_ID, 5);
    console.log(`✅ Top ${trending.length} tracks by play count:`);
    trending.forEach((track, i) => {
        console.log(`   ${i + 1}. ${track.title} - ${formatPlayCount(track.playCount)} plays`);
    });

    // Test 8: searchTracks
    console.log('\n📋 Test 8: searchTracks("RAC")');
    const searchResults = await searchTracks('RAC');
    console.log(`✅ Found ${searchResults.length} results`);
    searchResults.slice(0, 3).forEach((track) => {
        console.log(`   - ${track.title}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!');
    console.log('='.repeat(60));
}

runTests().catch(console.error);
