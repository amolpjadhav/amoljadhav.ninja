import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Entropy: Why Time Only Runs One Way';
const CATEGORY = 'Science';

const QUIZ: QuizQuestion[] = [
  {
    question: 'You can always tell when a video is playing backwards. What does that tell you about the laws of physics?',
    options: [
      'The laws of physics forbid things running backwards',
      'They do not forbid it at all — the laws work equally well in both directions, which is exactly the puzzle',
      'Cameras cannot record backwards',
      'Time is an illusion',
    ],
    correctIndex: 1,
    explanation:
      'Two billiard balls colliding in reverse looks like perfectly normal physics. Nothing in the rules picks a direction — so the arrow of time has to come from somewhere else.',
  },
  {
    question: 'Why does milk mix into coffee instead of staying in a neat swirl?',
    options: [
      'A force pushes the particles apart',
      'There are vastly more mixed-up arrangements than neat ones, so that is where it lands by chance',
      'Milk is lighter than coffee',
      'The heat of the coffee destroys the milk',
    ],
    correctIndex: 1,
    explanation:
      'Nothing pushes it. Mixing happens for the same reason a shuffled deck comes out unsorted — there are simply far more ways to be jumbled.',
  },
  {
    question: 'With only four particles in a divided box, could they all randomly end up on one side?',
    options: [
      'No, that is physically impossible',
      'Yes — it is 1 chance in 16, so you would see it fairly often',
      'Only if you cool them down first',
      'Only if someone pushes them there',
    ],
    correctIndex: 1,
    explanation:
      'This is the key point: nothing forbids it. Every particle you add halves the odds, and real objects have trillions of trillions of particles — which is what turns "unlikely" into "never".',
  },
  {
    question: 'Why does hot tea go cold instead of getting hotter?',
    options: [
      'Cold is a substance that flows into the tea',
      'There are far more ways for the jiggling energy to spread out than to stay bunched in one place',
      'Heat is attracted to cold objects',
      'The cup absorbs the heat and destroys it',
    ],
    correctIndex: 1,
    explanation:
      'Heat is just molecules jiggling. It spreads for the same reason the particles in the box mix — spread-out arrangements massively outnumber concentrated ones.',
  },
  {
    question: 'You are extremely organised — trillions of cells all in the right place. How does that fit with everything drifting toward mess?',
    options: [
      'Living things are an exception to the rule',
      'You stay tidy by exporting a bigger mess outside yourself — that is mechanically what eating is',
      'Life reverses entropy permanently',
      'Cells are too small for the rule to apply',
    ],
    correctIndex: 1,
    explanation:
      'You take in concentrated energy as food and give back scattered heat and waste. The total mess still increases. You are just moving it around to keep a pocket of order.',
  },
  {
    question: 'What actually makes the past different from the future?',
    options: [
      'Time flows forward like a river',
      'The past had lower entropy — it was more sorted. That difference IS the arrow of time',
      'The future has not been created yet',
      'Clocks only run one way',
    ],
    correctIndex: 1,
    explanation:
      'Time\'s direction is not a separate ingredient added to physics — it is entropy increasing. Why the universe started so sorted in the first place is still an open question.',
  },
];

const CONTENT = `<p>Play a video backwards and you can always tell.</p>
<p>Smoke gathers itself out of the air and pours back into a chimney. A shattered glass leaps off the floor and reassembles on the table. Milk un-swirls out of coffee and rises back into the jug as a clean white stream.</p>
<p>You know instantly that something is wrong. But here&rsquo;s the strange part, and it&rsquo;s the reason this whole idea exists:</p>
<p><strong>Nothing in the laws of physics forbids any of it.</strong></p>
<p>Every rule governing how atoms bump into each other works exactly as well backwards as forwards. Play a video of two billiard balls colliding in reverse and it still looks like perfectly normal physics. The laws don&rsquo;t have a preferred direction.</p>
<p>So why does the world so obviously have one?</p>

<h3>The answer is just counting</h3>
<p>Here&rsquo;s the whole idea, and it really is this simple:</p>
<blockquote><strong>There are far more messy arrangements than tidy ones. So you end up messy by accident.</strong></blockquote>
<p>Let&rsquo;s actually count, with a tiny example.</p>
<p>Imagine a box with a divider down the middle and just <strong>four</strong> particles in it. Each one can be on the left or the right. How many ways can they arrange themselves?</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Arrangement</th><th>Number of ways</th></tr>
</thead>
<tbody>
<tr><td>All 4 on the left</td><td>1</td></tr>
<tr><td>3 left, 1 right</td><td>4</td></tr>
<tr><td><strong>2 left, 2 right (spread out)</strong></td><td><strong>6</strong></td></tr>
<tr><td>1 left, 3 right</td><td>4</td></tr>
<tr><td>All 4 on the right</td><td>1</td></tr>
</tbody>
</table>
</div>
<p>Sixteen arrangements in total. Only <strong>one</strong> of them has everything piled on the left. But <strong>six</strong> have them nicely spread out.</p>
<p>So even with four particles, &ldquo;spread out&rdquo; is already six times more likely than &ldquo;all on one side.&rdquo; Nothing is pushing them apart. There are just more ways to be spread out than to be piled up.</p>
<p>Now scale that up.</p>
<p>With 100 particles, the odds of them all landing on one side by chance are about 1 in a million trillion trillion. And a single breath of air contains roughly <strong>10,000,000,000,000,000,000,000</strong> particles.</p>
<p>At those numbers, &ldquo;unlikely&rdquo; stops being a useful word. It will not happen. Not today, not in the lifetime of the universe.</p>
<div data-widget="mixing-box" data-eyebrow="Try to un-mix it" data-caption="The particles start perfectly sorted. Shake the box and they mix. Keep shaking and see if you can get them back — then drag the particle count up and watch the odds fall off a cliff."></div>
<p>Play with that for a minute, and notice something important. With four or six particles you really <em>will</em> see it sort itself out if you keep shaking. It&rsquo;s not forbidden. It&rsquo;s just that every particle you add makes it twice as unlikely, and reality runs on numbers with twenty-two zeros.</p>

<h3>Entropy is not a force</h3>
<p>This is the bit that makes everything click, so it&rsquo;s worth saying plainly.</p>
<p>There is no force pushing things toward mess. Nothing is dragging your bedroom toward untidiness or shoving milk through your coffee. No mysterious energy is at work.</p>
<p>Things end up mixed for exactly the same reason a shuffled deck of cards comes out in no particular order: <strong>there are overwhelmingly more ways to be jumbled than to be sorted, so that&rsquo;s where you land.</strong></p>
<p><strong>Entropy</strong> is just the name for how many arrangements look like what you&rsquo;re seeing. Few possible arrangements means low entropy &mdash; sorted, special, unusual. Enormously many means high entropy &mdash; mixed, ordinary, unremarkable.</p>
<p>And the famous Second Law of Thermodynamics, which sounds so forbidding, says something almost obvious once you put it this way:</p>
<blockquote>Things drift from arrangements there are few of, toward arrangements there are lots of.</blockquote>
<p>That&rsquo;s it. That&rsquo;s the law. It&rsquo;s less a rule of physics than a statement about odds.</p>

<h3>What falls out of it</h3>
<p>Once you have that one idea, a surprising amount of the world drops out of it for free.</p>
<p><strong>Why heat flows from hot to cold, never the reverse.</strong> Heat is just molecules jiggling. In a hot object they jiggle hard; in a cold one, gently. When they touch, the jiggling spreads out &mdash; not because heat &ldquo;wants&rdquo; to move, but because there are vastly more ways for the energy to be shared around than to stay bunched up in one place. Your tea goes cold for the same reason the particles in the box mix.</p>
<p><strong>Why you can&rsquo;t unscramble an egg.</strong> There&rsquo;s essentially one way for an egg to be an egg, and countless ways for it to be scrambled. Whisking it takes seconds. Finding your way back would mean landing on exactly one arrangement out of a number too large to write down.</p>
<p><strong>Why perpetual motion machines never work.</strong> Every machine loses a little energy as heat, spread out into its surroundings. Getting that scattered energy back and re-concentrating it would mean running the counting backwards. Inventors have been trying for centuries. The counting always wins.</p>

<h3>So how are you so tidy?</h3>
<p>Here&rsquo;s a puzzle. You are extraordinarily organised. Trillions of cells, all in the right places, doing the right jobs. A tree is organised. A bird is organised. If everything drifts toward mess, how does any of this exist?</p>
<p>The answer isn&rsquo;t that life breaks the rule. It&rsquo;s that <strong>you stay tidy by making a bigger mess outside yourself.</strong></p>
<p>You take in concentrated, orderly energy &mdash; food &mdash; and you give back heat, carbon dioxide and waste, all far more scattered than what you took in. Add it up and the total mess still increases. You&rsquo;re just moving it around, exporting disorder into the world so you can hold on to a little pocket of order.</p>
<p>That&rsquo;s not a poetic way of describing life. It&rsquo;s mechanically what eating <em>is</em>.</p>
<p>And it&rsquo;s why you can never stop. The moment you stop paying that bill, the counting takes over, and a body becomes what bodies eventually become.</p>

<h3>The arrow of time</h3>
<p>Now for the part that makes this one of the deepest ideas in physics.</p>
<p>We started with a puzzle: the laws of physics work equally well in both directions, so why does time so obviously run one way?</p>
<p>Here&rsquo;s the answer. <strong>The only thing that reliably tells the past apart from the future is that the past had lower entropy.</strong> That&rsquo;s it. That&rsquo;s the difference. Yesterday was more sorted than today; tomorrow will be less sorted still.</p>
<p>Every way you sense time passing traces back to this. You remember the past and not the future because making a memory means leaving an orderly mark. The glass is broken now and whole in your memory. Time&rsquo;s direction isn&rsquo;t a separate thing layered on top of physics &mdash; it <em>is</em> entropy increasing.</p>
<p>Which leaves one enormous question hanging.</p>
<p>If everything drifts toward mess, and it&rsquo;s been drifting for 13.8 billion years, then the universe must have started in an extraordinarily sorted state. Almost unimaginably special. <strong>Why?</strong></p>
<p>Nobody knows. Physicists call this the past hypothesis, and it&rsquo;s genuinely unsolved &mdash; not &ldquo;hard,&rdquo; but open, with active disagreement about whether it even needs its own explanation. Everything above is settled science. This last step is the edge of the map.</p>
<p>It&rsquo;s worth sitting with that: the reason you can tell a video is playing backwards is a mystery that runs all the way down to the beginning of the universe.</p>

<h3>The one thing to remember</h3>
<p>Nothing pushes the world toward mess.</p>
<p><strong>There are simply far more ways to be messy than tidy, so that&rsquo;s where everything ends up</strong> &mdash; and the fact that it started tidy is why time has a direction at all.</p>
<p>Your tea goes cold, the egg won&rsquo;t unscramble, and you can tell the video is running backwards. All the same fact, just counting.</p>
`;

export default function PreviewEntropy() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-entropy" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
