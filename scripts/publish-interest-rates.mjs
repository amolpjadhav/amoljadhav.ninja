// Publishes "Interest Rates: The Fed's One Lever" to the blog.
//
// The HTML below is generated from drafts/interest-rates-the-feds-one-lever.md,
// so the draft stays the source of truth for the prose. Entities are deliberately
// absent: the article HTML is injected with dangerouslySetInnerHTML, and a
// string containing "&mdash;" cannot match the DOM it produces, which
// serialises the character back raw. lib/blog-content.ts normalises this on
// read as well, but there is no reason to store the version that needs fixing.
//
// Beyond the regression script this extends: this draft uses bullet and
// numbered lists, a markdown link, and raw <div data-widget> blocks, so the
// renderer handles those instead of wrapping everything in <p>.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-interest-rates.mjs

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

const TITLE = "Interest Rates: The Fed's One Lever";

// Short and conceptual rather than a slugified title. The TFT article is still
// carrying "all-27-teams" in its URL after the source moved to 31, which is the
// argument for keeping a number and a claim out of a slug.
const SLUG = 'interest-rates';
const CATEGORY = 'Economics';
const READ_TIME = 8;
const EXCERPT =
  "Twelve people meet eight times a year and decide a single number — and within weeks, your mortgage, your credit card, and your savings account all move. How the Fed's one lever cools prices, costs jobs, and what it can never fix.";

const QUIZ = [
  {
    question: 'Twelve people meet eight times a year and decide a single number. What is that number?',
    options: [
      'The federal budget for the year',
      'A short-term interest rate — the first digit of the price of borrowing money',
      'The tax rate everyone will pay',
      'How much money to print that month',
    ],
    correctIndex: 1,
    explanation:
      'No laws, no taxes, no spending. Just the rate banks charge each other overnight — and every mortgage, credit card, and savings account drifts with it within weeks.',
  },
  {
    question: 'Inflation is running hot. The Fed turns its dial UP. What happens next?',
    options: [
      'Borrowing gets cheaper, so people spend more and prices cool down',
      'Borrowing gets more expensive, so people spend less and prices cool down',
      'The government sends everyone a check to offset prices',
      'Banks are forced to lend more money',
    ],
    correctIndex: 1,
    explanation:
      'Expensive borrowing means fewer mortgages, fewer car loans, fewer expansions — less spending chasing goods, which is what cools prices. The thermostat turns the heat down.',
  },
  {
    question: 'Same $400,000 house, 30-year mortgage. Roughly what is the monthly payment at 3% versus 7%?',
    options: [
      'About $1,700 versus about $2,650 — nearly $1,000 more every month for the same house',
      'About $1,700 versus about $1,900 — barely noticeable',
      'The payment is identical; only the loan length changes',
      'About $1,700 versus about $5,000 — triple the cost',
    ],
    correctIndex: 0,
    explanation:
      '$1,686 versus $2,661 to be exact, and $207,000 versus $558,000 in lifetime interest. Same bricks, same street — a $350,000 difference from one number.',
  },
  {
    question: 'The Fed raises rates. Who wins and who loses?',
    options: [
      'Everyone wins — higher rates mean a stronger economy for all',
      'Borrowers win and savers lose',
      'Borrowers lose and savers win — the same lever tilts a seesaw with a winner and a loser',
      'Nobody is affected for at least a decade',
    ],
    correctIndex: 2,
    explanation:
      'Credit card debt at 22% takes $2,200 a year from a $10,000 balance, while savings at 4.5% earns $450. The lever never helps everyone — it picks which pain the economy can afford.',
  },
  {
    question: 'The Fed is legally supposed to deliver steady prices AND maximum employment. What is the catch?',
    options: [
      'There is no catch — low rates deliver both at once',
      'The same lever pushes both goals in opposite directions: cooling inflation eventually costs jobs',
      'Employment is handled by a different agency entirely',
      'The Fed only cares about prices and ignores jobs',
    ],
    correctIndex: 1,
    explanation:
      'Expensive borrowing cools prices but also kills expansions and then jobs. There is no setting with no losers — only a choice of which problem hurts less right now.',
  },
  {
    question: 'Oil spikes because of a war and prices surge. Why is the Fed nearly powerless here?',
    options: [
      'The Fed is not allowed to meet during wars',
      'This is a supply shock — goods vanished, and no interest rate can manufacture oil or microchips',
      'High rates always fix oil prices within days',
      'The Fed only controls prices in election years',
    ],
    correctIndex: 1,
    explanation:
      'The lever fixes too-much-money problems, not not-enough-stuff problems. Raising rates here just adds expensive borrowing on top of empty shelves — pushing on a string.',
  },
  {
    question: 'Rates are high. What should you do first?',
    options: [
      'Take on more credit card debt before rates rise further',
      'Kill variable-rate debt first — a carried balance becomes an emergency at 22%',
      'Move all savings into checking earning nothing',
      'Ignore it; rates do not affect households',
    ],
    correctIndex: 1,
    explanation:
      'Credit cards reset upward almost immediately. And flip it around: high rates are the one moment shopping for a 4%+ savings account is worth an afternoon.',
  },
  {
    question: 'You read the headline "Fed raises rates." What is the correct way to read it?',
    options: [
      'Good news, full stop',
      'Bad news, full stop',
      'Borrowers just lost and savers just won — someone chose expensive borrowing over melting money',
      'It means nothing until the next election',
    ],
    correctIndex: 2,
    explanation:
      'A rate move is a seesaw, not a verdict. Now you know enough to ask the useful question: who just paid, and why was that the cheaper pain?',
  },
];

// Built from the draft at run time, so the markdown stays the single source of
// truth for the prose and re-running after an edit republishes the real thing.
function renderDraft() {
  const md = readFileSync(new URL('../drafts/interest-rates-the-feds-one-lever.md', import.meta.url), 'utf-8');
  // Everything after the first --- line. (Unlike the regression draft, this
  // one also uses --- as a section separator, so [1] alone would keep only
  // the intro — take all remaining parts; lone --- blocks are skipped below.)
  const parts = md.split(/^---$/m);
  const body = parts.length > 1 ? parts.slice(1).join('\n') : md;

  const inline = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      // Curly quotes and apostrophes as characters, never entities — see the
      // note at the top of this file.
      .replace(/"([^"]*)"/g, '\u201c$1\u201d')
      .replace(/'/g, '\u2019');

  const blocks = body.trim().split(/\n\s*\n/).filter((block) => block.trim());
  const out = [];
  let list = null; // 'ul' | 'ol' | null

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const raw of blocks) {
    const b = raw.trim();
    if (b === '---' || b.startsWith('*Quiz (')) continue;
    if (b.startsWith('<div data-widget')) {
      closeList();
      out.push(b);
      continue;
    }
    if (b.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(b.slice(4).trim())}</h3>`);
      continue;
    }
    if (b.startsWith('## ')) {
      closeList();
      out.push(`<h3>${inline(b.slice(3).trim())}</h3>`);
      continue;
    }
    const lines = b.split('\n').map((l) => l.trim());
    if (lines.every((l) => l.startsWith('- '))) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      for (const l of lines) out.push(`<li>${inline(l.slice(2).trim())}</li>`);
      continue;
    }
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      for (const l of lines) out.push(`<li>${inline(l.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(lines.join(' '))}</p>`);
  }
  closeList();
  return out.join('\n');
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
  console.log(`  ${CONTENT.length} chars of HTML, ${QUIZ.length} quiz questions, widgets: line-trend, bar-compare`);
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
