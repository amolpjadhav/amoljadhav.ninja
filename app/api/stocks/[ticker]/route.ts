import { NextResponse } from 'next/server';
import { getStockData, normalizeTicker } from '@/lib/stocks';

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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Stocks API error:', error);
    return NextResponse.json(
      { error: 'Upstream data sources are unreachable right now. Try again in a minute.' },
      { status: 502 },
    );
  }
}
