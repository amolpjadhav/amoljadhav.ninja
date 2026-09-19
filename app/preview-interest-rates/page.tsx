import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import QuizModal from '@/components/blog/QuizModal';
import Header from '@/components/layout/Header';
import type { QuizQuestion } from '@/types/database';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// Delete this route once the draft is reviewed and published for real.

const TITLE = 'Interest Rates: The Fed\u2019s One Lever';
const CATEGORY = 'Economics';

const QUIZ: QuizQuestion[] = [
  {
    question: 'Twelve people meet eight times a year and decide a single number. What is that number?',
    options: [
      'The federal budget for the year',
      'A short-term interest rate — the first digit of the price of borrowing money',
      'The tax rate everyone will pay',
      'How much money to print that month',
    ],
    correctIndex: 1,
    explanation:
      'No laws, no taxes, no spending. Just the rate banks charge each other overnight — and every mortgage, credit card, and savings account drifts with it within weeks.',
  },
  {
    question: 'Inflation is running hot. The Fed turns its dial UP. What happens next?',
    options: [
      'Borrowing gets cheaper, so people spend more and prices cool down',
      'Borrowing gets more expensive, so people spend less and prices cool down',
      'The government sends everyone a check to offset prices',
      'Banks are forced to lend more money',
    ],
    correctIndex: 1,
    explanation:
      'Expensive borrowing means fewer mortgages, fewer car loans, fewer expansions — less spending chasing goods, which is what cools prices. The thermostat turns the heat down.',
  },
  {
    question: 'Same $400,000 house, 30-year mortgage. Roughly what is the monthly payment at 3% versus 7%?',
    options: [
      'About $1,700 versus about $2,650 — nearly $1,000 more every month for the same house',
      'About $1,700 versus about $1,900 — barely noticeable',
      'The payment is identical; only the loan length changes',
      'About $1,700 versus about $5,000 — triple the cost',
    ],
    correctIndex: 0,
    explanation:
      '$1,686 versus $2,661 to be exact, and $207,000 versus $558,000 in lifetime interest. Same bricks, same street — a $350,000 difference from one number.',
  },
  {
    question: 'The Fed raises rates. Who wins and who loses?',
    options: [
      'Everyone wins — higher rates mean a stronger economy for all',
      'Borrowers win and savers lose',
      'Borrowers lose and savers win — the same lever tilts a seesaw with a winner and a loser',
      'Nobody is affected for at least a decade',
    ],
    correctIndex: 2,
    explanation:
      'Credit card debt at 22% takes $2,200 a year from a $10,000 balance, while savings at 4.5% earns $450. The lever never helps everyone — it picks which pain the economy can afford.',
  },
  {
    question: 'The Fed is legally supposed to deliver steady prices AND maximum employment. What is the catch?',
    options: [
      'There is no catch — low rates deliver both at once',
      'The same lever pushes both goals in opposite directions: cooling inflation eventually costs jobs',
      'Employment is handled by a different agency entirely',
      'The Fed only cares about prices and ignores jobs',
    ],
    correctIndex: 1,
    explanation:
      'Expensive borrowing cools prices but also kills expansions and then jobs. There is no setting with no losers — only a choice of which problem hurts less right now.',
  },
  {
    question: 'Oil spikes because of a war and prices surge. Why is the Fed nearly powerless here?',
    options: [
      'The Fed is not allowed to meet during wars',
      'This is a supply shock — goods vanished, and no interest rate can manufacture oil or microchips',
      'High rates always fix oil prices within days',
      'The Fed only controls prices in election years',
    ],
    correctIndex: 1,
    explanation:
      'The lever fixes too-much-money problems, not not-enough-stuff problems. Raising rates here just adds expensive borrowing on top of empty shelves — pushing on a string.',
  },
  {
    question: 'Rates are high. What should you do first?',
    options: [
      'Take on more credit card debt before rates rise further',
      'Kill variable-rate debt first — a carried balance becomes an emergency at 22%',
      'Move all savings into checking earning nothing',
      'Ignore it; rates do not affect households',
    ],
    correctIndex: 1,
    explanation:
      'Credit cards reset upward almost immediately. And flip it around: high rates are the one moment shopping for a 4%+ savings account is worth an afternoon.',
  },
  {
    question: 'You read the headline "Fed raises rates." What is the correct way to read it?',
    options: [
      'Good news, full stop',
      'Bad news, full stop',
      'Borrowers just lost and savers just won — someone chose expensive borrowing over melting money',
      'It means nothing until the next election',
    ],
    correctIndex: 2,
    explanation:
      'A rate move is a seesaw, not a verdict. Now you know enough to ask the useful question: who just paid, and why was that the cheaper pain?',
  },
];

const CONTENT = `<p>Twelve people meet in Washington, eight times a year, and decide a single number.</p>
<p>No new laws. No taxes. No spending. Just a number \u2014 and within weeks, mortgages get cheaper or pricier, credit card bills swell or shrink, and savings accounts wake up or fall back asleep. For millions of people who will never know those twelve names.</p>
<p>That number is the interest rate. And this is the last piece of a three-part story. Part 1 asked how much money there actually is \u2014 the world\u2019s cash versus the world\u2019s wealth. Part 2 showed why money keeps losing value. This one answers the question both of them left hanging: <strong>when money starts melting, what can anyone actually do about it?</strong></p>
<p><strong>The one-line idea:</strong> an interest rate is a price tag on borrowing money \u2014 and borrowing is how new spending happens. Make borrowing cheap and the economy parties; make it expensive and the party quiets down. The Fed\u2019s entire job is picking the volume.</p>
<p><em>A note on numbers: the mortgage figures below are exact math for a $400,000, 30-year fixed loan \u2014 the same house, only the rate changing. Savings and credit card figures are rounded, typical examples \u2014 your bank will differ, but the shape is the same everywhere.</em></p>

<h3>The thermostat</h3>
<p>Your house has a thermostat. Too hot, the AC kicks in. Too cold, the heat comes on. One dial, and the whole house stays livable.</p>
<p>The economy has one too. When everyone is spending furiously, prices surge \u2014 that\u2019s inflation, the melting money from Part 2. When nobody spends at all, shops close and people lose jobs. The comfortable middle is where the Fed wants to live: prices rising just a touch (about 2% a year \u2014 enough to keep things moving, not enough to hurt), and nearly everyone who wants a job able to find one.</p>
<p>The Fed\u2019s dial is the interest rate. Turn it <strong>up</strong>, and borrowing gets expensive: fewer mortgages, fewer car loans, fewer business expansions, less spending, cooler prices. Turn it <strong>down</strong>, and borrowing gets cheap: more buying, more hiring, a warmer economy.</p>
<p>That is the whole game. One lever, two directions. Everything below is just that lever reaching into your wallet.</p>

<h3>How one number reaches your wallet</h3>
<p>The Fed doesn\u2019t set your mortgage rate directly. It sets one very specific price: what banks charge <em>each other</em> for overnight loans. It\u2019s called the federal funds rate, and it\u2019s the first domino.</p>
<p>Here\u2019s how the dominoes fall:</p>
<ul>
<li><strong>Banks pay more to borrow \u2192 they charge you more to borrow.</strong> Mortgages, car loans, and especially credit cards all drift up. A credit card at 22% instead of 18% quietly takes hundreds more from anyone carrying a balance.</li>
<li><strong>Banks pay more for deposits \u2192 they pay you more to save.</strong> That sleepy savings account earning almost nothing suddenly offers 4% or 5%. For the first time in years, sitting still earns something.</li>
<li><strong>Businesses pay more to expand \u2192 they open fewer stores and hire fewer people.</strong> The factory waits. The new branch doesn\u2019t open. This is the painful half of the lever, and we\u2019ll come back to it.</li>
</ul>
<p>One number ripples into every loan and every savings account in the country within weeks. That\u2019s not an exaggeration \u2014 it\u2019s the plumbing. Money has a price, and the Fed writes the first digit of it.</p>

<h3>The same house, two different universes</h3>
<p>This is where the lever stops being abstract. Take one ordinary $400,000 house, bought with a 30-year fixed mortgage. The house never changes. Only the rate does.</p>
<div data-widget="line-trend" data-eyebrow="One house, six different worlds" data-caption="Same $400,000 house, same 30 years. The only thing moving is the rate \u2014 and it nearly doubles the monthly payment from one end to the other. Every extra percent is hundreds of dollars a month, every month, for 30 years." data-series-a-label="Monthly payment" data-value-prefix="$" data-highlight-color="#34d399" data-points='[{"label":"3%","value":1686},{"label":"4%","value":1910},{"label":"5%","value":2147},{"label":"6%","value":2398},{"label":"7%","value":2661},{"label":"8%","value":2935}]'></div>
<p>Read that again: at 3%, the house costs <strong>$1,686 a month</strong>. At 7%, the identical house costs <strong>$2,661 a month</strong> \u2014 $975 more, every month, for 30 years. Over the life of the loan, the 3% buyer pays about $207,000 in interest; the 7% buyer pays about $558,000. Same bricks. Same street. A $350,000 difference, decided by that one number.</p>
<p>Now you see why the housing market freezes when rates rise. It\u2019s not psychology \u2014 it\u2019s arithmetic. Millions of buyers who qualified at 3% simply don\u2019t qualify at 7%. The music doesn\u2019t slow down. It stops.</p>

<h3>Borrowers lose, savers win \u2014 the seesaw</h3>
<p>Every rate move has a winner and a loser, sitting on opposite ends of a seesaw. When the Fed pushes its lever up:</p>
<div data-widget="bar-compare" data-eyebrow="One year, $10,000 \u2014 two opposite fates" data-caption="Same $10,000, same one year. Owed on a credit card at typical high-rate-era levels, it costs you $2,200. Parked in savings, it earns you $450. The lever doesn\u2019t pick sides \u2014 it just tilts the whole seesaw." data-value-prefix="$" data-items='[{"label":"Owed on a card at 22%","value":2200,"subtext":"interest you pay"},{"label":"Saved at 4.5%","value":450,"subtext":"interest you earn"}]'></div>
<p>Borrowers sink. Savers float. And most households are a bit of both \u2014 a mortgage on one side, a savings account on the other \u2014 so a rate hike squeezes with one hand while feeding with the other.</p>
<p>This is also why \u201chigh rates are bad\u201d is only half true. Ask a retiree living off savings interest whether they miss the years their account paid nothing. The lever never helps everyone.</p>

<h3>The price of cool: jobs</h3>
<p>Here\u2019s the part nobody applauds. Cooling inflation with high rates works \u2014 but the medicine has a side effect, and it\u2019s people.</p>
<p>When borrowing gets expensive, businesses don\u2019t just stop borrowing. They stop expanding, then they start cutting. The new store doesn\u2019t open (three jobs never created). Then the quiet store closes (ten jobs destroyed). Every percentage point of cooling lands, eventually, on someone\u2019s employment.</p>
<p>The Fed knows this. Its actual legal job is two things at once: <strong>steady prices AND as many people employed as possible.</strong> Economists call it the dual mandate. You can call it the impossible job \u2014 because the same lever pushes both goals in opposite directions. Down to fight inflation means up in unemployment, sooner or later. There is no setting that gives you both. There is only picking which problem hurts less right now.</p>
<p>That\u2019s worth sitting with. The twelve people aren\u2019t wise wizards with a perfect answer. They\u2019re stuck holding one lever connected to two things that want opposite settings \u2014 and whatever they choose, someone pays.</p>

<h3>What the lever can\u2019t fix: the broken window</h3>
<p>A thermostat keeps a house comfortable. But if a window shatters in January, no thermostat setting fixes the cold. You have to fix the window.</p>
<p>The economy has broken windows too. In 2020, factories shut down and there simply <em>wasn\u2019t enough stuff</em> \u2014 no rate setting manufactures microchips or unclogs ports. When oil spikes because of a war, no interest rate pumps more oil. These are <strong>supply shocks</strong>: prices rising not because too much money is chasing goods, but because the goods vanished.</p>
<p>The lever is nearly useless here \u2014 worse, it\u2019s the wrong tool entirely. Jacking up rates doesn\u2019t print a single microchip; it just adds expensive borrowing on top of empty shelves. Economists have a bleak phrase for it: <em>pushing on a string.</em> You can pull spending down, but you can\u2019t push goods into existence.</p>
<p>So the honest boundary is this: the Fed can fix too-much-money problems. It cannot fix not-enough-stuff problems. Knowing which kind of inflation you\u2019re looking at is half of understanding the news \u2014 and now you can tell them apart.</p>

<h3>What to actually do when rates move</h3>
<p>The whole article compresses to five rules:</p>
<ol>
<li><strong>When rates are high, kill variable-rate debt first.</strong> Credit cards reset upward almost immediately. A balance you could lazily carry at low rates becomes an emergency at 22%. Pay it like the house is on fire \u2014 because mathematically, it is.</li>
<li><strong>When rates are high, finally care about your savings account.</strong> The gap between a lazy 0.1% account and a 4.5% one is hundreds of dollars a year on real balances. High rates are the one moment shopping for yield is worth an afternoon.</li>
<li><strong>When rates are low, that\u2019s the window for big fixed borrowing.</strong> Mortgages, refinancing, starting the business \u2014 low rates are a sale on money itself. It doesn\u2019t last; the thermostat always turns again.</li>
<li><strong>Never assume today\u2019s rate is normal.</strong> People who bought houses at 3% treated it as the weather. It was the sale. Every rate in history felt permanent and wasn\u2019t.</li>
<li><strong>Read every Fed headline as a seesaw, not a verdict.</strong> \u201cFed raises rates\u201d doesn\u2019t mean good or bad \u2014 it means borrowers just lost and savers just won, and someone chose melting money over expensive borrowing. Now you know enough to ask who, and why.</li>
</ol>

<h3>The one thing to remember</h3>
<p>Prices, jobs, mortgages, savings \u2014 they look like separate stories, but they\u2019re one machine with one dial.</p>
<p><strong>Borrowing has a price, spending follows the price, and twelve people set the price eight times a year.</strong> Cheap money throws a party and melts the currency. Expensive money ends the party and costs jobs. There is no setting where nobody pays \u2014 there\u2019s only choosing <em>who</em> pays, <em>when</em>.</p>
<p>That\u2019s the end of the trilogy. Part 1 counted the money. Part 2 watched it melt. Part 3 met the people holding the thermostat \u2014 and now you know exactly what their one lever does, who it helps, who it hurts, and what it can never fix.</p>`;

export default function PreviewInterestRates() {
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

          <QuizModal questions={QUIZ} accent={accent} title={TITLE} slug="preview-interest-rates" />

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
