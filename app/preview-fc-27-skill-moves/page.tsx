import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'EA Sports FC 27 Skill Moves: The 5 That Win Games (Plus the 4 New Ones)';
const CATEGORY = 'Gaming';

const QUIZ: QuizQuestion[] = [
  {
    question: 'A 3-star midfielder tries a 4-star Heel to Heel Flick with perfect inputs. What happens?',
    options: [
      'It works — inputs are all that matter',
      'Nothing — a player can only perform moves at or below their star rating',
      'It works but drains extra stamina',
      'It works only in the practice arena',
    ],
    correctIndex: 1,
    explanation:
      'Stars are a hard gate. The best move is the best move your players can actually perform — check ratings before building attacks around tricks.',
  },
  {
    question: 'Which move is the most-used skill in competitive play?',
    options: [
      'Elastico',
      'Kneel Header',
      'Ball Roll — hold RS left or right',
      'Stepover Combo',
    ],
    correctIndex: 2,
    explanation:
      'Boring and unbeatable: roll sideways across your body, dodge the lunge, then shoot, pass, or sprint the other way.',
  },
  {
    question: 'When should you use Drag Back?',
    options: [
      'Every time you receive the ball, to stay safe',
      'When a defender is sprinting at you and overcommits — their momentum carries them past',
      'Only inside your own penalty area',
      'Only in the 90th minute',
    ],
    correctIndex: 1,
    explanation:
      'Hold L2+R2 (LT+RT) and flick LS down. But ration it: good players read patterns fast and will punish repetition.',
  },
  {
    question: 'Which of these is a new FC 27 move?',
    options: [
      'Ball Roll',
      'Stepover',
      'Ball Roll Spin — a roll fused with a spin to escape pressure',
      'Roulette',
    ],
    correctIndex: 2,
    explanation:
      'The four newcomers are Fake Turn (3★), Ball Roll Spin (4★), Stepover Combo (4★), and Kneel Header (5★). The Ball Roll Spin has the best chance of mattering.',
  },
  {
    question: 'What is unusual about the Kneel Header’s requirements?',
    options: [
      'It needs 5 stars like the Elastico',
      'It is gated behind the Trickster Playstyle rather than a star rating',
      'It can only be performed in the practice arena',
      'It needs no star rating and no Playstyle at all',
    ],
    correctIndex: 1,
    explanation:
      'L2 + R1 + flick RS up (LT + RB on Xbox) — any player with the Trickster Playstyle can perform it, even at 1 star.',
  },
  {
    question: 'What is the cardinal rule of skilling in matches?',
    options: [
      'Always use at least three moves per attack',
      'Never use skill moves in the first half',
      'One move per attack — every extra trick doubles the chance of losing the ball',
      'Only 5-star players should ever dribble',
    ],
    correctIndex: 2,
    explanation:
      'The best dribblers mostly do one ball roll and explode. Practice one move fifty times in the arena before it is match-ready.',
  },
];

const CONTENT = `<p>FC 27 launched on September 25, 2026, and with it came four brand-new skill moves: the Fake Turn, the Ball Roll Spin, the Stepover Combo, and the Kneel Header. Everybody is in the practice arena trying them. Almost nobody needs them yet.</p>
<p>Here is the honest truth about skill moves, in this game and every one before it: five old, boring tricks win more matches than the entire rest of the list combined. Learn those five first. Then meet the four new arrivals \u2014 what they do, who can perform them, and where they might fit once the community figures them out.</p>
<p>One note on inputs: this guide gives PlayStation buttons first, Xbox in parentheses. RS means the right stick, LS the left stick, and directions assume your player is running up the pitch.</p>

<h3>The rule of stars</h3>
<p>Every player has a skill-move star rating from 1 to 5, and a player can only perform moves at or below their rating. Your 5-star dribblers \u2014 Lamine Yamal and Ousmane Demb\u00e9l\u00e9 (both 93 dribbling), plus Michael Olise, Vin\u00edcius J\u00fanior, and Rayan Cherki (91 each) \u2014 can do everything. A 3-star midfielder cannot do a 4-star move, no matter how clean your inputs are.</p>
<p>This is why the list below is ordered the way it is. The best move in the game is not the flashiest one. It is the best move <em>your players can actually perform</em>.</p>
<div data-widget="skill-move-finder"></div>

<h3>The 5 moves that win games</h3>
<p><strong>1. Ball Roll (2 stars).</strong> <span data-widget="skill-input" data-input="Hold RS ← / →"></span> That is the whole move \u2014 no, really. Roll the ball sideways across your body and the defender\u2019s lunge misses by a step. It is boring, easy, and the most-used skill in competitive play, because it is fast, safe, and chains into everything: roll one way, then shoot, pass, or sprint the other way.</p>
<p><strong>2. Drag Back (2 stars).</strong> <span data-widget="skill-input" data-input="Hold L2+R2 (LT+RT) and flick LS ↓"></span> Your player drags the ball backward and stops dead. Use it when a defender is sprinting at you full speed \u2014 their momentum carries them past while you calmly turn the other way. The cardinal sin is doing it every time you receive the ball. Good players read patterns fast; save it for when someone overcommits.</p>
<p><strong>3. Stepover (2 stars).</strong> Rotate RS from up toward the direction you are running (up-to-right going right, up-to-left going left). One stepover freezes a defender for a split second \u2014 not to beat them outright, but to make them hesitate while you burst past. Do it at the edge of the box before a shot to buy half a yard.</p>
<p><strong>4. Heel to Heel Flick (4 stars).</strong> <span data-widget="skill-input" data-input="Flick RS ↑ then ↓"></span> The ball pops from heel to heel and launches forward past the defender\u2019s challenge. Best used when you are already facing goal with space ahead: one flick and you are through at full sprint. Needs 4-star dribblers, so check ratings before building your attack around it.</p>
<p><strong>5. Elastico (5 stars).</strong> <span data-widget="skill-input" data-input="RS →, rotate ↓←"></span> (mirror it starting left for the Reverse Elastico). The player knocks the ball one way with the outside of the boot and whips it back the other \u2014 the most violent direction change in the game. It only works if the defender hasn\u2019t covered your exit: elastico into a covered lane and you have simply passed them the ball, with style. Reserve it for 1v1s in space with Yamal-tier dribblers.</p>

<h3>The 4 new moves in FC 27</h3>
<p>Combos below come from FIFPlay\u2019s FC 27 launch table, cross-checked against EA\u2019s gameplay deep dive. One honesty note: with the game days old, early guides disagree on a couple of star ratings \u2014 where they do, this guide follows the input-level table, and ratings may still shift with patches.</p>
<p><strong>Fake Turn (4 stars).</strong> <span data-widget="skill-input" data-input="○ or ✕ + LS opposite"></span> Your player sells a turn one way, then bursts the other. Built for tight spaces: 1v1s, cutting inside from the wing, the edge of the box, or receiving with a defender on your back. The strength is surprise, so the moment you spam it, it stops working. Fake one way, turn the other, then pass or shoot before the defender resets.</p>
<p><strong>Ball Roll Spin (4 stars).</strong> <span data-widget="skill-input" data-input="Hold L1, RS direction then flick RS ↑"></span> A ball roll fused with a spin: move the ball across your body, then turn away from pressure and attack the space behind the defender. This is the new move with the best chance of mattering, because it extends something players already do every match. Watch for it under tight marking.</p>
<p><strong>Stepover Combo (5 stars).</strong> <span data-widget="skill-input" data-input="Hold L2, flick RS ↑ + direction"></span> Chained stepovers in one sequence instead of a single stepover and go. The idea is patience: each extra stepover makes your eventual direction harder to read. Best near the corner of the box, in 1v1s, or before accelerating into space. The risk is holding the ball too long \u2014 the combo is a setup, not a destination.</p>
<p><strong>Kneel Header (1 star + Trickster).</strong> <span data-widget="skill-input" data-input="L2 + R1 + flick RS ↑"></span> The odd one out: an aerial move where your player drops to redirect a cross. It is gated behind the Trickster Playstyle rather than a star rating \u2014 any player with Trickster can perform it. Early verdicts call it more spectacular than practical. File under \u201cscore a viral goal with it,\u201d not \u201cwin Weekend League with it.\u201d</p>

<h3>How to actually learn them</h3>
<p>Go to the practice arena, not matches. Pick one move and do it fifty times: walking, then sprinting, then with a defender added. Only when you can do it without looking at your thumbs is it match-ready. Then learn the cardinal rule of skillers: <strong>one move per attack.</strong> Every extra trick doubles the chance you lose the ball. The best dribblers in the world mostly do one ball roll and explode.</p>
<p>And if your thumbs are not cooperating, FC 27 still has simplified skill moves: flick RS in a main direction and the game picks a contextual trick for your player\u2019s star level. Training wheels, but honest ones.</p>

<h3>The one thing to remember</h3>
<p>Stars decide what you <em>can</em> do; judgment decides what you <em>should</em> do. Five boring moves, used once per attack, beat a whole library of tricks spammed at the wrong moment.</p>`;

export default function PreviewFc27Skills() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-fc-27-skill-moves" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
