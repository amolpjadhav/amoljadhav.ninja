// One-off: publishes "Maslow's Hierarchy of Needs" (drafted in
// drafts/maslow-hierarchy-of-needs.md, reviewed at /preview-maslow) into
// the Supabase blog_posts table.
//
// Usage:
//   node scripts/publish-maslow.mjs

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

const TITLE = "Maslow's Hierarchy of Needs: Why You Can't Think Straight When You're Hungry";
const SLUG = 'maslows-hierarchy-of-needs-why-you-cant-think-straight-when-youre-hungry';
const CATEGORY = 'Mental Models';
const EXCERPT =
  "Your needs take turns, and the emptiest one grabs your attention whether you like it or not. The five levels explained from scratch \u2014 plus the twist that the famous pyramid everyone uses was drawn by someone else entirely, and says something Maslow never believed.";
const READ_TIME = 8;

const QUIZ = [
  {
    question: "You're starving and it's the last lesson before lunch. Why is it so hard to concentrate?",
    options: [
      'Hunger physically damages your ability to think',
      'Your brain puts the most urgent unmet need first, and everything else has to wait',
      'Concentration always drops later in the day',
      'You are simply not trying hard enough',
    ],
    correctIndex: 1,
    explanation:
      'Needs take turns. Whichever one is emptiest and most basic grabs your attention — and it does not ask your permission.',
  },
  {
    question: 'Air is the single most important thing you need. So why do you almost never think about it?',
    options: [
      'It is not actually that important',
      'Because a need that is already filled goes quiet — you only notice it when it runs out',
      'Your brain cannot sense air',
      'You only need air when you are exercising',
    ],
    correctIndex: 1,
    explanation:
      'Satisfied needs make no noise. The moment you cannot breathe, air becomes the only thing you can think about.',
  },
  {
    question: 'Someone has plenty of food, a safe home, and good friends — but still feels restless and flat. What is going on?',
    options: [
      'They are being ungrateful',
      'The quieter needs higher up — feeling good at something, becoming fully yourself — are real needs too',
      'Nothing; that feeling is imaginary',
      'They must actually be unsafe without realising it',
    ],
    correctIndex: 1,
    explanation:
      'Once the loud alarms stop ringing, you finally hear the quiet ones. That itch to make something or get good at something is a genuine need, not a luxury.',
  },
  {
    question: 'Who drew the famous pyramid that everyone uses to explain this idea?',
    options: [
      'Maslow drew it in his original 1943 paper',
      'Other people did, about 20 years later — Maslow never drew a pyramid at all',
      'It comes from ancient Greek philosophy',
      'It was created for a school textbook in the 1990s',
    ],
    correctIndex: 1,
    explanation:
      'Keith Davis drew it as steps in 1957, and Charles McDermid turned it into a pyramid in a 1960 business article. Maslow never used one.',
  },
  {
    question: 'Does a person have to completely finish one level before starting the next?',
    options: [
      'Yes — it works like levels in a video game',
      'No — Maslow said the order is "not nearly as rigid" and people are partly full on every level at once',
      'Yes, but only for the bottom two levels',
      'Nobody has ever looked into it',
    ],
    correctIndex: 1,
    explanation:
      'Maslow gave rough example figures — about 85% on staying alive, 70% safety, 50% belonging, 40% esteem, 10% self-actualisation. Not one is at 0% or 100%.',
  },
  {
    question: 'A huge study of 60,865 people across 123 countries tested the idea. What did it find?',
    options: [
      'The whole theory was wrong',
      'The needs themselves are real and universal, but the strict order is not',
      'Everything Maslow said was exactly right',
      'The needs only apply in wealthy countries',
    ],
    correctIndex: 1,
    explanation:
      'People everywhere need these things. But someone can be loved and creative while their basic needs are shaky — so the ladder does not have to be climbed in order.',
  },
];

const CONTENT = `<p>Think back to the last lesson before lunch, when you were really hungry. Stomach growling, clock crawling.</p>
<p>Could you concentrate? Probably not. Not because you&rsquo;re bad at concentrating, but because your brain had decided something else was more important right then, and it wasn&rsquo;t asking your permission.</p>
<p>Now think about a time you were worried about something &mdash; a test, a fight with a friend, someone being unkind. Even if there was cake in front of you, it probably didn&rsquo;t taste like much.</p>
<p>In 1943, a psychologist named <strong>Abraham Maslow</strong> noticed this pattern and wrote it down properly. His idea is one of the most famous in all of psychology, it&rsquo;s genuinely useful, and &mdash; this is the fun part &mdash; the picture almost everyone uses to explain it is one <strong>he never drew</strong>.</p>
<p>Let&rsquo;s build it up, then take it apart.</p>

<h3>The one idea underneath everything</h3>
<p>Here&rsquo;s Maslow&rsquo;s insight, and it&rsquo;s simpler than you&rsquo;d think:</p>
<blockquote><strong>Your needs take turns. Whichever one is emptiest and most urgent grabs your attention, and the rest have to wait.</strong></blockquote>
<p>That&rsquo;s it. That&rsquo;s the whole engine.</p>
<p>A hungry person doesn&rsquo;t care about being admired. Someone in danger isn&rsquo;t thinking about their hobbies. Not because those things stopped mattering &mdash; but because something louder is currently using up all the space.</p>
<p>And there&rsquo;s a second half that&rsquo;s just as important:</p>
<blockquote><strong>A need that&rsquo;s been filled goes quiet.</strong></blockquote>
<p>You don&rsquo;t walk around all day feeling grateful for air. It&rsquo;s the most important thing you need &mdash; you&rsquo;d die in minutes without it &mdash; but because you have plenty, it makes no noise at all. The moment you can&rsquo;t breathe, it&rsquo;s the <em>only</em> thing you can think about.</p>
<p>So needs are a bit like a room full of alarms. The ones that are satisfied sit there silently. The empty ones go off, and the emptiest, most basic one is the loudest.</p>

<h3>The five needs</h3>
<p>Maslow sorted human needs into five groups, from &ldquo;you&rsquo;ll die without this&rdquo; up to &ldquo;this makes life feel worth it.&rdquo;</p>
<div data-widget="needs-levels" data-eyebrow="Maslow's five levels" data-caption="Tap any level to see what's in it, and what it feels like when that one is running empty. The most urgent needs are at the bottom."></div>
<p>Working from the bottom up:</p>
<p><strong>1. Staying alive.</strong> Food, water, sleep, air, warmth. Your body simply stops working without these, so they shout the loudest of anything.</p>
<p><strong>2. Feeling safe.</strong> Not being in danger. Having a home. Knowing roughly what tomorrow looks like. When this one is empty you feel permanently jumpy, and it&rsquo;s very hard to think about anything else.</p>
<p><strong>3. Belonging and being loved.</strong> Family, friends, feeling part of a group. Humans are a species that survives by sticking together, so being left out genuinely hurts &mdash; that isn&rsquo;t you being oversensitive, it&rsquo;s an alarm doing its job.</p>
<p><strong>4. Feeling good at something.</strong> Being respected by other people, and respecting yourself. Being good at something and knowing it. Being trusted.</p>
<p><strong>5. Becoming fully yourself.</strong> The one with the awkward name: <strong>self-actualisation</strong>. It means becoming everything you&rsquo;re capable of being &mdash; making things, exploring ideas, getting deep into something because you love it rather than because someone told you to.</p>
<p>Maslow&rsquo;s point was that the ones lower down generally have to be reasonably okay before the ones higher up get much of your attention. You can&rsquo;t focus on becoming a great painter while you&rsquo;re terrified or starving.</p>

<h3>The twist: Maslow never drew a pyramid</h3>
<p>If you&rsquo;ve seen this idea before, you&rsquo;ve seen it as a <strong>pyramid</strong> &mdash; five coloured stripes, wide at the bottom, pointy at the top. It&rsquo;s on classroom walls all over the world.</p>
<p>Maslow didn&rsquo;t draw that. Not in his 1943 paper, not later, not anywhere.</p>
<p>The pyramid was invented by other people, roughly twenty years afterwards. A management writer named Keith Davis drew the idea as a set of <em>steps</em> in a 1957 textbook. Then a consulting psychologist called Charles McDermid turned it into the pyramid in a 1960 business magazine article &mdash; one about how to motivate workers as cheaply as possible.</p>
<p>The pyramid caught on because it&rsquo;s a great picture. Simple, memorable, easy to print. And it&rsquo;s now so famous that people credit it to a man who never used it.</p>
<p><strong>Why does this matter?</strong> Because the pyramid quietly tells you something Maslow didn&rsquo;t actually believe.</p>
<p>A pyramid says: <em>finish this level, then climb to the next one.</em> Like levels in a video game &mdash; complete level 1, unlock level 2.</p>
<p>But nobody ever finishes a level. You ate lunch today and you&rsquo;ll be hungry again tomorrow; food isn&rsquo;t a box you tick once and never think about again. And being a bit hungry doesn&rsquo;t switch off caring about your friends.</p>
<p>What actually happens is that you&rsquo;re <strong>partly full on all five at the same time, always</strong> &mdash; and that is exactly what Maslow said.</p>

<h3>What Maslow actually said</h3>
<p>In the same 1943 paper, Maslow went out of his way to warn people against exactly that reading:</p>
<blockquote>&ldquo;We have spoken so far as if this hierarchy was a fixed order, but actually it is not nearly as rigid as we may have implied.&rdquo;</blockquote>
<p>He then gave some rough example numbers for an ordinary person: about <strong>85%</strong> satisfied on staying alive, <strong>70%</strong> on safety, <strong>50%</strong> on belonging, <strong>40%</strong> on feeling good at things, and <strong>10%</strong> on becoming fully yourself.</p>
<p>Look carefully at those numbers, because they&rsquo;re the opposite of a pyramid.</p>
<p>Not a single one is at 100%. Not a single one is at 0%. This person is working on <strong>all five at once</strong>, all the time &mdash; just in different amounts. They never &ldquo;finished&rdquo; safety and moved on. They&rsquo;re 70% okay on safety and getting on with their life.</p>
<div data-widget="needs-balance" data-eyebrow="How it actually works" data-caption="Every level is partly full, all the time. Try the different situations — or drag the sliders yourself — and watch which need takes over as the loudest one."></div>
<p>Play with that for a moment, because it&rsquo;s the bit worth remembering. Drop one bar and the loudest need changes instantly, even though nothing else moved. That&rsquo;s what it feels like to skip lunch, or to start at a new school where nobody knows you yet.</p>

<h3>Does the science hold up?</h3>
<p>Fair question, and the honest answer is: partly.</p>
<p>The biggest test came in 2011, when two researchers, Louis Tay and Ed Diener, went through survey data from <strong>60,865 people across 123 countries</strong>. That&rsquo;s about as wide a test as you can run on humans.</p>
<p><strong>What they found supports Maslow:</strong> the needs he named really do show up everywhere. Food and safety, friendship and respect, mastery and independence &mdash; people all over the world need these things, and each one on its own makes life measurably better. He wasn&rsquo;t just describing Americans in the 1940s.</p>
<p><strong>What they found against him:</strong> the strict order isn&rsquo;t real. People can have warm friendships and a deep sense of purpose <em>while</em> their basic needs are shaky. Someone can be poor and hungry and still be loved, still be creative, still feel their life has meaning. The ladder isn&rsquo;t one you have to climb in order.</p>
<p>So the honest verdict: <strong>Maslow was right about the ingredients, and too neat about the order.</strong></p>
<p>That&rsquo;s a pretty normal outcome in science, and it&rsquo;s worth noticing rather than hiding. A model doesn&rsquo;t have to be perfectly correct to be useful &mdash; it just has to be <em>less wrong than having no model at all</em>. This one still explains an enormous amount about why people behave the way they do.</p>

<h3>Why it's actually useful</h3>
<p>Here&rsquo;s what you can do with this once you understand it.</p>
<p><strong>It explains other people.</strong> When someone is being difficult, snappy or unreasonable, there&rsquo;s often an empty need underneath making all the noise. A kid who acts up in the last lesson before lunch may not be badly behaved. A friend who suddenly gets clingy or mean might be feeling left out. You start asking &ldquo;what&rsquo;s running empty?&rdquo; instead of &ldquo;what&rsquo;s wrong with them?&rdquo;</p>
<p><strong>It explains you.</strong> When you can&rsquo;t concentrate, or feel flat, or can&rsquo;t get started on something, it&rsquo;s worth scanning the list downward. Did I sleep? Have I eaten? Am I worried about something? Do I feel left out? Very often the problem is a level below the one you were trying to fix.</p>
<p><strong>It puts things in a sensible order.</strong> You cannot cheer someone up with a compliment when they&rsquo;re frightened, and you cannot help someone chase a big dream while they&rsquo;re hungry. Deal with the loudest thing first.</p>
<p><strong>And it explains why &ldquo;having everything&rdquo; isn&rsquo;t enough.</strong> People with plenty of food, total safety and lots of friends still get restless, because the top need is real too. That itch to make something, learn something, be good at something isn&rsquo;t a luxury &mdash; it&rsquo;s just the quietest alarm in the room, and you only hear it once the others stop ringing.</p>

<h3>The whole thing on one page</h3>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Question</th><th>The answer</th></tr>
</thead>
<tbody>
<tr><td>What&rsquo;s the core idea?</td><td>Your needs take turns; the emptiest and most basic one grabs your attention</td></tr>
<tr><td>Why don&rsquo;t I notice my met needs?</td><td>A satisfied need goes quiet. You only notice air when you can&rsquo;t get any</td></tr>
<tr><td>What are the five?</td><td>Staying alive &rarr; feeling safe &rarr; belonging &rarr; feeling good at something &rarr; becoming fully yourself</td></tr>
<tr><td>Who drew the famous pyramid?</td><td>Not Maslow. Keith Davis (steps, 1957) and Charles McDermid (pyramid, 1960)</td></tr>
<tr><td>Is it really a strict ladder?</td><td>No &mdash; Maslow said so himself. You&rsquo;re partly full on every level at once</td></tr>
<tr><td>Does the research back it up?</td><td>The needs are real and universal; the strict order isn&rsquo;t</td></tr>
</tbody>
</table>
</div>

<h3>The one thing to remember</h3>
<p>Forget the pyramid. Keep this instead:</p>
<p><strong>Everybody is running on five needs at once, all partly full. Whichever one is emptiest is the one doing the shouting &mdash; and until it gets fed, nothing above it gets heard.</strong></p>
<p>That&rsquo;s why you can&rsquo;t do homework when you&rsquo;re hungry. And it&rsquo;s why, when someone is being impossible, the most useful question isn&rsquo;t &ldquo;what&rsquo;s wrong with you?&rdquo; It&rsquo;s <strong>&ldquo;what&rsquo;s running empty?&rdquo;</strong></p>
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
