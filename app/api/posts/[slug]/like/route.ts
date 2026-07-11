import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
