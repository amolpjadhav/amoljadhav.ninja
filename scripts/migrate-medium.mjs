// One-off migration: pull posts from the Medium RSS feed and load them into
// the Supabase `blog_posts` table. Safe to re-run — upserts on `slug`.
//
// Usage:
//   node scripts/migrate-medium.mjs            # imports as unpublished drafts
//   node scripts/migrate-medium.mjs --publish  # imports and publishes immediately

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const MEDIUM_USERNAME = '@amoljadhav_48655';
const RSS_TO_JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  `https://medium.com/feed/${MEDIUM_USERNAME}`
)}`;

loadEnvLocal();

const shouldPublish = process.argv.includes('--publish');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Copy .env.example to .env.local and fill in your Supabase project values first.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`Fetching Medium feed for ${MEDIUM_USERNAME}...`);
  const res = await fetch(RSS_TO_JSON_URL);
  const data = await res.json();

  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    console.error('Failed to fetch/parse Medium feed:', data.message || data);
    process.exit(1);
  }

  console.log(`Found ${data.items.length} article(s).\n`);

  const rows = data.items.map((item) => toBlogPost(item, shouldPublish));

  const { data: upserted, error } = await supabase
    .from('blog_posts')
    .upsert(rows, { onConflict: 'slug' })
    .select('title, slug, published');

  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }

  for (const post of upserted) {
    console.log(`  ${post.published ? '[published]' : '[draft]    '} ${post.title} -> /blog/${post.slug}`);
  }

  console.log(
    shouldPublish
      ? '\nDone. All posts imported and published.'
      : '\nDone. Posts imported as drafts. Review them, then flip `published` to true' +
          ' in Supabase (or re-run with --publish) to make them live.'
  );
}

function toBlogPost(item, published) {
  const title = item.title.trim();
  const slug = generateSlug(title);
  const plainText = stripHtml(item.content || item.description || '');

  return {
    title,
    slug,
    content: withCanonicalNote(item.content || item.description || '', item.link),
    excerpt: truncate(plainText, 200),
    published,
    tags: (item.categories || []).slice(0, 8),
    cover_image: item.thumbnail || extractFirstImage(item.content) || null,
    read_time: calculateReadTime(plainText),
    created_at: new Date(item.pubDate).toISOString(),
  };
}

function withCanonicalNote(html, link) {
  const note = `<p><em>Originally published on <a href="${link}" target="_blank" rel="noopener noreferrer">Medium</a>.</em></p>`;
  return `${note}\n${html}`;
}

function extractFirstImage(html) {
  const match = /<img[^>]+src="([^"]+)"/i.exec(html || '');
  return match ? match[1] : null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
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
