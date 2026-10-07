// Publishes "Look Up Stock and Company Details" to the blog.
//
// The HTML below is generated from drafts/look-up-stock-and-company-details.md,
// so the draft stays the source of truth for the prose. Entities are
// deliberately absent: the article HTML is injected with
// dangerouslySetInnerHTML, and a string containing "&mdash;" cannot match the
// DOM it produces, which serialises the character back raw.
// lib/blog-content.ts normalises this on read as well, but there is no reason
// to store the version that needs fixing.
//
// Renderer notes: the draft keeps the author's prose verbatim with plain-text
// section titles (no `##` markers), so the four known section titles below are
// mapped to `<h3>` by exact match; every other block becomes `<p>`.
// `<div data-widget=...>` placeholders pass through verbatim so ArticleContent
// can portal the matching widget into place. `---` separators are dropped,
// never published.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-look-up-stock.mjs [--dry-run]

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

const TITLE = 'Look Up Stock and Company Details';
const SLUG = 'look-up-stock-and-company-details';
const CATEGORY = 'Investing';
const READ_TIME = 5;
const EXCERPT =
  'One page per company: type any US stock ticker to see what the business does, the quote, five years of financials, and SEC filings — plus how to read each part in 30 seconds.';

const QUIZ = [
  {
    question: 'What should you read first when you look up a company?',
    options: [
      'The stock price — the market is always right',
      'What the business does, in one sentence you can say back',
      'The 52-week low, to time your entry',
      'The list of filings, oldest first',
    ],
    correctIndex: 1,
    explanation:
      'If you cannot say what the business sells and who pays for it, the numbers have no meaning yet. Business first, price second.',
  },
  {
    question: 'Revenue is growing but net margin is shrinking. What does that mean?',
    options: [
      'The business is healthier than ever',
      'Each new dollar of revenue is less profitable than the last',
      'The company must be committing fraud',
      'The share count is falling',
    ],
    correctIndex: 1,
    explanation:
      'Growth is only half the story. A shrinking margin means the company keeps fewer cents per dollar — growth is getting more expensive.',
  },
  {
    question: 'A $700 stock and a $70 stock — which company is bigger?',
    options: [
      'The $700 stock, obviously',
      'The $70 stock — cheaper means more shares',
      'Whichever has the bigger market cap; share price alone says nothing about size',
      'They must be the same size',
    ],
    correctIndex: 2,
    explanation:
      'Market cap is share price times shares outstanding — the price of the whole company. A $700 stock can be a far smaller company than a $70 one.',
  },
  {
    question: 'Where does the company describe its own business in its own words?',
    options: [
      'In its TV commercials',
      'In the 10-K annual report, Item 1 (Business)',
      'In analyst price targets',
      'In the Wikipedia talk page',
    ],
    correctIndex: 1,
    explanation:
      'The 10-K is the big annual filing, and Item 1 is the company telling regulators — under oath, effectively — what it does.',
  },
  {
    question: 'Why does an ETF show no financials table on the lookup page?',
    options: [
      'The data feed is broken for ETFs',
      'ETFs are not listed on exchanges',
      'A fund has no revenue or profit of its own to report',
      'ETFs are banned from SEC filings',
    ],
    correctIndex: 2,
    explanation:
      'A fund just holds other assets, so revenue, margin, and EPS do not apply. The quote and overview still work.',
  },
];

// The draft carries the author's prose verbatim — section titles are plain
// lines, not markdown headings — so they are recognised by exact match and
// rendered as headings.
const SECTION_TITLES = new Set([
  'What each part tells you',
  'The 30-second routine',
  'Where the numbers come from',
  'The one thing to remember',
]);

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/look-up-stock-and-company-details.md', import.meta.url), 'utf-8');
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
