// One-off: publishes "The Science of Caffeine" (drafted in
// drafts/coffee-and-your-brain.md, reviewed at /preview-coffee-brain)
// straight into the Supabase blog_posts table. Part 2 of the coffee
// series — Part 1 is "The History of Coffee."
//
// Usage:
//   node scripts/publish-coffee-and-your-brain.mjs

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

const TITLE = 'The Science of Caffeine: How Coffee Actually Wakes Up Your Brain';
const SLUG = 'the-science-of-caffeine-how-coffee-actually-wakes-up-your-brain';
const CATEGORY = 'Curiosity';
const EXCERPT =
  "Caffeine doesn't give you energy — it blocks the molecule that tells your brain it's tired. The real chemistry behind adenosine, dopamine, the afternoon crash, tolerance, and why coffee hits everyone differently.";
const READ_TIME = 8;

const QUIZ = [
  {
    question: 'What does caffeine actually do in your brain?',
    options: [
      'It creates new energy for your brain cells',
      'It blocks adenosine (the tiredness signal) from binding to its receptors',
      'It puts your brain cells to sleep temporarily',
      'It converts sugar into extra brain fuel',
    ],
    correctIndex: 1,
    explanation:
      "Caffeine doesn't add energy — it's shaped closely enough like adenosine to occupy the same receptors without activating them, blocking the tiredness signal from getting through.",
  },
  {
    question: "What's caffeine's official chemical name and formula?",
    options: ['C8H10N4O2, 1,3,7-trimethylxanthine', 'C6H12O6, glucoside', 'C2H5OH, ethanol', 'C9H8O4, acetylsalicylic acid'],
    correctIndex: 0,
    explanation: 'Caffeine is a xanthine alkaloid — 1,3,7-trimethylxanthine — built on a similar core structure to adenosine.',
  },
  {
    question: "Why does caffeine's blood level matter hours after you drink it?",
    options: [
      "It doesn't — caffeine disappears within an hour",
      "Its average half-life is about 5 hours, so a portion is still active well into the evening",
      'Caffeine only works for the first 15 minutes',
      'It builds up forever and never clears',
    ],
    correctIndex: 1,
    explanation:
      'With a ~5 hour half-life, a 3pm coffee can still have roughly a quarter of its caffeine circulating at 1am — a common reason for disrupted sleep.',
  },
  {
    question: 'Why does the same amount of coffee affect people so differently?',
    options: [
      'It depends on shoe size',
      'A gene called CYP1A2 controls how fast the liver breaks caffeine down — some people are fast metabolizers, others slow',
      'It only depends on body weight',
      "It doesn't — caffeine affects everyone identically",
    ],
    correctIndex: 1,
    explanation: 'CYP1A2 handles about 95% of caffeine breakdown, and genetic variation splits people into fast, intermediate, and slow metabolizers.',
  },
  {
    question: 'Why does a "caffeine crash" often feel worse than being tired without coffee at all?',
    options: [
      'Coffee directly causes extra tiredness chemicals',
      'Adenosine keeps building up the whole time caffeine blocks it, then floods back in all at once when it wears off',
      "It's purely psychological",
      'Caffeine damages brain cells permanently',
    ],
    correctIndex: 1,
    explanation: 'Caffeine blocks adenosine receptors, not adenosine production — so the backlog that built up while you were caffeinated hits all at once once it clears.',
  },
  {
    question: 'Why does regular daily coffee drinking require more caffeine over time for the same effect?',
    options: [
      'The brain grows more adenosine receptors (upregulation), so the same dose blocks a smaller share of them',
      'Caffeine molecules get weaker with repeated use',
      'The stomach absorbs less caffeine over time',
      'It only happens with instant coffee',
    ],
    correctIndex: 0,
    explanation: 'This is tolerance: more receptors means the same amount of caffeine blocks a smaller percentage, shrinking the effect — and needing that caffeine just to feel normal.',
  },
];

const TIMELINE_POINTS = JSON.stringify([
  { label: '0 min', value: 0 },
  { label: '15 min', value: 55 },
  { label: '45 min', value: 150 },
  { label: '1 hr', value: 175 },
  { label: '2 hr', value: 150 },
  { label: '3 hr', value: 128 },
  { label: '5 hr', value: 92 },
  { label: '7 hr', value: 66 },
  { label: '10 hr', value: 39 },
]);

const DRINK_CAFFEINE = JSON.stringify([
  { label: 'Drip coffee (8oz)', value: 95 },
  { label: 'Espresso (1oz shot)', value: 64 },
  { label: 'Energy drink (8oz)', value: 80 },
  { label: 'Black tea (8oz)', value: 47 },
  { label: 'Green tea (8oz)', value: 28 },
  { label: 'Cola (12oz)', value: 33 },
]);

const CONTENT = `<p>Coffee blocks your brain&rsquo;s tiredness signal &mdash; a molecule called adenosine &mdash; so you can&rsquo;t feel it. Once you see how it works, coffee stops looking like magic and starts looking like chemistry. This is Part 2 of a two-part look at coffee &mdash; <a href="/blog/the-history-of-coffee-from-a-goat-herders-legend-to-your-morning-cup">Part 1</a> covered where it came from; this one covers what it&rsquo;s actually doing to your brain.</p>

<h3>What caffeine actually is</h3>
<p>Start with <strong>adenosine</strong>, since caffeine&rsquo;s whole trick depends on it. Adenosine is a molecule your brain makes constantly, as a natural byproduct of your brain cells burning energy &mdash; and your brain uses it as a built-in signal for &ldquo;you&rsquo;re getting tired.&rdquo; The more of it that builds up, the sleepier you feel.</p>
<p>Caffeine works because it&rsquo;s shaped almost exactly like adenosine &mdash; close enough to slide into the same slots in your brain that adenosine normally fits into, like a spare key cut close enough to slide into a lock, even though it doesn&rsquo;t turn the lock the way the real key does. That one fact &mdash; a good-enough-to-fit impostor key &mdash; explains almost everything else in this article.</p>
<p>For the curious: caffeine&rsquo;s actual chemical formula is <strong>C&#8328;H&#8321;&#8320;N&#8324;O&#8322;</strong> &mdash; eight carbon atoms, ten hydrogen, four nitrogen, two oxygen &mdash; officially named <strong>1,3,7-trimethylxanthine</strong>, part of a family of compounds called xanthines.</p>

<h3>The chemical impostor</h3>
<p>That adenosine does its job by binding to receptors on brain cells &mdash; mainly two types, called <strong>A1</strong> and <strong>A2A</strong>, and each handles a different part of the job. A1 receptors are spread throughout the brain and act like a general brake pedal, slowing activity wherever they&rsquo;re triggered. A2A receptors are concentrated in the brain&rsquo;s reward and motivation circuits, and they&rsquo;re the ones mostly responsible for that specific &ldquo;I need to stop and rest&rdquo; pull. Bind either one, and you get less brain activity &mdash; which is exactly the foggy, heavy-eyed feeling you get late in the day.</p>
<p>Caffeine&rsquo;s near-identical shape lets it slide into those same A1 and A2A receptors &mdash; but unlike adenosine, it doesn&rsquo;t activate them. It just sits there, physically blocking the real adenosine from getting in. Scientists call this an <strong>antagonist</strong>: something that occupies a receptor without triggering it. With the tiredness signal blocked, your brain cells keep firing at full speed, and you feel alert &mdash; not because caffeine added any energy, but because it hid the signal telling you that you&rsquo;re running low on it.</p>

<h3>Why it also feels good, not just alert</h3>
<p>Blocking adenosine sets off a small chain reaction. Adenosine normally puts a damper on other brain chemicals too, including <strong>dopamine</strong> &mdash; the molecule tied to motivation and reward. With adenosine blocked, dopamine sticks around and signals more effectively, which is a real part of why that first cup feels like a small mood lift, not just a jolt.</p>
<p>At the same time, all that extra neuron firing gets noticed by your pituitary gland, which signals your adrenal glands to release <strong>adrenaline</strong> &mdash; the same fight-or-flight hormone your body uses for genuine danger. That&rsquo;s the source of the racing heart and jittery edge from too much coffee: caffeine is, in a very real sense, tricking your body into a mild version of its emergency response.</p>

<h3>How fast it hits — and how long it lasts</h3>
<p>On an empty stomach, the first effects show up within about <strong>10 to 15 minutes</strong>. Blood caffeine levels peak around the <strong>one-hour mark</strong>, and from there it clears out on a fairly predictable curve:</p>
<div data-widget="line-trend" data-eyebrow="One 200mg cup of coffee, modeled over 10 hours" data-caption="Effects start within 15 minutes and peak around the one-hour mark — but notice how much is still circulating hours later. That's the part most people underestimate." data-value-prefix="" data-value-suffix=" mg" data-highlight-color="#a0785a" data-mark-index="3" data-mark-label="Peak — effects strongest here" data-points='${TIMELINE_POINTS}'></div>
<p>The number that matters most for sleep is caffeine&rsquo;s <strong>half-life</strong> &mdash; the time it takes your body to clear half of what&rsquo;s in your system &mdash; which averages about <strong>5 hours</strong> in a healthy adult. That means a 3pm coffee can still have roughly a quarter of its caffeine circulating at 1am.</p>

<h3>Why coffee hits everyone differently</h3>
<p>Not everyone clears caffeine at the same rate, and it comes down to one gene: <strong>CYP1A2</strong>, which makes the liver enzyme responsible for about 95% of caffeine breakdown. Depending on which version of this gene you inherited, you land in one of three rough buckets &mdash; fast metabolizers (roughly half of people of European descent) clear caffeine in as little as 2 to 4 hours; slow metabolizers can take 6 to 12 hours to process the same cup. If an afternoon coffee wrecks your sleep while a coworker drinks espresso after dinner and sleeps fine, this gene is very likely why.</p>

<h3>The crash is a bill coming due</h3>
<p>Here&rsquo;s the part that trips people up: caffeine blocks adenosine from binding, but your brain doesn&rsquo;t stop making it. Adenosine keeps piling up in the background the entire time you&rsquo;re caffeinated &mdash; it&rsquo;s just locked out of its receptors. Once the caffeine clears and those receptors open back up, all that backed-up adenosine floods in at once. The result can feel sharper than the tiredness you&rsquo;d have felt without any coffee at all &mdash; not because coffee made you more tired, but because it postponed the bill and let interest pile up while you weren&rsquo;t looking.</p>

<h3>Why your regular cup stops working as well</h3>
<p>Your brain doesn&rsquo;t just sit still while you keep blocking its adenosine receptors every day. With regular use, it responds by building <strong>more</strong> of them &mdash; a process called <strong>upregulation</strong>. More receptors means the same dose of caffeine now blocks a smaller share of the total, so the effect shrinks. That&rsquo;s tolerance &mdash; and it&rsquo;s also why people who drink coffee daily often say they need it just to feel normal rather than extra alert: with more receptors than a non-drinker&rsquo;s brain, an ordinary adenosine level now hits harder without caffeine on board to block it.</p>

<h3>What happens if you stop</h3>
<p>Skip your usual coffee and that extra army of adenosine receptors doesn&rsquo;t disappear overnight &mdash; it takes about <strong>4 to 5 days</strong> to shrink back down. In the meantime, all those receptors sit wide open with nothing blocking them, so ordinary adenosine levels hit harder than they should. Caffeine also normally keeps blood vessels in the brain slightly narrowed; without it, those vessels widen more than usual, which is the specific mechanism behind a caffeine-withdrawal headache. Symptoms &mdash; headache, fatigue, irritability, trouble focusing &mdash; typically peak between <strong>20 and 51 hours</strong> after the last dose.</p>

<h3>How much caffeine is actually in what you drink</h3>
<p>Caffeine content varies a lot more than people expect from one drink to the next:</p>
<div data-widget="bar-compare" data-eyebrow="Caffeine by drink" data-caption="Espresso isn't actually the strongest thing on this list — a standard drip coffee usually has more caffeine, just spread across a bigger cup." data-value-prefix="" data-value-suffix=" mg" data-accent-color="#a0785a" data-items='${DRINK_CAFFEINE}'></div>
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
    .select('title, slug, published')
    .single();

  if (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }

  console.log(`Published: ${data.title} -> /blog/${data.slug}`);
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
