// One-off: publishes "TFT Set 18: Every Champion and the Items They Want" (drafted in
// drafts/tft-set-18-items.md, reviewed at /preview-tft-items) into the
// Supabase blog_posts table.
//
// QUIZ and CONTENT below are lifted verbatim from the reviewed preview.
//
// Usage:
//   node scripts/publish-tft-set-18-items.mjs

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

const TITLE = 'TFT Set 18: Every Champion and the Items They Want';
const SLUG = 'tft-set-18-items-cheat-sheet';
const CATEGORY = 'Gaming';
const EXCERPT =
  'All 36 core items with recipes — plus who actually wants each one, counted off the 45 comp boards. Searchable, filterable, and built for mid-game glances.';
const READ_TIME = 4;

const QUIZ = [
  {
    question: 'Two components sit on your bench in stage 2. What is usually right?',
    options: [
      'Hold them until you know your final carry',
      'Slam a tank item now — bench components win nothing',
      'Sell them for gold',
      'Wait for the perfect pair',
    ],
    correctIndex: 1,
    explanation:
      'Components on the bench do nothing, and you get them back when you sell the holder. A slammed tank item starts winning fights immediately.',
  },
  {
    question: 'Which two components make Spear of Shojin?',
    options: ['Sword + Bow', 'Sword + Tear', 'Rod + Tear', 'Tear + Tear'],
    correctIndex: 1,
    explanation:
      'Sword plus Tear. Attacks refill the holder\u2019s mana, so casters with Shojin cast constantly — check the sheet for who wants it most.',
  },
  {
    question: 'Where do emblems mostly come from?',
    options: [
      'Combining two components',
      'The Pan, augments, and Wisps — not the bench',
      'The carousel, first pick only',
      'Selling three-star units',
    ],
    correctIndex: 1,
    explanation:
      'Emblems do not have component recipes, which is why this sheet leaves them out. The comps sheet notes the ones specific teams need.',
  },
  {
    question: 'Your front line melts every fight. Which components should you prioritize?',
    options: [
      'Swords and bows',
      'Vests, cloaks, and belts',
      'Rods and tears',
      'Gloves and swords',
    ],
    correctIndex: 1,
    explanation:
      'Tank items are armor, magic resist, and health — Sunfire, Bramble, Dragon\u2019s Claw, Warmog\u2019s. The sheet\u2019s Tank filter lists them all.',
  },
  {
    question: 'The "Best on" lines under each item come from where?',
    options: [
      'The author\u2019s opinion',
      'A vote in chat',
      'Counted off all 45 current comp boards',
      'Last patch\u2019s stats',
    ],
    correctIndex: 2,
    explanation:
      'Every holder line is counted from the live comp boards, so it moves when the meta moves — refresh the comps, and the sheet follows.',
  },
];

const CONTENT = `
<p>There are 36 core items, and every game hands you the same eight components. This sheet lists all of them — recipe, what it does, and which champions actually want it right now, counted off all 45 boards in the <a href="/blog/tft-set-18-comps-all-27-teams-for-enchanted-wilds">Set 18 comps sheet</a>. If recipes themselves are still fuzzy, start with the <a href="/blog/teamfight-tactics-tftitems-your-super-simple-guide-to-gearing-up-your-champions">beginner&rsquo;s items guide</a> — it teaches what each component does first.</p>
<div data-widget="tft-items-sheet" data-eyebrow="Set 18 items cheat sheet" data-caption="Every core item, its two components, and the three champions asking for it loudest. ★ is a carry — the unit its team is built around. Filter by who the item helps, or flip to By champion to start from a unit instead."></div>
<h3>Slam first, ask later</h3>
<p>The biggest beginner mistake with items is waiting. Components sitting on your bench do nothing; a slammed item starts winning fights immediately, and you get the components back when you sell the holder.</p>
<ul>
<li><strong>Slam a tank item first.</strong> Sunfire Cape, Warmog&rsquo;s, Gargoyle — tanks hold anything, and early fights are decided by who dies slower.</li>
<li><strong>Slam an AP item second.</strong> Morellonomicon and Archangel&rsquo;s go on whoever casts most; early AP carries are everywhere.</li>
<li><strong>Swords and bows can wait.</strong> Attack damage items need the right holder to matter. If you must slam one, Giant Slayer and Titan&rsquo;s Resolve stay useful on almost any hitter.</li>
</ul>
<p>A slammed &ldquo;wrong&rdquo; item still beats two components gathering dust. Rebuild later with the Remover — the sheet above shows what each carry truly wants.</p>
<h3>Carry items and tank items are different shopping lists</h3>
<p>Roughly half the items want a damage dealer and half want someone who stands in front. The sheet&rsquo;s filters split them the same way the game does:</p>
<ul>
<li><strong>Attack</strong> — swords, bows, gloves. Infinity Edge, Last Whisper, Giant Slayer: the physical carry kit.</li>
<li><strong>Magic</strong> — rods, tears. Shojin, Archangel&rsquo;s, Jeweled Gauntlet: the caster kit.</li>
<li><strong>Tank</strong> — vests, cloaks, belts. Sunfire, Bramble, Dragon&rsquo;s Claw, Warmog&rsquo;s: health and resistances.</li>
</ul>
<p>Hybrids exist on purpose — Bloodthirster heals a hitter, Hextech Gunblade heals a caster, Crownguard shields anyone. When a component pair fits two kits, build for the carry you actually have, not the one you wish for.</p>
<p>To go the other way — start from a champion and see its ideal items with the reasoning — flip the sheet above to <strong>By champion</strong>. Every one of the 65 gets its kit explained from its own ability: what it scales off, how much mana it needs, and whether it belongs up front.</p>
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
