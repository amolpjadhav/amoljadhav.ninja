import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is published for real.

const TITLE = 'TFT Economy: Get So Far Ahead That Losing Is Hard';
const CATEGORY = 'Gaming';

const CONTENT = `<p>Most TFT games are not lost in a fight. They are lost three rounds earlier, at the shop, by someone spending gold they should have kept.</p>
<p>The version of this game that good players are playing is not &ldquo;build the strongest board&rdquo;. It is &ldquo;get so far ahead of the table that a bad fight cannot kill me&rdquo;. Those sound the same. They are not. A board that wins this round can still lose you the game, if paying for it means you arrive at level 8 with 4 gold and no way to roll.</p>
<p>Here is the whole engine.</p>

<h3>The only number you have to remember is 50</h3>
<p>At the end of every round you earn interest: <strong>1 gold for every 10 you are holding, up to 5.</strong></p>
<p>Read that twice, because two things are hiding in it.</p>
<p>The first is a <strong>floor</strong>. Below 10 gold, you earn nothing at all. Not a little &mdash; nothing. The first ten gold you save is the hardest to save and pays you back zero, which is exactly why most people never get past it.</p>
<p>The second is a <strong>ceiling</strong>. The 50th gold is the last one that earns anything. Hold 50, earn 5. Hold 90, earn 5. So gold above 50 is <em>free money</em> &mdash; it earns nothing by sitting there, which makes it the gold you should be spending.</p>
<p>Between those two numbers, a pile of gold grows faster the bigger it gets. Hold 20 and do nothing at all, and ten rounds later you have 46. You did not play better. You just did not spend.</p>
<div data-widget="tft-gold-curve" data-eyebrow="The 50 gold rule" data-caption="Drag the sliders. One player sits on their gold; the other rolls it away every round."></div>

<h3>What &ldquo;hard to lose&rdquo; actually means</h3>
<p>Health is a currency too, and it buys you time. The trap is thinking your job is to spend health as slowly as possible. Your job is to convert one currency into the other at a good rate.</p>
<p>Every round you take a loss, you are paying health for gold &mdash; the interest that gold earns, plus the streak bonus for losing, plus an earlier pick at the carousel, because the lowest-health player chooses first. That is a real purchase. It is only a bad one if you never spend what you bought.</p>
<p>The player who is hard to beat is not the one at 100 health. It is the one who arrives at level 8 with 50 gold still in the bank, because they get to look at more shops than anybody else at the table. Rolling is just buying lottery tickets, and they turned up with more tickets.</p>

<h3>Pick a streak &mdash; either one</h3>
<p>Winning pays. Losing pays. Alternating pays nothing.</p>
<p>This is the rule people find hardest, because losing on purpose feels like losing. It is not: a loss streak is a payment plan. What actually costs you the game is drifting &mdash; winning one, losing one, winning one &mdash; collecting the bonus for neither while your health drains anyway.</p>
<p>So decide early which game you are playing, and commit to it for a few rounds.</p>

<h3>The two ways to spend it</h3>
<p>Once the bank is built, there are exactly two things to buy, and every comp in the <a href="/blog/tft-set-18-comps-all-27-teams-for-enchanted-wilds">comp sheet</a> is built around choosing one:</p>
<p><strong>Levels.</strong> More units on the board, and better odds of the expensive ones appearing. Fifteen of the 31 comps do this: stop rolling, buy XP, arrive at 8 with gold left, roll once, hard.</p>
<p><strong>Copies.</strong> Stay at level 6 or 7, where a cheap unit is still common, and spend only the interest &mdash; the gold above 50 &mdash; hunting for three copies of it. Fifteen of the 31 comps do this instead. Nine copies makes a 3-star, which is why it needs every spare gold and a level you can stop at.</p>
<p>What loses games is doing both at once. Levelling <em>and</em> rolling means you never have enough gold to finish either, and you arrive at stage 5 with a level-8 board of 1-star units.</p>

<h3>When to break the rule</h3>
<p>Roll below 50 for exactly two reasons.</p>
<p><strong>You are one copy away</strong> from the upgrade that wins the round in front of you.</p>
<p><strong>You will die this round if you don&rsquo;t.</strong> A dead player earns no interest at all, so the compounding argument stops applying the moment you cannot survive to collect. This is the part people get backwards: they hold 50 gold at 6 health and go out in eighth with a lovely bank.</p>

<h3>The version with no ceiling</h3>
<p>Here is the thing worth taking out of the game.</p>
<p>That curve &mdash; slow at first, faster the more you have, then flat once it hits the cap &mdash; is <strong>compound interest</strong>. TFT just puts a ceiling on it at 50 gold so a single lucky player cannot run away with the lobby.</p>
<p>Real compound interest has no ceiling. Same curve, same floor at the start where it feels pointless, and then it never flattens out. It just keeps bending upward for as long as you leave it alone.</p>
<p>Thirty minutes of a video game teaches the mechanic. Then reality removes the cap and runs it for forty years.</p>`;

export default function PreviewTftEconomy() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-0 sm:px-4">
        <article className="container mx-auto max-w-3xl lg:w-[80vw] lg:max-w-5xl bg-[#1c1d20] border-y sm:border border-white/10 sm:rounded-lg p-4 sm:p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
              style={{ color: accent, background: `${accent}22` }}
            >
              {CATEGORY} &middot; DRAFT PREVIEW
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">{TITLE}</h1>
          </div>
          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
