// One-off: publishes "The Birthday Paradox: 23 Strangers, One Shared Birthday, and the Math Behind Digital Fingerprints" (drafted in
// drafts/birthday-paradox.md, reviewed at /preview-birthday-paradox)
// straight into the Supabase blog_posts table.
//
// Usage:
//   node scripts/publish-birthday-paradox.mjs

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

const TITLE = 'The Birthday Paradox: 23 Strangers, One Shared Birthday, and the Math Behind Digital Fingerprints';
const SLUG = 'the-birthday-paradox-23-strangers-one-shared-birthday-and-the-math-behind-digital-fingerprints';
const CATEGORY = 'Science';
const EXCERPT =
  "23 strangers, one shared birthday: why pairs beat people, how to win the bar bet, and why the fingerprints securing the internet must be twice as long as you'd think.";
const READ_TIME = 7;

const QUIZ = [
  {
    question: 'How many people make a shared birthday likelier than not?',
    options: ['23', '50', '183', '365'],
    correctIndex: 0,
    explanation:
      'At 23 people the chance crosses 50% (50.7%, to be exact). At 22 it’s still under half — 47.5%.',
  },
  {
    question: 'Why is the answer so much smaller than most people guess?',
    options: [
      'Birthdays cluster in summer',
      'Leap years add extra chances',
      'You’re counting 253 pairs, not 23 people',
      'Twins are more common than reported',
    ],
    correctIndex: 2,
    explanation:
      'Any two people can match, and 23 people make 23 × 22 / 2 = 253 pairs. People go up by one at a time; pairs go up faster and faster.',
  },
  {
    question: 'How many people for a 50% chance someone shares YOUR birthday?',
    options: ['23', 'About 253', 'About 366', 'About 500'],
    correctIndex: 1,
    explanation:
      'Only pairs involving you count now, so you need roughly as many people as there are days — about 253. Wrong question, eleven times the answer.',
  },
  {
    question: 'Real birthdays cluster in summer instead of spreading evenly. What does that do to the match chance?',
    options: [
      'Lowers it',
      'Raises it',
      'Nothing — the math assumes uniformity anyway',
      'Makes it exactly 50%',
    ],
    correctIndex: 1,
    explanation:
      'Clustering helps matches: when birthdays pile onto the same days, collisions get easier. The textbook 50.7% is slightly pessimistic.',
  },
  {
    question: 'A birthday attack on a 64-bit hash needs roughly how many tries to find a collision?',
    options: ['2⁶⁴', '2³²', '64²', '64,000'],
    correctIndex: 1,
    explanation:
      'Collisions arrive after about the square root of the possibilities — 2³², or ~4 billion tries. That square root is why hashes must be twice as long as intuition suggests.',
  },
  {
    question: 'With 366 people (365-day model), a shared birthday is…',
    options: [
      '99.9% likely',
      'Guaranteed, by the pigeonhole principle',
      'Still only 75% likely',
      'Impossible to compute',
    ],
    correctIndex: 1,
    explanation:
      '366 pigeons, 365 holes — one day must hold two people. Probability ends and certainty begins.',
  },
];

const BIRTHDAY_CHANCES = JSON.stringify([
  { label: '10 people', value: 11.7, subtext: 'a long shot' },
  { label: '20 people', value: 41.1, subtext: 'getting interesting' },
  { label: '23 people', value: 50.7, subtext: 'better than a coin flip' },
  { label: '30 people', value: 70.6, subtext: 'a strong favorite' },
  { label: '50 people', value: 97.0, subtext: 'near certain' },
]);
const HIDDEN_PAIRS = JSON.stringify([
  { label: '10 people', value: 45, subtext: '10 × 9 / 2' },
  { label: '23 people', value: 253, subtext: '23 × 22 / 2' },
  { label: '50 people', value: 1225, subtext: '50 × 49 / 2' },
  { label: '100 people', value: 4950, subtext: '100 × 99 / 2' },
]);

const CONTENT = `<p>Walk into a room of 23 strangers and bet someone that two of them share a birthday. You&rsquo;ll win more often than not &mdash; about 51% of the time. Most people hearing this for the first time guess you&rsquo;d need 150 people, maybe 180. The real answer feels impossible, which is exactly why mathematicians call it a paradox. It isn&rsquo;t one. It&rsquo;s your intuition miscounting &mdash; and the same miscount is why the fingerprints that secure the internet need to be twice as long as you&rsquo;d think.</p>
<div data-widget="bar-compare" data-eyebrow="Chance of a shared birthday" data-caption="The chance climbs fast: by 50 people it stops being a bet and starts being a near certainty." data-value-prefix="" data-value-suffix="%" data-accent-color="#6366f1" data-items='${BIRTHDAY_CHANCES}'></div>
<h3>The bet that wins bar tabs</h3>
<p>Assume 365 equally likely birthdays (no leap days &mdash; we&rsquo;ll come back to that). The chart above shows the curve; here are the landmarks it skips:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>People</th><th>Chance of a shared birthday</th></tr>
</thead>
<tbody>
<tr><td>22</td><td>47.5% &mdash; still under half</td></tr>
<tr><td>57</td><td>99%</td></tr>
<tr><td>70</td><td>99.9%</td></tr>
</tbody>
</table>
</div>
<p>Twenty-three is the famous line: the smallest group where a match is likelier than not. It was first published by the mathematician Richard von Mises in 1939, and it has been winning bar bets ever since.</p>
<h3>You&rsquo;re counting the wrong thing</h3>
<p>Here&rsquo;s why 23 feels absurd. You&rsquo;re picturing yourself against 22 other people &mdash; 22 chances to match. But the bet isn&rsquo;t about you. It&rsquo;s about <em>any two people</em> in the room matching each other, and pairs multiply fast. You&rsquo;re not taking 22 shots at a match; the room is taking 253.</p>
<p><strong>Pairs = n &times; (n &minus; 1) / 2</strong></p>
<p>That&rsquo;s the whole formula: each of the n people pairs with the n &minus; 1 others, divided by 2 because every pair gets counted twice (you-with-them and them-with-you are the same handshake). For 23 people: 23 &times; 22 / 2 = 253. It&rsquo;s the classic handshake problem wearing a birthday costume.</p>
<div data-widget="bar-compare" data-eyebrow="Comparisons hiding in the room" data-caption="Same rooms as above, but now counting pairs instead of people. This is the engine under the paradox." data-value-prefix="" data-value-suffix=" pairs" data-accent-color="#6366f1" data-items='${HIDDEN_PAIRS}'></div>
<p>That&rsquo;s the whole trick: people go up by one at a time; pairs go up faster and faster. By 50 people there are 1,225 pairs quietly checking each other, which is why the chance is already 97%. Whenever something surprises you by arriving &ldquo;too early&rdquo; &mdash; a collision, a coincidence, a traffic jam &mdash; ask whether you&rsquo;re counting individuals when you should be counting pairs.</p>
<div data-widget="birthday-classroom" data-eyebrow="Fill a classroom" data-caption="Guess first, then add kids one at a time — or let it run — until two birthdays collide. Watch the handshakes outrun the kids."></div>
<h3>It&rsquo;s not about you</h3>
<p>This is the confusion that keeps the paradox alive, so let&rsquo;s kill it directly. There are two different questions:</p>
<ul>
<li><strong>Any two people share a birthday?</strong> 23 people. (253 pairs working for you.)</li>
<li><strong>Someone shares <em>your</em> birthday?</strong> About 253 people. (Only as many chances as there are other people.)</li>
</ul>
<p>Same room, same birthdays, eleven times the people &mdash; because in the second version, only pairs involving you count. If someone &ldquo;disproves&rdquo; the paradox by noting nobody shares <em>their</em> birthday, they&rsquo;ve answered the wrong question.</p>
<h3>The math in 60 seconds</h3>
<p>Counting every possible way two people could match is a mess. So mathematicians flip the question around: what are the chances that <em>nobody</em> matches? Then whatever&rsquo;s left over is the chance of a match.</p>
<p>Picture people walking into an empty room one at a time, each trying to avoid every birthday already taken.</p>
<ul>
<li><strong>Person 1</strong> walks in. No birthdays are taken yet, so there&rsquo;s nothing to avoid.</li>
<li><strong>Person 2</strong> has to avoid 1 birthday. Easy: 364 of the 365 days are still free.</li>
<li><strong>Person 3</strong> has to avoid 2 birthdays. Still easy.</li>
<li><strong>Person 10</strong> has to avoid 9. Still pretty easy.</li>
</ul>
<p>Each step is easy on its own. But everyone has to succeed at the same time, and that&rsquo;s what gets hard. It&rsquo;s like a basketball player who makes 97% of free throws: easy once, but making 23 in a row? About a coin flip. Exactly the birthday odds.</p>
<p>Here&rsquo;s what happens to the chance that nobody matches as people walk in:</p>
<div class="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
<p class="text-xs uppercase tracking-wide text-white/40 mb-3">Nobody matches vs somebody matches</p>
<div style="display:flex;gap:16px;font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:10px;">
<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(255,255,255,0.25);margin-right:5px;"></span>nobody matches</span>
<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#3b82f6;margin-right:5px;"></span>match</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.6);">5 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);"><div style="width:97.3%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.75);text-align:right;">97% nobody · 3% match</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.6);">10 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);"><div style="width:88.3%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.75);text-align:right;">88% nobody · 12% match</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.6);">15 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);"><div style="width:74.7%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.75);text-align:right;">75% nobody · 25% match</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.6);">20 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);"><div style="width:58.9%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.75);text-align:right;">59% nobody · 41% match</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;font-weight:700;color:#fff;">23 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);outline:2px solid #3b82f6;outline-offset:1px;"><div style="width:49.3%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;font-weight:700;color:#fff;text-align:right;">49% · 51% &#8592; below half!</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin:7px 0;">
<span style="width:64px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.6);">30 people</span>
<div style="flex:1;height:18px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,0.08);"><div style="width:29.4%;background:rgba(255,255,255,0.25);"></div><div style="flex:1;background:#3b82f6;"></div></div>
<span style="width:132px;flex-shrink:0;font-size:11px;color:rgba(255,255,255,0.75);text-align:right;">29% nobody · 71% match</span>
</div>
</div>
<p>At 23 people, &ldquo;nobody matches&rdquo; slips below half. That&rsquo;s the whole paradox: lots of small, easy dodges, stacked together, stop being a safe bet surprisingly quickly.</p>
<p><strong>Two small notes.</strong> Leap years? Adding February 29 barely changes anything. Real life is even easier: birthdays aren&rsquo;t spread out evenly &mdash; more babies are born in late summer, and fewer on weekends. When birthdays bunch up, matches happen even sooner. So 23 is, if anything, slightly too cautious.</p>
<details style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:12px 16px;margin:1em 0;">
<summary style="cursor:pointer;font-weight:700;color:rgba(255,255,255,0.85);font-size:0.95em;">For the curious: the exact math</summary>
<p style="margin:0.8em 0 0.2em;">The exact math multiplies each person&rsquo;s chance of dodging. Here they are as decimals, one per person, all 23 of them:</p>
<div style="font-family:var(--font-geist-mono),monospace;font-size:11px;line-height:2;overflow-x:auto;margin:0.8em 0 0.2em;">
<div style="min-width:340px;">
<div>1 &minus; (1 &times; 0.9973 &times; 0.9945 &times; 0.9918 &times; 0.9890</div>
<div style="padding-left:2ch;">&times; 0.9863 &times; 0.9836 &times; 0.9808 &times; 0.9781 &times; 0.9753</div>
<div style="padding-left:2ch;">&times; 0.9726 &times; 0.9699 &times; 0.9671 &times; 0.9644 &times; 0.9616</div>
<div style="padding-left:2ch;">&times; 0.9589 &times; 0.9562 &times; 0.9534 &times; 0.9507 &times; 0.9479</div>
<div style="padding-left:2ch;">&times; 0.9452 &times; 0.9425 &times; 0.9397)</div>
<div>= 1 &minus; 0.4927 = <strong>0.5073</strong></div>
</div>
</div>
<p style="margin:0.8em 0 0.2em;">Notice the numbers get smaller: each new person has more birthdays to avoid.</p>
<p style="margin:0.8em 0 0.2em;">There&rsquo;s also a shortcut formula, 1 &minus; e<sup>(&#8722;n&sup2;/730)</sup>, which gives about 51.6% for 23 people &mdash; close enough for a bar bet. The n&sup2; in it is the pairs again: double the people, and you get about four times the pairs. Each of the 23 steps is spelled out below.</p>
<div style="font-family:var(--font-geist-mono),monospace;font-size:11px;line-height:2;margin-top:0.9em;padding-top:0.9em;border-top:1px solid rgba(255,255,255,0.1);overflow-x:auto;"><div style="min-width:470px;"><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 1</span><span style="width:150px;flex-shrink:0;">× 365/365 = 1</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 100.00% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:100.0%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 2</span><span style="width:150px;flex-shrink:0;">× 364/365 = 0.9973</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 99.73% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:99.7%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 3</span><span style="width:150px;flex-shrink:0;">× 363/365 = 0.9945</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 99.18% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:99.2%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 4</span><span style="width:150px;flex-shrink:0;">× 362/365 = 0.9918</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 98.36% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:98.4%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 5</span><span style="width:150px;flex-shrink:0;">× 361/365 = 0.9890</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 97.29% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:97.3%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 6</span><span style="width:150px;flex-shrink:0;">× 360/365 = 0.9863</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 95.95% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:96.0%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 7</span><span style="width:150px;flex-shrink:0;">× 359/365 = 0.9836</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 94.38% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:94.4%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 8</span><span style="width:150px;flex-shrink:0;">× 358/365 = 0.9808</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 92.57% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:92.6%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 9</span><span style="width:150px;flex-shrink:0;">× 357/365 = 0.9781</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 90.54% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:90.5%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 10</span><span style="width:150px;flex-shrink:0;">× 356/365 = 0.9753</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 88.31% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:88.3%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 11</span><span style="width:150px;flex-shrink:0;">× 355/365 = 0.9726</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 85.89% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:85.9%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 12</span><span style="width:150px;flex-shrink:0;">× 354/365 = 0.9699</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 83.30% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:83.3%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 13</span><span style="width:150px;flex-shrink:0;">× 353/365 = 0.9671</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 80.56% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:80.6%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 14</span><span style="width:150px;flex-shrink:0;">× 352/365 = 0.9644</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 77.69% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:77.7%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 15</span><span style="width:150px;flex-shrink:0;">× 351/365 = 0.9616</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 74.71% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:74.7%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 16</span><span style="width:150px;flex-shrink:0;">× 350/365 = 0.9589</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 71.64% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:71.6%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 17</span><span style="width:150px;flex-shrink:0;">× 349/365 = 0.9562</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 68.50% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:68.5%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 18</span><span style="width:150px;flex-shrink:0;">× 348/365 = 0.9534</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 65.31% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:65.3%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 19</span><span style="width:150px;flex-shrink:0;">× 347/365 = 0.9507</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 62.09% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:62.1%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 20</span><span style="width:150px;flex-shrink:0;">× 346/365 = 0.9479</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 58.86% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:58.9%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 21</span><span style="width:150px;flex-shrink:0;">× 345/365 = 0.9452</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 55.63% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:55.6%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 22</span><span style="width:150px;flex-shrink:0;">× 344/365 = 0.9425</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 52.43% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:52.4%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="display:flex;align-items:center;gap:10px;"><span style="width:62px;flex-shrink:0;color:rgba(255,255,255,0.4);">person 23</span><span style="width:150px;flex-shrink:0;">× 343/365 = 0.9397</span><span style="width:118px;flex-shrink:0;color:rgba(255,255,255,0.75);">→ 49.27% nobody</span><div style="flex:1;min-width:30px;height:6px;border-radius:3px;background:rgba(255,255,255,0.08);"><div style="width:49.3%;height:100%;border-radius:3px;background:rgba(255,255,255,0.25);"></div></div></div><div style="margin-top:0.7em;padding:8px 12px;border-radius:6px;background:#3b82f622;border:1px solid #3b82f655;color:#fff;">1 − 0.4927 = 0.5073 → <strong>50.73% match</strong></div></div></div>
</details>
<h3>Why computers care</h3>
<p>Now replace &ldquo;birthdays&rdquo; with &ldquo;digital fingerprints&rdquo; and the party trick becomes security engineering. A hash function squeezes any input into a fixed-size fingerprint &mdash; say 64 bits, or about 18 quintillion possibilities. How many fingerprints until two collide? Not 9 quintillion: about 2<sup>32</sup> &mdash; roughly 4 billion. That&rsquo;s the square root of 18 quintillion: just as 23 people is in the same ballpark as the square root of 365 (about 19), collisions show up around the square root of the possibilities. A computer does that before lunch.</p>
<p>This is the <strong>birthday attack</strong>: to find two inputs with the same hash, you only need to try about the square root of the possibilities. It&rsquo;s why hash functions must be <em>twice</em> as long as naive intuition suggests &mdash; SHA-256&rsquo;s 256 bits exist so attackers face 2<sup>128</sup> work, not 2<sup>256</sup> wishes. Same reason your UUIDs are 128 bits long: with 122 random bits, you&rsquo;d need about 2<sup>61</sup> IDs &mdash; billions per second for a century &mdash; before a duplicate becomes likely. Every &ldquo;universally unique&rdquo; ID you&rsquo;ve ever generated is a birthday problem solved in advance.</p>
<p>Your password, though, is safe from this trick: cracking it means matching one specific hash, which is the &ldquo;someone shares <em>my</em> birthday&rdquo; problem &mdash; far harder &mdash; not the &ldquo;any two match&rdquo; one.</p>
<h3>Run it yourself</h3>
<p>Next time you&rsquo;re in a group of 25 or more &mdash; a classroom, a team offsite, a wedding table &mdash; offer the bet. With 30 people you&rsquo;re a 70% favorite. Run it ten times and you&rsquo;ll win about seven. Two upgrades for repeat performances:</p>
<ul>
<li><strong>The triple.</strong> Three people sharing one birthday needs about 88 people for a coin flip. Save it for big rooms.</li>
<li><strong>The guarantee.</strong> With 366 people (on the 365-day model), a match isn&rsquo;t likely &mdash; it&rsquo;s certain. That&rsquo;s the pigeonhole principle: 366 pigeons, 365 holes. No probability left.</li>
</ul>
<p>The birthday paradox earns its fame honestly: five minutes of arithmetic, a lifetime of miscalibrated intuition corrected, and the reason every digital signature you rely on is built the way it is.</p>
<h3>Sources</h3>
<ul>
<li>&ldquo;Birthday problem,&rdquo; Wikipedia &mdash; <a href="https://en.wikipedia.org/wiki/Birthday_problem">en.wikipedia.org/wiki/Birthday_problem</a></li>
<li>&ldquo;Birthday attack,&rdquo; Wikipedia &mdash; <a href="https://en.wikipedia.org/wiki/Birthday_attack">en.wikipedia.org/wiki/Birthday_attack</a></li>
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
