// Emails every subscriber about a newly published post via Resend.
// Run manually after you publish something — there's no automatic trigger
// on purpose, so a draft flipped live by mistake can't blast an email.
//
// Usage:
//   node scripts/notify-subscribers.mjs <slug>            # send once
//   node scripts/notify-subscribers.mjs <slug> --force     # re-send even if already notified

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';

const SITE_URL = 'https://amoljadhav.ai';
const FROM = 'Amol Jadhav <hello@amoljadhav.ai>';
const BATCH_SIZE = 100; // Resend's batch send limit per call

loadEnvLocal();

const slug = process.argv[2];
const force = process.argv.includes('--force');

if (!slug) {
  console.error('Usage: node scripts/notify-subscribers.mjs <slug> [--force]');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}
if (!resendKey) {
  console.error('Missing RESEND_API_KEY in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const resend = new Resend(resendKey);

async function main() {
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, category, quiz, published, notified_at')
    .eq('slug', slug)
    .single();

  if (postError || !post) {
    console.error(`No post found with slug "${slug}".`);
    process.exit(1);
  }

  if (!post.published) {
    console.error(`"${post.title}" isn't published yet — publish it first.`);
    process.exit(1);
  }

  if (post.notified_at && !force) {
    console.error(
      `"${post.title}" was already notified on ${new Date(post.notified_at).toLocaleString()}.\n` +
        'Re-run with --force if you really want to send it again.'
    );
    process.exit(1);
  }

  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('email, unsubscribe_token');

  if (subError) {
    console.error('Failed to fetch subscribers:', subError.message);
    process.exit(1);
  }

  if (!subscribers || subscribers.length === 0) {
    console.log('No subscribers yet — nothing to send.');
    return;
  }

  console.log(`Sending "${post.title}" to ${subscribers.length} subscriber(s)...\n`);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const emails = subscribers.map((sub) => ({
    from: FROM,
    to: sub.email,
    subject: `New post: ${post.title}`,
    html: renderEmail({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      hasQuiz: Array.isArray(post.quiz) && post.quiz.length > 0,
      postUrl,
      token: sub.unsubscribe_token,
    }),
  }));

  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const { data, error } = await resend.batch.send(chunk);

    if (error) {
      console.error('Batch send failed:', error.message);
      process.exit(1);
    }

    sent += data.data.length;
    console.log(`  sent ${data.data.length} (batch ${Math.floor(i / BATCH_SIZE) + 1})`);
  }

  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({ notified_at: new Date().toISOString() })
    .eq('slug', slug);

  if (updateError) {
    console.error('\nEmails sent, but failed to mark the post as notified:', updateError.message);
    process.exit(1);
  }

  console.log(`\nDone. ${sent} email(s) sent.`);
}

// Mirrors lib/blog-content.ts's CATEGORY_COLORS. Duplicated here (rather than
// imported) since this script runs as plain Node and can't load a .ts file.
const CATEGORY_COLORS = {
  AI: '#c084fc',
  Gaming: '#f472b6',
  Travel: '#fb923c',
  Engineering: '#38bdf8',
  Investing: '#facc15',
  'Mental Models': '#fb7185',
};
const DEFAULT_CATEGORY_COLOR = '#0aee3c';

function categoryColor(category) {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}

function renderEmail({ title, excerpt, category, hasQuiz, postUrl, token }) {
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`;
  const accent = categoryColor(category);

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
        ${category ? `<span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${accent};margin-bottom:10px;">${escapeHtml(category)}</span><br/>` : `<p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 10px;">New post</p>`}
        <h1 style="font-size:24px;margin:0 0 16px;color:#0a0a0a;line-height:1.3;">${escapeHtml(title)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#333;margin:0 0 24px;">${escapeHtml(excerpt)}</p>
        ${
          hasQuiz
            ? `<table role="presentation" cellpadding="0" cellspacing="0" style="background:#eefbf1;border-radius:8px;margin:0 0 28px;">
          <tr>
            <td style="padding:14px 18px;font-size:14px;color:#166534;line-height:1.5;">
              🧠 <strong>Heads up:</strong> this post ends with a short quiz so you can test what you just learned.
            </td>
          </tr>
        </table>`
            : ''
        }
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 36px;">
        <a href="${postUrl}" style="display:inline-block;background:#0aee3c;color:#0a0a0a;font-weight:700;font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">Read the full post →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#999;margin:0;">
          You're getting this because you subscribed at amoljadhav.ai. <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a> at any time.
        </p>
      </td>
    </tr>
  </table>
</div>`.trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
