import { getArtistById, getArtistTracks, getArtistPlaylists } from '@/lib/audius';
import CatalogClient from './catalog-client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// RAC's Audius ID
const ARTIST_ID = 'nkwv1';

export const revalidate = 300; // ISR - revalidate every 5 minutes

export const metadata = {
    title: 'Full Catalog | Artist Portal',
    description: 'Browse the complete music catalog',
};

export default async function CatalogPage() {
    // Fetch all data server-side
    const [artist, tracksResponse, playlists] = await Promise.all([
        getArtistById(ARTIST_ID),
        getArtistTracks(ARTIST_ID, 100),
        getArtistPlaylists(ARTIST_ID),
    ]);

    if (!artist) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                <p>Unable to load catalog. Please try again later.</p>
            </div>
        );
    }

    // Extract unique genres for filtering
    const genres = [...new Set(tracksResponse.data.map(t => t.genre).filter((g): g is string => g !== null))];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">
                            {artist.name}&apos;s Catalog
                        </h1>
                        <p className="text-zinc-500 mt-2">
                            {tracksResponse.data.length} tracks · {playlists.length} playlists
                        </p>
                    </div>

                    {/* Client-side interactive catalog */}
                    <CatalogClient
                        tracks={tracksResponse.data}
                        playlists={playlists}
                        genres={genres}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
