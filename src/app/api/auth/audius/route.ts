import { NextResponse } from 'next/server';
import { getAudiusAuthUrl } from '@/lib/audius-auth';

export async function GET() {
  const url = getAudiusAuthUrl();
  return NextResponse.redirect(url);
}
