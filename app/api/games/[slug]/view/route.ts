import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GAME_BY_SLUG, isGameSlug } from '@/components/games/registry';

// One play counts once per day per browser (the client dedupes with the
// same view-dedup day map as blog views); the server just increments.
const COUNTED = new Set([...Object.keys(GAME_BY_SLUG), 'hub']);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    if (!isGameSlug(slug) && !COUNTED.has(slug)) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 404 });
    }
    const { data, error } = await supabaseAdmin.rpc('increment_game_views', {
      game_slug: slug,
    });
    if (error) throw error;
    return NextResponse.json({ views: data });
  } catch (error) {
    console.error('Game view API error:', error);
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
  }
}
