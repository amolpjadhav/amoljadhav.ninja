import { NextResponse } from 'next/server';
import { getMarketMovers } from '@/lib/stocks';

// Movers for the lookup page: Trending / Gainers / Losers / Mag 7 ranked
// across the 40-stock watchlist. Slower than the strip (two-phase fan-out),
// cached 5 minutes; always 200 with empty groups on upstream blips.
// GET /api/markets/movers
export async function GET() {
  try {
    const data = await getMarketMovers();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Markets movers API error:', error);
    return NextResponse.json(
      { gainers: [], losers: [], trending: [], mag7: [], asOf: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
