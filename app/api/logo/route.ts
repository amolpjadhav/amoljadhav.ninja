import { NextResponse } from 'next/server';

// Logo proxy: Finnhub serves company logos keyless but with short-lived
// cache headers, so every page view refetches. This route pins them at
// the edge for 30 days per symbol (logos barely change; unknown tickers
// 404 upstream and fall back to the monogram client-side).
//   GET /api/logo?symbol=AAPL → image/png
// max-age mirrors s-maxage so browsers skip repeat requests entirely —
// without it browsers ignore s-maxage and re-request every page load
// (fast edge hits, but still requests). Logos barely change, so the
// browser may hold them as long as the edge does.
const CACHE = 'public, s-maxage=2592000, max-age=2592000, stale-while-revalidate=604800';
// Failures stay cacheable for a minute only: Finnhub is flaky per symbol
// (AAPL timed out outright), and a 30-day 404 would turn one slow reply
// into a month-long missing logo.
const RETRY = 'public, s-maxage=60, stale-while-revalidate=60';

export async function GET(req: Request) {
  const symbol = (new URL(req.url).searchParams.get('symbol') ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: 'bad symbol' }, { status: 400, headers: { 'Cache-Control': RETRY } });
  }
  try {
    const upstream = await fetch(
      `https://finnhub.io/api/logo?symbol=${encodeURIComponent(symbol)}`,
      { signal: AbortSignal.timeout(15000), next: { revalidate: 2592000 } },
    );
    if (!upstream.ok) {
      return NextResponse.json({ error: 'no logo' }, { status: 404, headers: { 'Cache-Control': RETRY } });
    }
    const type = upstream.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'no logo' }, { status: 404, headers: { 'Cache-Control': RETRY } });
    }
    const buf = await upstream.arrayBuffer();
    if (buf.byteLength < 512) {
      return NextResponse.json({ error: 'no logo' }, { status: 404, headers: { 'Cache-Control': RETRY } });
    }
    return new NextResponse(buf, { headers: { 'Content-Type': type, 'Cache-Control': CACHE } });
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502, headers: { 'Cache-Control': RETRY } });
  }
}
