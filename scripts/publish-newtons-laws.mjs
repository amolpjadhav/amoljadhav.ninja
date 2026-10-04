// One-off: publishes "Newton's Laws of Motion: Push It, Race It, Bounce It"
// (drafted in drafts/newtons-laws-of-motion.md, reviewed at
// /preview-newtons-laws) into the Supabase blog_posts table.
//
// QUIZ and CONTENT below are lifted verbatim from the reviewed preview.
//
// Usage:
//   node scripts/publish-newtons-laws.mjs

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

const TITLE = 'Newton\u2019s Laws of Motion: Push It, Race It, Bounce It';
const SLUG = 'newtons-laws-of-motion';
const CATEGORY = 'Science';
const EXCERPT =
  'Three rules from 300 years ago that still steer every car, ball, and rocket — taught with buses, shopping carts, and balloons.';
const READ_TIME = 4;

const QUIZ = [
  {
    question: 'The bus brakes suddenly and your body lunges forward. Which law is that?',
    options: [
      'The second law — the bus pushed you forward',
      'The first law — your body kept moving because nothing stopped it yet',
      'The third law — the seats pushed you forward',
      'No law — buses are just bumpy',
    ],
    correctIndex: 1,
    explanation:
      'Inertia: things in motion stay in motion. The bus stopped, but your body continued until the seatbelt (or the seat in front) became the "something" that stops you.',
  },
  {
    question: 'You push an empty shopping cart and a watermelon-loaded cart with the same shove. The empty one zooms; the loaded one crawls. Why?',
    options: [
      'The loaded cart\u2019s wheels are stuck',
      'The loaded cart\u2019s bigger mass divides your push into a smaller speed-up',
      'Watermelons make carts sleepy',
      'You pushed the loaded one more gently without noticing',
    ],
    correctIndex: 1,
    explanation:
      'Law 2: speed-up equals push divided by mass. Same push, much bigger mass — so the loaded cart gets a fraction of the zoom. (Carts keep the push honest: with a football vs a bowling ball, your foot slowing down on the heavy ball muddies the comparison.)',
  },
  {
    question: 'You let go of an untied balloon and it zooms around the room. What pushes it forward?',
    options: [
      'Nothing — balloons just hate staying still',
      'The air rushing out the back pushes the balloon the opposite way',
      'The balloon shoves the air out harder than the air shoves back — bigger push wins',
      'Warm air inside rising like a hot-air balloon',
    ],
    correctIndex: 1,
    explanation:
      'Law 3: every push returns an equal push the other way. Air rushes backward, so the balloon gets pushed forward. Rockets work the same way \u2014 shoving gas down to go up.',
  },
  {
    question:
      'On the trampoline, she pushes down on the mat exactly as hard as the mat pushes up on her. If the pushes are equal, why does she fly up?',
    options: [
      'The two pushes act on different things — hers squishes the mat, the mat\u2019s launches her',
      'Equal pushes cancel out, so she should stay stuck on the mat',
      'The mat pushes just a little bit harder — the bigger push wins',
      'Her push waits until she\u2019s in the air, then kicks in',
    ],
    correctIndex: 0,
    explanation:
      'Law 3: the pair pushes never land on the same thing, so they can\u2019t cancel. Her push bends the mat; the mat\u2019s push sends her up. Watch the two arrows in the lab — always the same size, always on different things.',
  },
  {
    question: 'Why do race cars want light bodies as well as huge engines?',
    options: [
      'Light cars look faster in photos',
      'Less mass means the same engine push makes more speed-up',
      'Heavy cars are banned from racing',
      'Light paint dries quicker',
    ],
    correctIndex: 1,
    explanation:
      'Law 2 again: the engine\u2019s push gets divided by the car\u2019s mass. Shrink the mass and the same push buys more zoom. That\u2019s not style — that\u2019s physics with a paint job.',
  },
  {
    question: 'Someone yanks a tablecloth off a table and the dishes stay put. Which law saved dinner?',
    options: [
      'The third law — the dishes pushed the cloth back',
      'The second law — the yank was too weak for heavy dishes',
      'The first law — the dishes were sitting still, so they stayed still',
      'No law — the dishes were glued down',
    ],
    correctIndex: 2,
    explanation:
      'Inertia works both ways: moving things keep moving, and resting things keep resting. The cloth moved; nothing pushed the dishes, so they stayed exactly where they were.',
  },
];
const CONTENT = `<p>Over 300 years ago, a man named Isaac Newton watched the world move \u2014 falling apples, rolling carts \u2014 and wrote down three rules for how everything pushes and gets pushed. (The Moon\u2019s circling needs one more of his ideas, gravity \u2014 that\u2019s another article.) Every car, football, rocket, and skateboard still obeys them today.</p>
<div data-widget="newton-playground" data-eyebrow="Playable physics" data-caption="Three laws, three toys: bowl a strike, race toy cars, and bounce the trampoline."></div>
<h3>Now prove it</h3>
<p>Played all three toys? <a href="?quiz=1">Take the quiz again</a> and see if you beat your first score.</p>
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
