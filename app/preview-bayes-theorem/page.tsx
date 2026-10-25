import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Bayes\u2019 Theorem: The Math of Changing Your Mind';
const CATEGORY = 'Mental Models';

const QUIZ: QuizQuestion[] = [
  {
    question: 'A 99%-accurate test says you have a disease that strikes 1 person in 1,000. What are the odds you are actually sick?',
    options: [
      '99% — the test is 99% accurate, case closed',
      'About 9% — the disease is so rare that false alarms outnumber real cases ten to one',
      '50% — a positive result means it could go either way',
      '0.1% — the test result changes nothing',
    ],
    correctIndex: 1,
    explanation:
      'Out of 1,000 tested people: 1 sick person tests positive, and about 10 healthy people false-alarm. Your slip is 1 of 11 — about 9%. The test described itself; it never described you.',
  },
  {
    question: 'Why does counting 1,000 people convince skeptics faster than any formula?',
    options: [
      'Large numbers always impress people regardless of logic',
      'It turns abstract percentages into people you can picture — 1 true positive on a table of 11 slips',
      'Counting is more mathematically rigorous than probability',
      'It changes the answer to something more intuitive',
    ],
    correctIndex: 1,
    explanation:
      'Same math, different packaging. Frequencies ("1 out of 11 slips") are something brains evolved to handle; naked percentages are not. The answer never changed — only its clothes did.',
  },
  {
    question: 'A second, independent test also comes back positive. Now what are your odds?',
    options: [
      'Still about 9% — the test has not changed',
      'About 99% — two 99% tests must stack to near-certainty',
      'About 91% — the same test is far more powerful now because yesterday\u2019s answer is today\u2019s starting point',
      '100% — two positives cannot both be wrong',
    ],
    correctIndex: 2,
    explanation:
      'Starting at 9%: roughly 9 true positives against 1 false alarm — about 91%. Evidence has no fixed meaning; the identical test nudged at 0.1% and shoved at 9%.',
  },
  {
    question: 'Which evidence should move your beliefs the most?',
    options: [
      'Evidence you see every day — volume beats everything',
      'Evidence that is rare unless your idea is true — an elephant in the kitchen, not a mouse',
      'Evidence that agrees with what you already think',
      'The most recent evidence, whatever it is',
    ],
    correctIndex: 1,
    explanation:
      'The update is the ratio of "how likely is this if I\u2019m right" to "how likely if I\u2019m wrong." Kitchens almost never contain elephants innocently — so an elephant moves you enormously and a mouse barely at all.',
  },
  {
    question: 'An expert testifies that a random DNA match happens 1 in a million times. What is the prosecutor\u2019s fallacy?',
    options: [
      'Claiming DNA evidence is never reliable',
      'Swapping "the odds of this evidence if innocent" with "the odds of innocence given this evidence"',
      'Refusing to present the expert\u2019s credentials',
      'Testing too many suspects at once',
    ],
    correctIndex: 1,
    explanation:
      'In a country of 300 million, about 300 innocents would also match — the defendant is one of ~301. A strong lead wearing a certainty costume, same shape as the 9%-vs-99% error.',
  },
  {
    question: '"Extraordinary claims require extraordinary evidence" is…',
    options: [
      'A poetic saying with no mathematical content',
      'Bayes in a trench coat — a near-impossible claim needs evidence that is near-impossible any other way',
      'The opposite of Bayes\u2019 theorem',
      'Only true for scientific claims, never everyday ones',
    ],
    correctIndex: 1,
    explanation:
      'A claim starting near zero stays near zero under ordinary evidence. Blurry lights can\u2019t move "visited by aliens" because blurry lights show up for a hundred boring reasons.',
  },
  {
    question: 'Before you can interpret any test, study, or rumor, what must you establish first?',
    options: [
      'Who is reporting it and whether you like them',
      'The base rate — how common this was before the evidence showed up',
      'Whether anyone else already believes it',
      'How recently the evidence was gathered',
    ],
    correctIndex: 1,
    explanation:
      'No base rate, no interpretation. "How common was this yesterday?" is the question that changes the answer almost every time — and the one almost nobody asks.',
  },
  {
    question: 'Two different tests agree. A rumor is retold five times. How should you update?',
    options: [
      'Equally — six pieces of evidence either way',
      'The two tests multiply; the retold rumor counts once — the same evidence in a costume is not new evidence',
      'The rumor matters more because five people believe it',
      'Neither matters; only expert testimony counts',
    ],
    correctIndex: 1,
    explanation:
      'Independent lines multiply — the first finds, the second convinces. Repetition is not replication: update once for one fact, no matter how many mouths it passes through.',
  },
];

const CONTENT = `<p><strong>Even a 99%-accurate test is wrong 9 times out of 10 \u2014 when what it\u2019s looking for is rare enough.</strong></p>
<p>A test that\u2019s right 99 times out of 100 says you have the disease \u2014 so you\u2019re 99% likely sick? It\u2019s 9%. No trick, and doctors and judges fall for it too: the test tells you how good <em>it</em> is, not how likely <em>you</em> are sick.</p>
<p>Evidence doesn\u2019t tell you what\u2019s true. It tells you how to <em>adjust</em> what you already believed \u2014 and if that was \u201cextremely rare,\u201d even great evidence can\u2019t move you very far.</p>
<p><em>A note on numbers: the disease example below uses round numbers \u2014 1 in 1,000 people, a test that\u2019s right 99 times out of 100 \u2014 because the shape of the answer is what matters. The arithmetic is exact for those inputs, and every figure was computed, not estimated.</em></p>

<h3>So what IS Bayes\u2019 theorem?</h3>
<p><strong>Don\u2019t start over with every clue \u2014 start from what you believed, then let the clue move you.</strong></p>
<p>That\u2019s it. A minister named Thomas Bayes wrote the math version 250 years ago, and it sat in a drawer until a Frenchman named Laplace realized what it was: a recipe for changing your mind. Alan Turing later used the same recipe to hunt submarines \u2014 his codebreakers weighed each intercepted clue exactly this way. Your spam filter does it billions of times a day.</p>
<p>The recipe has three ingredients: how rare the thing was <em>before</em> the clue, how often the clue appears when the answer is yes, and how often it cries wolf when the answer is no. Squeezed into math, the whole recipe is one line:</p>
<blockquote>Chance sick, given a beep = (beeps when sick \u00d7 how rare) \u00f7 (beeps overall)</blockquote>
<p>The fancy version just shortens the words \u2014 P means \u201cchance of,\u201d and the little line | means \u201cgiven that we know\u201d:</p>
<blockquote>P(sick | beep) = P(beep | sick) \u00d7 P(sick) \u00f7 P(beep)</blockquote>
<p>Read it out loud: \u201cthe chance you\u2019re sick, given a beep, equals the chance of a beep when sick, times how rare sickness is, divided by beeps overall.\u201d Now plug in our school\u2019s numbers:</p>
<blockquote>(99 \u00f7 100) \u00d7 (1 \u00f7 1,000) \u00f7 (11 \u00f7 1,000) = 9% \u2014 the same 1-in-11 from the story</blockquote>
<p>The formula never does anything the story didn\u2019t \u2014 it just does it in one line. Watch it run once and you\u2019ll never need to memorize it:</p>

<h3>Picture 1,000 kids in a line</h3>
<p>Picture a line of 1,000 kids waiting to see the school nurse. We know this disease is rare, affecting exactly 1 in 1,000 children. The nurse\u2019s test is simply designed to beep for anyone it thinks is sick.</p>
<p><strong>Group 1: The Sick Kids</strong></p>
<ul>
<li>Out of the whole school of 1,000 kids, exactly 1 kid is genuinely sick.</li>
<li>The nurse tests this 1 sick kid. The machine correctly beeps.</li>
<li>Beep count: 1.</li>
</ul>
<p><strong>Group 2: The Healthy Kids</strong></p>
<ul>
<li>That leaves exactly 999 kids in the school who are perfectly healthy.</li>
<li>The nurse tests all 999 of these healthy kids.</li>
<li>Because the machine has a 1% error rate, it makes a mistake on 1% of them. 999 multiplied by 0.01 is roughly 10.</li>
<li>The machine falsely beeps for 10 completely healthy kids.</li>
<li>Beep count: 10.</li>
</ul>
<p>Now, tally up the results for the whole school. You have 1 valid beep from the genuinely sick kid, plus 10 mistaken beeps from the healthy kids, giving you exactly 11 total beeps.</p>
<p><strong>The Final Result</strong></p>
<p>When the testing is over, there are 11 kids standing in the nurse\u2019s office holding a slip that beeped.</p>
<p>If you are standing in that room, you look around at the 10 other kids. You know that out of all 11 of you, 10 are completely healthy false alarms, and only 1 is actually sick.</p>
<p>To find your odds, you take the 1 actually sick kid and divide by the 11 total beeps.</p>
<p>1 \u00f7 11 = 0.0909, which means your chance of actually having the disease is about 9%.</p>
<p>The test actually worked perfectly. The three ingredients of Bayes\u2019 theorem\u2014the background rarity, the true detection, and the false alarm rate\u2014all did their jobs. The mistake was assuming the test answered the question \u201cAm I sick?\u201d, a question it never actually answered.</p>

<h3>Take it twice, get a different answer</h3>
<p>So the first beep barely moved you \u2014 from 1 in 1,000 to 1 in 11. Depressing. But that 1-in-11 is your new starting line, and it changes everything.</p>
<p>The nurse runs a <em>fresh</em> test on you. New slip, same accuracy. It beeps again. Now what?</p>
<p>New line, new counting. Your odds are 1 sick kid in every 11. So line up 110 kids \u2014 ten groups of eleven: about 10 sick, 100 healthy.</p>
<p>Test them all. The 10 sick kids beep. Of the 100 healthy ones, 1 beeps by mistake \u2014 1 in 100, landing exact this time.</p>
<p>Count: 11 beeps, 10 belonging to sick kids. You hold a beeping slip \u2014 your odds are <strong>10 out of 11, about 91%.</strong></p>
<p>Look at the mirror: last time it was 1 out of 11. This time, 10 out of 11.</p>
<p>First time a nudge, second time a shove \u2014 because <strong>a clue has no fixed meaning; its power depends on what you believed when it arrived.</strong> That\u2019s why second opinions aren\u2019t bureaucracy. They\u2019re arithmetic: the first test finds, the second convinces.</p>

<h3>Two more places this bites</h3>
<p><strong>Courtrooms.</strong> An expert says a random DNA match happens 1 in a million times; the jury hears \u201c1 in a million he\u2019s innocent.\u201d But in 300 million people, ~300 innocents match too \u2014 the defendant is one face in ~301. Strong lead, not proof. Lawyers call the mix-up the prosecutor\u2019s fallacy. Same error as the nurse\u2019s test; this time someone goes to prison.</p>
<p><strong>Your inbox.</strong> A spam filter starts from how spammy your mail was yesterday, then lets each word nudge it \u2014 \u201clottery\u201d shoves, \u201clunch\u201d barely taps. And \u201cextraordinary claims need extraordinary evidence\u201d is the same rule dressed up: \u201caliens visited\u201d starts near zero, so blurry lights (which show up for a hundred boring reasons) can\u2019t move it.</p>
<p>The giveaway sentence, everywhere: <strong>out of everyone who\u2019d set off this clue, how many are actually guilty?</strong></p>

<h3>Three rules to steal</h3>
<ol>
<li><strong>How rare was it yesterday?</strong> No starting point, no interpretation. Find it first.</li>
<li><strong>How often does the clue cry wolf?</strong> Accuracy on the guilty is half the story \u2014 false alarms on the innocent usually matter more.</li>
<li><strong>One clue, one update.</strong> Two different tests multiply. The same rumor retold five times is one clue in a costume.</li>
</ol>

<h3>The one thing to remember</h3>
<p>Clues have no meaning alone \u2014 only next to what you believed first.</p>
<p><strong>How rare was it? How often does the clue cry wolf? Let the two multiply.</strong> That\u2019s Bayes\u2019 theorem: changing your mind with numbers, usable every day, no formula needed.</p>`;

export default function PreviewBayes() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-3xl lg:w-[80vw] lg:max-w-5xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
              style={{ color: accent, background: `${accent}22` }}
            >
              {CATEGORY} · DRAFT PREVIEW
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">
              {TITLE}
            </h1>
          </div>

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-bayes-theorem" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
