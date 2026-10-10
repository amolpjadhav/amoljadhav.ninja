import { NextResponse } from 'next/server';
import { nytBestsellers } from '@/lib/books';

// NYT bestsellers overview (server-side key, never exposed). Cached 6h; the
// NYT lists update weekly. 200 with an empty overview when no key is set so
// the tab degrades to a note instead of an error.
// GET /api/books/bestsellers
export async function GET() {
  try {
    const overview = await nytBestsellers(process.env.NYT_BOOKS_API_KEY);
    if (!overview) {
      return NextResponse.json(
        { publishedDate: '', lists: [], unavailable: true },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
      );
    }
    return NextResponse.json(overview, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=21600' },
    });
  } catch (error) {
    console.error('Books bestsellers API error:', error);
    return NextResponse.json(
      { publishedDate: '', lists: [], unavailable: true },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
