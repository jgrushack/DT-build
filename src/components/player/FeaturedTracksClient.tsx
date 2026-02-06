'use client';

import type { Track, ContentAccess } from '@/lib/types';
import TrackCard from '@/components/catalog/TrackCard';
import { usePlayerStore } from '@/store/playerStore';
import { useAuth } from '@/contexts/AuthContext';
import { canUserAccess, getLockMessage } from '@/lib/access';

interface FeaturedTracksClientProps {
    tracks: Track[];
    accessRules: Record<string, ContentAccess>;
}

export default function FeaturedTracksClient({ tracks, accessRules }: FeaturedTracksClientProps) {
    const play = usePlayerStore((s) => s.play);
    const { user, isAuthenticated } = useAuth();

    const handleTrackClick = (track: Track) => {
        const rule = accessRules[track.id];
        const requiredTier = rule ? rule.access_tier : 'public';
        const hasAccess = canUserAccess(user?.tiers || [], requiredTier, isAuthenticated);

        if (hasAccess) {
            play(track);
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {tracks.map((track) => {
                const rule = accessRules[track.id];
                const requiredTier = rule ? rule.access_tier : 'public';
                const hasAccess = canUserAccess(user?.tiers || [], requiredTier, isAuthenticated);

                return (
                    <TrackCard
                        key={track.id}
                        track={track}
                        onClick={handleTrackClick}
                        isLocked={!hasAccess}
                        lockMessage={!hasAccess ? getLockMessage(requiredTier) : undefined}
                    />
                );
            })}
        </div>
    );
}
