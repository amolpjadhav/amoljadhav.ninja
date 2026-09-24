// Publishes "The Lindy Effect: Old Things Outlive New Things" to the blog.
//
// The HTML below is generated from drafts/the-lindy-effect.md, so the draft
// stays the source of truth for the prose. Entities are deliberately absent:
// the article HTML is injected with dangerouslySetInnerHTML, and a string
// containing "&mdash;" cannot match the DOM it produces, which serialises
// the character back raw. lib/blog-content.ts normalises this on read as
// well, but there is no reason to store the version that needs fixing.
//
// Same renderer notes as scripts/publish-planes-stay-up.mjs: `##`/`###`
// section headings, `---` separators between sections, raw
// `<div data-widget>` lines (passed through unwrapped, full-bleed cards),
// and a trailing meta note about the quiz column that must not be published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-lindy-effect.mjs [--dry-run]

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

const TITLE = 'The Lindy Effect: Old Things Outlive New Things';
const SLUG = 'the-lindy-effect';
const CATEGORY = 'Mental Models';
const READ_TIME = 5;
const EXCERPT =
  'Broadway actors in the 1960s noticed plays that survived a hundred performances usually survived a hundred more. That deli-counter rule — the Lindy effect — says the older a non-perishable thing is, the longer it will probably last. Here is how to use it, and where it breaks.';

// Mirrors the QUIZ array in app/preview-lindy-effect/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'What does the Lindy effect predict?',
    options: [
      'Old things are always better than new things',
      'For non-perishable things, the expected remaining life is roughly the current age',
      'Everything decays at the same rate, whatever it is',
      'New things always replace old things within a decade',
    ],
    correctIndex: 1,
    explanation:
      'Age is a track record. A book in print for fifty years has survived everything the world threw at it — expect fifty more.',
  },
  {
    question: 'Where does the name come from?',
    options: [
      'Charles Lindbergh, the first pilot to cross the Atlantic',
      'A Broadway deli where actors bet on how long plays would run',
      'The Lindy Hop dance craze of the 1930s',
      'A Lindt chocolate factory in Switzerland',
    ],
    correctIndex: 1,
    explanation:
      'Actors at Lindy\u2019s Delicatessen noticed plays that survived a hundred performances usually survived a hundred more. Albert Goldman coined the term in 1964.',
  },
  {
    question: 'A man is 90 years old. How much longer does Lindy expect him to live?',
    options: [
      'About 90 more years',
      'About 45 more years',
      'Trick question — Lindy does not apply to humans',
      'About 9 more years, a tenth of his age',
    ],
    correctIndex: 2,
    explanation:
      'Humans are perishable: they decay on their own. For perishable things the logic reverses — a 90-year-old is closer to the end, not further from it.',
  },
  {
    question: 'Why is mere survival evidence of robustness?',
    options: [
      'Because old things were built with better materials',
      'Because fragile things die young, so survivors passed a brutal silent exam',
      'Because people feel nostalgic about old things',
      'Because the government protects old institutions',
    ],
    correctIndex: 1,
    explanation:
      'Most restaurants, apps, and fads die fast. Surviving means withstanding competitors, changing tastes, and bad luck — a filter almost nothing passes.',
  },
  {
    question: 'Which is the safer bet to still exist in 20 years?',
    options: [
      'A two-month-old productivity app with great reviews',
      'A forty-year-old novel still in print',
      'Both are equally safe bets',
      'Neither — twenty years kills everything',
    ],
    correctIndex: 1,
    explanation:
      'The app has survived almost nothing; the novel survived wars, regimes, TV, and the smartphone. Bet with time, not against it.',
  },
  {
    question: 'What is the biggest caveat to keep in view?',
    options: [
      'The Lindy effect only works on Broadway plays',
      'It deals in probabilities, not guarantees — and survivorship bias hides the graveyard',
      'It was disproved by mathematicians in the 1990s',
      'It only applies to things younger than ten years',
    ],
    correctIndex: 1,
    explanation:
      'Plenty of old things do die, and we see survivors, not the fallen. Lindy says what is likely to endure — judgment still decides what should.',
  },
];

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/the-lindy-effect.md', import.meta.url), 'utf-8');
  // Drop the title/category header up to the FIRST `---` line only — later
  // `---` lines are section separators, filtered as blocks below.
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
    .filter((block) => !block.trim().startsWith('*Quiz '))
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<div data-widget=')) return b;
      if (/^#{2,3} /.test(b)) return `<h3>${inline(b.replace(/^#{2,3} /, '').trim())}</h3>`;
      return `<p>${inline(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  const dryRun = process.argv[2] === '--dry-run';
  const widgets = [...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]);
  console.log(`  ${CONTENT.length} chars of HTML, ${QUIZ.length} quiz questions`);
  console.log(`  widgets: ${widgets.join(', ')}`);

  if (!CONTENT) {
    console.error('Article HTML is empty.');
    process.exit(1);
  }
  const text = CONTENT.replace(/<[^>]*>/g, '');
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(text)) {
    console.error('Refusing to publish: the HTML contains entities that will not survive serialisation.');
    process.exit(1);
  }
  const expected = ['lindy-curves'];
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
