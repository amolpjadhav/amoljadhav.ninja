import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = 'https://amoljadhav.ai';
const FROM = 'Amol Jadhav <hello@amoljadhav.ai>';

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

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're subscribed",
      html: `
<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#1a1a1a;">
  <h1 style="font-size:22px;margin:0 0 16px;">You're in.</h1>
  <p style="font-size:16px;line-height:1.6;color:#333;margin:0 0 16px;">
    Thanks for subscribing to amoljadhav.ai — you'll get an email whenever a new post goes up. No spam, just new posts.
  </p>
  <a href="${SITE_URL}/blog" style="display:inline-block;background:#0aee3c;color:#0a0a0a;font-weight:700;padding:10px 20px;border-radius:6px;text-decoration:none;">Browse the blog</a>
  <p style="font-size:12px;color:#999;margin-top:40px;border-top:1px solid #eee;padding-top:16px;">
    <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a> at any time.
  </p>
</div>`.trim(),
    });
  } catch (err) {
    // A failed welcome email shouldn't fail the subscription itself.
    console.error('Failed to send welcome email:', err);
  }
}
