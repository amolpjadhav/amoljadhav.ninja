import { NextResponse } from 'next/server';
import { FLAGSHIPS, mergeLivePrice } from '@/lib/ai-pricing';

// Flagship AI model prices, live from OpenRouter with the curated table as
// fallback. Providers reprice often; the `live` flag on each row says which
// source a number came from so the widget can label it honestly.
//   GET /api/ai-prices
const CACHE = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' };

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'amoljadhav.ninja price calculator' },
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const byId = new Map(rows.filter((m) => typeof m?.id === 'string').map((m) => [m.id, m]));
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        models: FLAGSHIPS.map((base) => mergeLivePrice(base, byId.get(base.id))),
      },
      { headers: CACHE },
    );
  } catch (error) {
    console.error('AI prices API error:', error);
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        stale: true,
        models: FLAGSHIPS.map((base) => ({ ...base, live: false })),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
    );
  }
}
