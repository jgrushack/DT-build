import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArtistById, getTrendingTracks, getArtistAlbums, getArtistPlaylists } from '@/lib/audius';
import { getAllContentAccess } from '@/lib/access';
import FeaturedTracksClient from '@/components/player/FeaturedTracksClient';
import PortalTransition from '@/components/dreampeace/PortalTransition';
import AlbumCard from '@/components/catalog/AlbumCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ARTIST_ID = 'nkwv1';

export const revalidate = 300;

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token) redirect('/login');

  const [artist, trendingTracks, albums, playlists, accessRules] = await Promise.all([
    getArtistById(ARTIST_ID),
    getTrendingTracks(ARTIST_ID, 8),
    getArtistAlbums(ARTIST_ID),
    getArtistPlaylists(ARTIST_ID),
    getAllContentAccess(),
  ]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--cream)] flex items-center justify-center">
        <p>Unable to load artist data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural text-[var(--cream)] flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex items-end overflow-hidden pt-28 pb-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[var(--amber)]/4 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-1/6 w-[400px] h-[400px] bg-[var(--sage)]/6 rounded-full blur-[120px] animate-pulse-soft" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {artist.profileImage ? (
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 flex-shrink-0 ring-1 ring-white/10">
                <Image
                  src={artist.profileImage}
                  alt={artist.name}
                  width={224}
                  height={224}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            ) : (
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-[var(--sage)] to-[var(--earth-dark)] flex items-center justify-center shadow-2xl shadow-black/60 flex-shrink-0 ring-1 ring-white/10">
                <span className="text-6xl font-bold text-[var(--cream)]">{artist.name.charAt(0)}</span>
              </div>
            )}

            <div className="flex-1 text-center md:text-left pb-1">
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--cream)] leading-none tracking-tight mb-3">
                {artist.name}
              </h1>
              {artist.bio && (
                <p className="text-[var(--sage-light)] text-sm md:text-base max-w-lg leading-relaxed mb-5 line-clamp-2">
                  {artist.bio}
                </p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Link
                  href="/catalog"
                  className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[var(--amber)] hover:bg-[var(--amber-light)] text-[var(--stone-deep)] font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,164,92,0.3)] hover:-translate-y-0.5"
                >
                  Explore
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular tracks */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--cream)]">Popular</h2>
            <Link
              href="/catalog"
              className="group text-[var(--amber)] hover:text-[var(--amber-light)] text-xs font-medium flex items-center gap-1 transition-colors"
            >
              See all
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <FeaturedTracksClient tracks={trendingTracks} accessRules={accessRules} />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
      </div>

      {/* Albums */}
      {albums.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--cream)]">Albums</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <>
          <div className="max-w-5xl mx-auto w-full px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
          </div>
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--cream)]">Playlists</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {playlists.map((playlist) => (
                  <AlbumCard key={playlist.id} album={playlist} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Dreampeace CTA */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden liquid-glass p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sage)]/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--amber)]/6 rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--sage)] font-medium mb-3">
                Ambient Experience
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--cream)] mb-3">
                Dreampeace
              </h2>
              <p className="text-[var(--sage-light)] text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Immersive soundscapes for focus, meditation, and relaxation.
              </p>
              <PortalTransition>
                <div
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--glass-border)] hover:border-[var(--sage)] bg-white/5 hover:bg-white/10 text-[var(--cream)] font-medium text-sm transition-all duration-300 cursor-pointer"
                >
                  Enter
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </PortalTransition>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
