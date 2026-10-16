import { NextResponse } from 'next/server';
import { autocompletePlaces } from '@/lib/transit';

// Type-ahead place suggestions (Google Places, server-side key). One
// session token per type-and-pick flow keeps Google billing per
// session instead of per keystroke.
//   GET /api/transit/autocomplete?q=space n&session=<uuid>
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const session = (url.searchParams.get('session') ?? '').trim();
  if (q.length < 3 || !session) {
    return NextResponse.json({ suggestions: [] });
  }
  try {
    const suggestions = await autocompletePlaces(q, session);
    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Transit autocomplete API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
