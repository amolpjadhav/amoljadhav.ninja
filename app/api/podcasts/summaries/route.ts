import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cached episode summaries by video id. Service-role read (the table has
// no anon policy); cached 1h. The widget batches visible ids in one call.
//   GET /api/podcasts/summaries?ids=abc,def
export async function GET(req: Request) {
  try {
    const ids = (new URL(req.url).searchParams.get('ids') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[A-Za-z0-9_-]{6,16}$/.test(s))
      .slice(0, 40);
    if (ids.length === 0) return NextResponse.json({ summaries: {} });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data, error } = await supabase
      .from('podcast_summaries')
      .select('video_id,tldr,bullets,moments,source')
      .in('video_id', ids);
    if (error) throw new Error(error.message);
    const summaries: Record<string, unknown> = {};
    for (const row of data ?? []) summaries[row.video_id] = row;
    return NextResponse.json(
      { summaries },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } },
    );
  } catch (error) {
    console.error('Podcast summaries API error:', error);
    return NextResponse.json(
      { summaries: {} },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
