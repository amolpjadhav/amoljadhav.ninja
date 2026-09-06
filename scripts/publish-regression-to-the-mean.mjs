// Publishes "Regression to the Mean: Why the Best Get Worse and the Worst Get
// Better" to the blog.
//
// The HTML below is generated from drafts/regression-to-the-mean.md, so the
// draft stays the source of truth for the prose. Entities are deliberately
// absent: the article HTML is injected with dangerouslySetInnerHTML, and a
// string containing "&mdash;" cannot match the DOM it produces, which
// serialises the character back raw. lib/blog-content.ts normalises this on
// read as well, but there is no reason to store the version that needs fixing.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-regression-to-the-mean.mjs

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

const TITLE = 'Regression to the Mean: Why the Best Get Worse and the Worst Get Better';

// Short and conceptual rather than a slugified title. The TFT article is still
// carrying "all-27-teams" in its URL after the source moved to 31, which is the
// argument for keeping a number and a claim out of a slug.
const SLUG = 'regression-to-the-mean';
const CATEGORY = 'Mental Models';
const READ_TIME = 6;
const EXCERPT =
  'Flight instructors in the 1960s Israeli Air Force had years of evidence that praise ruined landings and screaming fixed them. They were right about the pattern and wrong about the cause — and the same mistake is waiting in medicine, money, hiring and your best week of the year.';

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/regression-to-the-mean.md', import.meta.url), 'utf-8');
  const body = md.split(/^---$/m)[1] ?? md;

  const inline = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      // Curly quotes and apostrophes as characters, never entities — see the
      // note at the top of this file.
      .replace(/"([^"]*)"/g, '\u201c$1\u201d')
      .replace(/'/g, '\u2019');

  return body
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<!-- widget:')) {
        const name = b.split('widget:')[1].split('-->')[0].trim();
        return (
          `<div data-widget="${name}" data-eyebrow="Do it yourself" ` +
          `data-caption="240 people with a fixed hidden ability, scoring twice. Pick the extremes of round one, then look at round two."></div>`
        );
      }
      if (b.startsWith('## ')) return `<h3>${inline(b.slice(3).trim())}</h3>`;
      return `<p>${inline(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  if (!CONTENT) {
    console.error('Article HTML is empty.');
    process.exit(1);
  }
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(CONTENT.replace(/<[^>]*>/g, ''))) {
    console.error('Refusing to publish: the HTML still contains entities that will not survive serialisation.');
    process.exit(1);
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
  console.log(`  ${CONTENT.length} chars of HTML, widget: regression-to-mean`);
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
