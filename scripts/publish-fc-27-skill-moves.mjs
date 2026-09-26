// Publishes "EA Sports FC 27 Skill Moves: The 5 That Win Games (Plus the 4
// New Ones)" to the blog.
//
// The HTML below is generated from drafts/fc-27-skill-moves.md, so the draft
// stays the source of truth for the prose. Entities are deliberately absent:
// the article HTML is injected with dangerouslySetInnerHTML, and a string
// containing "&mdash;" cannot match the DOM it produces, which serialises
// the character back raw. lib/blog-content.ts normalises this on read as
// well, but there is no reason to store the version that needs fixing.
//
// Renderer notes (same family as scripts/publish-planes-stay-up.mjs):
// `##`/`###` section headings, `---` separators between sections, raw
// `<div data-widget>` lines (passed through unwrapped, full-bleed cards),
// inline `<span data-widget="skill-input" ...>` combos inside paragraphs
// (passed through raw — the curly-quote transform must NOT touch their
// double-quoted attributes), and a trailing meta note about the quiz column
// that must not be published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-fc-27-skill-moves.mjs [--dry-run]

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

const TITLE = 'EA Sports FC 27 Skill Moves: The 5 That Win Games (Plus the 4 New Ones)';
const SLUG = 'fc-27-skill-moves';
const CATEGORY = 'Gaming';
const READ_TIME = 6;
const EXCERPT =
  'FC 27 added four new skill moves, but five old boring tricks still win more matches than everything else combined. The confirmed combos, the star-rating rules, and where each move actually fits.';

// Mirrors the QUIZ array in app/preview-fc-27-skill-moves/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'A 3-star midfielder tries a 4-star Heel to Heel Flick with perfect inputs. What happens?',
    options: [
      'It works — inputs are all that matter',
      'Nothing — a player can only perform moves at or below their star rating',
      'It works but drains extra stamina',
      'It works only in the practice arena',
    ],
    correctIndex: 1,
    explanation:
      'Stars are a hard gate. The best move is the best move your players can actually perform — check ratings before building attacks around tricks.',
  },
  {
    question: 'Which move is the most-used skill in competitive play?',
    options: [
      'Elastico',
      'Kneel Header',
      'Ball Roll — hold RS left or right',
      'Stepover Combo',
    ],
    correctIndex: 2,
    explanation:
      'Boring and unbeatable: roll sideways across your body, dodge the lunge, then shoot, pass, or sprint the other way.',
  },
  {
    question: 'When should you use Drag Back?',
    options: [
      'Every time you receive the ball, to stay safe',
      'When a defender is sprinting at you and overcommits — their momentum carries them past',
      'Only inside your own penalty area',
      'Only in the 90th minute',
    ],
    correctIndex: 1,
    explanation:
      'Hold L2+R2 (LT+RT) and flick LS down. But ration it: good players read patterns fast and will punish repetition.',
  },
  {
    question: 'Which of these is a new FC 27 move?',
    options: [
      'Ball Roll',
      'Stepover',
      'Ball Roll Spin — a roll fused with a spin to escape pressure',
      'Roulette',
    ],
    correctIndex: 2,
    explanation:
      'The four newcomers are Fake Turn (4★), Ball Roll Spin (4★), Stepover Combo (5★), and Kneel Header (1★ + Trickster). The Ball Roll Spin has the best chance of mattering.',
  },
  {
    question: 'What is unusual about the Kneel Header’s requirements?',
    options: [
      'It needs 5 stars like the Elastico',
      'It is gated behind the Trickster Playstyle rather than a star rating',
      'It can only be performed in the practice arena',
      'It needs no star rating and no Playstyle at all',
    ],
    correctIndex: 1,
    explanation:
      'L2 + R1 + flick RS up (LT + RB on Xbox) — any player with the Trickster Playstyle can perform it, even at 1 star.',
  },
  {
    question: 'What is the cardinal rule of skilling in matches?',
    options: [
      'Always use at least three moves per attack',
      'Never use skill moves in the first half',
      'One move per attack — every extra trick doubles the chance of losing the ball',
      'Only 5-star players should ever dribble',
    ],
    correctIndex: 2,
    explanation:
      'The best dribblers mostly do one ball roll and explode. Practice one move fifty times in the arena before it is match-ready.',
  },
];

const SPAN_RE = /(<span data-widget="skill-input" data-input="[^"]*"><\/span>)/g;

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/fc-27-skill-moves.md', import.meta.url), 'utf-8');
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

  // Inline skill-input spans pass through raw; everything around them gets
  // the normal inline treatment (this keeps attribute quotes intact).
  const inlineWithSpans = (text) =>
    text
      .split(SPAN_RE)
      .map((part) => (part.startsWith('<span data-widget=') ? part : inline(part)))
      .join('');

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
      return `<p>${inlineWithSpans(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
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
  const expected = ['skill-move-finder', 'skill-input'];
  const missing = expected.filter((w) => !widgets.includes(w));
  if (missing.length > 0) {
    console.error(`Refusing to publish: missing widgets: ${missing.join(', ')}`);
    process.exit(1);
  }
  // Inline combos must survive with attributes intact — no curly quotes inside.
  const broken = [...CONTENT.matchAll(/<span data-widget="skill-input" data-input="([^"]*)"><\/span>/g)].filter(
    (m) => /[\u201c\u201d]/.test(m[1])
  );
  if (broken.length > 0) {
    console.error('Refusing to publish: skill-input attributes were mangled.');
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
