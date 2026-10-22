import { NextResponse } from 'next/server';
import { getCompanyNews, getNewsReasons, type NewsItem } from '@/lib/news';

// News proxy: the Finnhub key stays server-side. Two shapes —
//   GET /api/news?ticker=NVDA        → { items }  (7 days, latest 6)
//   GET /api/news?reasons=A,B,C      → { reasons } (latest ≤24h per symbol)
// reasons accepts caller-known company names for the match check:
//   &names=A:Acme Corp|B:Beta Inc  (pairs split on "|", symbol from name
//   on the first ":"). Summaries stay server-side — only the fields the
//   UI renders go over the wire.
// Cached 15 minutes at the edge, matching the lib's fetch revalidation.
const CACHE = { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900' };

function parseNames(param: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!param) return out;
  for (const pair of param.split('|')) {
    const i = pair.indexOf(':');
    if (i <= 0) continue;
    const sym = pair.slice(0, i).trim().toUpperCase();
    const name = pair.slice(i + 1).trim();
    if (sym && name) out[sym] = name;
  }
  return out;
}

function publish(item: NewsItem): Omit<NewsItem, 'summary' | 'related'> {
  return {
    id: item.id,
    headline: item.headline,
    source: item.source,
    url: item.url,
    datetime: item.datetime,
    image: item.image,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const reasonsParam = url.searchParams.get('reasons');
    if (reasonsParam) {
      const symbols = reasonsParam.split(',').map((s) => s.trim()).filter(Boolean);
      const names = parseNames(url.searchParams.get('names'));
      const reasons = await getNewsReasons(symbols, 25, names);
      const pub: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(reasons)) pub[k] = v ? publish(v) : null;
      return NextResponse.json({ reasons: pub }, { headers: CACHE });
    }
    const ticker = (url.searchParams.get('ticker') ?? '').trim().toUpperCase();
    if (!ticker) {
      return NextResponse.json({ items: [] }, { headers: CACHE });
    }
    const items = await getCompanyNews(ticker, 7, 6);
    return NextResponse.json({ items: items.map(publish) }, { headers: CACHE });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { items: [], reasons: {} },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
