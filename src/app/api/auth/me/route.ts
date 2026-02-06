import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
