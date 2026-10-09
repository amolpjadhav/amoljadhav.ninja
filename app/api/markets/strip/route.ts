import { NextResponse } from 'next/server';
import { getMarketStrip } from '@/lib/stocks';

// Index strip for the lookup page: 7 symbols, paints in ~1-2s while the
// movers fan-out still runs. Cached 5 minutes; always 200 with an empty
// strip on upstream blips (the UI skeletons, then hides it).
// GET /api/markets/strip
export async function GET() {
  try {
    const data = await getMarketStrip();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Markets strip API error:', error);
    return NextResponse.json(
      { strip: [], asOf: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
