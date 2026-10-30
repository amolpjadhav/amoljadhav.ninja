import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'How Much Money Is There, Really? The World’s Cash vs. the World’s Wealth';
const CATEGORY = 'Investing';

const MONEY_BY_COUNTRY = JSON.stringify([
  {
    label: 'China',
    value: 52.4,
    subtext: 'M2, April 2026 — People’s Bank of China (¥353.9T), converted at today’s ¥6.76/$',
  },
  {
    label: 'Eurozone',
    value: 20.0,
    subtext: 'M3, January 2026 — European Central Bank (€17.3T), converted at today’s $1.15/€',
  },
  {
    label: 'United States',
    value: 23.2,
    subtext: 'M2, June 2026 — Federal Reserve H.6 release',
  },
  {
    label: 'Japan',
    value: 8.2,
    subtext: 'M2, June 2026 — Bank of Japan (¥1,296.4T), converted at today’s ¥158/$',
  },
  {
    label: 'United Kingdom',
    value: 4.3,
    subtext: 'M4, December 2025 — Bank of England (£3.2T), converted at today’s $1.34/£',
  },
  {
    label: 'Rest of world (~180 other countries)',
    value: 15.2,
    subtext: 'Estimated residual to reach the ~$123T global total',
  },
]);

const ASSET_CLASSES = JSON.stringify([
  {
    label: 'Global money supply (M2/M3), for scale',
    value: 123,
    subtext: 'Cash, checking, savings, money-market funds — repeated from above',
  },
  {
    label: 'Gold, all of it ever mined',
    value: 28.7,
    subtext: '219,891 tonnes above ground (World Gold Council) at today’s ~$4,069/oz spot price',
  },
  {
    label: 'Global stock markets',
    value: 150,
    subtext: 'Every publicly listed company on Earth, combined — World Federation of Exchanges / World Bank, 2026',
  },
  {
    label: 'Global bond markets',
    value: 150,
    subtext: 'Government and corporate debt outstanding worldwide — Bank for International Settlements / SIFMA',
  },
  {
    label: 'Global real estate',
    value: 393.3,
    subtext: 'Every home, office, and farm on Earth — Savills World Research, start of 2025',
  },
]);

const CONTENT = `<p>Imagine someone asked you: how much money is there in the world? You&rsquo;d probably guess there&rsquo;s one answer. There isn&rsquo;t &mdash; there are two totally different answers, and mixing them up is where most of the confusion about money starts.</p>
<p>One is <strong>money supply</strong> &mdash; the actual cash and bank deposits that exist right now, that someone could spend today. The other is <strong>the value of stuff</strong> &mdash; what all the world&rsquo;s stocks, bonds, buildings, and gold are estimated to be worth. People treat these like the same pile. They&rsquo;re not, and the gap between them is enormous.</p>
<p><em>A note on the numbers: every figure below is pulled from a central bank, an industry data provider, or a research firm &mdash; not estimated. Sources are named inline. Currency conversions use today&rsquo;s exchange rates.</em></p>

<h3>What "money supply" actually means</h3>
<p>When economists say &ldquo;M2,&rdquo; they mean a specific, countable thing: physical cash, money sitting in checking accounts, savings accounts, and money-market funds. Not stocks. Not your house. Not your retirement account. Just the money you could walk up to an ATM or a bank teller and actually get your hands on, today.</p>
<p>That&rsquo;s the number worth starting with, because it&rsquo;s the closest thing to &ldquo;how much spendable money exists.&rdquo;</p>

<h3>So how much money is there?</h3>
<p>Add up the major economies&rsquo; central bank numbers, converted to dollars at today&rsquo;s exchange rates:</p>
<div data-widget="bar-compare" data-eyebrow="Global M2/M3 money supply, ~$123 trillion" data-caption="The United States isn't even close to the biggest pile of money in the world — China's is more than double it. Together, five economies account for about seven-eighths of all the money that exists." data-value-prefix="$" data-value-suffix="T" data-accent-color="#5b9bf5" data-items='${MONEY_BY_COUNTRY}'></div>
<p>Add it all up, worldwide, and you land around <strong>$123 trillion</strong>. That&rsquo;s every dollar, yuan, euro, yen, and pound sitting in cash or a bank account, everywhere on Earth, right now.</p>
<p>Hold onto that number: <strong>$123 trillion</strong>. Now compare it to what things are actually worth.</p>

<h3>Now here's the confusing part</h3>
<p>Stocks, bonds, real estate, and gold aren&rsquo;t money &mdash; nobody&rsquo;s holding them as cash. They&rsquo;re assets: things people own, that other people would pay some estimated price for. Add up what the major asset classes are worth, and the picture looks very different from the money-supply chart above:</p>
<div data-widget="bar-compare" data-eyebrow="What the world's major asset classes are worth" data-caption="Real estate alone is worth more than three times the entire world's money supply. Stocks, bonds, real estate, and gold combined come to roughly $722 trillion — about 6x the $123 trillion of actual spendable money that exists." data-value-prefix="$" data-value-suffix="T" data-accent-color="#facc15" data-items='${ASSET_CLASSES}'></div>
<p>Stocks, bonds, real estate, and gold together come to roughly <strong>$722 trillion</strong>. That&rsquo;s about <strong>six times</strong> the entire world&rsquo;s money supply.</p>

<h3>Why is "wealth" so much bigger than "money"?</h3>
<p>This is the part that trips people up, so it&rsquo;s worth being precise about: <strong>that $722 trillion isn&rsquo;t sitting anywhere, waiting to be spent.</strong> It&rsquo;s an estimate &mdash; what the last buyer paid, or what someone thinks the next buyer would pay, for every stock, building, and gold bar on the planet, added together.</p>
<p>Here&rsquo;s a small version of the same thing. Say a house last sold for $400,000. That $400,000 is now &ldquo;the value of the house&rdquo; &mdash; it shows up in real estate&rsquo;s $393 trillion total. But there isn&rsquo;t a spare $400,000 in cash sitting around backing that number. If the owner tries to sell tomorrow, they need to find one specific buyer willing to actually hand over that much real money. Multiply that by every stock, bond, building, and gold bar in the world, and you get the gap above: $722 trillion in <em>estimated</em> value, resting on top of only $123 trillion in money that could actually change hands at any given moment.</p>
<p>That&rsquo;s also why &ldquo;sell everything at once&rdquo; never works the way it sounds. If every homeowner, shareholder, and gold owner on Earth tried to cash out on the same day, there wouldn&rsquo;t be enough money in existence to pay everyone the price their asset was &ldquo;worth&rdquo; the day before &mdash; prices would collapse simply because the money to pay full price for all of it doesn&rsquo;t exist. Asset values and money supply aren&rsquo;t two views of the same pile; one is a price tag, and the other is what&rsquo;s actually in people&rsquo;s pockets to pay it.</p>

<h3>Why this matters for you</h3>
<p>&ldquo;The stock market is worth $150 trillion&rdquo; and &ldquo;there&rsquo;s $150 trillion in cash somewhere&rdquo; are two completely different sentences &mdash; only the first one is true. Net worth, portfolio values, home equity: all of it is a price tag, not a bank balance. It&rsquo;s real, and it&rsquo;s exactly as real as the buyer who&rsquo;d actually pay it &mdash; but it was never money sitting in a vault, and it was never going to be.</p>
`;

export default function PreviewGlobalMoneySupply() {
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

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
