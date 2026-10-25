import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Why Do We Dream? Four Theories, and Why Nobody Has Won Yet';
const CATEGORY = 'Curiosity';

const QUIZ: QuizQuestion[] = [
  {
    question: 'Some people are certain they never dream. What does the research actually find?',
    options: [
      'Some people genuinely do not dream at all',
      'They dream normally — they just do not remember. Woken in a lab, they report dreams like anyone else',
      'They dream only once or twice a year',
      'They dream, but only in black and white',
    ],
    correctIndex: 1,
    explanation:
      'Everyone dreams every night. Dream memories decay extremely fast unless you wake during one, which is why the ones you keep are usually the last before your alarm.',
  },
  {
    question: 'Do dreams only happen during REM sleep?',
    options: [
      'Yes, REM is the only stage where dreaming occurs',
      'No — REM awakenings produce dream reports 70–95% of the time, but non-REM ones still do 5–10% of the time',
      'No, dreams only happen in deep sleep',
      'Nobody has ever tested this',
    ],
    correctIndex: 1,
    explanation:
      'Non-REM dreams are real but thinner — more like drifting thoughts than full films — which makes them much easier to forget.',
  },
  {
    question: 'In 2021, researchers managed to do something remarkable with lucid dreamers. What?',
    options: [
      'They recorded and played back a dream as video',
      'They asked questions out loud and got correct answers back, via eye movements, from people verifiably asleep',
      'They implanted a specific dream',
      'They stopped people dreaming entirely',
    ],
    correctIndex: 1,
    explanation:
      'Sleepers did maths problems and answered yes/no questions using coded eye movements. It proves a dreaming brain can hear, understand, hold something in working memory and deliberately reply.',
  },
  {
    question: 'What is the single strongest piece of hard evidence that dreams help sort memories?',
    options: [
      'People report dreaming about their day',
      'A sleeping rat replays the exact brain-cell firing pattern from its maze run, in the correct order',
      'Students who sleep more get better grades',
      'Dreams often feel meaningful',
    ],
    correctIndex: 1,
    explanation:
      'It is measured directly rather than self-reported, which is what makes it so much stronger than dream diaries.',
  },
  {
    question: 'The "anti-overfitting" theory borrows an idea from training AI. What does it claim dreams are for?',
    options: [
      'Deleting useless memories to save space',
      'Feeding your brain deliberately weird, distorted versions of life so it learns general patterns instead of memorising your routine',
      'Recharging the brain like a battery',
      'Practising conversations for the next day',
    ],
    correctIndex: 1,
    explanation:
      'Train a neural network on the same narrow data and it memorises instead of learning. Engineers fix it with noisy, distorted data. Under this theory, the weirdness of dreams is the active ingredient, not a side-effect.',
  },
  {
    question: 'Every theory comfortably explains why people blind from birth still dream. What should you conclude?',
    options: [
      'It proves all four theories are correct',
      'That fact cannot help you choose between them — good evidence has to be able to rule something out',
      'It proves dreams have nothing to do with vision',
      'It means the theories are all wrong',
    ],
    correctIndex: 1,
    explanation:
      'An observation consistent with every explanation has no power to discriminate. The useful evidence is whatever a theory would struggle to survive.',
  },
];

const CONTENT = `<p>You spend roughly <strong>two hours every night</strong> dreaming. Over an average lifetime that&rsquo;s about <strong>six years</strong> &mdash; six years of vivid, urgent experiences that you almost entirely forget by breakfast.</p>
<p>Six years is a lot of anything. Evolution doesn&rsquo;t usually hand out six years for free.</p>
<p>So here&rsquo;s the honest situation: after more than a century of serious research, <strong>nobody knows what dreams are for.</strong> There are four good theories, real evidence for each, and no winner.</p>
<p>That sounds like a disappointing article. It isn&rsquo;t &mdash; because we know a surprising amount about what dreams <em>are</em>. The gap is only about what they&rsquo;re <em>for</em>. Let&rsquo;s separate those two things carefully, because most writing on this topic smashes them together.</p>
<p><em>This picks up where <a href="/blog/how-sleep-actually-works-the-two-switches-that-decide-when-you-sleep">the sleep article</a> left off &mdash; that one covered how sleep gets switched on, and deliberately stopped short of what happens inside it.</em></p>

<h3>Part 1: What we actually know</h3>
<p>Start with the solid ground. None of this is disputed.</p>
<p><strong>You dream every single night</strong>, whether you remember it or not. People who insist they never dream turn out to dream perfectly normally when woken in a lab and asked. They&rsquo;re not non-dreamers; they&rsquo;re non-rememberers.</p>
<p><strong>You forget nearly all of it.</strong> Dream memories decay extraordinarily fast unless you wake during one or right after. This is why the fragments you <em>do</em> keep are almost always from the last dream before your alarm.</p>
<p><strong>Dreams are not only a REM thing.</strong> This one&rsquo;s a genuine misconception, worth correcting because it&rsquo;s repeated everywhere. Wake someone from REM sleep and they report a dream <strong>70&ndash;95%</strong> of the time. But wake them from non-REM sleep and they still report one <strong>5&ndash;10%</strong> of the time. Non-REM dreams are just thinner &mdash; more like drifting thoughts than full films &mdash; so they&rsquo;re much easier to forget.</p>
<p><strong>Your body is switched off while it happens.</strong> During REM your muscles are effectively paralysed. That&rsquo;s a safety mechanism, and you can see what happens without it: people with REM sleep behaviour disorder physically act out their dreams, sometimes injuring themselves. The paralysis is the reason running in a dream doesn&rsquo;t launch you out of bed.</p>
<p><strong>Blind people dream too.</strong> People blind from birth have no visual imagery in their dreams &mdash; but they dream just as much, in sound, touch, taste and smell. Their dream reports contain far more references to hearing and texture than sighted people&rsquo;s do. Dreaming isn&rsquo;t fundamentally about pictures.</p>
<p><strong>Other animals appear to do it.</strong> When a rat learns a maze, the exact pattern of brain cells that fired during the run <strong>fires again in the same order while it sleeps</strong>. That&rsquo;s not speculation, it&rsquo;s measured &mdash; and it&rsquo;s the single best piece of hard evidence in this entire field.</p>

<h3>The experiment where scientists talked to a dreaming person</h3>
<p>This one deserves its own moment, because it sounds impossible.</p>
<p>In 2021, researchers at Northwestern and three other labs worked with <strong>lucid dreamers</strong> &mdash; people who know they&rsquo;re dreaming while it&rsquo;s happening. The sleepers agreed a code in advance: answer using deliberate eye movements and small facial muscle twitches, which still work despite the paralysis.</p>
<p>Then, while the sleepers were in confirmed REM sleep, the researchers asked them questions out loud. <strong>Maths problems.</strong> Yes-or-no questions.</p>
<p>And they got correct answers back. Out of 158 attempts, 18% produced a correct response &mdash; from people who were genuinely, verifiably asleep.</p>
<p>Think about what that proves. A dreaming brain can hear the outside world, understand a question, <strong>hold it in working memory, do arithmetic, and deliberately choose to answer.</strong> Dreaming isn&rsquo;t the brain switched off, or idling. Big parts of it are running.</p>

<h3>Part 2: The four theories</h3>
<p>Now the contested half. Here are the four serious contenders.</p>
<p><strong>1. Random noise.</strong> Proposed in 1977, this says dreams mean nothing at all. During REM, the brainstem fires off essentially random signals; the rest of your brain, which is a relentless pattern-matcher, desperately assembles a story out of the static. The bizarreness of dreams isn&rsquo;t a message &mdash; it&rsquo;s what nonsense looks like when a storytelling organ tries to narrate it.</p>
<p><strong>2. Memory sorting.</strong> Dreams are the visible side-effect of your brain filing the day into long-term storage. Replaying, sorting, deciding what to keep. The sleeping rat running its maze again is the poster child for this one.</p>
<p><strong>3. Threat rehearsal.</strong> Dreams are a flight simulator for danger. An ancestor who spent every night practising <em>being chased, falling, hiding, escaping</em> &mdash; at zero physical risk &mdash; would react better when it happened for real. This theory makes a sharp, testable prediction: dreams should be disproportionately full of threats. They are.</p>
<p><strong>4. Anti-overfitting.</strong> The newest one, from 2021, and it borrows directly from how we train AI.</p>
<p>When you train a neural network on the same data over and over, it gets superb at that exact data and useless at anything slightly different. It memorises instead of learning. Engineers call this <strong>overfitting</strong>, and the standard fix is deliberately feeding the model noisy, distorted, augmented versions of its training data so it&rsquo;s forced to learn the general pattern instead of the specific examples.</p>
<p>The claim: your brain has the same problem. All day you train on one narrow slice of reality &mdash; your commute, your room, your routine. Overfit to that and you&rsquo;d cope badly with anything new. So every night your brain generates deliberately weird, distorted, half-wrong versions of your life, and trains on those instead.</p>
<p>Under this theory the strangeness of dreams isn&rsquo;t a bug or a byproduct. <strong>The weirdness is the active ingredient.</strong></p>

<h3>So which one is right?</h3>
<p>Here&rsquo;s the useful part &mdash; not the answer, but how to think about it. Each theory nails some facts and stumbles on others.</p>
<div data-widget="theory-scorecard" data-eyebrow="Test the theories yourself" data-caption="Pick something we know about dreams and see how each theory copes with it. Nothing wins every round — which is exactly why this is still open."></div>
<p>Work through those and a pattern appears. Random noise explains the weirdness beautifully and the emotion terribly. Threat rehearsal nails the nightmares and fumbles the nonsense. Memory sorting has the strongest hard evidence and the weakest explanation for why dreams look nothing like real life.</p>
<p>Pay particular attention to the last one &mdash; blind people dreaming. Every theory handles it fine, which means it tells you <strong>nothing</strong> about which is right. That&rsquo;s a genuinely useful thing to notice: a fact that agrees with everything can&rsquo;t help you choose. Good evidence has to be capable of ruling something out.</p>
<p>Most researchers now suspect the answer is <strong>several of these at once</strong>. Dreams may not have one job any more than your hands do.</p>

<h3>Why is this so hard to settle?</h3>
<p>One brutal reason: <strong>you can&rsquo;t observe a dream.</strong></p>
<p>You can measure brain waves, eye movements, breathing, blood flow. You can watch which regions light up. But the dream itself &mdash; the actual experience &mdash; is only ever available as a story told afterwards by someone who just woke up, whose memory is already dissolving, and who is unconsciously tidying the fragments into something that makes sense.</p>
<p>Every dream study in history is built on that shaky foundation. It&rsquo;s as if astronomy could only proceed through sketches drawn from memory by people who&rsquo;d glanced at the sky hours earlier.</p>
<p>That 2021 lucid-dreaming work matters so much because it&rsquo;s the first real crack in the problem &mdash; the first time anyone got information out of a dream <em>while it was still happening</em>, instead of waiting for a fading report over breakfast.</p>

<h3>The one thing to remember</h3>
<p>We know dreaming is universal, nightly, physically protected by paralysis, present in blind people and probably in animals, and that a dreaming brain can hear you, do sums and answer back.</p>
<p>We don&rsquo;t know what it&rsquo;s for.</p>
<p><strong>Four good theories, real evidence for each, no winner yet</strong> &mdash; and that&rsquo;s not a gap in this article, it&rsquo;s the actual state of the field. Somewhere in those six years you&rsquo;ll spend dreaming is an answer nobody has found.</p>
<p>Which is a much better thing to know than a tidy explanation that happens to be wrong.</p>
`;

export default function PreviewDreams() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-dreams" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
