// One-off: publishes "The Haunted Arcade: A Seven-Stop Treasure Hunt"
// (drafted in drafts/haunted-arcade-treasure-hunt.md, reviewed at
// /preview-haunted-arcade) into the Supabase blog_posts table.
//
// QUIZ and CONTENT below are lifted verbatim from the reviewed preview.
//
// Usage:
//   node scripts/publish-haunted-arcade.mjs

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

const TITLE = 'The Haunted Arcade: A Seven-Stop Treasure Hunt';
const SLUG = 'haunted-arcade-treasure-hunt';
const CATEGORY = 'Gaming';
const EXCERPT =
  'Five locked rooms, four ghost lights, one lost high score. Solve each room to open the next — wrong answers only teach.';
const READ_TIME = 4;

const QUIZ = [
  {
    question: 'Why does saying the lights out loud help you remember them?',
    options: [
      'Ghosts like the sound',
      'Memory holds spoken patterns far better than silent ones',
      'It scares the wrong answers away',
      'It pauses the game',
    ],
    correctIndex: 1,
    explanation:
      'Giving each blink a name turns six flashes into a sentence — and your brain files sentences faster than lists.',
  },
  {
    question: 'What does “chunking” mean in the lights room?',
    options: [
      'Breaking the machine open',
      'Remembering two groups of three instead of six single blinks',
      'Turning the sound off',
      'Skipping a round',
    ],
    correctIndex: 1,
    explanation:
      'Boxes beat lists. Two groups of three fit in memory where six singles overflow it.',
  },
  {
    question: 'What happens when you pick the wrong door?',
    options: [
      'You lose all progress',
      'Nothing bad — a hint appears and you try again',
      'The hunt locks for a day',
      'You go back two rooms',
    ],
    correctIndex: 1,
    explanation:
      'The hunt only moves forward. Wrong answers teach and invite a retry — kids quit at dead ends, not at wrong answers.',
  },
  {
    question: 'Your progress survives a closed tab because…',
    options: [
      'The ghosts remember you',
      'Solved rooms are saved in your browser',
      'The arcade never closes',
      'You took a screenshot',
    ],
    correctIndex: 1,
    explanation:
      'Each solved room is stored in localStorage, so leaving and coming back keeps every open door open.',
  },
];

const CONTENT = `
<p>Yesterday a parcel arrived with no return address: a treasure hunter's journal, and on its last page, a hand-drawn map of the arcade on 5th street — dark for years — with seven stops circled in red. <em>“Every legend starts with a single clue,”</em> the final entry reads. <em>“Follow my trail through all seven stops, and the lost high score is yours.”</em> This is a treasure hunt, not a quiz: every room opens only when the one before it is solved, wrong answers never punish, and your progress survives a closed tab.</p>
<div data-widget="treasure-hunt" data-eyebrow="Playable treasure hunt" data-caption="Seven stops from Start to Finish: spot the odd one out, crack the lock, count the coins, tame the lights, dodge the traps, pay the ferryman, crack the fruit lock — then claim the lost high score."></div>
<h3>Tips for little hunters</h3>
<ul>
<li><strong>Say patterns out loud.</strong> In the ghost-lights room, naming each light as it blinks (“red, blue, blue…”) doubles how many you can hold. Memory loves a voice.</li>
<li><strong>Chunk the lights.</strong> Don’t remember six blinks — remember two groups of three. Your brain files boxes faster than lists.</li>
<li><strong>Turn pictures into numbers.</strong> If 3 apples make 12, one apple is 4 — then the banana gives itself away.</li>
<li><strong>Wrong answers teach.</strong> Every wrong tap tells you something. The hunt only moves forward; it never takes progress away.</li>
</ul>
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
