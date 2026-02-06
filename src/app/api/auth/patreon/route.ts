import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/patreon';

export async function GET() {
  const url = getAuthorizationUrl();
  return NextResponse.redirect(url);
}
