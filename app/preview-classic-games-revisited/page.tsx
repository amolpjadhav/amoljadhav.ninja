import { colorizeArticleSections } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Classic Games, Revisited';
const CATEGORY = 'Gaming';

const CONTENT = `<h3>Five Letters</h3>
<p>Guess the hidden five-letter word in six tries. A new daily word drops every midnight, Pacific time — or drill practice words below.</p>
<div data-widget="five-letters" id="five-letters"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: your first guess is an information bet</summary>
<p>Every guess splits the remaining answers into buckets — one bucket per feedback pattern. The best openers are the guesses whose buckets come out most even, because an even split eliminates the most answers on average no matter what comes back. That is the same expected-information math behind decision trees and twenty-questions strategies: test common letters in common slots first, and the field collapses fast. Hard mode takes away your best tool — throwaway guesses that only gather information — so it’s harder, not smarter.</p>
</details>

<h3>Minesweeper</h3>
<p>Nine by nine, ten mines: clear every safe square without detonating one. Your first click is always safe — the mines are placed after it.</p>
<div data-widget="minesweeper" id="minesweeper"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: you are doing probability by hand</summary>
<p>Every number is a local constraint — “exactly 2 of my 8 neighbors” — and solving well means combining overlapping constraints, which is informal probabilistic reasoning. Richard Kaye proved in 2000 that deciding whether a Minesweeper board is even consistent is NP-complete: in the worst case, no shortcut exists, and some boards genuinely force a guess. So when you stare at a 50/50 and shrug, that is not failure — that is computer science.</p>
</details>

<h3>Code Breaker</h3>
<p>Crack the secret 4-peg code in ten tries. A black peg means a color in the right slot; a white peg means a right color in the wrong slot.</p>
<div data-widget="code-breaker" id="code-breaker"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: five guesses always suffice</summary>
<p>Same math as Five Letters: each guess splits what’s left. There are only 6⁴ = 1,296 possible codes, and each guess partitions them by feedback. In 1977 Donald Knuth showed a strategy (always guess the code that minimizes the worst-case survivors) that cracks any code in at most five tries. You do not need his algorithm to play well: an opener with four different colors buys the most information, and from there, chase the guess that splits what is left most evenly.</p>
</details>

<h3>2048</h3>
<p>Slide the tiles; matching pairs merge and add to your score. Reach 2048 to win, then keep climbing.</p>
<div data-widget="game-2048" id="game-2048"></div>
<details>
<summary style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.55);cursor:pointer">Why it works: the corner strategy</summary>
<p>Random sliding loses; disciplined sliding almost never does. Pick one corner for your biggest tile and never swipe it out: build a descending snake of tiles toward that corner, and every merge cascades into the next. It works because merges only help when big tiles touch — the corner is the one spot no swipe can strand you from.</p>
</details>

<h3>What you just practiced</h3>
<ul>
<li><strong>Splitting possibilities</strong> — every Five Letters and Code Breaker guess divided what was left into buckets and eliminated most of them.</li>
<li><strong>Chaining constraints</strong> — every Minesweeper number was one small fact, and solving meant combining overlapping facts until the next safe square was forced.</li>
<li><strong>Planning ahead</strong> — 2048 punished random moves and rewarded keeping your biggest tile pinned while you built toward it.</li>
</ul>

<h3>Your scorecard</h3>
<p>Played them all? Your bests are summarized below — they save in your browser.</p>
<div data-widget="game-scorecard" id="scorecard"></div>`;

const GAMES: [string, string][] = [
  ['Five Letters', '#five-letters'],
  ['Minesweeper', '#minesweeper'],
  ['Code Breaker', '#code-breaker'],
  ['2048', '#game-2048'],
];

export default function PreviewFamousPuzzleGames() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = '#0aee3c';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0b0c] px-4 pb-16 pt-24 font-sans">
        <article className="container mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#1c1d20] p-6 shadow-[0_0_60px_rgba(10,238,60,0.07)] md:p-10 lg:w-[80vw] lg:max-w-5xl">
          <div className="mb-8 animate-fadeIn">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0aee3c]/25 bg-[#0aee3c]/[0.07] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#0aee3c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0aee3c]" aria-hidden />
              {CATEGORY} · Draft preview
            </span>
            <h1 className="mb-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#f3ecd9] md:text-5xl">
              {TITLE}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
              Wordle, 2048, Mastermind, Minesweeper — four games you know. Underneath them: three ideas from
              math and computer science.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {GAMES.map(([name, href]) => (
                <a
                  key={href}
                  href={href}
                  className="touch-manipulation select-none rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-150 hover:border-[#0aee3c]/40 hover:text-white active:scale-95"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>

          <TableOfContents headings={headings} accent={accent} />
          <div className="[&_.article-section]:rounded-xl [&_.article-section]:[--accent:#0aee3c]">
            <ArticleContent html={contentHtml} category={CATEGORY} />
          </div>
        </article>
      </main>
    </>
  );
}
