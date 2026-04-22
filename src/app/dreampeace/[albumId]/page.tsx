import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
    getDreampeaceAlbum,
    getAlbumCredits,
    DREAMPEACE_ALBUMS,
    VISUALIZER_THEMES,
} from '@/lib/dreampeace-data';
import DreampeaceAlbumClient from './album-client';

interface DreampeaceAlbumPageProps {
    params: Promise<{ albumId: string }>;
}

export async function generateStaticParams() {
    return DREAMPEACE_ALBUMS.map((album) => ({ albumId: album.id }));
}

export default async function DreampeaceAlbumPage({ params }: DreampeaceAlbumPageProps) {
    const { albumId } = await params;
    const album = getDreampeaceAlbum(albumId);

    if (!album) notFound();

    const theme = VISUALIZER_THEMES[albumId] || VISUALIZER_THEMES.dp1;
    const credits = getAlbumCredits(albumId);

    // Suspense boundary required: album-client reads useSearchParams for sleep
    // mode, which triggers CSR bailout during prerender without this wrapper.
    return (
        <Suspense fallback={null}>
            <DreampeaceAlbumClient album={album} visualizerTheme={theme} credits={credits} />
        </Suspense>
    );
}
