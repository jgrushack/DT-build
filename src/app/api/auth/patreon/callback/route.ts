import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, verifyDevinTownsendSubscription } from '@/lib/patreon';
import { signToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const { isSubscribed, user } = await verifyDevinTownsendSubscription(tokens.access_token);

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    if (!isSubscribed) {
      return NextResponse.redirect(new URL('/login?error=not_subscribed', request.url));
    }

    const jwt = await signToken({
      userId: user.id,
      email: user.email,
      displayName: user.fullName,
      avatarUrl: user.imageUrl,
      isSubscribed,
      tiers: user.currentlyEntitledTiers,
      authProvider: 'patreon',
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
    console.error('Patreon OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
