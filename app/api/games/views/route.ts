import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Public view counts for the arcade hub cards. Service key stays server
// side; the response is cacheable for a minute to keep the hub cheap.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('game_views').select('slug, views');
    if (error) throw error;
    const views: Record<string, number> = {};
    for (const row of data ?? []) views[row.slug] = row.views;
    return NextResponse.json(
      { views },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (error) {
    console.error('Game views API error:', error);
    return NextResponse.json({ views: {} });
  }
}
