import { NextResponse } from 'next/server';
import { resolveTicker } from '@/lib/stocks';

// Company-name (or mistyped ticker) resolution against the SEC ticker map:
// { ticker } when unambiguous, { suggestions } for a "did you mean" error,
// 404 when nothing matches. Mappings barely change, so this caches an hour.
// GET /api/ticker-search?q=costco
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ error: 'Missing q parameter.' }, { status: 400 });
  }
  try {
    const hit = await resolveTicker(q);
    if (!hit) {
      return NextResponse.json(
        { error: `No ticker found for "${q.trim()}". Try a company name or ticker.` },
        { status: 404 },
      );
    }
    return NextResponse.json(hit, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Ticker search error:', error);
    return NextResponse.json({ error: 'Ticker search is unreachable right now.' }, { status: 502 });
  }
}
