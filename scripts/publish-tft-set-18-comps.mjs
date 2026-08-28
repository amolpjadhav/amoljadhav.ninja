// One-off: publishes "TFT Set 18 Comps" (drafted in
// drafts/tft-set-18-comps.md, reviewed at /preview-tft-comps) into the
// Supabase blog_posts table.
//
// QUIZ and CONTENT below are lifted verbatim from the reviewed preview.
//
// Usage:
//   node scripts/publish-tft-set-18-comps.mjs

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

const TITLE = 'TFT Set 18 Comps: All 27 Teams for Enchanted Wilds';
const SLUG = 'tft-set-18-comps-all-27-teams-for-enchanted-wilds';
const CATEGORY = 'Gaming';
const EXCERPT =
  'A comp sheet to keep open while you play. All 27 Enchanted Wilds teams with early board, final board and item priority \u2014 searchable by champion, and laid out by the rows you actually place units in.';
const READ_TIME = 5;

const QUIZ = [
  {
    question: 'Set 18 Enchanted Wilds introduces Wisps. Where and when do they appear?',
    options: [
      'Anywhere in the shop, every round',
      'In the rightmost shop slot, every other planning phase, at most one per round',
      'Only after you reach level 8',
      'They replace your augment choices',
    ],
    correctIndex: 1,
    explanation:
      'A Wisp hides a champion behind it. Buy the Wisp and the champion is revealed; skip it and the Wisp disappears at the end of planning, leaving the champion.',
  },
  {
    question: 'What happens to Wisp offers after the mid game?',
    options: [
      'They stop appearing entirely',
      'Every other one is guaranteed to be a combat Wisp',
      'They become free',
      'They can only be bought during combat',
    ],
    correctIndex: 1,
    explanation:
      'Late Wisps trend toward winning the fight in front of you. Economy and item Wisps are mostly an early-game opportunity, which is why taking them early matters.',
  },
  {
    question: 'You have four item components and a full board. Where should they go?',
    options: [
      'Spread evenly so every unit gets a little stronger',
      'Stacked on your carry — the one unit the team is built around',
      'On your tankiest unit, so nothing dies',
      'Hold them until level 8',
    ],
    correctIndex: 1,
    explanation:
      'Spreading items gives you four slightly-better units, which in practice is the same as none. Damage scales when it is concentrated on one unit that survives long enough to use it.',
  },
  {
    question: 'A comp is rated S tier. How long should you expect that to hold?',
    options: [
      'Permanently — it is a property of the comp',
      'Until roughly the next patch; small number changes move tiers constantly',
      'For the whole set, about four months',
      'Tiers never change once a set is live',
    ],
    correctIndex: 1,
    explanation:
      'Balance changes land roughly every two weeks, and a single item nerf can drop a comp two tiers. The boards and item priorities stay useful much longer than the rating does.',
  },
  {
    question: 'It is early in the game and you have not hit any of the units your planned comp wants. What is usually right?',
    options: [
      'Force the plan — committing early is how you get there first',
      'Put items on a decent unit you actually have and stay open to switching',
      'Sell everything and save gold with an empty board',
      'Pick whichever comp is rated highest',
    ],
    correctIndex: 1,
    explanation:
      'Early rounds are about losing less health, not about having the correct final team. Items come back when you sell a unit, so there is little cost to using them now.',
  },
];

const CONTENT = `
<p>Set 18, <em>Enchanted Wilds</em>, went live on <strong>26 August 2026</strong>. Here are all 27 comps &mdash; early board, final board, and item priority for each.</p>
<p>Search a champion you keep hitting and it&rsquo;ll show you every team that wants them. Everything else on this page is below the list.</p>

<h3>The comps</h3>
<div data-widget="tft-comps" data-eyebrow="Set 18 comp sheet" data-caption="Tap a comp to open it. Boards are split into the rows you place them in: 🛡 front takes the hits, ⚔ mid is melee, 🏹 back is damage. ★ is the carry — it gets the items."></div>

<h3>New in Set 18: Wisps</h3>
<p>Every set has one mechanic that only exists for that set. This one is <strong>Wisps</strong>.</p>
<p>A Wisp is a one-time effect you can buy from the shop. It sits in the <strong>rightmost shop slot</strong> with a champion hidden behind it &mdash; buy the Wisp and the champion is revealed; skip it and the Wisp vanishes when planning ends, leaving the champion anyway.</p>
<ul>
<li>They appear <strong>every other planning phase</strong>, at most one per round</li>
<li>You can only buy one <strong>during planning</strong> &mdash; once fighting starts, the offer is gone</li>
<li>Categories: <strong>combat</strong> boosts, <strong>gold and XP</strong>, <strong>items</strong>, <strong>shop</strong> effects, and <strong>risky</strong> ones that gamble for a bigger payoff</li>
<li><strong>After the mid game, every other Wisp is a combat Wisp</strong></li>
</ul>
<p>That last rule is the one people miss. Early Wisps are where you shape your game &mdash; take the economy and item ones while they&rsquo;re offered, because from stage 5 on, the game mostly stops giving you that choice.</p>

<h3>Reading the boards</h3>
<p><strong>Carry</strong> &mdash; the one unit the team is built around. It gets the items and the money. Everyone else exists to keep it alive long enough to do damage. It&rsquo;s the ★ in every board above.</p>
<p><strong>Reroll</strong> &mdash; instead of saving gold to reach a higher level, you spend it spinning the shop over and over to find three copies of one cheap unit and upgrade it. Comps with &ldquo;Reroll&rdquo; in the name are built around this.</p>
<p><strong>Augment</strong> &mdash; a bonus you pick between rounds that changes a rule of the game for you. A few comps only work with a specific one; those say so.</p>
<p><strong>Traits</strong> are why the boards look the way they do &mdash; get enough champions sharing a tag and the whole team gets a bonus. Every champion has one <strong>origin</strong> (where they&rsquo;re from) and one <strong>class</strong> (what they do):</p>
<p><em>Origins:</em> Blackthorn, Blossom, Coven, Elderwood, Fae, Flora Fatalis, Inferno, Lunar, Primal, Riftbeast, Rival, Solar, Sprykin</p>
<p><em>Classes:</em> Adaptor, Brawler, Defender, Executioner, Hunter, Invoker, Juggernaut, Rapidfire, Ravager, Spellweaver, Summoner, Vanguard</p>
<p>So <em>Elderwood Executioners</em> is stacking one of each. The class is also what puts a unit in its row &mdash; Defenders and Juggernauts go front, Rapidfire and Spellweavers go back.</p>

<h3>Three habits that beat any tier list</h3>
<p><strong>1. Play what you&rsquo;re given, not what you planned.</strong> The most common way to lose is committing to a comp in round one and forcing it while the shop hands you something else. Pick a direction, keep a backup, switch when the game tells you to. That&rsquo;s what the search box is for.</p>
<p><strong>2. Items on the carry, first, every time.</strong> Spread items across four units and you get four slightly-better units, which is the same as none. The item rows above are in priority order &mdash; build the top row before anything else.</p>
<p><strong>3. A bad board with items beats a good board without them.</strong> Early on your job is to lose less health, not to have the correct team. Put components on whatever decent unit you have now; you get them back when you sell it.</p>
<p>And treat the tiers loosely. Riot changes numbers roughly every two weeks, and one item nerf can drop a comp two tiers. Set 18 is days old, so these ratings are as fresh and as unstable as they ever get. The boards and item priorities stay useful much longer than the letter next to them.</p>
<p><em>Sources: <a href="https://tftraits.com/set18/" target="_blank" rel="noopener noreferrer">tftraits.com Set 18</a>, <a href="https://mobalytics.gg/tft/guides/set-18-reveal-enchanted-wilds" target="_blank" rel="noopener noreferrer">Mobalytics Set 18 reveal</a>, <a href="https://tftacademy.com/tierlist/comps" target="_blank" rel="noopener noreferrer">TFT Academy comps tierlist</a></em></p>
`;


async function main() {
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
    .select('title, slug, published, category')
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
