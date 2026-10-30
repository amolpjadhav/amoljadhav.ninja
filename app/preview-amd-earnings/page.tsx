import { colorizeArticleSections } from '@/lib/blog-content';
import { categoryColor } from '@/lib/categoryColors';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = "Inside AMD's Q2 2026 Earnings: A Real AI Breakout, Padded by a Weak Comp";
const CATEGORY = 'Investing';

const TREND_POINTS = JSON.stringify([
  { label: 'Q1 2025', revenue: 7438, margin: 11 },
  { label: 'Q2 2025', revenue: 7685, margin: -2 },
  { label: 'Q3 2025', revenue: 9246, margin: 14 },
  { label: 'Q4 2025', revenue: 10270, margin: 17 },
  { label: 'Q1 2026', revenue: 10253, margin: 14 },
  { label: 'Q2 2026', revenue: 11536, margin: 17 },
]);

const RATING_DIMENSIONS = JSON.stringify([
  {
    label: 'Growth',
    score: 5,
    why: 'Revenue +50% beat consensus; Data Center more than doubled and is now 58% of revenue; Embedded +19%. Only Client & Gaming (+6%, dragged down by Gaming) lagged.',
  },
  {
    label: 'Profitability',
    score: 3.5,
    why: 'Data Center and Embedded genuinely got more profitable; Client & Gaming operating income fell 24% despite revenue growth; most of the consolidated GAAP margin “expansion” is a comp against a one-time-charge-depressed prior year, not new structural improvement.',
  },
  {
    label: 'Cash discipline',
    score: 4.5,
    why: 'Free cash flow up 32% to $1.56B, funding a 186% capex increase without new borrowing; record cash and short-term investments; debt held flat.',
  },
  {
    label: 'Guidance confidence',
    score: 4.5,
    why: 'Q3 revenue guide beat consensus by ~4% with a reasonably tight range; gross margin guided flat to up; no signs of hedging.',
  },
  {
    label: 'Narrative credibility',
    score: 3,
    why: 'The real growth story (Data Center, new AI partnerships) is well-supported and credible — but management’s framing leaned on GAAP margin and net-income “expansion” figures that are substantially inflated by comping against a charge-hit, tax-benefit-skewed prior-year quarter, without volunteering that context up front.',
  },
]);

const CONTENT = `<p>A summary of AMD&rsquo;s Q2 2026 earnings report &mdash; the quarter ended June 27, 2026, reported August 4, 2026.</p>
<p><strong>Source:</strong> AMD&rsquo;s <a href="https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results" target="_blank" rel="noopener noreferrer">Q2 2026 press release</a>, earnings call transcript, and investor presentation deck.</p>

<h3>Highlights</h3>
<ul>
<li>Record revenue: $11.536B, up 50% year-over-year, beating the ~$11.32B analyst consensus.</li>
<li>Data Center revenue more than doubled &mdash; up 107% year-over-year to $6.7B &mdash; and now makes up 58% of AMD&rsquo;s total revenue.</li>
<li>Non-GAAP EPS of $1.66 beat the ~$1.61 consensus; new Anthropic and expanded Microsoft partnerships broaden AMD&rsquo;s AI customer base.</li>
<li>Free cash flow of $1.56B (up from $1.18B a year ago) funded a 186% jump in capex without AMD touching its balance sheet &mdash; total debt held flat.</li>
</ul>

<h3>Lowlights</h3>
<ul>
<li>Client &amp; Gaming segment operating income fell 24% year-over-year (to $582M from $767M) even as segment revenue grew &mdash; real margin compression, masked by Data Center&rsquo;s strength. Gaming revenue alone fell 31% year-over-year.</li>
<li>Most of the quarter&rsquo;s eye-popping GAAP margin &ldquo;expansion&rdquo; is a comparison against an artificially bad prior-year quarter, not new margin strength (see below).</li>
<li>$598M of &ldquo;other income,&rdquo; including a $483M gain on AMD&rsquo;s long-term investment portfolio, did real work getting GAAP net income to $2.297B &mdash; money that has nothing to do with selling chips.</li>
<li>Despite beating on revenue, earnings, and guidance, AMD&rsquo;s stock fell in after-hours trading &mdash; a sign expectations were already priced in above what even this quarter delivered.</li>
</ul>

<h3>The headline numbers</h3>
<p><strong>Vs. Wall Street (analyst consensus):</strong></p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Metric</th><th>Result</th></tr>
</thead>
<tbody>
<tr><td>Revenue</td><td><span style="color:#0aee3c;font-weight:700">Beat</span> &mdash; $11.536B vs. ~$11.32B estimate (+1.9%)</td></tr>
<tr><td>EPS (Non-GAAP)</td><td><span style="color:#0aee3c;font-weight:700">Beat</span> &mdash; $1.66 vs. ~$1.61 estimate (+3.1%)</td></tr>
<tr><td>Forward guidance</td><td><span style="color:#0aee3c;font-weight:700">Beat</span> &mdash; Q3 revenue guide midpoint $13.0B vs. ~$12.5B consensus (+~4%)</td></tr>
</tbody>
</table>
</div>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Metric</th><th>Q2 2026</th><th>Q2 2025</th><th>Change</th></tr>
</thead>
<tbody>
<tr><td>Net revenue</td><td>$11,536M</td><td>$7,685M</td><td>+50%</td></tr>
<tr><td>Total cost of sales</td><td>($5,333M)</td><td>($4,626M)</td><td>+15%</td></tr>
<tr><td>Gross profit</td><td>$6,203M</td><td>$3,059M</td><td>+103%</td></tr>
<tr><td>Gross margin</td><td>54%</td><td>40%</td><td>+14 pts</td></tr>
<tr><td>Total operating expenses</td><td>($4,213M)</td><td>($3,193M)</td><td>+32%</td></tr>
<tr><td>Operating income (loss)</td><td>$1,990M</td><td>($134M)</td><td>swing to profit</td></tr>
<tr><td>Operating margin</td><td>17%</td><td>(2%)</td><td>+19 pts</td></tr>
<tr><td>Interest expense</td><td>($37M)</td><td>($38M)</td><td>&minus;3%</td></tr>
<tr><td>Other income (expense), net</td><td>$598M</td><td>$98M</td><td>+510%</td></tr>
<tr><td>Income before taxes</td><td>$2,551M</td><td>($74M)</td><td>swing to profit</td></tr>
<tr><td>Tax provision (benefit)</td><td>($252M)</td><td>$834M benefit</td><td>swing to a real tax bill</td></tr>
<tr><td>Net income</td><td>$2,297M</td><td>$872M</td><td>+163%</td></tr>
<tr><td>Diluted EPS</td><td>$1.38</td><td>$0.54</td><td>+156%</td></tr>
<tr><td>Capital expenditures (Q2, cash)</td><td>$808M</td><td>$282M</td><td>+186%</td></tr>
<tr><td>Free cash flow</td><td>$1,558M</td><td>$1,180M</td><td>+32%</td></tr>
</tbody>
</table>
</div>
<p>Here&rsquo;s the part AMD&rsquo;s own slides don&rsquo;t put front and center: Q2 2025&rsquo;s GAAP gross margin of 40% was artificially crushed by an $800 million inventory charge tied to U.S. export restrictions on AMD&rsquo;s MI308 GPUs sold to China &mdash; a one-time hit, not a reflection of normal profitability. AMD&rsquo;s own adjusted disclosure shows what last year&rsquo;s margin would have been without that charge: 54%. This quarter&rsquo;s GAAP gross margin is also 54%. Adjusted for the one-time charge, gross margin didn&rsquo;t expand 14 points year-over-year &mdash; it was flat. The real, comparable improvement &mdash; on AMD&rsquo;s own non-GAAP, adjusted basis &mdash; was about 2 percentage points (54% to 56%), not the dramatic headline swing the raw GAAP numbers suggest.</p>
<p>Net income tells a similar, if smaller, story in the other direction. Q2 2025&rsquo;s GAAP net income of $872M included an $853 million one-time tax benefit (the IRS released reserves tied to a prior tax position) that had nothing to do with running the business &mdash; strip it out, and last year&rsquo;s &ldquo;real&rdquo; net income was close to just $19M. That makes this year&rsquo;s underlying improvement even larger than the reported 163% growth suggests, once you&rsquo;re comparing real business performance to real business performance instead of to a tax quirk.</p>

<h3>The tension</h3>
<p>The operating business genuinely had a breakout quarter &mdash; record revenue, Data Center more than doubling, real (if modest) margin improvement once you strip out both years&rsquo; one-time noise. But the headline numbers dress that real improvement up as something far more dramatic than it actually was, comping against a quarter that ate an $800 million export-control charge and got an $853 million tax gift. Wall Street seemed to see through the costume: even with a clean beat-and-raise on revenue, earnings, and guidance, AMD&rsquo;s stock fell after hours.</p>
<div data-widget="growth-vs-margin-trend" data-eyebrow="Six quarters" data-caption="Revenue (bars) has grown every quarter. Operating margin (line) collapsed to -2% in Q2 2025 — almost entirely the $800M export-control charge — then recovered as that charge rolled off, landing back at 17% this quarter, in line with Q4 2025's level. The real story is a return to a normal, healthy margin, not a new high." data-highlight-color="#5b9bf5" data-points='${TREND_POINTS}'></div>

<h3>Where the growth is coming from</h3>
<p>Data Center is doing almost all of the heavy lifting:</p>
<ul>
<li><strong>Data Center:</strong> $6.718B, up 107% year-over-year and up 16% sequentially &mdash; now 58% of total company revenue. Operating income swung from a $155M loss a year ago to $2.103B this quarter (31% margin), driven by EPYC server CPU demand and the ongoing ramp of Instinct GPUs. Much of last year&rsquo;s operating loss here was also the $800M export-control charge &mdash; but even adjusting for that, this segment&rsquo;s growth is real and large.</li>
<li><strong>Client &amp; Gaming:</strong> $3.841B, up 6% year-over-year (Client alone up 23% to $3.062B; Gaming down 31% to $779M). Operating income fell 24% to $582M, on higher operating expenses.</li>
<li><strong>Embedded:</strong> $977M, up 19% year-over-year, with operating income up 40% to $386M &mdash; a 40% operating margin, AMD&rsquo;s highest-margin segment by a wide margin, on continued demand across industrial and communications end markets.</li>
<li><strong>New AI partnerships:</strong> Anthropic and AMD announced a strategic agreement to deploy up to 2 gigawatts of AMD Instinct MI450 Series GPUs in AMD Helios racks. Microsoft expanded its collaboration with AMD to deploy Helios and 6th Gen EPYC CPUs at scale on Azure.</li>
</ul>
<p>CEO Lisa Su&rsquo;s framing, direct from the earnings call: &ldquo;Data center revenue more than doubled year-over-year and now represents 58% of total revenue&hellip; we are still in the early stages of a multi-year AI adoption cycle,&rdquo; with the Data Center segment expected to &ldquo;more than double year-over-year&rdquo; again in 2027.</p>

<h3>Where the money's going</h3>
<p>Operating expenses grew 32% year-over-year &mdash; slower than gross profit&rsquo;s 103% growth, but still faster than revenue&rsquo;s 50%, meaning AMD is spending aggressively into this cycle, not just harvesting past investment:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Expense line</th><th>Q2 2026</th><th>Q2 2025</th><th>Change</th></tr>
</thead>
<tbody>
<tr><td>Research and development</td><td>$2,528M</td><td>$1,894M</td><td>+33%</td></tr>
<tr><td>Marketing, general and administrative</td><td>$1,401M</td><td>$991M</td><td>+41%</td></tr>
<tr><td>Amortization of acquisition-related intangibles</td><td>$284M</td><td>$308M</td><td>&minus;8%</td></tr>
<tr><td><strong>Total operating expenses</strong></td><td><strong>$4,213M</strong></td><td><strong>$3,193M</strong></td><td><strong>+32%</strong></td></tr>
</tbody>
</table>
</div>
<p>R&amp;D and SG&amp;A both grew faster than revenue &mdash; AMD is hiring and spending ahead of the AI opportunity, not letting expenses coast while Data Center revenue does the work. The one line moving the other way, amortization of acquired intangibles, is a mechanical decline as older acquisitions (like Xilinx) finish amortizing, not a spending choice.</p>

<h3>The cash story</h3>
<ul>
<li><strong>Capital expenditures</strong> were $808M in cash this quarter, up 186% from $282M a year ago &mdash; still a modest 7% of revenue, well short of the capex intensity of the hyperscalers AMD sells into.</li>
<li><strong>Free cash flow</strong> was $1.558B this quarter (14% FCF margin), up from $1.180B a year ago &mdash; comfortably funding the capex increase with room to spare.</li>
<li><strong>Cash, cash equivalents and short-term investments</strong> hit a record $13.111B, up 6% sequentially.</li>
<li><strong>Total debt</strong> held flat at $3.226B &mdash; the capex and R&amp;D ramp is being funded out of AMD&rsquo;s own cash flow, not new borrowing.</li>
</ul>

<h3>What guidance says</h3>
<ul>
<li><strong>Q3 2026 revenue:</strong> ~$13.0B, &plusmn;$300M (range $12.7&ndash;$13.3B) &mdash; about 41% year-over-year growth and 13% sequential growth, comfortably above the ~$12.5B analyst consensus heading into the print.</li>
<li><strong>Q3 2026 non-GAAP gross margin:</strong> ~56%, roughly flat to slightly up from this quarter&rsquo;s 56% non-GAAP margin.</li>
<li><strong>Q3 2026 non-GAAP operating expenses:</strong> ~$3.65B, up from $3.394B this quarter &mdash; continued step-up in spending.</li>
<li><strong>Effective tax rate:</strong> 13% of pre-tax income, non-GAAP.</li>
</ul>
<p>A beat-and-raise quarter by every conventional measure &mdash; and the stock still fell after hours, a reminder that when a stock has already run up enough beforehand, &ldquo;great&rdquo; can still be less than what&rsquo;s priced in.</p>

<h3>The rating</h3>
<p>Scoring the quarter across five dimensions, 1&ndash;5 each:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Dimension</th><th>Score</th><th>Why</th></tr>
</thead>
<tbody>
<tr><td>Growth</td><td>5/5</td><td>Revenue +50% beat consensus; Data Center more than doubled and is now 58% of revenue; Embedded +19%. Only Client &amp; Gaming (+6%, dragged down by Gaming) lagged.</td></tr>
<tr><td>Profitability</td><td>3.5/5</td><td>Data Center and Embedded genuinely got more profitable; Client &amp; Gaming operating income fell 24% despite revenue growth; most of the consolidated GAAP margin &ldquo;expansion&rdquo; is a comp against a one-time-charge-depressed prior year, not new structural improvement.</td></tr>
<tr><td>Cash discipline</td><td>4.5/5</td><td>Free cash flow up 32% to $1.56B, funding a 186% capex increase without new borrowing; record cash and short-term investments; debt held flat.</td></tr>
<tr><td>Guidance confidence</td><td>4.5/5</td><td>Q3 revenue guide beat consensus by ~4% with a reasonably tight range; gross margin guided flat to up; no signs of hedging.</td></tr>
<tr><td>Narrative credibility</td><td>3/5</td><td>The real growth story (Data Center, new AI partnerships) is well-supported and credible &mdash; but management&rsquo;s framing leaned on GAAP margin and net-income &ldquo;expansion&rdquo; figures that are substantially inflated by comping against a charge-hit, tax-benefit-skewed prior-year quarter, without volunteering that context up front.</td></tr>
</tbody>
</table>
</div>
<div data-widget="rating-scorecard" data-dimensions='${RATING_DIMENSIONS}'></div>
`;

export default function PreviewAmdEarnings() {
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
