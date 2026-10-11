import { NextResponse } from 'next/server';
import { genreBySlug, mostReadBooks } from '@/lib/books';

// Top currently-read books on a genre shelf, ranked by live OL reading-log
// counts. Cached 12h.
// GET /api/books/most-read?genre=fantasy
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get('genre') ?? '';
  if (!genreBySlug(genre)) return NextResponse.json({ error: 'unknown genre' }, { status: 400 });
  try {
    const books = await mostReadBooks(genre, 5);
    const ttl = books.length === 0 ? 60 : 43200;
    return NextResponse.json(
      { genre, books },
      { headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}` } },
    );
  } catch (error) {
    console.error('Books most-read API error:', error);
    return NextResponse.json(
      { genre, books: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
