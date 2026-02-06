'use client';

import { usePlayer } from '@/hooks/usePlayer';
import Player from './Player';

export default function PlayerWrapper() {
    // Initialize the audio bridge
    usePlayer();

    return <Player />;
}
