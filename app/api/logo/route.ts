import { NextResponse } from 'next/server';

// Logo proxy: Finnhub serves company logos keyless but with short-lived
// cache headers, so every page view refetches. This route pins them at
// the edge for 30 days per symbol (logos barely change; unknown tickers
// 404 upstream and fall back to the monogram client-side).
//   GET /api/logo?symbol=AAPL → image/png
const CACHE = 'public, s-maxage=2592000, stale-while-revalidate=604800';

export async function GET(req: Request) {
  const symbol = (new URL(req.url).searchParams.get('symbol') ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: 'bad symbol' }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      `https://finnhub.io/api/logo?symbol=${encodeURIComponent(symbol)}`,
      { signal: AbortSignal.timeout(8000), next: { revalidate: 2592000 } },
    );
    if (!upstream.ok) {
      return NextResponse.json({ error: 'no logo' }, { status: 404, headers: { 'Cache-Control': CACHE } });
    }
    const type = upstream.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'no logo' }, { status: 404, headers: { 'Cache-Control': CACHE } });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, { headers: { 'Content-Type': type, 'Cache-Control': CACHE } });
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
