import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = "Inside Amazon's Q2 2026 Earnings: A Great Quarter Wearing a $53 Billion Costume";
const CATEGORY = 'Investing';

const TREND_POINTS = JSON.stringify([
  { label: 'Q2 2025', revenue: 167702, margin: 11.4 },
  { label: 'Q3 2025', revenue: 180200, margin: 9.7 },
  { label: 'Q4 2025', revenue: 213400, margin: 11.7 },
  { label: 'Q1 2026', revenue: 181500, margin: 13.2 },
  { label: 'Q2 2026', revenue: 200606, margin: 13.7 },
]);

const RATING_DIMENSIONS = JSON.stringify([
  {
    label: 'Growth',
    score: 5,
    why: 'Revenue +20% beat consensus; AWS’s fastest growth in 18 quarters; Advertising +26%; AI and chips businesses each over $25B run-rate, growing triple digits.',
  },
  {
    label: 'Profitability',
    score: 4.75,
    why: 'Operating margin expanded 2.3 points and AWS margin expanded 6.5 points — spending is converting to profit; only shadow is Technology and infrastructure costs growing slightly faster than revenue.',
  },
  {
    label: 'Cash discipline',
    score: 2,
    why: 'Trailing-12-month free cash flow swung negative for the first time in five quarters of decline; full-year capex guide raised mid-year on cost inflation.',
  },
  {
    label: 'Guidance confidence',
    score: 3.25,
    why: 'Operating income guide roughly matches consensus, but guided revenue growth decelerates meaningfully even after adjusting for Prime Day timing.',
  },
  {
    label: 'Narrative credibility',
    score: 3.75,
    why: 'Management directly acknowledged the free cash flow headwind rather than obscuring it, and AWS’s realized margin expansion backs up the “spending is working” story — but the $53.4B investment gain inflating the headline net-income number is a real test of how carefully this quarter gets reported elsewhere.',
  },
]);

const CONTENT = `<p>A summary of Amazon&rsquo;s Q2 2026 earnings report &mdash; the quarter ended June 30, 2026, reported July 30, 2026.</p>
<p><strong>Source:</strong> Amazon&rsquo;s <a href="https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/" target="_blank" rel="noopener noreferrer">Q2 2026 press release</a>, earnings call transcript, and investor presentation deck.</p>

<h3>Highlights</h3>
<ul>
<li>Net sales: $200.6B, up 20% year-over-year, beating the ~$196.5B analyst consensus.</li>
<li>AWS revenue grew 37% to $42.2B &mdash; its fastest growth in 18 quarters &mdash; with AWS operating margin expanding 650 basis points.</li>
<li>AWS&rsquo;s AI and chips businesses each now exceed a $25B annual revenue run rate, both growing at triple-digit percentages.</li>
<li>Advertising revenue grew 26% year-over-year.</li>
</ul>

<h3>Lowlights</h3>
<ul>
<li>Trailing-twelve-month free cash flow swung negative for the first time in this window: a $7.6B outflow, down from an $18.2B inflow a year ago.</li>
<li>Full-year 2026 cash capex guidance was raised to about $220 billion (from ~$200 billion), due to higher memory-chip prices.</li>
<li>Nearly all of the quarter&rsquo;s massive net-income growth came from a single $53.4 billion non-operating investment gain, not the operating business.</li>
<li>Q3 guidance implies real deceleration (9&ndash;12% growth vs. 20% this quarter), though management attributes most of that to Prime Day timing and currency.</li>
</ul>

<h3>The headline numbers</h3>
<p><strong>Vs. Wall Street (analyst consensus):</strong></p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Metric</th><th>Result</th></tr>
</thead>
<tbody>
<tr><td>Revenue</td><td><span style="color:#0aee3c;font-weight:700">Beat</span> &mdash; $200.6B vs. ~$196.5B estimate (+2.1%)</td></tr>
<tr><td>EPS (GAAP)</td><td><span style="color:#facc15;font-weight:700">Misleading</span> &mdash; $5.75 vs. ~$1.82 estimate, but $0.60+ of that &ldquo;beat&rdquo; is a one-time gain (see below)</td></tr>
<tr><td>Forward guidance</td><td><span style="color:#facc15;font-weight:700">In-line</span> &mdash; Q3 operating-income guidance midpoint $24.5B, close to the ~$24.9B consensus</td></tr>
</tbody>
</table>
</div>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Metric</th><th>Q2 2026</th><th>Q2 2025</th><th>Change</th></tr>
</thead>
<tbody>
<tr><td>Net sales</td><td>$200.61B</td><td>$167.70B</td><td>+20%</td></tr>
<tr><td>Total operating expenses</td><td>($173.15B)</td><td>($148.53B)</td><td>+17%</td></tr>
<tr><td>Operating income</td><td>$27.46B</td><td>$19.17B</td><td>+43%</td></tr>
<tr><td>Operating margin</td><td>13.7%</td><td>11.4%</td><td>+2.3 pts</td></tr>
<tr><td>Interest income</td><td>$1.30B</td><td>$1.09B</td><td>+19%</td></tr>
<tr><td>Interest expense</td><td>($1.31B)</td><td>($0.52B)</td><td>+155%</td></tr>
<tr><td>Other income (expense), net</td><td>$53.42B</td><td>$1.12B</td><td>&mdash;</td></tr>
<tr><td>Income before taxes</td><td>$80.86B</td><td>$20.86B</td><td>+288%</td></tr>
<tr><td>Tax provision (effective rate)</td><td>($18.20B &middot; 22.5%)</td><td>($2.68B &middot; 12.8%)</td><td>rate +9.7 pts</td></tr>
<tr><td>Net income</td><td>$62.65B</td><td>$18.16B</td><td>+245%</td></tr>
<tr><td>Diluted EPS</td><td>$5.75</td><td>$1.68</td><td>+242%</td></tr>
<tr><td>Capital expenditures (Q2, cash)</td><td>$53.1B</td><td>&mdash;</td><td>&mdash;</td></tr>
<tr><td>Free cash flow (trailing 12 months)</td><td>($7.6B)</td><td>$18.2B</td><td>&mdash;</td></tr>
</tbody>
</table>
</div>
<p>Look at that &ldquo;Other income (expense), net&rdquo; row: $53.42 billion, up from $1.12 billion a year ago. Amazon&rsquo;s own disclosure is direct about it &mdash; this quarter&rsquo;s net income &ldquo;includes non-operating pre-tax other income of $53.4 billion, primarily from our investments in Anthropic.&rdquo; Strip that one line out, and income before taxes would have been about $27.4 billion &mdash; almost exactly equal to operating income, which is what you&rsquo;d expect. The other $53.4 billion is a mark-to-market gain on a private investment stake, not sales, not profit from running the business.</p>
<p><strong>A rougher, honest comparison:</strong> if you tax that $27.4 billion &ldquo;real&rdquo; pretax income at this quarter&rsquo;s own 22.5% effective rate, normalized net income comes out to roughly $21.3 billion, or about <strong>$1.95 per diluted share</strong> &mdash; this is our own estimate, not a figure Amazon reports. That&rsquo;s a modest beat over the ~$1.82 analysts were modeling, not the 3x &ldquo;beat&rdquo; the headline $5.75 implies.</p>

<h3>The tension</h3>
<p>The headline says profit nearly quadrupled. It didn&rsquo;t &mdash; not from the business, anyway. The actual operating business had a genuinely strong quarter (margin expanded 2.3 points, AWS margin expanded 6.5 points), but free cash flow &mdash; the number hardest to dress up &mdash; just went negative for the first time in years, and it&rsquo;s been getting worse for five straight quarters running.</p>
<div data-widget="growth-vs-margin-trend" data-eyebrow="Five quarters" data-caption="Revenue (bars) has grown every quarter. Operating margin (line) has been climbing overall — the opposite of a margin-compression story. Q3 2025's dip was almost entirely a $4.3B one-time hit (an FTC settlement plus severance charges); excluding those, that quarter's margin would have been about 12%, in line with the trend. The real strain this quarter shows up in free cash flow instead, not here." data-highlight-color="#facc15" data-points='${TREND_POINTS}'></div>
<p>The free cash flow trend is the one that matters most this quarter, so here it is directly, trailing twelve months: <strong>$18.2B &rarr; $14.8B &rarr; $11.2B &rarr; $1.2B &rarr; ($7.6B)</strong>. Five straight quarters of decline, crossing from comfortably positive to outright negative, driven &mdash; in Amazon&rsquo;s own words &mdash; &ldquo;primarily by a year-over-year increase of $66.1 billion in purchases of property and equipment&hellip; this increase primarily reflects investments in artificial intelligence.&rdquo;</p>

<h3>Where the growth is coming from</h3>
<p>All three segments grew, and the fastest one keeps getting faster:</p>
<ul>
<li><strong>AWS:</strong> $42.2B, up 37% &mdash; its fastest growth in 18 quarters, marking a fifth consecutive quarter of acceleration. AWS operating income grew 64% to $16.6B, with margin expanding 650 basis points &mdash; the spending is visibly converting into profit, not just cost.</li>
<li><strong>North America:</strong> $116.2B, up 16%, with operating income up 21% to $9.1B.</li>
<li><strong>International:</strong> $42.2B, up 15% (18% on an FX-adjusted basis), with operating income up 15% to $1.7B.</li>
<li><strong>Advertising</strong> (spanning the retail segments): revenue grew 26% year-over-year.</li>
</ul>
<p>CEO Andy Jassy&rsquo;s framing, direct from the release: &ldquo;AWS is booming, growing 36.7% year-over-year in Q2 &mdash; our fastest growth in 18 quarters &mdash; and our AI and Chips businesses each eclipsed run rates of more than $25 billion.&rdquo; On why AWS keeps accelerating despite the scale it&rsquo;s already at, he pointed to unmet demand rather than market saturation: &ldquo;we now believe we will spend approximately $220 billion in cash CapEx in 2026&hellip; [and] even at that amount, we will still not have enough capacity to meet all the demand we have in 2026. Demand we already have for 2028 is striking.&rdquo;</p>

<h3>Where the money's going</h3>
<p>Total operating expenses grew 17%, slower than revenue&rsquo;s 20% &mdash; which is exactly why operating margin expanded instead of compressing:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Expense line</th><th>Q2 2026</th><th>Q2 2025</th><th>Change</th></tr>
</thead>
<tbody>
<tr><td><strong>Cost of sales</strong></td><td>$95.78B</td><td>$80.81B</td><td>+19%</td></tr>
<tr><td>Technology and infrastructure</td><td>$33.16B</td><td>$27.17B</td><td>+22%</td></tr>
<tr><td>Fulfillment</td><td>$29.63B</td><td>$25.98B</td><td>+14%</td></tr>
<tr><td>Sales and marketing</td><td>$11.70B</td><td>$11.42B</td><td>+2%</td></tr>
<tr><td>General and administrative</td><td>$2.79B</td><td>$2.97B</td><td>&minus;6%</td></tr>
<tr><td><strong>Total operating expenses</strong></td><td><strong>$173.15B</strong></td><td><strong>$148.53B</strong></td><td><strong>+17%</strong></td></tr>
</tbody>
</table>
</div>
<p>Cost of sales is the largest dollar increase (+$15.0B), simply tracking Amazon&rsquo;s overall size. But <strong>Technology and infrastructure &mdash; the line where AWS and AI capacity costs concentrate &mdash; grew faster than revenue itself (22% vs. 20%)</strong>, the same pattern showing up at every AI-heavy company right now. The one line moving the other direction is G&amp;A, down 6% &mdash; actual cost discipline, not just slower growth.</p>

<h3>The cash story</h3>
<p>This is where the quarter stops looking uniformly great:</p>
<ul>
<li><strong>Capital expenditures</strong> were $53.1 billion in cash for the quarter alone, &ldquo;primarily relates to AWS and generative AI,&rdquo; per CFO Brian Olsavsky.</li>
<li><strong>Full-year 2026 capex guidance</strong> was raised to approximately $220 billion, up from the prior ~$200 billion estimate &mdash; Jassy attributed the increase specifically to &ldquo;the higher cost of memory.&rdquo;</li>
<li><strong>Free cash flow (trailing twelve months)</strong> swung to a $7.6 billion outflow, from an $18.2 billion inflow a year earlier &mdash; even as operating cash flow itself grew 33% to $161.4 billion. The capital bill grew faster than the cash coming in, by a wide margin.</li>
<li><strong>Cash and equivalents</strong> stood at $78.2 billion as of June 30, 2026.</li>
</ul>
<p>Management isn&rsquo;t hiding from this. Jassy addressed it directly: &ldquo;In the short term&hellip; we&rsquo;ll spend a lot of CapEx and encounter free cash flow headwinds until data centers come online. [But a] few years out&hellip; revenue growth outpaces incremental CapEx growth, [and] the resulting free cash flow is very compelling.&rdquo; That&rsquo;s a real bet on a multi-year payoff, not a denial that the near-term cash picture has gotten worse.</p>

<h3>What guidance says</h3>
<ul>
<li><strong>Q3 2026 net sales:</strong> $197.0&ndash;202.0 billion, 9&ndash;12% growth &mdash; a real deceleration from this quarter&rsquo;s 20%. Amazon says excluding the Prime Day timing shift between years, growth would run nearly 400 basis points higher, plus an ~80 basis point currency headwind.</li>
<li><strong>Q3 2026 operating income:</strong> $22.5&ndash;26.5 billion, versus $17.4 billion a year ago (29&ndash;52% growth) &mdash; a $24.5B midpoint that lands close to the ~$24.9B analysts were already modeling.</li>
<li>No new quarterly capex figure was given beyond the raised full-year ~$220 billion guide.</li>
</ul>
<p>The growth deceleration in the headline number is mostly a timing and currency artifact, not a demand problem &mdash; but it&rsquo;s still true that Q3&rsquo;s guided growth rate is meaningfully lower than what just printed.</p>

<h3>The rating</h3>
<p>Scoring the quarter across five dimensions, 1&ndash;5 each:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Dimension</th><th>Score</th><th>Why</th></tr>
</thead>
<tbody>
<tr><td>Growth</td><td>5/5</td><td>Revenue +20% beat consensus; AWS&rsquo;s fastest growth in 18 quarters; Advertising +26%; AI and chips businesses each over $25B run-rate, growing triple digits</td></tr>
<tr><td>Profitability</td><td>4.75/5</td><td>Operating margin expanded 2.3 points and AWS margin expanded 6.5 points &mdash; spending is converting to profit; only shadow is Technology and infrastructure costs growing slightly faster than revenue</td></tr>
<tr><td>Cash discipline</td><td>2/5</td><td>Trailing-12-month free cash flow swung negative for the first time in five quarters of decline; full-year capex guide raised mid-year on cost inflation</td></tr>
<tr><td>Guidance confidence</td><td>3.25/5</td><td>Operating income guide roughly matches consensus, but guided revenue growth decelerates meaningfully even after adjusting for Prime Day timing</td></tr>
<tr><td>Narrative credibility</td><td>3.75/5</td><td>Management directly acknowledged the free cash flow headwind rather than obscuring it, and AWS&rsquo;s realized margin expansion backs up the &ldquo;spending is working&rdquo; story &mdash; but the $53.4B investment gain inflating the headline net-income number is a real test of how carefully this quarter gets reported elsewhere</td></tr>
</tbody>
</table>
</div>
<div data-widget="rating-scorecard" data-dimensions='${RATING_DIMENSIONS}'></div>
`;

export default function PreviewAmazonEarnings() {
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
