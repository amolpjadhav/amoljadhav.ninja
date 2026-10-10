import { NextResponse } from 'next/server';
import { searchBooks } from '@/lib/books';

// Book search proxy (Open Library). Cached 1h; 200 with [] on upstream blips.
// GET /api/books/search?q=dune&limit=12
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 12, 1), 24);
  if (!q) return NextResponse.json({ books: [] });
  try {
    const books = await searchBooks(q, limit);
    return NextResponse.json(
      { books },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } },
    );
  } catch (error) {
    console.error('Books search API error:', error);
    return NextResponse.json(
      { books: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
