import { NextResponse } from 'next/server';
import { readGameViews } from '@/lib/game-views';

// Public view counts for the arcade hub cards. Service key stays server
// side. Never cached: a cached empty map is how fresh counts hide.
export async function GET() {
  try {
    const views = await readGameViews();
    return NextResponse.json({ views }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Game views API error:', error);
    return NextResponse.json({ views: {} });
  }
}
