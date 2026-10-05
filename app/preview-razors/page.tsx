import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Occam’s Razor and Hanlon’s Razor: Start With the Simplest Story';
const CATEGORY = 'Mental Models';

const QUIZ: QuizQuestion[] = [
  {
    question: 'Your bike tire is flat. What is the Occam-approved first guess?',
    options: [
      'Someone snuck into the garage and let the air out',
      'You rode over a nail — one ordinary thing explains it',
      'Tires just do that sometimes, no need to look',
      'Check every complicated explanation at the same time',
    ],
    correctIndex: 1,
    explanation:
      'The nail story needs just one ordinary thing to be true. The sneaky-person story needs a lot of strange things to all be true at once.',
  },
  {
    question: 'Why is it called a razor?',
    options: [
      'Because the idea is sharp enough to cut tires',
      'Because it shaves away the extra guesses, leaving only what you need',
      'Because William of Ockham sold razors for a living',
      'Because simple stories always cut people off',
    ],
    correctIndex: 1,
    explanation:
      'Do not add extra explanations you do not need — shave them off until only the necessary guesses remain.',
  },
  {
    question: 'What happens when the simple story is wrong?',
    options: [
      'You never find out — simple stories hide their mistakes',
      'You find out fast, because it is easy to check',
      'You have to abandon the razor entirely',
      'The complicated story automatically becomes right',
    ],
    correctIndex: 1,
    explanation:
      'Check the tire for a nail. No hole? Now you know to look elsewhere. The complicated story just absorbs each new clue with another guess.',
  },
  {
    question: 'Your friend did not save you a seat at lunch. What does Hanlon’s Razor say?',
    options: [
      'She is mad at you and wants you to feel left out',
      'Start by guessing she got distracted and forgot',
      'Stop sitting with her to stay safe',
      'Tell everyone else she was being mean',
    ],
    correctIndex: 1,
    explanation:
      'Forgetting needs a busy, distracted person. Being mean on purpose needs a reason, a plan, and someone who wants to hurt you.',
  },
  {
    question: 'Why does guessing “honest mistake” first pay off?',
    options: [
      'Because people never act with bad intentions',
      'Because it protects the friendship and gives you an easy next step',
      'Because getting angry uses no energy at all',
      'Because first guesses can never be revised',
    ],
    correctIndex: 1,
    explanation:
      '“She forgot” lets you just ask for a seat tomorrow. And it is only the first guess — if she “forgets” every day for a month, the pattern is a new clue.',
  },
  {
    question: 'How do the two razors work as a pair?',
    options: [
      'Nail before sneaky stranger; forgot before left out on purpose',
      'Always assume the complicated story about people',
      'Use Occam for friends and Hanlon for bikes',
      'They cancel each other out, so trust your gut instead',
    ],
    correctIndex: 0,
    explanation:
      'Occam picks the simplest story about the world; Hanlon reminds you the simplest story about people is usually a mistake, not a secret plan.',
  },
];

const CONTENT = `<p>Your bike tire is flat. Two stories could explain it.</p>
<p>Story one: You rode over a nail yesterday. One sharp nail, one small hole.</p>
<p>Story two: Someone snuck into your garage at night, let the air out, hid the evidence, and walked away without anyone seeing.</p>
<p>Both stories are possible. But only one is a good first guess. The nail story needs just one ordinary thing to be true. The sneaky-person story needs a lot of strange things to all be true at the same time. And every extra thing you have to believe is one more chance to be wrong.</p>
<p>That habit of picking the story that needs the fewest guesses has a name: Occam’s Razor. It’s named after William of Ockham, a thinker who lived about 700 years ago. (His name is spelled with a “k,” but the razor is usually spelled “Occam.” Both are correct.) The rule usually credited to him is simple: don’t add extra explanations you don’t need.</p>
<p>Why is it called a razor? Because it shaves away the extra guesses, so you’re left with only what you need.</p>

<h3>Why the simple story usually wins</h3>
<p>Think of each guess in a story like flipping a coin and hoping for heads. A story with one guess needs one lucky flip. A story with four guesses needs four lucky flips in a row. That’s a lot harder.</p>
<p>Here’s another example. You hear barking outside. Is it your neighbor’s dog, or a wolf that wandered into town? The neighbor’s dog lives right there. The wolf would have to leave the forest, find its way into town, and end up on your street without anyone noticing. That’s a lot of guesses. Start with the dog.</p>
<p>Here’s the best part. When the simple story is wrong, you find out fast. Check the tire for a nail. No hole? Now you know to look for something else. The complicated story is trickier. Every time a new clue shows up, you can just add another guess to explain it. “No footprints? The sneaky person must have worn socks!” That’s why the complicated story is so hard to prove wrong.</p>

<h3>Where simple goes wrong</h3>
<p>Occam’s Razor does not say the simplest story is always right. It says to start with the simplest story that fits the facts.</p>
<p>That last part matters a lot. “My tire is flat because tires just do that sometimes” is simple, but it doesn’t explain anything and doesn’t help you fix it. And sometimes the world really is complicated. If something truly weird is going on, it deserves a careful look.</p>
<p>So think of the razor as a to-do list, not a final answer. Check for a nail first. If there’s no nail, then you get to be a detective.</p>

<h3>The sibling, for dealing with people</h3>
<p>Occam’s Razor has a sibling. This one is just for the stories we tell about other people: don’t start by assuming someone was being mean when an honest mistake fits the facts. This is Hanlon’s Razor.</p>
<p>Your friend didn’t save you a seat at lunch.</p>
<p>Story one: She’s mad at you and wants you to feel left out.</p>
<p>Story two: She got distracted talking to someone and forgot.</p>
<p>Forgetting just needs a busy, distracted person. Being mean on purpose needs a reason, a plan, and someone who wants to hurt you. Most of the time, the simple story wins here too.</p>
<p>Nobody is totally sure who came up with Hanlon’s Razor. It’s usually credited to a man named Robert J. Hanlon, who sent it in as a joke to a book of funny sayings in 1980. But people had said similar things long before that. That makes sense, because everyone has seen it happen from both sides. You’ve probably forgotten someone too. And you know exactly how much meanness was behind it: none.</p>

<h3>Why assuming a mistake first pays off</h3>
<p>Hanlon’s Razor protects your friendships. Getting angry takes a lot of energy. It can make the next conversation awkward, and once you’ve decided someone was mean, it’s hard to back down. It also feels pretty silly to get that upset about something that was just a mistake.</p>
<p>It also helps you fix things. “She forgot” gives you an easy next step: just ask her to save you a seat tomorrow. “She’s being mean on purpose” doesn’t give you any next step. It just makes you feel worried.</p>
<p>One important rule: Hanlon’s Razor is about your first guess, not your last one. If your friend “forgets” to save you a seat every single day for a month, that pattern is a new clue. The story has to fit it. Start by guessing it was a mistake, but always pay attention to the facts.</p>

<h3>The pair, working together</h3>
<p>Both razors are really the same habit. Occam’s Razor picks the simplest story about the world. Hanlon’s Razor reminds you that the simplest story about people is usually a mistake, not a secret plan.</p>
<p>Nail before sneaky stranger. Forgot before left out on purpose.</p>
<p>Neither razor promises you’ll always be right. But they give you the best first guess: the one that’s right most often, is easiest to check, and is easiest to change your mind about.</p>

<h3>The one thing to remember</h3>
<p>When more than one story fits, start with the one that needs the fewest guesses. And when the story is about a person, guess “honest mistake” before “being mean.”</p>
<p>Try it: The next time something goes wrong, say two stories out loud. Which one needs fewer things to be true? Start there.</p>`;

export default function PreviewRazors() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-razors" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
