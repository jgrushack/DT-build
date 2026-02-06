import { getArtistById, getArtistTracks, getArtistAlbums, getArtistPlaylists } from '@/lib/audius';
import { getAllContentAccess } from '@/lib/access';
import CatalogClient from './catalog-client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ARTIST_ID = 'nkwv1';

export const revalidate = 300;

export const metadata = {
    title: 'Full Catalog | Devin Townsend',
    description: 'Browse Devin Townsend\'s complete music catalog',
};

export default async function CatalogPage() {
    const [artist, tracksResponse, albums, playlists, accessRules] = await Promise.all([
        getArtistById(ARTIST_ID),
        getArtistTracks(ARTIST_ID, 100),
        getArtistAlbums(ARTIST_ID),
        getArtistPlaylists(ARTIST_ID),
        getAllContentAccess(),
    ]);

    if (!artist) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--cream)] flex items-center justify-center">
                <p>Unable to load catalog. Please try again later.</p>
            </div>
        );
    }

    const genres = [...new Set(tracksResponse.data.map(t => t.genre).filter((g): g is string => g !== null))];

    return (
        <div className="min-h-screen bg-stone-ambient text-[var(--cream)] flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gradient">
                            {artist.name}&apos;s Catalog
                        </h1>
                        <p className="text-[var(--sage)] mt-2">
                            {tracksResponse.data.length} tracks · {albums.length} albums · {playlists.length} playlists
                        </p>
                    </div>

                    <CatalogClient
                        tracks={tracksResponse.data}
                        albums={albums}
                        playlists={playlists}
                        genres={genres}
                        accessRules={accessRules}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
