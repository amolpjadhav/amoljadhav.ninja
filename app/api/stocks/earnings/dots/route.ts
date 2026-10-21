import { NextResponse } from 'next/server';
import { fetchQuarterDetails } from '@/lib/earnings';
import { normalizeTicker } from '@/lib/stocks';

// Last-4 quarter details (oldest first) for the lookup-page earnings card:
// beat dots with quarter labels and estimate tooltips. Tiny, cached a day —
// the week payload carries only the aggregate.
// GET /api/stocks/earnings/dots?ticker=TSLA
export async function GET(req: Request) {
  const ticker = normalizeTicker(new URL(req.url).searchParams.get('ticker') ?? '');
  if (!ticker) {
    return NextResponse.json({ dots: [], quarters: [] }, { status: 400 });
  }
  try {
    const quarters = await fetchQuarterDetails(ticker);
    const dots = quarters.map((q) => q.beat).filter((b): b is boolean => b !== null);
    return NextResponse.json(
      { dots, quarters },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Stocks earnings dots API error:', error);
    return NextResponse.json({ dots: [], quarters: [] });
  }
}
