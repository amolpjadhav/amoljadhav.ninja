import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Full-episode summaries (from real transcripts). Service-role read (the
// table has no anon policy); cached 1h.
//   GET /api/podcasts/episodes            → { ids: [videoId…] }
//   GET /api/podcasts/episodes?videoId=… → { episode } or 404
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const COLUMNS =
  'video_id,show,title,tldr,takeaways,hook,story,story_sections,key_ideas,concepts,worth_it_for,chapters,moments,people,transcript_source,created_at';

// story_sections arrived in migration 3; rows saved before it (or tables
// where it hasn't run yet) simply omit sections and the UI falls back to
// the plain story text.
const COLUMNS_FALLBACK = COLUMNS.replace(',story_sections', '');

export async function GET(req: Request) {
  const cache = { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } };
  try {
    const videoId = new URL(req.url).searchParams.get('videoId') ?? '';
    const supabase = admin();
    if (/^[A-Za-z0-9_-]{6,16}$/.test(videoId)) {
      const first = await supabase
        .from('podcast_episode_summaries')
        .select(COLUMNS)
        .eq('video_id', videoId)
        .maybeSingle();
      let data: Record<string, unknown> | null = first.data;
      if (first.error) {
        if (!first.error.message.includes('story_sections')) throw new Error(first.error.message);
        const retry = await supabase
          .from('podcast_episode_summaries')
          .select(COLUMNS_FALLBACK)
          .eq('video_id', videoId)
          .maybeSingle();
        if (retry.error) throw new Error(retry.error.message);
        data = retry.data as unknown as Record<string, unknown> | null;
      }
      if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({ episode: data }, cache);
    }
    const { data, error } = await supabase.from('podcast_episode_summaries').select('video_id');
    if (error) throw new Error(error.message);
    return NextResponse.json({ ids: (data ?? []).map((r) => r.video_id) }, cache);
  } catch (error) {
    console.error('Podcast episodes API error:', error);
    return NextResponse.json({ ids: [] }, { status: 200 });
  }
}
