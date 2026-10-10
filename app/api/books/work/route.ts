import { NextResponse } from 'next/server';
import { bookDetails } from '@/lib/books';

// Single-book details proxy (Open Library work + ratings). Cached 24h.
// GET /api/books/work?key=/works/OL893414W
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') ?? '';
  if (!/^\/works\/OL\d+W$/.test(key)) return NextResponse.json({ error: 'bad key' }, { status: 400 });
  try {
    const book = await bookDetails(key);
    if (!book) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(
      { book },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Books work API error:', error);
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
