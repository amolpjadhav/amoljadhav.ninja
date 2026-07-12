import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { categoryColor } from '@/lib/blog-content';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = 'https://amoljadhav.ai';
const FROM = 'Amol Jadhav <hello@amoljadhav.ai>';
const RECENT_POSTS_COUNT = 5;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();

    // @ts-ignore - Supabase type inference issue with insert
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert({ email: normalized })
      .select('unsubscribe_token')
      .single();

    if (error) {
      if (error.code === '23505') {
        // unique_violation — already subscribed, treat as success, no repeat welcome email
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
      throw error;
    }

    await sendWelcomeEmail(normalized, data.unsubscribe_token);

    return NextResponse.json({
      success: true,
      message: "Subscribed! You'll hear about new posts.",
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping welcome email.');
    return;
  }

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('title, slug, excerpt, category')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(RECENT_POSTS_COUNT);

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're subscribed",
      html: renderWelcomeEmail({ unsubscribeUrl, posts: posts ?? [] }),
    });
  } catch (err) {
    // A failed welcome email shouldn't fail the subscription itself.
    console.error('Failed to send welcome email:', err);
  }
}

function renderWelcomeEmail({
  unsubscribeUrl,
  posts,
}: {
  unsubscribeUrl: string;
  posts: { title: string; slug: string; excerpt: string; category?: string }[];
}) {
  const postsHtml = posts
    .map((post) => {
      const accent = categoryColor(post.category);
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `
        <tr>
          <td style="padding:0 0 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f8;border-left:3px solid ${accent};border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  ${post.category ? `<span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${accent};margin-bottom:6px;">${escapeHtml(post.category)}</span><br/>` : ''}
                  <a href="${url}" style="font-size:16px;font-weight:700;color:#1a1a1a;text-decoration:none;line-height:1.4;">${escapeHtml(post.title)}</a>
                  <p style="font-size:14px;color:#666;line-height:1.5;margin:6px 0 0;">${escapeHtml(truncate(post.excerpt, 140))}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join('');

  return `
<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;background:#f2f2f3;padding:40px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="background:#0a0a0a;padding:28px 32px;">
        <span style="font-family:ui-monospace,Menlo,monospace;color:#0aee3c;font-size:15px;font-weight:700;letter-spacing:0.03em;">amoljadhav.ai</span>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 32px 8px;">
        <h1 style="font-size:24px;margin:0 0 12px;color:#0a0a0a;">You're in.</h1>
        <p style="font-size:16px;line-height:1.6;color:#333;margin:0 0 16px;">
          Thanks for subscribing — you'll get an email whenever a new post goes up. No spam, just new posts.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#eefbf1;border-radius:8px;margin:0 0 32px;">
          <tr>
            <td style="padding:14px 18px;font-size:14px;color:#166534;line-height:1.5;">
              🧠 <strong>Heads up:</strong> every post ends with a short quiz so you can test what you just learned.
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${
      postsHtml
        ? `<tr><td style="padding:0 32px;"><p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#999;margin:0 0 16px;">A few to start with</p></td></tr>
    <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${postsHtml}</table></td></tr>`
        : ''
    }
    <tr>
      <td style="padding:8px 32px 36px;">
        <a href="${SITE_URL}/blog" style="display:inline-block;background:#0aee3c;color:#0a0a0a;font-weight:700;font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">Browse all posts →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#999;margin:0;">
          <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a> at any time.
        </p>
      </td>
    </tr>
  </table>
</div>`.trim();
}

function truncate(text: string, maxLength: number) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}…`;
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
