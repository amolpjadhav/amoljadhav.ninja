import { NextResponse } from 'next/server';
import { getPool } from '@/lib/podcast-pool';
import { PEOPLE, personStats } from '@/lib/people';

export const revalidate = 3600;

// Directory aggregation: every tracked person with all-time appearance
// counts, distinct shows, and latest appearance. Powers the people
// directory and the Active-this-week row; no per-person fan-out.
export async function GET() {
  try {
    const pool = await getPool();
    if (!pool) throw new Error('missing YouTube API key');
    const people = PEOPLE.map((person) => ({
      ...person,
      stats: personStats(pool, person),
    }));
    return NextResponse.json(
      { people, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } },
    );
  } catch (err) {
    console.error('people directory failed', err);
    const people = PEOPLE.map((person) => ({
      ...person,
      stats: { appearances: 0, shows: 0, latest: null },
    }));
    return NextResponse.json(
      { people, unavailable: true },
      { headers: { 'Cache-Control': 'public, s-maxage=300' } },
    );
  }
}
