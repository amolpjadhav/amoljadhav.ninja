import { NextResponse } from 'next/server';
import { getStockFast, normalizeTicker } from '@/lib/stocks';
import { quoteTtlSeconds } from '@/lib/market-hours';

// Fast first paint: identity + quote only (no SEC filings, no history).
// The lookup page renders its hero from this, then fills the slow sections
// from /api/stocks/[ticker]. TTL follows the market: 15s while open, hard
// cache while closed (frozen numbers need no refetch).
// GET /api/stocks/[ticker]/fast
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const clean = normalizeTicker(ticker);
  if (!clean) {
    return NextResponse.json({ error: 'Invalid ticker. Use 1-10 letters, e.g. META.' }, { status: 400 });
  }

  try {
    const data = await getStockFast(clean);
    if (!data) {
      return NextResponse.json(
        { error: `No data found for "${clean}". Check the ticker — US-listed stocks and ETFs only.` },
        { status: 404 },
      );
    }
    const ttl = quoteTtlSeconds();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 10}` },
    });
  } catch (error) {
    console.error('Stocks fast API error:', error);
    return NextResponse.json(
      { error: 'Upstream data sources are unreachable right now. Try again in a minute.' },
      { status: 502 },
    );
  }
}
