import { NextResponse } from 'next/server';
import { genreBooks, genreBySlug } from '@/lib/books';

// Genre shelf proxy (Open Library subjects), popularity-sorted. Cached 2h.
// GET /api/books/genre/fantasy?limit=24
export async function GET(req: Request, { params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const genre = genreBySlug(subject);
  if (!genre) return NextResponse.json({ error: 'unknown genre' }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 24, 1), 48);
  try {
    const books = await genreBooks(subject, limit);
    return NextResponse.json(
      { genre, books },
      { headers: { 'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=7200' } },
    );
  } catch (error) {
    console.error('Books genre API error:', error);
    return NextResponse.json(
      { genre, books: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
