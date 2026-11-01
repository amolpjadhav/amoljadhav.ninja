import { NextResponse } from 'next/server';
import { getPricedModels } from '@/lib/ai-pricing';

// Flagship AI model prices, live from OpenRouter with the curated table as
// fallback. Providers reprice often; the `live` flag on each row says which
// source a number came from so the widget can label it honestly.
//   GET /api/ai-prices
export async function GET() {
  const { models, live, updatedAt } = await getPricedModels();
  if (!live) {
    return NextResponse.json(
      { updatedAt, stale: true, models },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
    );
  }
  return NextResponse.json(
    { updatedAt, models },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } },
  );
}
