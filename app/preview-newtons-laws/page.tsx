import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Newton\u2019s Laws of Motion: Push It, Race It, Bounce It';
const CATEGORY = 'Science';

const QUIZ: QuizQuestion[] = [
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

export default function PreviewNewtonsLaws() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <article className="container mx-auto max-w-3xl bg-[#1c1d20] border border-white/10 rounded-lg p-6 md:p-10">
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-newtons-laws" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
