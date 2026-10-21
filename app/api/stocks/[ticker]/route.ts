import { NextResponse } from 'next/server';
import { getStockData, isAnnualForm, normalizeTicker } from '@/lib/stocks';
import { accessionFromFilingUrl, getCachedOverview } from '@/lib/stock-llm';
import { supabaseAdmin } from '@/lib/supabase';

// Full payload: fundamentals, filings, history, insights. Cached an hour —
// filings and financials move quarterly; the quote inside can lag the fast
// endpoint, so clients prefer /api/stocks/[ticker]/fast for the hero price.
// GET /api/stocks/[ticker]
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
    const data = await getStockData(clean);
    if (!data) {
      return NextResponse.json(
        { error: `No data found for "${clean}". Check the ticker — US-listed stocks and ETFs only.` },
        { status: 404 },
      );
    }
    // AI overview rewrite for this exact filing, cached forever per
    // accession. Missing table/key/row all read as null — the extractive
    // text below stands, so this never fails a lookup.
    let description = data.description;
    try {
      const annual = data.filings.find((f) => isAnnualForm(f.form));
      const accession = accessionFromFilingUrl(annual?.url);
      if (description && accession) {
        const cached = await getCachedOverview(supabaseAdmin, clean, accession).catch(() => null);
        if (cached) description = { ...description, aiRewrite: cached.text };
      }
    } catch {
      /* extractive text stands */
    }
    return NextResponse.json(
      { ...data, description },
      {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      },
    );
  } catch (error) {
    console.error('Stocks API error:', error);
    return NextResponse.json(
      { error: 'Upstream data sources are unreachable right now. Try again in a minute.' },
      { status: 502 },
    );
  }
}
