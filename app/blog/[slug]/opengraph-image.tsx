import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const title = post?.title ?? 'Amol Jadhav';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          fontFamily: 'monospace',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '2px solid #0aee3c',
            borderRadius: 16,
            padding: 64,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(10,238,60,0.6)', marginBottom: 32 }}>
            {'amoljadhav.ninja/blog'}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 700,
              color: '#0aee3c',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    size
  );
}
