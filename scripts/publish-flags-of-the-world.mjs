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

const TITLE = 'Every Flag in the World, and the Six Families They Come From';
// Short and conceptual, so it cannot go stale the way a slug with a count in it
// does — the TFT article still says all-27-teams now the source lists 31.
const SLUG = 'flags-of-the-world';
const CATEGORY = 'Curiosity';
const READ_TIME = 13;
const EXCERPT =
  'There are 195 countries but nowhere near 195 ideas. Six design families cover most of the world, and once you know them you can place a flag you have never seen. Includes every flag, searchable, and a quiz that works through all of them.';

// Pre-read quiz. Every answer is something the article explains, and the wrong
// options are what people usually believe instead.
const QUIZ = [
  {
    question: 'What do the red, white and blue of the Union Jack officially stand for?',
    options: [
      'Red for courage, white for peace, blue for justice',
      'The three kingdoms of England, Scotland and Ireland',
      'Nothing — they have no official meaning at all',
      'Red for the navy, white for the church, blue for the crown',
    ],
    correctIndex: 2,
    explanation:
      'The flag is three older flags stacked on top of each other, so the colors are simply what those flags already were. Every meaning you have heard was written afterwards by someone filling in a blank.',
  },
  {
    question: 'Which is the only national flag that is not a rectangle?',
    options: ['Switzerland', 'Nepal', 'Vatican City', 'Bhutan'],
    correctIndex: 1,
    explanation:
      'Nepal is two stacked pennants. Switzerland and the Vatican are unusual too, but in a different way — they are the only two squares.',
  },
  {
    question: 'The flags of Chad and Romania are famously hard to tell apart. What is the difference?',
    options: [
      'Romania has a coat of arms in the middle',
      'The stripes are in the opposite order',
      'Chad’s blue is slightly darker — and that is all',
      'Chad’s flag is square',
    ],
    correctIndex: 2,
    explanation:
      'Same three vertical bands, same order. Chad has raised the matter at the United Nations, and nothing has changed.',
  },
  {
    question: 'Why did so many newly independent African countries adopt red, gold and green?',
    options: [
      'They were the colors of the United Nations at the time',
      'They are the cheapest dyes to produce at scale',
      'They came from Ethiopia, which had defeated a European army and stayed independent',
      'They were required by the Organisation of African Unity',
    ],
    correctIndex: 2,
    explanation:
      'In 1896 at Adwa an Ethiopian army beat an invading Italian one. Sixty years later those colors already meant the place that never had to ask, so Ghana took them in 1957 and a dozen countries followed.',
  },
  {
    question: 'Singapore’s flag has a crescent moon. What does it represent?',
    options: [
      'Islam, as in Turkey and Pakistan',
      'A young country on the rise',
      'The country’s position on the equator',
      'Its independence from Malaysia',
    ],
    correctIndex: 1,
    explanation:
      'It has no religious meaning at all. The crescent is a young nation ascending, and the five stars beside it are democracy, peace, progress, justice and equality. It only looks like it belongs with the others.',
  },
];

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
