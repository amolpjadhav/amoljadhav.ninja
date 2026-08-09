// One-off: publishes "How Sleep Actually Works" (drafted in
// drafts/how-sleep-works.md, reviewed at /preview-sleep) into the Supabase
// blog_posts table. Follows on from the caffeine article.
//
// Usage:
//   node scripts/publish-how-sleep-works.mjs

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

const TITLE = 'How Sleep Actually Works: The Two Switches That Decide When You Sleep';
const SLUG = 'how-sleep-actually-works-the-two-switches-that-decide-when-you-sleep';
const CATEGORY = 'Curiosity';
const EXCERPT =
  "You don't decide to fall asleep — two separate systems do, and they have to agree. The mechanics of sleep pressure, the body clock, the flip-flop switch that flips you under, and why each one failing gives you a different kind of sleepless night.";
const READ_TIME = 9;

const QUIZ = [
  {
    question: 'What has to happen inside your body before you can fall asleep?',
    options: [
      'Being tired enough is all it takes',
      'Two things at once: enough tiredness built up, AND the right time of day for your body',
      'Melatonin has to reach a fixed threshold',
      'You have to be awake for exactly 16 hours',
    ],
    correctIndex: 1,
    explanation:
      'Two independent systems have to agree — Process S (adenosine-driven sleep pressure) and Process C (the body clock). High pressure alone is why you can be exhausted and still wide awake.',
  },
  {
    question: 'What does melatonin actually do?',
    options: [
      'It knocks you out like a sedative',
      "It's a timing signal that tells your body it's night — not a knockout drug",
      'It burns off adenosine',
      'It blocks the wake-promoting neurons directly',
    ],
    correctIndex: 1,
    explanation:
      "Melatonin announces 'it's night now' and nudges the system toward sleep. Light suppresses it directly, which is the real mechanism behind screens-at-night advice.",
  },
  {
    question: 'Why does falling asleep feel sudden, with no memory of the transition?',
    options: [
      'Memory shuts off an hour before sleep',
      'Sleep and wake neurons inhibit each other in a flip-flop circuit — there is no stable middle state',
      'The brain slowly fades over about 30 minutes',
      'Melatonin causes short-term amnesia',
    ],
    correctIndex: 1,
    explanation:
      'The wake and sleep neuron groups suppress each other, so whichever gains a slight edge slams the switch fully over. There is barely a transition to remember.',
  },
  {
    question: 'How are deep sleep (N3) and REM distributed across the night?',
    options: [
      'Evenly spread through every cycle',
      'Deep sleep is front-loaded early; REM gets longer toward morning',
      'REM comes first, deep sleep comes last',
      'Both only occur in the final cycle',
    ],
    correctIndex: 1,
    explanation:
      "That's why cutting sleep short doesn't trim each stage evenly — it removes a disproportionate share of your REM.",
  },
  {
    question: 'What resets your body clock each day?',
    options: [
      'Eating breakfast at a fixed time',
      'Light hitting special cells in your eyes, which signal the clock inside your brain',
      'Physical exercise',
      'Melatonin slowly building up overnight',
    ],
    correctIndex: 1,
    explanation:
      'The SCN runs slightly off from exactly 24 hours, so it needs a daily correction. Dedicated light-sensing cells in the retina — separate from the ones you see images with — wire straight to it.',
  },
  {
    question: "You're exhausted at 2am but still wide awake. What's most likely going on?",
    options: [
      'You are not actually tired enough yet',
      "Your pressure to sleep is high, but the part of your brain that keeps you alert hasn't switched off",
      'Melatonin has already worn off',
      "You've entered REM early",
    ],
    correctIndex: 1,
    explanation:
      "The flip-flop only works if one side clearly wins. An alertness system stuck on props up the wake side no matter how much sleep pressure has built behind it — the \"wired but tired\" state.",
  },
];

const PROCESS_S = JSON.stringify([
  { label: '7am', value: 10 },
  { label: '10am', value: 28 },
  { label: '1pm', value: 45 },
  { label: '3pm', value: 55 },
  { label: '5pm', value: 65 },
  { label: '7pm', value: 75 },
  { label: '10pm', value: 90 },
  { label: '12am', value: 97 },
  { label: '3am', value: 62 },
  { label: '5am', value: 38 },
  { label: '7am', value: 12 },
]);

const PROCESS_C = JSON.stringify([
  { label: '7am', value: 30 },
  { label: '10am', value: 70 },
  { label: '1pm', value: 75 },
  { label: '3pm', value: 58 },
  { label: '5pm', value: 72 },
  { label: '7pm', value: 85 },
  { label: '10pm', value: 45 },
  { label: '12am', value: 22 },
  { label: '3am', value: 12 },
  { label: '5am', value: 8 },
  { label: '7am', value: 30 },
]);

const SLEEP_GATES = JSON.stringify([
  {
    question: 'Has enough adenosine built up?',
    failTitle: 'Not sleepy yet',
    failDetail: 'A long late nap drained it — or caffeine is still masking it',
  },
  {
    question: 'Is the body clock in night mode?',
    failTitle: 'Wired at the wrong time',
    failDetail: 'Jet lag, or evening light pushed the clock later',
  },
  {
    question: 'Has the alertness system stood down?',
    failTitle: 'Wired but tired',
    failDetail: 'Stress chemicals still switched on',
  },
]);

const SLEEP_STAGES = JSON.stringify(['Awake', 'REM', 'N1', 'N2', 'N3 (deep)']);

const SLEEP_SEGMENTS = JSON.stringify([
  { stage: 'Awake', minutes: 5 },
  { stage: 'N1', minutes: 5 },
  { stage: 'N2', minutes: 25 },
  { stage: 'N3 (deep)', minutes: 40 },
  { stage: 'N2', minutes: 10 },
  { stage: 'REM', minutes: 5 },
  { stage: 'N2', minutes: 20 },
  { stage: 'N3 (deep)', minutes: 30 },
  { stage: 'N2', minutes: 25 },
  { stage: 'REM', minutes: 12 },
  { stage: 'N2', minutes: 30 },
  { stage: 'N3 (deep)', minutes: 15 },
  { stage: 'N2', minutes: 30 },
  { stage: 'REM', minutes: 20 },
  { stage: 'N2', minutes: 45 },
  { stage: 'N1', minutes: 5 },
  { stage: 'REM', minutes: 30 },
  { stage: 'Awake', minutes: 3 },
  { stage: 'N2', minutes: 40 },
  { stage: 'REM', minutes: 38 },
]);

const CONTENT = `<p>You don&rsquo;t decide to fall asleep. Two separate systems in your body decide for you, and they have to agree &mdash; which is exactly why you can be exhausted at 2am and still lie there wide awake. This is a follow-on to <a href="/blog/the-science-of-caffeine-how-coffee-actually-wakes-up-your-brain">the caffeine article</a>, which covered one half of this system without naming the other.</p>

<h3>The two switches</h3>
<p>Sleep researchers have modeled this the same way since the early 1980s, when Swiss scientist Alexander Borb&eacute;ly laid out what&rsquo;s now called the <strong>two-process model</strong>. Two independent systems run in parallel:</p>
<p><strong>Process S &mdash; sleep pressure.</strong> This is the adenosine story from the caffeine article. Every hour you&rsquo;re awake, adenosine builds up in your brain and pushes harder for sleep. It&rsquo;s a simple counter: the longer you&rsquo;ve been up, the higher it climbs. Sleep is what drains it back down.</p>
<p><strong>Process C &mdash; the body clock.</strong> Completely separate, and it doesn&rsquo;t care how long you&rsquo;ve been awake. It&rsquo;s a roughly 24-hour cycle that raises and lowers your alertness on a fixed schedule, whether you slept last night or not.</p>
<p>You fall asleep when sleep pressure is high <strong>and</strong> the body clock has swung toward its low point. Both, not either.</p>
<div data-widget="line-trend" data-eyebrow="One full day — waking up at 7am, asleep by midnight" data-caption="Read it left to right. Blue is sleep pressure: it starts near zero when you wake and climbs all day, no matter what you do. Yellow is the body clock, running its own independent cycle — it's what creates the real 3pm slump and the evening 'second wind' around 7pm. You fall asleep at the point where yellow has dropped low while blue is at its peak. During the shaded stretch, sleep drains the blue line back down — which is why you wake up with it near zero and the whole thing starts over." data-value-prefix="" data-series-a-label="Sleep pressure (Process S)" data-series-b-label="Body clock alertness (Process C)" data-highlight-color="#5b9bf5" data-color-b="#facc15" data-shade-from="7" data-shade-to="10" data-shade-label="Asleep" data-points='${PROCESS_S}' data-points-b='${PROCESS_C}'></div>
<p>This model explains a few things you&rsquo;ve probably felt without having a name for them. The <strong>3pm slump</strong> is real and isn&rsquo;t about lunch &mdash; it&rsquo;s a genuine dip in the body clock&rsquo;s alertness signal. The <strong>second wind</strong> late in the evening is also real: the clock pushes alertness back up right when sleep pressure is getting high, which is why 9pm can feel more productive than 4pm despite being later in the day.</p>

<h3>Where the clock actually lives</h3>
<p>The body clock is a specific piece of tissue: the <strong>suprachiasmatic nucleus</strong>, or SCN &mdash; a cluster of about 20,000 brain cells, roughly the size of a grain of rice. It sits in the <strong>hypothalamus</strong>, which is the part of your brain that handles the housekeeping you never think about: body temperature, hunger, thirst, and the release of hormones. Sleep timing is one more thing on that list.</p>
<p>The SCN keeps its own near-24-hour rhythm even in total darkness &mdash; but it runs slightly off from exactly 24 hours, so it needs resetting daily, and light is what resets it.</p>
<p>There&rsquo;s a dedicated wiring path for this. Your <strong>retina</strong> &mdash; the light-sensing layer at the back of your eye &mdash; contains special cells separate from the ones you see images with. These run a direct line to the SCN, and their entire job is reporting &ldquo;it&rsquo;s bright out.&rdquo; When that signal fades in the evening, the SCN tells your <strong>pineal gland</strong> &mdash; a pea-sized gland near the middle of your brain &mdash; to start releasing <strong>melatonin</strong>.</p>
<p>This is the part most people get backwards: melatonin doesn&rsquo;t knock you out. It works as a <em>timing signal</em> &mdash; a chemical announcement that says &ldquo;it&rsquo;s night now,&rdquo; which nudges the whole system toward sleep. Light suppresses it directly, which is the actual mechanism behind the advice about screens at night.</p>

<p>So yes &mdash; looking at a screen in bed works against you. Phone, tablet, laptop, TV: the light reaches those retina cells, they report &ldquo;still daytime,&rdquo; and the melatonin signal gets held back.</p>
<p>The effect is real but smaller than headlines suggest: studies of normal screen use find melatonin drops by roughly 10&ndash;35%, not a total shutdown. Two things make it worse. A dark room, because your eyes adapt to their surroundings, so a bright screen against total darkness is a much stronger signal than the same screen in a lit room. And anything that winds you up &mdash; arguments, work email &mdash; which keeps you awake through a completely separate route we&rsquo;ll get to below. Putting screens away about <strong>an hour</strong> before bed is where the evidence lands.</p>

<h3>How sleep gets triggered</h3>
<p>Here&rsquo;s what&rsquo;s strange about falling asleep: you can never catch the moment it happens. The reason is in the wiring.</p>
<p>Two groups of brain cells fight over this, and only one can win. <strong>The alertness system</strong>, in the lower part of your brain, keeps you awake. <strong>The VLPO</strong> (short for <em>ventrolateral preoptic nucleus</em>) starts sleep &mdash; it sits in the hypothalamus a few millimeters from the SCN, but does a different job: the SCN is the clock that tracks time, the VLPO is the switch that acts on it.</p>
<p>Each side shuts the other one down. Engineers will recognize this as a <strong>flip-flop circuit</strong>: two stable states, no comfortable middle. Whichever side gains the slightest edge suppresses the other, which widens its own lead &mdash; so the switch slams over instead of easing across. That&rsquo;s why sleep arrives all at once, and why lying there wide awake means the alertness side is winning.</p>
<p>Here are the parts themselves, and how the signals move between them. Step through a day and watch which pieces are active &mdash; and notice that at 9pm the pressure is already high, but you&rsquo;re still awake:</p>
<div data-widget="sleep-system-diagram" data-eyebrow="The parts, and how they talk to each other" data-caption="Two paths feed one switch: light → SCN → melatonin on top, adenosine pressure on the left. The switch only flips when both agree."></div>

<p>A third player, a brain chemical called <strong>orexin</strong>, acts as a stabilizer holding the switch in the wake position. It&rsquo;s what stops you from flickering between states all day. When the orexin system fails, the switch does become unstable &mdash; that&rsquo;s narcolepsy, where people drop into sleep abruptly during the day.</p>

<h3>What happens while you're asleep</h3>
<p>Sleep runs in cycles. You move through several distinct stages every 90 to 110 minutes, four to six times a night:</p>
<div data-widget="stage-timeline" data-eyebrow="One night's sleep, stage by stage" data-caption="The shape matters more than the details: deep sleep (N3) is front-loaded into the first half of the night, while REM stretches longer and longer toward morning. Cut your night short and you don't lose an even slice of everything — you disproportionately lose REM." data-accent-color="#5b9bf5" data-highlight-stage="REM" data-stages='${SLEEP_STAGES}' data-segments='${SLEEP_SEGMENTS}'></div>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Stage</th><th>What it is</th></tr>
</thead>
<tbody>
<tr><td><strong>N1</strong></td><td>The doorway &mdash; a few minutes of drifting. This is where that falling sensation and sudden jerk can happen.</td></tr>
<tr><td><strong>N2</strong></td><td>The bulk of your night, around half of total sleep. Body temperature drops, heart rate slows.</td></tr>
<tr><td><strong>N3 (deep)</strong></td><td>Also called slow-wave sleep, because brain activity settles into long, rolling waves. Hardest stage to wake from &mdash; wake someone here and they&rsquo;re groggy and confused. Concentrated in the first half of the night.</td></tr>
<tr><td><strong>REM</strong></td><td>Rapid eye movement. Brain activity looks almost like being awake, but your body is temporarily paralyzed, which is likely what stops you acting out dreams. Gets longer with each cycle.</td></tr>
</tbody>
</table>
</div>
<p>That last row is the practical one. Because REM is back-loaded, cutting sleep short by two hours doesn&rsquo;t shave 25% off each stage evenly &mdash; it removes a disproportionate share of your REM.</p>

<h3>So why can't you sleep?</h3>
<p>Now the two-switch model earns its keep. Every sleepless night is one of these gates failing, and which one decides what kind of night you get:</p>
<div data-widget="decision-flow" data-eyebrow="Falling asleep, as a flowchart" data-caption="Three conditions, all of which have to be true. Fail any one and you stay awake — and which one you failed decides what kind of sleepless night you get." data-start-title="It's bedtime" data-end-title="The switch flips — you're asleep" data-end-detail="No gradual fade, which is why you never catch the moment" data-gate-color="#5b9bf5" data-fail-color="#f0a35e" data-end-color="#4ade80" data-gates='${SLEEP_GATES}'></div>
<p>In words:</p>
<p><strong>The two processes disagree.</strong> Jet lag is the clean example: your sleep pressure is high (you&rsquo;ve been up 18 hours), but your body clock is still set to a timezone where it&rsquo;s mid-afternoon, so it&rsquo;s pumping out an alertness signal. Both switches have to agree, and they don&rsquo;t. The same thing happens on a smaller scale every Monday if your weekend bedtime drifted late &mdash; researchers actually call it &ldquo;social jet lag.&rdquo;</p>
<p><strong>Sleep pressure got drained early.</strong> A long late-afternoon nap dumps a chunk of accumulated adenosine. Come bedtime, the pressure just isn&rsquo;t there yet.</p>
<p><strong>Caffeine is masking the pressure.</strong> From the caffeine article: caffeine doesn&rsquo;t reduce adenosine, it blocks you from feeling it. With a half-life around 5 hours, an afternoon coffee is still partly circulating at midnight.</p>
<p><strong>Light told your clock it&rsquo;s still daytime.</strong> Evening light suppresses melatonin directly, so the clock delays its &ldquo;it&rsquo;s night&rdquo; signal.</p>
<p><strong>An overactive alertness system &mdash; the &ldquo;wired but tired&rdquo; state.</strong> This is the one behind most chronic insomnia, and it&rsquo;s genuinely different from the others. Here sleep pressure is high and the clock is in the right place, but the alertness system won&rsquo;t stand down. Three things stay switched on that should have switched off: <strong>cortisol</strong>, the body&rsquo;s main stress hormone; <strong>norepinephrine</strong>, a chemical that keeps you alert and reactive; and the <strong>sympathetic nervous system</strong>, the fight-or-flight side of your wiring that&rsquo;s supposed to hand over to the rest-and-digest side at night. Brain scans show the regions involved in thinking and self-monitoring staying unusually busy, as if part of the brain is standing guard. Remember the flip-flop switch &mdash; it only works if one side clearly wins. An alertness system stuck on props up the wake side so the switch can&rsquo;t flip, no matter how much pressure has built behind it. (Sleep researchers call this state <em>hyperarousal</em>, if you want to look it up.)</p>
<p>There&rsquo;s a cruel feedback loop in that last one: worrying about not sleeping is itself alerting, which keeps the wake side propped up, which means you don&rsquo;t sleep, which gives you more to worry about.</p>

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
