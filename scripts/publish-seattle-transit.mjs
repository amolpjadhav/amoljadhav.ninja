// Publishes "Seattle Transit: When Is the Next Bus?" to the blog.
//
// The HTML below is generated from drafts/seattle-transit-next-bus.md, so
// the draft stays the source of truth. The article is a lookup tool, not a
// read: the draft carries no prose, just the transit-lookup widget
// placeholder, which ArticleContent portals the TransitLookup component
// into. Entities are deliberately absent: the article HTML is injected
// with dangerouslySetInnerHTML, and a string containing "&mdash;" cannot
// match the DOM it produces, which serialises the character back raw.
// lib/blog-content.ts normalises this on read as well, but there is no
// reason to store the version that needs fixing.
//
// Idempotent: upserts on slug, so re-running updates rather than
// duplicating.
//
// Usage:
//   node scripts/publish-seattle-transit.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TITLE = 'Seattle Transit: When Is the Next Bus?';
const SLUG = 'seattle-transit-next-bus';
const CATEGORY = 'Travel';
// A tool, not a read: the page is the lookup widget plus its dek.
const READ_TIME = 1;
const EXCERPT =
  'Live arrivals for any stop, plus trip suggestions. Just say where you are starting.';

// No quiz on this article: it is a lookup tool, not a read, so the
// pre-read quiz box does not belong. (The page renders it only when quiz
// is set.)

// Built from the draft at run time, so the markdown stays the single
// source of truth and re-running after an edit republishes the real
// thing. `<div data-widget=...>` placeholders pass through verbatim so
// ArticleContent can portal the matching widget into place. `---`
// separators are dropped, never published.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/seattle-transit-next-bus.md', import.meta.url), 'utf-8');
  // Drop the title/category header up to the FIRST `---` line only.
  const lines = md.split('\n');
  const sep = lines.findIndex((l) => l.trim() === '---');
  const body = sep === -1 ? md : lines.slice(sep + 1).join('\n');

  const inline = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      // Curly quotes and apostrophes as characters, never entities — see
      // the note at the top of this file.
      .replace(/"([^"]*)"/g, '\u201c$1\u201d')
      .replace(/'/g, '\u2019');

  return body
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .filter((block) => !/^-{3,}\s*$/.test(block.trim()))
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<div data-widget=')) return b;
      return `<p>${inline(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  const dryRun = process.argv[2] === '--dry-run';
  const widgets = [...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]);
  console.log(`  ${CONTENT.length} chars of HTML, no quiz`);
  console.log(`  widgets: ${widgets.join(', ') || '(none)'}`);

  if (!CONTENT) {
    console.error('Article HTML is empty.');
    process.exit(1);
  }
  const text = CONTENT.replace(/<[^>]*>/g, '');
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(text)) {
    console.error('Refusing to publish: the HTML contains entities that will not survive serialisation.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('Dry run — nothing written.');
    return;
  }

  const row = {
    title: TITLE,
    slug: SLUG,
    content: CONTENT,
    excerpt: EXCERPT,
    published: true,
    category: CATEGORY,
    read_time: READ_TIME,
    quiz: null,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(row, { onConflict: 'slug' })
    .select('title, slug, published, category, read_time')
    .single();

  if (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }

  console.log(`Published: ${data.title}`);
  console.log(`  /blog/${data.slug} — ${data.category}, ${data.read_time} min, published=${data.published}`);
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
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
