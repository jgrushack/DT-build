import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

const PUBLIC_PATHS = ['/login', '/api/auth'];
const STATIC_PREFIXES = ['/_next', '/favicon.ico', '/images'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public paths
  if (
    STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear it and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp)$).*)'],
};
