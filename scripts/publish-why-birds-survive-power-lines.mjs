// Publishes "Why Birds Can Sit on Power Lines (and You Can't)" to the blog.
//
// The HTML below is generated from drafts/why-birds-survive-power-lines.md,
// so the draft stays the source of truth for the prose. Entities are
// deliberately absent: the article HTML is injected with
// dangerouslySetInnerHTML, and a string containing "&mdash;" cannot match
// the DOM it produces, which serialises the character back raw.
// lib/blog-content.ts normalises this on read as well, but there is no
// reason to store the version that needs fixing.
//
// Differences from the planes publish script: this draft uses `- ` bullet
// blocks (rendered as <ul>), `##` section headings, and one raw
// `<div data-widget>` line (passed through unwrapped so ArticleContent can
// portal the matching widget into place).
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-why-birds-survive-power-lines.mjs [--dry-run]

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

const TITLE = "Why Birds Can Sit on Power Lines (and You Can't)";
const SLUG = 'why-birds-survive-power-lines';
const CATEGORY = 'Science';
const READ_TIME = 6;
const EXCERPT =
  'A bird sits on a power line carrying thousands of volts, completely relaxed. Grab that same wire and it would kill you. The difference is not the volts — it is the volts across you.';

// Mirrors the QUIZ array in app/preview-bird-wire/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'A bird sits on a 12,000-volt wire and feels nothing. What is the voltage across the bird\u2019s own body?',
    options: [
      '12,000 volts',
      'Essentially zero — both feet are at the same voltage, so there is no difference to push current',
      'About 6,000 volts, split between the two feet',
      'It depends on how big the bird is',
    ],
    correctIndex: 1,
    explanation:
      'Voltage only pushes from one voltage toward a different one. Same voltage everywhere you touch means no push and no current.',
  },
  {
    question: 'Which of these completes a circuit through a body and causes a shock?',
    options: [
      'Standing on one live wire wearing insulated boots',
      'Touching a live wire while standing on the ground',
      'Sitting on a single wire like a bird',
      'Touching a wire that has no voltage on it',
    ],
    correctIndex: 1,
    explanation:
      'Hand at line voltage, feet at zero: your body bridges two different voltages, so current flows through you.',
  },
  {
    question: 'A lineman works on a live wire from an insulated platform and is unharmed. Why?',
    options: [
      'The suit absorbs all the electricity',
      'The platform leaves current with no path anywhere else — same physics as the bird on the wire',
      'Linemen are trained to not feel shocks',
      'The wire is switched off while they work',
    ],
    correctIndex: 1,
    explanation:
      'No path, no current. Insulation works by removing the second contact point, not by fighting the voltage.',
  },
  {
    question: 'Dry skin is about 100,000 ohms. Grabbing a 120-volt wire with dry hands gives roughly 1 milliamp. What happens with soaking-wet hands at ~1,000 ohms?',
    options: [
      'About the same — voltage matters, not resistance',
      'About 120 milliamps, which can be lethal — this is why water and electricity are a deadly combination',
      'Less current, because water cools the skin',
      'Nothing, because 120 volts is always safe',
    ],
    correctIndex: 1,
    explanation:
      'Current is volts divided by resistance. Same 120 volts across 100× less resistance means 100× the current.',
  },
];

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/why-birds-survive-power-lines.md', import.meta.url), 'utf-8');
  // Drop the title/category header up to the FIRST `---` line only.
  const lines = md.split('\n');
  const sep = lines.findIndex((l) => l.trim() === '---');
  const body = sep === -1 ? md : lines.slice(sep + 1).join('\n');

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
    .filter((block) => !/^-{3,}\s*$/.test(block.trim()))
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<div data-widget=')) return b;
      if (/^#{2,3} /.test(b)) return `<h3>${inline(b.replace(/^#{2,3} /, '').trim())}</h3>`;
      const items = b.split('\n').map((l) => l.trim());
      if (items.length > 0 && items.every((l) => l.startsWith('- '))) {
        return `<ul>${items.map((l) => `<li>${inline(l.replace(/^- /, ''))}</li>`).join('')}</ul>`;
      }
      return `<p>${inline(items.join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  const dryRun = process.argv[2] === '--dry-run';
  const widgets = [...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]);
  console.log(`  ${CONTENT.length} chars of HTML, ${QUIZ.length} quiz questions`);
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
  const expected = ['bird-wire-demo'];
  const missing = expected.filter((w) => !widgets.includes(w));
  if (missing.length > 0) {
    console.error(`Refusing to publish: missing widgets: ${missing.join(', ')}`);
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
    quiz: QUIZ,
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
