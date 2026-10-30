import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'The Haunted Arcade: A Seven-Stop Treasure Hunt';
const CATEGORY = 'Gaming';

const QUIZ: QuizQuestion[] = [
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

const CONTENT = `<p>Yesterday a parcel arrived with no return address: a treasure hunter's journal, and on its last page, a hand-drawn map of the arcade on 5th street — dark for years — with seven stops circled in red. <em>“Every legend starts with a single clue,”</em> the final entry reads. <em>“Follow my trail through all seven stops, and the lost high score is yours.”</em> This is a treasure hunt, not a quiz: every room opens only when the one before it is solved, wrong answers never punish, and your progress survives a closed tab.</p>
<div data-widget="treasure-hunt" data-eyebrow="Playable treasure hunt" data-caption="Seven stops from Start to Finish: spot the odd one out, crack the lock, count the coins, tame the lights, dodge the traps, pay the ferryman, crack the fruit lock — then claim the lost high score."></div>
<h3>Tips for little hunters</h3>
<ul>
<li><strong>Say patterns out loud.</strong> In the ghost-lights room, naming each light as it blinks (“red, blue, blue…”) doubles how many you can hold. Memory loves a voice.</li>
<li><strong>Chunk the lights.</strong> Don’t remember six blinks — remember two groups of three. Your brain files boxes faster than lists.</li>
<li><strong>Turn pictures into numbers.</strong> If 3 apples make 12, one apple is 4 — then the banana gives itself away.</li>
<li><strong>Wrong answers teach.</strong> Every wrong tap tells you something. The hunt only moves forward; it never takes progress away.</li>
</ul>`;

export default function PreviewHauntedArcade() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-haunted-arcade" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
