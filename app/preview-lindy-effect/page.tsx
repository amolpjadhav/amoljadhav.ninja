import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'The Lindy Effect: Old Things Outlive New Things';
const CATEGORY = 'Mental Models';

const QUIZ: QuizQuestion[] = [
  {
    question: 'What does the Lindy effect predict?',
    options: [
      'Old things are always better than new things',
      'For non-perishable things, the expected remaining life is roughly the current age',
      'Everything decays at the same rate, whatever it is',
      'New things always replace old things within a decade',
    ],
    correctIndex: 1,
    explanation:
      'Age is a track record. A book in print for fifty years has survived everything the world threw at it — expect fifty more.',
  },
  {
    question: 'Where does the name come from?',
    options: [
      'Charles Lindbergh, the first pilot to cross the Atlantic',
      'A Broadway deli where actors bet on how long plays would run',
      'The Lindy Hop dance craze of the 1930s',
      'A Lindt chocolate factory in Switzerland',
    ],
    correctIndex: 1,
    explanation:
      'Actors at Lindy\u2019s Delicatessen noticed plays that survived a hundred performances usually survived a hundred more. Albert Goldman coined the term in 1964.',
  },
  {
    question: 'A man is 90 years old. How much longer does Lindy expect him to live?',
    options: [
      'About 90 more years',
      'About 45 more years',
      'Trick question — Lindy does not apply to humans',
      'About 9 more years, a tenth of his age',
    ],
    correctIndex: 2,
    explanation:
      'Humans are perishable: they decay on their own. For perishable things the logic reverses — a 90-year-old is closer to the end, not further from it.',
  },
  {
    question: 'Why is mere survival evidence of robustness?',
    options: [
      'Because old things were built with better materials',
      'Because fragile things die young, so survivors passed a brutal silent exam',
      'Because people feel nostalgic about old things',
      'Because the government protects old institutions',
    ],
    correctIndex: 1,
    explanation:
      'Most restaurants, apps, and fads die fast. Surviving means withstanding competitors, changing tastes, and bad luck — a filter almost nothing passes.',
  },
  {
    question: 'Which is the safer bet to still exist in 20 years?',
    options: [
      'A two-month-old productivity app with great reviews',
      'A forty-year-old novel still in print',
      'Both are equally safe bets',
      'Neither — twenty years kills everything',
    ],
    correctIndex: 1,
    explanation:
      'The app has survived almost nothing; the novel survived wars, regimes, TV, and the smartphone. Bet with time, not against it.',
  },
  {
    question: 'What is the biggest caveat to keep in view?',
    options: [
      'The Lindy effect only works on Broadway plays',
      'It deals in probabilities, not guarantees — and survivorship bias hides the graveyard',
      'It was disproved by mathematicians in the 1990s',
      'It only applies to things younger than ten years',
    ],
    correctIndex: 1,
    explanation:
      'Plenty of old things do die, and we see survivors, not the fallen. Lindy says what is likely to endure — judgment still decides what should.',
  },
];

const CONTENT = `<p>In the 1960s, Broadway actors had a rule of thumb about new plays. They would gather at Lindy\u2019s Delicatessen in Manhattan, order cheesecake, and place bets on how long a show would run. The heuristic was simple: a play that had already survived a hundred performances would probably survive a hundred more. A play limping through its second week was already dead \u2014 it just didn\u2019t know it yet.</p>
<p>The actors were doing statistics without knowing it. Their deli-counter rule had a real mathematical backbone, and it applies far beyond Broadway: <strong>the future life expectancy of a non-perishable thing is proportional to its current age.</strong> A book in print for fifty years will probably stay in print for fifty more. A technology used for a decade will probably last another decade. The older something is, the longer it is likely to keep going.</p>
<p>This is the Lindy effect, named after the deli where actors first noticed it. The writer Albert Goldman coined the term in 1964 after hearing the actors\u2019 rule. The mathematician Benoit Mandelbrot \u2014 the fractals pioneer \u2014 gave it formal treatment. And Nassim Nicholas Taleb popularized it in <em>Antifragile</em>, turning a Broadway betting heuristic into one of the most useful mental models for navigating a novelty-obsessed world.</p>

<h3>Why survival is evidence</h3>
<p>The logic is disarmingly simple. Every day a thing survives is a day it withstood everything the world threw at it: competitors, changing tastes, accidents, bad luck. Fragile things die young \u2014 most new restaurants close within years, most apps vanish from the store, most fads evaporate by next season. So the mere fact that something is old means it has already passed a brutal, silent exam that killed nearly all of its contemporaries.</p>
<p>Think of it as a filter. A two-month-old productivity app has survived almost nothing; the world hasn\u2019t had time to test it. A forty-year-old novel has survived wars, regimes, translations, and the arrival of television, the internet, and the smartphone \u2014 and people still read it. Age, for things that don\u2019t physically decay, is not a weakness. It is a track record.</p>

<h3>The crucial exception: perishable things</h3>
<p>The Lindy effect comes with a giant flashing boundary, and Taleb is explicit about it: it applies to the <strong>non-perishable</strong> \u2014 ideas, books, technologies, institutions, practices. It does not apply to the <strong>perishable</strong>: humans, animals, food, individual machines with wearing parts.</p>
<p>For perishable things, the logic reverses. A ninety-year-old man is not expected to live ninety more years; he is expected to live a few. A car with 300,000 kilometers on it is closer to the scrapyard, not further from it. If someone quotes Lindy to argue that an aging dictator, an old dog, or a carton of milk has ages left in it, they have the rule exactly backwards.</p>
<p>The test is one question: <strong>does this thing decay on its own?</strong> If yes \u2014 perishable, Lindy does not apply. If no \u2014 an idea, a text, a technique \u2014 every year survived is evidence of years to come.</p>
<div data-widget="lindy-curves"></div>

<h3>How to actually use it</h3>
<p>Lindy is a decision tool disguised as a curiosity. Use it wherever novelty competes with staying power:</p>
<p><strong>Reading.</strong> Prefer books that are older than you. A new bestseller has survived nothing; a book still read after a century has survived everything. This doesn\u2019t mean never read new books \u2014 it means demanding more evidence before spending ten hours on one.</p>
<p><strong>Technology.</strong> Boring, decade-old tools (email, plain text, the command line) will probably outlive this year\u2019s shiny platform. Before rebuilding your life around a new app, ask how many of its predecessors survived.</p>
<p><strong>Habits and advice.</strong> Diets and productivity systems that are two years old are experiments. Ones embedded in cultures for centuries \u2014 walking, fasting, cooking at home \u2014 have passed the only trial that matters: time.</p>
<p>But keep the caveats in view. Lindy is about probabilities, not guarantees \u2014 plenty of old things do die. It suffers from survivorship bias by construction: we see the survivors, not the graveyard. It is no excuse for stagnation. \u201cWe\u2019ve always done it this way\u201d is the lazy cousin of the Lindy effect, not the effect itself. Lindy tells you what is likely to endure; human judgment still has to decide what should.</p>

<h3>The one thing to remember</h3>
<p>New things have to prove themselves. Old, non-perishable things already have. When in doubt, bet with time, not against it: <strong>what has lasted will probably keep lasting.</strong></p>`;

export default function PreviewLindy() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-lindy-effect" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
