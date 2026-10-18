// Publishes "AI Model Price Calculator: What That Prompt Actually Costs" to
// the blog.
//
// The HTML below is generated from drafts/ai-model-price-calculator.md, so
// the draft stays the source of truth for the prose. Entities are
// deliberately absent: the article HTML is injected with
// dangerouslySetInnerHTML, and a string containing "&mdash;" cannot match
// the DOM it produces, which serialises the character back raw.
// lib/blog-content.ts normalises this on read as well, but there is no
// reason to store the version that needs fixing.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-ai-model-price-calculator.mjs [--dry-run]

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

const TITLE = 'AI Model Price Calculator: What That Prompt Actually Costs';
const SLUG = 'ai-model-price-calculator';
const CATEGORY = 'AI';
const READ_TIME = 3;
const EXCERPT =
  'The same prompt can cost half a cent or fifty cents depending on the model. Estimate your bill from your own token usage, or compare the flagships head to head — with live prices.';

// Mirrors the QUIZ array in app/preview-ai-prices/page.tsx. The draft
// deliberately does not duplicate it, so keep the two in sync by hand.
const QUIZ = [
  {
    question: 'A model charges $2 per 1M input tokens and $10 per 1M output tokens. What does 100K in + 25K out cost?',
    options: [
      'About $12.00 — you add the two per-million prices',
      'About $0.45 — $0.20 of input plus $0.25 of output',
      'About $0.12 — output tokens are free under 1M',
      'About $4.50 — ten times the input price',
    ],
    correctIndex: 1,
    explanation:
      '100K is a tenth of a million ($0.20) and 25K out is a fortieth of the $10/M output price ($0.25). Tokens in times price in, plus tokens out times price out.',
  },
  {
    question: 'Why does a chatbot that writes long answers usually cost more than one that reads long documents?',
    options: [
      'Reading is billed per page, writing per word',
      'Output tokens typically cost much more than input tokens, so the bill follows the writing',
      'Long documents are compressed for free',
      'Chatbots get a discount on input tokens',
    ],
    correctIndex: 1,
    explanation:
      'Providers charge a premium for generation — roughly 3 to 8 times the input price. Same token count, different direction, very different bill.',
  },
  {
    question: 'The ranked table under your result shows every model priced for YOUR usage. What does “12.5×” next to a model mean?',
    options: [
      'It is 12.5 times faster than the cheapest model',
      'It uses 12.5 times more tokens for the same task',
      'It costs 12.5 times more than the cheapest model for exactly the usage you entered',
      'It was updated 12.5 times more recently',
    ],
    correctIndex: 2,
    explanation:
      'Same tokens, different prices: the × column is the cost ratio against the cheapest row, recomputed live from your inputs.',
  },
  {
    question: 'Your bill is far higher than the visible text suggests, on a reasoning model. What should you check first?',
    options: [
      'Whether the provider rounded up your character count',
      'The usage logs for hidden thinking tokens, billed as output',
      'Whether input tokens cost more than output tokens',
      'Whether the calculator added tax',
    ],
    correctIndex: 1,
    explanation:
      'Thinking models bill their internal reasoning as output. A short answer can carry thousands of invisible tokens.',
  },
];

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/ai-model-price-calculator.md', import.meta.url), 'utf-8');
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
  const expected = ['ai-price-calculator'];
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
