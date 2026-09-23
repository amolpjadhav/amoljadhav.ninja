// Publishes "Why Do Planes Stay Up? (Your Teacher's Answer Was Mostly Wrong)"
// to the blog.
//
// The HTML below is generated from drafts/why-do-planes-stay-up.md, so the
// draft stays the source of truth for the prose. Entities are deliberately
// absent: the article HTML is injected with dangerouslySetInnerHTML, and a
// string containing "&mdash;" cannot match the DOM it produces, which
// serialises the character back raw. lib/blog-content.ts normalises this on
// read as well, but there is no reason to store the version that needs fixing.
//
// Differences from the flags publish script: this draft uses `###` section
// headings, `---` separators between sections, raw `<div data-widget>` lines
// (passed through unwrapped, full-bleed cards — not data-inline), and ends
// with a meta note about the quiz column that must not be published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-planes-stay-up.mjs [--dry-run]

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

const TITLE = "Why Do Planes Stay Up? (Your Teacher's Answer Was Mostly Wrong)";
const SLUG = 'why-do-planes-stay-up';
const CATEGORY = 'Science';
const READ_TIME = 6;
const EXCERPT =
  'A fully loaded 747 weighs about 440 tonnes, and the only thing holding it up is air. The story your teacher drew on the board — curved wing, hurrying air, Bernoulli — is neat, confident, and wrong. The real answer is simpler: wings shove air down, and the air shoves back.';

// Mirrors the QUIZ array in app/preview-planes-stay-up/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'What actually holds a plane up?',
    options: [
      'The curved top of the wing, which makes air hurry and push less',
      'The wing continuously shoves air downward, and the air shoves back just as hard',
      'The engines push against the sky like a ladder',
      'Hot air trapped under the wings',
    ],
    correctIndex: 1,
    explanation:
      'Action and reaction, same as swimming: every kilogram of air deflected down returns the favor upward. Add up a whole sky of shoved air and you get 440 tonnes hanging in the air.',
  },
  {
    question: 'The textbook claims air over the top must hurry to rejoin air below at the back edge. What do smoke tunnels show?',
    options: [
      'The two streams meet exactly on time, confirming the theory',
      'The top air arrives well before the bottom air — there was never a reunion to explain',
      'Air refuses to flow over wings at all',
      'The bottom air arrives first instead',
    ],
    correctIndex: 1,
    explanation:
      'Equal transit time was invented to explain a meeting that never happens. No appointment, no hurry, no theory.',
  },
  {
    question: 'Aerobatic planes fly upside down with symmetric wings. Why does this kill the textbook story?',
    options: [
      'It doesn\u2019t — upside-down flight uses a different physics',
      'Symmetric wings have no "long road on top," and inverted the long road points the wrong way — yet they fly fine',
      'Aerobatic planes are actually gliding, not flying',
      'They fly upside down only in thin mountain air',
    ],
    correctIndex: 1,
    explanation:
      'Kites, paper planes, and barn doors make the same point: shape refines lift but was never the engine. Tilt plus speed is.',
  },
  {
    question: 'So was Bernoulli wrong?',
    options: [
      'Yes — pressure differences across wings do not exist',
      'No — the pressures are real and his math describes them, but they are the speedometer, not the engine',
      'Yes — NASA proved air pressure has no effect on anything',
      'No — the textbook story is fully correct after all',
    ],
    correctIndex: 1,
    explanation:
      'The pressure field and the downward shove are one event seen two ways. Demote Bernoulli from cause to correct description and everything fits.',
  },
  {
    question: 'Why do planes take off and land nose-high?',
    options: [
      'It looks impressive for passengers',
      'Slow air needs a bigger shove per second, and more tilt means more shove',
      'The pilots are showing off',
      'Nose-high flight uses less fuel',
    ],
    correctIndex: 1,
    explanation:
      'Lift is shoved air per second. Less speed means each second must shove harder — so the wing tilts up to grab more air.',
  },
  {
    question: 'What is a stall?',
    options: [
      'The engines stopping mid-flight',
      'Tipping the wing too far so airflow breaks away, the downwash collapses, and lift vanishes',
      'Running out of fuel over the ocean',
      'A traffic jam in the boarding queue',
    ],
    correctIndex: 1,
    explanation:
      'Tilt is the whole game until it isn\u2019t: past the cliff edge the air can\u2019t follow the turn. Recovery is always the same — nose down, regain speed, let the air reattach.',
  },
  {
    question: 'Your hand out of a car window, palm tilted slightly up, feels lifted. What are you feeling?',
    options: [
      'Wind hitting your palm at random',
      'Your hand acting as a wing — deflecting air down and getting shoved up, plus drag pushing back',
      'An optical illusion; nothing is actually pushing',
      'The car\u2019s engine heat rising past your arm',
    ],
    correctIndex: 1,
    explanation:
      'Tilt more and it lifts harder (plus more backward shove on your arm). Tilt way too far and the lift dies — you just flew and stalled a wing.',
  },
  {
    question: 'A 440-tonne jumbo jet hangs in the sky. What is holding it up?',
    options: [
      'Nothing physical — modern jets are too heavy for air and use magnetic levitation',
      'Curved aluminum generating a vacuum above the wings',
      'Ordinary air, shoved downward wingful by wingful, shoving back',
      'The sheer speed of the engines pressing the plane upward',
    ],
    correctIndex: 2,
    explanation:
      'Four hundred tonnes of metal, held up by nothing but pushed-around sky. Shape refines it, speed feeds it, tilt controls it — the shove is the engine.',
  },
];

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/why-do-planes-stay-up.md', import.meta.url), 'utf-8');
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
  const expected = ['equal-transit-myth', 'downwash-pushback', 'upside-down-wing', 'hand-wing-stall'];
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
