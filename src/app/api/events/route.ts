import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    // Play event tracking endpoint
    const body = await request.json();
    console.log('Play event:', body);
    return NextResponse.json({ success: true });
}
