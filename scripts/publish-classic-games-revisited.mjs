// One-off: publishes "Classic Games, Revisited" (drafted in
// drafts/classic-games-revisited.md, reviewed at /preview-classic-games-revisited)
// into the Supabase blog_posts table.
//
// CONTENT below is lifted verbatim from the reviewed preview — the four
// <div data-widget> lines are what mount the playable games through
// components/blog/widgets/registry.ts.
//
// Idempotent: upserts on slug, so re-running updates rather than duplicating.
//
// Usage:
//   node scripts/publish-classic-games-revisited.mjs [--dry-run]

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

const TITLE = 'Classic Games, Revisited';
const SLUG = 'classic-games-revisited';
const CATEGORY = 'Gaming';
const EXCERPT =
  'Wordle, 2048, Mastermind, Minesweeper, Sudoku — five games you know, playable right here. Underneath them: three ideas from math and computer science.';
const READ_TIME = 4;

const CONTENT = `<h3>Five Letters</h3>
<p>Guess the hidden five-letter word in six tries. A new daily word drops every midnight, Pacific time — or drill practice words below.</p>
<div data-widget="five-letters" id="five-letters"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: your first guess is an information bet</summary>
<p>Every guess splits the remaining answers into buckets — one bucket per feedback pattern. The best openers are the guesses whose buckets come out most even, because an even split eliminates the most answers on average no matter what comes back. That is the same expected-information math behind decision trees and twenty-questions strategies: test common letters in common slots first, and the field collapses fast. Hard mode takes away your best tool — throwaway guesses that only gather information — so it’s harder, not smarter.</p>
</details>

<h3>Minesweeper</h3>
<p>Nine by nine, ten mines: clear every safe square without detonating one. Your first click is always safe — the mines are placed after it.</p>
<div data-widget="minesweeper" id="minesweeper"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: you are doing probability by hand</summary>
<p>Every number is a local constraint — “exactly 2 of my 8 neighbors” — and solving well means combining overlapping constraints, which is informal probabilistic reasoning. Richard Kaye proved in 2000 that deciding whether a Minesweeper board is even consistent is NP-complete: in the worst case, no shortcut exists, and some boards genuinely force a guess. So when you stare at a 50/50 and shrug, that is not failure — that is computer science.</p>
</details>

<h3>Sudoku</h3>
<p>Fill every row, column, and 3×3 box with 1–9. Three difficulties, pencil notes, three hints — wrong digits bounce, they never stick.</p>
<div data-widget="sudoku" id="sudoku"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: propagate, don't guess</summary>
<p>Strong Sudoku players rarely backtrack. They scan for naked singles — cells whose row, column, and box leave exactly one candidate — fill them, and let each fill create the next single. That is constraint propagation, the same idea behind type inference and scheduling algorithms: pin down what is forced, propagate the consequences, and the board solves itself. Guessing is what you do when propagation stalls; noticing that distinction is the skill.</p>
</details>

<h3>Code Breaker</h3>
<p>Crack the secret 4-peg code in ten tries. A black peg means a color in the right slot; a white peg means a right color in the wrong slot.</p>
<div data-widget="code-breaker" id="code-breaker"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: five guesses always suffice</summary>
<p>Same math as Five Letters: each guess splits what’s left. There are only 6⁴ = 1,296 possible codes, and each guess partitions them by feedback. In 1977 Donald Knuth showed a strategy (always guess the code that minimizes the worst-case survivors) that cracks any code in at most five tries. You do not need his algorithm to play well: an opener with four different colors buys the most information, and from there, chase the guess that splits what is left most evenly.</p>
</details>

<h3>2048</h3>
<p>Slide the tiles; matching pairs merge and add to your score. Reach 2048 to win, then keep climbing.</p>
<div data-widget="game-2048" id="game-2048"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: the corner strategy</summary>
<p>Random sliding loses; disciplined sliding almost never does. Pick one corner for your biggest tile and never swipe it out: build a descending snake of tiles toward that corner, and every merge cascades into the next. It works because merges only help when big tiles touch — the corner is the one spot no swipe can strand you from.</p>
</details>

<h3>What you just practiced</h3>
<ul>
<li><strong>Splitting possibilities</strong> — every Five Letters and Code Breaker guess divided what was left into buckets and eliminated most of them.</li>
<li><strong>Chaining constraints</strong> — every Minesweeper number was one small fact, and solving meant combining overlapping facts until the next safe square was forced. Sudoku ran the same play: naked singles, propagated until the board gave way.</li>
<li><strong>Planning ahead</strong> — 2048 punished random moves and rewarded keeping your biggest tile pinned while you built toward it.</li>
</ul>

<h3>Your scorecard</h3>
<p>Played them all? Your bests are summarized below — they save in your browser.</p>
<div data-widget="game-scorecard" id="scorecard"></div>`;

async function main() {
  const dryRun = process.argv[2] === '--dry-run';
  const widgets = [...CONTENT.matchAll(/data-widget="([^"]+)"/g)].map((m) => m[1]);
  console.log(`  ${CONTENT.length} chars of HTML`);
  console.log(`  widgets: ${widgets.join(', ') || '(none)'}`);

  if (!CONTENT) {
    console.error('Article HTML is empty.');
    process.exit(1);
  }
  // Entities do not survive the dangerouslySetInnerHTML round trip, so the
  // draft stores raw characters instead (see publish-chess-notation.mjs).
  const text = CONTENT.replace(/<[^>]*>/g, '');
  if (/&(?!amp;|lt;|gt;|nbsp;)[a-zA-Z]+;/.test(text)) {
    console.error('Refusing to publish: the HTML contains entities that will not survive serialisation.');
    process.exit(1);
  }
  // Without these five the article is just prose about games nobody can play.
  const expected = ['five-letters', 'minesweeper', 'code-breaker', 'game-2048', 'game-scorecard'];
  const missing = expected.filter((w) => !widgets.includes(w));
  if (missing.length > 0) {
    console.error(`Refusing to publish: missing widgets: ${missing.join(', ')}`);
    process.exit(1);
  }
  // Each widget anchors a Games nav chip; a missing id breaks that jump link.
  const missingIds = expected
    .filter((w) => w !== 'game-scorecard')
    .filter((w) => !CONTENT.includes(`id="${w}"`));
  if (missingIds.length > 0) {
    console.error(`Refusing to publish: widget divs missing anchor ids: ${missingIds.join(', ')}`);
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
    quiz: null,
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

  console.log(`Published: ${data.title} [${data.category}] -> /blog/${data.slug}`);
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
