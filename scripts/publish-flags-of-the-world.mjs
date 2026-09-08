// Publishes "Every Flag in the World, and the Six Families They Come From".
//
// The prose is rendered from drafts/flags-of-the-world.md at run time, so the
// draft stays the source of truth and re-running after an edit republishes the
// real thing.
//
// Entities are deliberately absent from the output. Article HTML is injected
// with dangerouslySetInnerHTML, and a string containing "&mdash;" cannot match
// the DOM it produces, which serialises the character back raw. The script
// refuses to publish if any survive.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-flags-of-the-world.mjs

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

const TITLE = "Decoding the World's Flags: The Six Families You Need to Know";
// Short and conceptual, so it cannot go stale the way a slug with a count in it
// does — the TFT article still says all-27-teams now the source lists 31.
const SLUG = 'flags-of-the-world';
const CATEGORY = 'Curiosity';
const READ_TIME = 13;
const EXCERPT =
  'There are 195 countries but nowhere near 195 ideas. Six design families cover most of the world, and once you know them you can place a flag you have never seen. Includes every flag, searchable, and a quiz that works through all of them.';

// The pre-read quiz is generated from the flag data, not hand-written: it shows
// a flag and asks which country it is, which is the only question this article
// is really about.
//
// It cannot cover all 195, because QuickCheck walks every question it is given
// and draws a progress dot for each — 195 dots is not a quiz, it is a
// punishment. Full coverage is the job of the in-article flag-quiz widget,
// which works through the whole set. This one is a representative sample: the
// famous near-identical pairs first, because they make the point, then one
// country from each World Bank region so no part of the world is missing.
//
// Deterministic, so republishing does not silently reshuffle a reader's quiz.
const QUIZ_SIZE = 12;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readFlagData() {
  const src = readFileSync(new URL('../components/blog/widgets/countryFlagData.ts', import.meta.url), 'utf-8');
  const slice = (from, to) => {
    const start = src.indexOf(from) + from.length;
    const end = to ? src.indexOf(to) : src.length;
    return JSON.parse(src.slice(start, end).trim().replace(/;\s*$/, ''));
  };
  return {
    families: slice('FLAG_FAMILIES: FlagFamily[] =', 'export const LOOKALIKES'),
    lookalikes: slice('LOOKALIKES: Lookalike[] =', 'export const COUNTRIES'),
    countries: slice('COUNTRIES: Country[] ='),
  };
}

function buildQuiz() {
  const { families, lookalikes, countries } = readFlagData();
  const pool = countries.filter((c) => c.sovereign);
  const byCode = new Map(pool.map((c) => [c.code, c]));
  const rand = mulberry32(20260907);
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const flag = (code) => `https://flagcdn.com/w320/${code.toLowerCase()}.png`;

  // The hard pairs are worth asking first; one member of each is enough.
  const chosen = [];
  for (const pair of lookalikes) {
    const c = byCode.get(pair.codes[0]);
    if (c && !chosen.some((x) => x.code === c.code)) chosen.push(c);
  }
  // Then one per region, so the sample spans the world rather than Europe.
  for (const region of [...new Set(pool.map((c) => c.region))]) {
    if (chosen.length >= QUIZ_SIZE) break;
    const candidate = shuffle(pool.filter((c) => c.region === region && !chosen.some((x) => x.code === c.code)))[0];
    if (candidate) chosen.push(candidate);
  }
  while (chosen.length < QUIZ_SIZE) {
    const candidate = shuffle(pool.filter((c) => !chosen.some((x) => x.code === c.code)))[0];
    if (!candidate) break;
    chosen.push(candidate);
  }

  return chosen.slice(0, QUIZ_SIZE).map((answer) => {
    const decoys = [];
    const pair = lookalikes.find((l) => l.codes.includes(answer.code));
    if (pair) for (const code of pair.codes) {
      const c = code === answer.code ? null : byCode.get(code);
      if (c && !decoys.some((d) => d.code === c.code)) decoys.push(c);
    }
    if (decoys.length < 3 && answer.families.length) {
      for (const c of shuffle(pool.filter((x) => x.code !== answer.code && x.families.includes(answer.families[0])))) {
        if (decoys.length >= 3) break;
        if (!decoys.some((d) => d.code === c.code)) decoys.push(c);
      }
    }
    for (const c of shuffle(pool.filter((x) => x.code !== answer.code && x.region === answer.region))) {
      if (decoys.length >= 3) break;
      if (!decoys.some((d) => d.code === c.code)) decoys.push(c);
    }
    // North America holds only Canada and the United States here, so a
    // last-resort fill stops those questions coming out as a coin flip.
    for (const c of shuffle(pool.filter((x) => x.code !== answer.code))) {
      if (decoys.length >= 3) break;
      if (!decoys.some((d) => d.code === c.code)) decoys.push(c);
    }

    const options = shuffle([answer, ...decoys.slice(0, 3)]);
    const family = families.find((f) => f.id === answer.families[0]);
    const note = pair ? ` ${pair.note}` : family ? ` All four are ${family.name.toLowerCase()} flags.` : '';

    return {
      question: 'Which country flies this flag?',
      image: flag(answer.code),
      imageAlt: 'A national flag to identify',
      options: options.map((c) => c.name),
      correctIndex: options.findIndex((c) => c.code === answer.code),
      explanation: `${answer.name}.${note}`.trim(),
    };
  });
}

const QUIZ = buildQuiz();

// Widget captions live here rather than in the draft, so the prose file stays
// prose. The big two get an eyebrow and a caption; the inline flag rows carry
// a family or an explicit list of ISO codes.
const BIG = {
  'flag-browser': [
    'Every flag, by family',
    'Search it, or filter by design family — the Nordic cross stops being a fact and becomes one idea copied six times.',
  ],
  'flag-quiz': [
    'Whose flag is this?',
    'Starts on the hardest pair in the world. The wrong answers come from the same family as the right one.',
  ],
};

function renderDraft() {
  const md = readFileSync(new URL('../drafts/flags-of-the-world.md', import.meta.url), 'utf-8');
  const body = md.split(/^---$/m)[1] ?? md;

  const inline = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      .replace(/"([^"]*)"/g, '\u201c$1\u201d')
      .replace(/'/g, '\u2019');

  const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return body
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => {
      const b = block.trim();
      if (b.startsWith('<!-- widget:')) {
        const spec = b.split('widget:')[1].split('-->')[0].trim();
        const name = spec.split(/\s+/)[0];
        if (BIG[name]) {
          const [eyebrow, caption] = BIG[name];
          return `<div data-widget="${name}" data-eyebrow="${escapeAttr(eyebrow)}" data-caption="${escapeAttr(caption)}"></div>`;
        }
        let attrs = '';
        const family = spec.match(/family=([a-z-]+)/);
        if (family) attrs += ` data-family="${family[1]}"`;
        const codes = spec.match(/codes=([A-Z,]+)/);
        if (codes) attrs += ` data-codes="${codes[1]}"`;
        const note = spec.match(/note=(.+)$/);
        if (note) attrs += ` data-note="${escapeAttr(note[1].trim())}"`;
        // data-inline keeps small illustrations out of the mobile full-bleed rule.
        return `<div data-widget="${name}" data-inline="true"${attrs}></div>`;
      }
      if (b.startsWith('## ')) return `<h3>${inline(b.slice(3).trim())}</h3>`;
      return `<p>${inline(b.split('\n').map((l) => l.trim()).join(' '))}</p>`;
    })
    .join('\n');
}

const CONTENT = renderDraft();

async function main() {
  const text = CONTENT.replace(/<[^>]*>/g, '');
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(text)) {
    console.error('Refusing to publish: the HTML contains entities that will not survive serialisation.');
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
  console.log(`  ${CONTENT.length} chars of HTML, ${QUIZ.length} quiz questions`);
  console.log(`  widgets: ${[...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]).join(', ')}`);
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
