import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Why Do Planes Stay Up? (Your Teacher\u2019s Answer Was Mostly Wrong)';
const CATEGORY = 'Science';

const QUIZ: QuizQuestion[] = [
  {
    question: 'What actually holds a plane up?',
    options: [
      'The curved top of the wing, which makes air hurry and push less',
      'The wing continuously shoves air downward, and the air shoves back just as hard',
      'The engines push against the sky like a ladder',
      'Hot air trapped under the wings',
    ],
    correctIndex: 1,
    explanation:
      'Action and reaction, same as swimming: every kilogram of air deflected down returns the favor upward. Add up a whole sky of shoved air and you get 440 tonnes hanging in the air.',
  },
  {
    question: 'The textbook claims air over the top must hurry to rejoin air below at the back edge. What do smoke tunnels show?',
    options: [
      'The two streams meet exactly on time, confirming the theory',
      'The top air arrives well before the bottom air — there was never a reunion to explain',
      'Air refuses to flow over wings at all',
      'The bottom air arrives first instead',
    ],
    correctIndex: 1,
    explanation:
      'Equal transit time was invented to explain a meeting that never happens. No appointment, no hurry, no theory.',
  },
  {
    question: 'Aerobatic planes fly upside down with symmetric wings. Why does this kill the textbook story?',
    options: [
      'It doesn\u2019t — upside-down flight uses a different physics',
      'Symmetric wings have no "long road on top," and inverted the long road points the wrong way — yet they fly fine',
      'Aerobatic planes are actually gliding, not flying',
      'They fly upside down only in thin mountain air',
    ],
    correctIndex: 1,
    explanation:
      'Kites, paper planes, and barn doors make the same point: shape refines lift but was never the engine. Tilt plus speed is.',
  },
  {
    question: 'So was Bernoulli wrong?',
    options: [
      'Yes — pressure differences across wings do not exist',
      'No — the pressures are real and his math describes them, but they are the speedometer, not the engine',
      'Yes — NASA proved air pressure has no effect on anything',
      'No — the textbook story is fully correct after all',
    ],
    correctIndex: 1,
    explanation:
      'The pressure field and the downward shove are one event seen two ways. Demote Bernoulli from cause to correct description and everything fits.',
  },
  {
    question: 'Why do planes take off and land nose-high?',
    options: [
      'It looks impressive for passengers',
      'Slow air needs a bigger shove per second, and more tilt means more shove',
      'The pilots are showing off',
      'Nose-high flight uses less fuel',
    ],
    correctIndex: 1,
    explanation:
      'Lift is shoved air per second. Less speed means each second must shove harder — so the wing tilts up to grab more air.',
  },
  {
    question: 'What is a stall?',
    options: [
      'The engines stopping mid-flight',
      'Tipping the wing too far so airflow breaks away, the downwash collapses, and lift vanishes',
      'Running out of fuel over the ocean',
      'A traffic jam in the boarding queue',
    ],
    correctIndex: 1,
    explanation:
      'Tilt is the whole game until it isn\u2019t: past the cliff edge the air can\u2019t follow the turn. Recovery is always the same — nose down, regain speed, let the air reattach.',
  },
  {
    question: 'Your hand out of a car window, palm tilted slightly up, feels lifted. What are you feeling?',
    options: [
      'Wind hitting your palm at random',
      'Your hand acting as a wing — deflecting air down and getting shoved up, plus drag pushing back',
      'An optical illusion; nothing is actually pushing',
      'The car\u2019s engine heat rising past your arm',
    ],
    correctIndex: 1,
    explanation:
      'Tilt more and it lifts harder (plus more backward shove on your arm). Tilt way too far and the lift dies — you just flew and stalled a wing.',
  },
  {
    question: 'A 440-tonne jumbo jet hangs in the sky. What is holding it up?',
    options: [
      'Nothing physical — modern jets are too heavy for air and use magnetic levitation',
      'Curved aluminum generating a vacuum above the wings',
      'Ordinary air, shoved downward wingful by wingful, shoving back',
      'The sheer speed of the engines pressing the plane upward',
    ],
    correctIndex: 2,
    explanation:
      'Four hundred tonnes of metal, held up by nothing but pushed-around sky. Shape refines it, speed feeds it, tilt controls it — the shove is the engine.',
  },
];

const CONTENT = `<p>A fully loaded Boeing 747 weighs about 440 tonnes. When it is cruising at 35,000 feet, there are no cables, no pillars, and no visible means of support. The only thing keeping that staggering amount of metal from dropping out of the sky is air.</p>
<p>How does a transparent gas hold up a building-sized machine?</p>
<p>If you ask a physicist, they will give you the real answer. But if you ask the average adult, they will likely repeat a story their high school science teacher drew on a chalkboard \u2014 a story that is neat, confident, and almost entirely wrong.</p>
<p>It starts with the diagram your teacher drew on the board: a wing, curved on top and flat on the bottom. According to the story, the air splits at the front edge. Because the top of the wing is curved, the air traveling over the top has a longer road to travel than the air traveling underneath.</p>
<p>Here is the story\u2019s big rule: because the top air has further to go, it has to sprint to keep up with the bottom air so they can meet neatly at the back edge. Fast-moving air pushes softly, while slow-moving air pushes hard. Therefore, the slow air under the wing shoves up harder than the fast air on top pushes down. The wing gets shoved upward, and the plane flies.</p>
<div data-widget="equal-transit-myth"></div>
<p>Almost every adult believes some version of this. It uses a real scientist\u2019s name (Bernoulli), it makes intuitive sense, and it is measurably false.</p>
<p>The classroom story relies entirely on a concept called <em>equal transit time</em> \u2014 the idea that the split air has an appointment to meet up again at the back of the wing. But smoke-tunnel films show the truth plainly: the air sliding over the top doesn\u2019t wait for anyone. It arrives at the back edge well before the air underneath, sometimes twice as fast, with no reunion whatsoever. The whole \u201clonger road, must hurry\u201d logic was invented to explain a meeting that never happens.</p>
<p><strong>Here\u2019s the real answer, and it\u2019s simpler:</strong> wings stay up by shoving air <em>down</em>. The air shoves back. That\u2019s the whole trick \u2014 everything below just proves it.</p>
<p><em>A note on numbers: aircraft weights and speeds below are rounded, typical figures \u2014 a 747\u2019s maximum is about 440 tonnes, cruising roughly 900 km/h. Exact specs vary by model and load; the shape of the argument doesn\u2019t.</em></p>

<h3>The swimming pool proof</h3>
<p>Forget planes for ten seconds. Get in a pool and push water backwards with your hands. You glide forwards. Nobody is confused by this. You shoved the water one way; the water shoved you the other. Action, reaction \u2014 Newton\u2019s third law, the one you already believe with your whole body.</p>
<p>A wing is a hand that never stops pushing. Tilted slightly upward as it rushes forward, it grabs the air coming at it and throws it downward behind it \u2014 pilots call this the <em>downwash</em>, and you can sometimes see it flattening grass or spraying water on takeoff. Every kilogram of air shoved down shoves the wing up by exactly as much. Add up a whole sky of shoved air, and you get 440 tonnes of airplane hanging in the sky.</p>
<div data-widget="downwash-pushback"></div>
<p>So when someone asks what holds a plane up, the honest one-word answer is: <strong>air.</strong> Not magic pressure, not curved shapes. Just air, shoved down, shoving back.</p>

<h3>Why the textbook story collapses</h3>
<p>And there\u2019s a killer experiment sitting in plain sight: <strong>aerobatic planes fly upside down.</strong> (Aerobatic planes are stunt planes — small, extra-strong planes built to do loops, rolls, and upside-down tricks at air shows.) Their wings are symmetric \u2014 no long top road at all \u2014 and inverted, the \u201clong road\u201d points the wrong way entirely. Under the textbook story, inverted flight should be impossible. Pilots do it for a living. Kites fly with flat boards. Paper airplanes fly with folded sheets. Barn doors would fly if you pushed them fast enough at the right tilt. Shape helps, but shape was never the engine.</p>
<div data-widget="upside-down-wing"></div>

<h3>So Bernoulli was\u2026 what, lying?</h3>
<p>No \u2014 and this is the subtle part, worth one paragraph. Pressure differences across a wing are real. Measure them and the top really does pull up while the bottom pushes. Bernoulli\u2019s math correctly <em>describes</em> those pressures.</p>
<p>The mistake is calling the description the <em>cause</em>. The pressures and the downward shove are the same event seen two ways \u2014 like saying a car moves because its wheels turn. True, but the engine is the engine. The wing turns the airflow downward (you can photograph the downwash); the pressure field is what that turning <em>looks like</em> from the pressure side. NASA\u2019s own explainer puts the shove first: the wing exerts a downward force on the air, and the air returns the favor.</p>
<p>So keep Bernoulli \u2014 just give him a different job. He\u2019s not the engine; he\u2019s the speedometer. His math correctly reads out what\u2019s happening, but it isn\u2019t the reason it happens.</p>

<h3>The tilt is everything (which is why landings are scary)</h3>
<p>If lift is just shoved air, then the <em>tilt</em> of the wing \u2014 the angle it meets the air, which pilots call angle of attack \u2014 is the whole game. More tilt, more shove, more lift.</p>
<p>Taking off, the plane is still slow and heavy, so the pilot tips the nose up. That tilts the wings, so they scoop and shove down extra air. More shove, more lift \u2014 up you go. Landing is the same trick in reverse: the plane is slow again, so the pilot keeps the nose tipped up to keep shoving enough air \u2014 floating down gently instead of dropping out of the sky.</p>
<p>But tilt has a cliff edge. Tip the wing too far and the air can\u2019t follow the turn anymore \u2014 it breaks away into chaos behind the wing, the downwash collapses, and lift vanishes in a second. Pilots call this a <strong>stall</strong>, and it\u2019s the one thing every trainee practices recovering from, again and again: nose down, regain speed, let the air reattach.</p>
<p>Try it with your hand out of a car window (ask the driver first). Palm flat, slight tilt up: your hand lifts. Tilt more: lifts harder \u2014 plus more shove backwards on your arm. Tilt way too far: the lift suddenly dies and your hand just gets blasted back. You just flew, and stalled, a wing. Congratulations, pilot.</p>
<div data-widget="hand-wing-stall"></div>

<h3>The one thing to remember</h3>
<p>Forget the curved-top diagram. A plane flies for the same reason you swim: it throws something backward (well, downward), and gets thrown the other way.</p>
<p><strong>Wings shove air down; air shoves wings up.</strong> Shape refines it, speed feeds it, tilt controls it \u2014 but the shove is the engine. Four hundred tonnes of metal, held up by nothing but pushed-around sky.</p>`;

export default function PreviewPlanes() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-planes-stay-up" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
