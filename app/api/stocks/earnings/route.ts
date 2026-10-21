import { NextResponse } from 'next/server';
import { fetchEnrichedWeek } from '@/lib/earnings';
import { fetchNasdaqChart } from '@/lib/stocks';

// This week's earnings calendar (Finnhub, server-side key): dates plus
// profiles and beat histories for the top reporters, plus today's session
// move on rows that already reported (keyless Nasdaq chart, failures stay
// null — never a reaction claim, just today's move). Hourly revalidation —
// enrichment is cached harder underneath (profiles 30d, beats 24h, charts
// 120s).
// GET /api/stocks/earnings
export async function GET() {
  try {
    const week = await fetchEnrichedWeek();
    const reported = [...new Set(week.events.filter((e) => e.epsActual !== null).map((e) => e.symbol))].slice(0, 12);
    const moves = await Promise.all(
      reported.map(async (symbol) => {
        try {
          const chart = await fetchNasdaqChart(symbol);
          const pct = chart?.quote?.changePct;
          const ah = chart?.ahChangePct;
          const clean = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
          return { symbol, pct: clean(pct), ah: clean(ah) };
        } catch {
          return null;
        }
      }),
    );
    for (const m of moves) {
      if (!m) continue;
      for (const e of week.events) {
        if (e.symbol === m.symbol) {
          if (m.pct !== null) e.priceChangePct = m.pct;
          if (m.ah !== null) e.ahChangePct = m.ah;
        }
      }
    }
    return NextResponse.json(week, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Stocks earnings API error:', error);
    return NextResponse.json(
      { events: [], fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
    );
  }
}
