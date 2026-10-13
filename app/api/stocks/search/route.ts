import { NextResponse } from 'next/server';
import { fetchSecTickerMap, searchTickers } from '@/lib/stocks';

// Ticker autocomplete for the homepage lookup box: the same ranked matcher
// the full lookup page uses to resolve a typed company name, exposed as its
// own endpoint so the input can suggest while you type.
// The SEC map is a once-a-day fetch shared with resolveTicker, so this is a
// map scan, not an upstream call, on all but the first request.
// GET /api/stocks/search?q=appl
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim();
  if (q.length < 1) return NextResponse.json({ results: [] });

  try {
    const map = await fetchSecTickerMap();
    return NextResponse.json(
      { results: searchTickers(q, map) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Ticker search API error:', error);
    // Empty rather than a 5xx: suggestions are a convenience, and the form
    // still submits whatever was typed.
    return NextResponse.json({ results: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
