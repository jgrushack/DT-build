import { DT_ARTIST, DT_ALBUMS, getAllDTTracks, getDTGenres } from '@/lib/dt-catalog';
import CatalogClient from './catalog-client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const revalidate = 300;

export const metadata = {
    title: 'Full Catalog | Devin Townsend',
    description: 'Browse Devin Townsend\'s complete music catalog',
};

export default async function CatalogPage() {
    const artist = DT_ARTIST;
    const tracks = getAllDTTracks();
    const albums = DT_ALBUMS;
    const genres = getDTGenres();
    const accessRules = {};

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
                            {tracks.length} tracks · {albums.length} albums
                        </p>
                    </div>

                    <CatalogClient
                        tracks={tracks}
                        albums={albums}
                        playlists={[]}
                        genres={genres}
                        accessRules={accessRules}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
