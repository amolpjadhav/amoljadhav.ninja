import { NextResponse } from 'next/server';
import { getMarketOverview } from '@/lib/stocks';

// Market overview for the lookup page: index strip plus Trending / Gainers /
// Losers / Mag 7 tiles. One response, cached 5 minutes at the CDN — quotes
// are delayed 15 minutes upstream anyway, so fresher polling buys nothing.
// Always 200: sections degrade to empty arrays on upstream blips and the UI
// hides empty sections instead of erroring the whole page.
// GET /api/markets
export async function GET() {
  try {
    const data = await getMarketOverview();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json(
      { strip: [], gainers: [], losers: [], trending: [], mag7: [], asOf: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
