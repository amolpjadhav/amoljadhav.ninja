// One-off: adds the "How a game actually goes" section to the published TFT
// Set 18 comps article, immediately before "Three habits", so the strategy
// material sits together and the comp sheet stays at the top for mid-match use.
//
// The section is built on the article's own data rather than on general TFT
// knowledge: the 15-reroll / 11-fast-level split, the "stop at 6 or 7", the
// "mid stage 4" deadline and the 50-gold anchor are all read off the `style`
// and `plan` fields of the 27 comps, so it cannot contradict a card. Numbers
// with no source — XP costs, streak gold, roll odds — are deliberately absent;
// Community Dragon ships no economy tables and those change between sets.
//
// Idempotent: exits cleanly if the section is already there, and refuses to
// write if the anchor is missing rather than guessing at a position.
//
// Usage:
//   node scripts/publish-tft-how-to-play.mjs

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

const SLUG = 'tft-set-18-comps-all-27-teams-for-enchanted-wilds';
const ANCHOR = '<h3>Three habits that beat any tier list</h3>';

const SECTION = `<h3>How a game actually goes</h3>
<p>Two things run at the same time: the fight rounds, and your gold. Most games are lost on the gold.</p>
<p><strong>The one number to remember is 50.</strong> At the end of every round you earn interest &mdash; 1 gold for every 10 you are holding, up to 5. So the 50th gold is the last one that earns anything, and any gold you spend below 50 costs you income as well as the gold. That is why eight of the 27 comps above say some version of <em>&ldquo;econ above 50 and hold&rdquo;</em>.</p>
<p><strong>Stage 1 &mdash; nothing to decide.</strong> Buy the cheap units that look strongest, pick up the item components the monsters drop, and don&rsquo;t plan your final board yet. You don&rsquo;t know what the shop will give you.</p>
<p><strong>Stage 2 &mdash; choose an opener, and choose a streak.</strong> Play the strongest units you own, not the ones your comp wants. Both winning and losing pay: a win streak pays gold and protects your health, a loss streak pays gold and gets you an earlier pick at the carousel, because the lowest-health player chooses first. Drifting between the two is the only option that pays nothing.</p>
<p><strong>Stage 3 &mdash; the fork.</strong> This is where the comps above split into two kinds of game:</p>
<table>
<thead>
<tr><th></th><th>Reroll &mdash; 15 of the 27</th><th>Fast level &mdash; 11 of the 27</th></tr>
</thead>
<tbody>
<tr><td><strong>Levelling</strong></td><td>stop at 6 or 7</td><td>keep buying XP</td></tr>
<tr><td><strong>Your gold</strong></td><td>hold 50, spend only what interest adds</td><td>spend it</td></tr>
<tr><td><strong>Hunting for</strong></td><td>copies of one cheap unit</td><td>4-costs at level 8</td></tr>
<tr><td><strong>Your health</strong></td><td>you keep it, you are winning</td><td>you spend it, you take losses</td></tr>
</tbody>
</table>
<p>Three copies of a unit make a 2-star. Nine make a 3-star, and that is what a reroll comp is really chasing &mdash; which is why it needs every spare gold and a level it can stop at.</p>
<p><strong>Stage 4 &mdash; the game is decided here.</strong> If you are rerolling, your 3-star should exist by the middle of stage 4; if it doesn&rsquo;t, you are behind, and the plans above say so. If you are levelling, you hit 8 here and roll &mdash; that is the one big roll of your game, and you want gold left for it.</p>
<p><strong>Stage 5 onward &mdash; spend everything.</strong> Interest stops mattering once the game is ending; gold you die holding was wasted. Level 9 only if your health can afford it. And remember from the Wisps section that after the mid game almost every Wisp is a combat one, so the economy Wisps are gone &mdash; your gold plan has to be finished before then.</p>
<p><strong>When to roll.</strong> Roll for a reason, not because you have gold: a named unit, at a named level. Gold above 50 is the free gold, so that is what you roll with. Roll below 50 only for one of two reasons &mdash; you are one copy away from the upgrade that wins you the round, or you will die this round if you don&rsquo;t, and a dead player earns no interest at all.</p>

`;

async function main() {
  const { data: post, error: readErr } = await supabase
    .from('blog_posts')
    .select('content')
    .eq('slug', SLUG)
    .single();

  if (readErr) {
    console.error('Could not read post:', readErr.message);
    process.exit(1);
  }

  if (post.content.includes('<h3>How a game actually goes</h3>')) {
    console.log('Section already present — nothing to do.');
    return;
  }

  const hits = post.content.split(ANCHOR).length - 1;
  if (hits !== 1) {
    console.error(`Refusing to write: expected 1 match for the anchor heading, found ${hits}.`);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ content: post.content.replace(ANCHOR, SECTION + ANCHOR) })
    .eq('slug', SLUG)
    .select('title, content')
    .single();

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log(`Updated: ${data.title}`);
  console.log('  sections now:');
  for (const m of data.content.matchAll(/<h3>([^<]+)<\/h3>/g)) console.log(`    ${m[1]}`);
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
