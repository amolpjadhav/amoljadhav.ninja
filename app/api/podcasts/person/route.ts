import { NextResponse } from 'next/server';
import { episodeMentions, matchPersonEpisodes, personById } from '@/lib/people';
import { clipTag, fetchViewCounts, viewsPerHour } from '@/lib/podcasts';
import { getPool, stripDescriptions } from '@/lib/podcast-pool';

// Appearances by a directory person across the curated channels, ranked by
// total views (no per-show cap — every appearance counts). Shares the
// hourly pool fetch; cached 1h.
// GET /api/podcasts/person?id=naval-ravikant
const PERSON_CAP = 40;

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const person = personById(id.trim().toLowerCase());
  if (!person) {
    return NextResponse.json({ error: `Unknown person "${id.trim()}".` }, { status: 404 });
  }
  try {
    const pool = await getPool();
    if (!pool) throw new Error('missing YouTube API key');
    const now = Date.now();
    const byViews = (a: { views: number }, b: { views: number }) => b.views - a.views;
    // Title appearances first, description-only mentions after — each tier
    // ranked by views, so a news roundup can't bury a real interview.
    // Copies, never pool references: the overlay below must not mutate the
    // memoized pool.
    const tiers = [
      matchPersonEpisodes(pool, person)
        .filter((ep) => episodeMentions(ep, person) === 'title')
        .sort(byViews)
        .slice(0, 30),
      matchPersonEpisodes(pool, person)
        .filter((ep) => episodeMentions(ep, person) === 'description')
        .sort(byViews)
        .slice(0, 30),
    ].map((tier) => tier.map((ep) => ({ ...ep })));
    const [titleTier = [], descTier = []] = tiers;
    // Stored views go stale for old episodes, so the shortlist (≤60 = 2
    // quota units) re-ranks on live counts before responding. Recent
    // episodes already carry fresh views from the hourly refresh.
    const apiKey = process.env.YOUTUBE_API_KEY;
    const shortlist = [...titleTier, ...descTier];
    if (apiKey && shortlist.length > 0) {
      const fresh = await fetchViewCounts(
        apiKey,
        shortlist.map((ep) => ep.videoId),
      ).catch(() => new Map<string, number>());
      for (const ep of shortlist) {
        const v = fresh.get(ep.videoId);
        if (v !== undefined) ep.views = v;
      }
    }
    const ranked = [...titleTier.sort(byViews), ...descTier.sort(byViews)].slice(0, PERSON_CAP);
    const episodes = stripDescriptions(
      ranked.map((ep) => ({
        ...ep,
        viewsPerHour: viewsPerHour(ep.views, ep.publishedAt, now),
        tag: clipTag(ep.title) ?? (episodeMentions(ep, person) === 'description' ? 'Mentioned' : undefined),
      })),
    );
    return NextResponse.json(
      {
        person: { id: person.id, name: person.name, blurb: person.blurb, group: person.group, ownShow: person.ownShow, essentials: person.essentials },
        episodes,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } },
    );
  } catch (error) {
    console.error('Podcasts person API error:', error);
    return NextResponse.json(
      {
        person: { id: person.id, name: person.name, blurb: person.blurb, group: person.group, ownShow: person.ownShow, essentials: person.essentials },
        episodes: [],
        fetchedAt: null,
        unavailable: true,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' } },
    );
  }
}
