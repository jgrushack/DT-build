import { sdk } from '@audius/sdk';

const audiusSdk = sdk({
  appName: process.env.NEXT_PUBLIC_AUDIUS_APP_NAME || 'artist-portal-mvp',
});

const RAC_ARTIST_ID = 'nkwv1';

/**
 * Build the Audius OAuth authorization URL
 */
export function getAudiusAuthUrl(): string {
  const redirectUri = process.env.AUDIUS_REDIRECT_URI;
  if (!redirectUri) throw new Error('AUDIUS_REDIRECT_URI is not set');

  const params = new URLSearchParams({
    scope: 'read',
    app_name: 'artist-portal-mvp',
    redirect_uri: redirectUri,
    response_mode: 'query',
  });

  return `https://audius.co/oauth/auth?${params.toString()}`;
}

/**
 * Verify an Audius OAuth ID token using the SDK
 * Returns decoded user info or null if invalid
 */
export async function verifyAudiusToken(token: string) {
  try {
    const result = await audiusSdk.users.verifyIDToken({ token });
    if (!result.data) return null;
    return result.data;
  } catch (error) {
    console.error('[audius-auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Check if a user follows the artist (RAC) on Audius.
 * Paginates through the user's following list.
 */
export async function checkUserFollowsArtist(
  userId: string,
  artistId: string = RAC_ARTIST_ID
): Promise<boolean> {
  const limit = 100;
  let offset = 0;

  try {
    while (true) {
      const response = await audiusSdk.users.getFollowing({
        id: userId,
        limit,
        offset,
      });

      const following = response.data || [];
      if (following.length === 0) break;

      if (following.some((user) => user.id === artistId)) {
        return true;
      }

      if (following.length < limit) break;
      offset += limit;
    }

    return false;
  } catch (error) {
    console.error('[audius-auth] Follow check failed:', error);
    return false;
  }
}
