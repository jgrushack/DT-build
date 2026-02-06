import { NextRequest, NextResponse } from 'next/server';
import { verifyAudiusToken, checkUserFollowsArtist } from '@/lib/audius-auth';
import { signToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  try {
    const user = await verifyAudiusToken(token);

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    const followsArtist = await checkUserFollowsArtist(user.userId);

    if (!followsArtist) {
      return NextResponse.redirect(new URL('/login?error=not_following', request.url));
    }

    const jwt = await signToken({
      userId: user.userId,
      email: user.email || '',
      displayName: user.name || user.handle,
      avatarUrl: user.profilePicture?.['_480x480'] || user.profilePicture?.['_150x150'] || '',
      isSubscribed: true,
      tiers: ['audius-follower'],
      authProvider: 'audius',
    });

    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Audius OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
