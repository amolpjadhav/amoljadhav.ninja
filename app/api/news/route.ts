import { NextResponse } from 'next/server';
import { getCompanyNews, getNewsReasons } from '@/lib/news';

// News proxy: the Finnhub key stays server-side. Two shapes —
//   GET /api/news?ticker=NVDA        → { items }  (7 days, latest 6)
//   GET /api/news?reasons=A,B,C      → { reasons } (latest ≤24h per symbol)
// Cached 15 minutes at the edge, matching the lib's fetch revalidation.
const CACHE = { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const reasonsParam = url.searchParams.get('reasons');
    if (reasonsParam) {
      const symbols = reasonsParam.split(',').map((s) => s.trim()).filter(Boolean);
      const reasons = await getNewsReasons(symbols);
      return NextResponse.json({ reasons }, { headers: CACHE });
    }
    const ticker = (url.searchParams.get('ticker') ?? '').trim().toUpperCase();
    if (!ticker) {
      return NextResponse.json({ items: [] }, { headers: CACHE });
    }
    const items = await getCompanyNews(ticker, 7, 6);
    return NextResponse.json({ items }, { headers: CACHE });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { items: [], reasons: {} },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
