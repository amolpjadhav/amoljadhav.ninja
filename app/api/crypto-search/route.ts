import { NextResponse } from 'next/server';
import { searchCoins } from '@/lib/crypto';

// Symbol/name resolution against CoinGecko search:
// { id } when unambiguous, { suggestions } for a "did you mean" error,
// 404 when nothing matches. Mappings barely change, so this caches an hour.
// GET /api/crypto-search?q=sol
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ error: 'Missing q parameter.' }, { status: 400 });
  }
  try {
    const hit = await searchCoins(q);
    if (!hit) {
      return NextResponse.json(
        { error: `No coin found for "${q.trim()}". Try a name or symbol.` },
        { status: 404 },
      );
    }
    return NextResponse.json(hit, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Crypto search error:', error);
    return NextResponse.json({ error: 'Crypto search is unreachable right now.' }, { status: 502 });
  }
}
