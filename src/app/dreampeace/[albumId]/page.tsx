import { notFound } from 'next/navigation';
import { getDreampeaceAlbum, DREAMPEACE_ALBUMS, VISUALIZER_THEMES } from '@/lib/dreampeace-data';
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

    return (
        <DreampeaceAlbumClient album={album} visualizerTheme={theme} />
    );
}
