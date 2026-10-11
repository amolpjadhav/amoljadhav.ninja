import { NextResponse } from 'next/server';
import { getCoinData, normalizeCoinId } from '@/lib/crypto';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ coin: string }> },
) {
  const { coin } = await params;
  const clean = normalizeCoinId(coin);
  if (!clean) {
    return NextResponse.json({ error: 'Invalid coin id. Use a CoinGecko id, e.g. bitcoin.' }, { status: 400 });
  }

  try {
    const data = await getCoinData(clean);
    if (!data) {
      return NextResponse.json(
        { error: `No data found for "${clean}". Check the spelling — try BTC or bitcoin.` },
        { status: 404 },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Crypto API error:', error);
    return NextResponse.json(
      { error: 'Upstream data sources are unreachable right now. Try again in a minute.' },
      { status: 502 },
    );
  }
}
