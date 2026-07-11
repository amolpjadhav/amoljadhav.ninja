// One-off backfill: Medium's RSS feed only exposes the 10 most recent posts,
// so `migrate-medium.mjs` silently misses anything older. This loads the
// pre-extracted archive (medium-archive-posts.json) for posts published
// before that window. Safe to re-run — upserts on `slug`.
//
// Usage:
//   node scripts/migrate-medium-archive.mjs            # imports as unpublished drafts
//   node scripts/migrate-medium-archive.mjs --publish  # imports and publishes immediately

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

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
  const archivePath = new URL('./medium-archive-posts.json', import.meta.url);
  const posts = JSON.parse(readFileSync(archivePath, 'utf-8'));

  console.log(`Loaded ${posts.length} archived post(s).\n`);

  const rows = posts.map((post) => ({ ...post, published: shouldPublish }));

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
      ? '\nDone. All archived posts imported and published.'
      : '\nDone. Posts imported as drafts. Review them, then flip `published` to true' +
          ' in Supabase (or re-run with --publish) to make them live.'
  );
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
