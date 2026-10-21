import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('likes')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json(
      { likes: data?.likes ?? 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Like count API error:', error);
    return NextResponse.json({ error: 'Failed to load likes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { liked } = await request.json();

    if (typeof liked !== 'boolean') {
      return NextResponse.json(
        { error: '"liked" must be a boolean' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc('increment_post_likes', {
      post_slug: slug,
      delta: liked ? 1 : -1,
    });

    if (error) throw error;

    return NextResponse.json({ likes: data });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
