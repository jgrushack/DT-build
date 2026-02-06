import { searchTracks } from '../src/lib/audius';

async function findAmbientTrack() {
    console.log('Searching for "089: Meditation"...');
    try {
        const tracks = await searchTracks('Meditation');

        if (tracks && tracks.length > 0) {
            const track = tracks[0];
            console.log('Found Track:');
            console.log(`Title: ${track.title}`);
            console.log(`ID: ${track.id}`);
            console.log(`User: ${track.user.name}`);
            console.log(`Duration: ${track.duration}s`);
        } else {
            console.log('Track not found.');
        }
    } catch (error) {
        console.error('Error finding track:', error);
    }
}

findAmbientTrack();
