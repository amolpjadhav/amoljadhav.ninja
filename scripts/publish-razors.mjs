// Publishes "Occam's Razor and Hanlon's Razor: Start With the Simplest Story"
// to the blog.
//
// The HTML below is generated from drafts/occams-razor-and-hanlons-razor.md,
// so the draft stays the source of truth for the prose. Entities are
// deliberately absent: the article HTML is injected with
// dangerouslySetInnerHTML, and a string containing "&mdash;" cannot match the
// DOM it produces, which serialises the character back raw.
// lib/blog-content.ts normalises this on read as well, but there is no reason
// to store the version that needs fixing.
//
// Renderer notes: the draft keeps the author's prose verbatim with plain-text
// section titles (no `##` markers), so the six known section titles below are
// mapped to `<h3>` by exact match; every other block becomes `<p>`. `---`
// separators and the trailing quiz meta note are dropped, never published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-razors.mjs [--dry-run]

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

const TITLE = 'Occam\u2019s Razor and Hanlon\u2019s Razor: Start With the Simplest Story';
const SLUG = 'occams-razor-and-hanlons-razor';
const CATEGORY = 'Mental Models';
const READ_TIME = 5;
const EXCERPT =
  'Your bike tire is flat: nail, or a sneaky stranger in the night? The nail needs one ordinary thing to be true. That habit — fewest guesses first — is Occam\u2019s Razor, and its sibling Hanlon\u2019s Razor applies it to people: a forgotten seat at lunch is almost never a plot.';

// Mirrors the QUIZ array in app/preview-razors/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'Your bike tire is flat. What is the Occam-approved first guess?',
    options: [
      'Someone snuck into the garage and let the air out',
      'You rode over a nail \u2014 one ordinary thing explains it',
      'Tires just do that sometimes, no need to look',
      'Check every complicated explanation at the same time',
    ],
    correctIndex: 1,
    explanation:
      'The nail story needs just one ordinary thing to be true. The sneaky-person story needs a lot of strange things to all be true at once.',
  },
  {
    question: 'Why is it called a razor?',
    options: [
      'Because the idea is sharp enough to cut tires',
      'Because it shaves away the extra guesses, leaving only what you need',
      'Because William of Ockham sold razors for a living',
      'Because simple stories always cut people off',
    ],
    correctIndex: 1,
    explanation:
      'Do not add extra explanations you do not need \u2014 shave them off until only the necessary guesses remain.',
  },
  {
    question: 'What happens when the simple story is wrong?',
    options: [
      'You never find out \u2014 simple stories hide their mistakes',
      'You find out fast, because it is easy to check',
      'You have to abandon the razor entirely',
      'The complicated story automatically becomes right',
    ],
    correctIndex: 1,
    explanation:
      'Check the tire for a nail. No hole? Now you know to look elsewhere. The complicated story just absorbs each new clue with another guess.',
  },
  {
    question: 'Your friend did not save you a seat at lunch. What does Hanlon\u2019s Razor say?',
    options: [
      'She is mad at you and wants you to feel left out',
      'Start by guessing she got distracted and forgot',
      'Stop sitting with her to stay safe',
      'Tell everyone else she was being mean',
    ],
    correctIndex: 1,
    explanation:
      'Forgetting needs a busy, distracted person. Being mean on purpose needs a reason, a plan, and someone who wants to hurt you.',
  },
  {
    question: 'Why does guessing \u201chonest mistake\u201d first pay off?',
    options: [
      'Because people never act with bad intentions',
      'Because it protects the friendship and gives you an easy next step',
      'Because getting angry uses no energy at all',
      'Because first guesses can never be revised',
    ],
    correctIndex: 1,
    explanation:
      '\u201cShe forgot\u201d lets you just ask for a seat tomorrow. And it is only the first guess \u2014 if she \u201cforgets\u201d every day for a month, the pattern is a new clue.',
  },
  {
    question: 'How do the two razors work as a pair?',
    options: [
      'Nail before sneaky stranger; forgot before left out on purpose',
      'Always assume the complicated story about people',
      'Use Occam for friends and Hanlon for bikes',
      'They cancel each other out, so trust your gut instead',
    ],
    correctIndex: 0,
    explanation:
      'Occam picks the simplest story about the world; Hanlon reminds you the simplest story about people is usually a mistake, not a secret plan.',
  },
];

// The draft carries the author's prose verbatim — section titles are plain
// lines, not markdown headings — so they are recognised by exact match and
// rendered as headings, exactly as the preview page does.
const SECTION_TITLES = new Set([
  'Why the simple story usually wins',
  'Where simple goes wrong',
  'The sibling, for dealing with people',
  'Why assuming a mistake first pays off',
  'The pair, working together',
  'The one thing to remember',
]);

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/occams-razor-and-hanlons-razor.md', import.meta.url), 'utf-8');
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
      if (SECTION_TITLES.has(b)) return `<h3>${inline(b)}</h3>`;
      return `<p>${inline(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
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
