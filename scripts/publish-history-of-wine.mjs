// One-off: publishes "8,000 Years of Wine: From Clay Pots in Georgia to Your Dinner Table" (drafted in
// drafts/history-of-wine.md, reviewed at /preview-history-of-wine)
// straight into the Supabase blog_posts table.
//
// Usage:
//   node scripts/publish-history-of-wine.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TITLE = '8,000 Years of Wine: From Clay Pots in Georgia to Your Dinner Table';
const SLUG = '8-000-years-of-wine-from-clay-pots-in-georgia-to-your-dinner-table';
const CATEGORY = 'Curiosity';
const EXCERPT =
  'Clay jars in Georgia, monks mapping Burgundy, a root louse that nearly killed every vine in Europe, and the blind tasting that put California on the map — 8,000 years of wine in one story.';
const READ_TIME = 9;

const QUIZ = [
  {
    question: 'Where is the oldest hard evidence of winemaking?',
    options: ['Bordeaux, France', 'Georgia', 'Tuscany, Italy', 'The Nile Delta'],
    correctIndex: 1,
    explanation:
      'Residue inside clay jars in Georgia dates winemaking to around 6000 BC — roughly 8,000 years ago, millennia before France planted a vine.',
  },
  {
    question: 'Why has England been Bordeaux’s best customer for centuries?',
    options: [
      'Eleanor of Aquitaine’s 1152 marriage tied Bordeaux to the English crown',
      'England is physically unable to grow wine grapes',
      'A 1700s trade ban blocked all other French wine',
      'Bordeaux is the closest wine region to London',
    ],
    correctIndex: 0,
    explanation:
      'Eleanor’s marriage to Henry II gave England three centuries of Bordeaux access starting in 1152 — and the English never left.',
  },
  {
    question: 'What did the 1855 Bordeaux Classification rank châteaux by?',
    options: [
      'A blind tasting panel',
      'The age of the estate',
      'The market price of their wine',
      'The size of their vineyards',
    ],
    correctIndex: 2,
    explanation:
      'Brokers ranked estates by what their wine sold for — commerce, not tasting. The list still shapes Bordeaux prices and prestige more than 170 years later.',
  },
  {
    question: 'What ultimately saved European vineyards from phylloxera?',
    options: [
      'Burning every infected vineyard',
      'A chemical pesticide',
      'Grafting European vines onto resistant American roots',
      'Moving all vineyards to higher ground',
    ],
    correctIndex: 2,
    explanation:
      'American vines had co-evolved with the root louse and resisted it. Splicing European fruiting wood onto American roots saved the industry — and most fine wine still grows on grafted vines today.',
  },
  {
    question: 'What was Dom Pérignon actually trying to do with his wine?',
    options: [
      'Remove the bubbles',
      'Invent the bubbles',
      'Age it in oak barrels',
      'Make it sweet enough to ship',
    ],
    correctIndex: 0,
    explanation:
      'Bubbles were a flaw that exploded bottles — he spent his career fighting them. Stronger English glass and the Widow Clicquot’s riddling table are what made Champagne possible.',
  },
  {
    question: 'What did the 1976 Judgment of Paris prove?',
    options: [
      'French wines always win blind tastings',
      'California wines could beat the best French wines, tasted blind',
      'Red wine beats white wine every time',
      'Older vintages always score higher',
    ],
    correctIndex: 1,
    explanation:
      'In a blind tasting judged by French experts, a California Chardonnay and a California Cabernet took first place in their flights — the result that put New World wine on the map for good.',
  },
];

const WINE_JOURNEY_PINS = JSON.stringify([
  { label: 'Georgia', lon: 44.8, lat: 41.7, note: '~6000 BC, clay jars' },
  { label: 'Egypt', lon: 31.2, lat: 30.0, note: '~3000 BC, tomb paintings' },
  { label: 'Greece', lon: 23.7, lat: 38.0, note: '~2000 BC, symposiums' },
  { label: 'Rome', lon: 12.5, lat: 41.9, note: '~200 BC, estates + manuals' },
  { label: 'Burgundy', lon: 5.0, lat: 47.3, note: '1100s, monks map the slopes' },
  { label: 'Bordeaux', lon: -0.6, lat: 44.8, note: '1855, the Classification' },
  { label: 'Languedoc', lon: 4.0, lat: 43.6, note: '1860s, phylloxera + grafting' },
  { label: 'Champagne', lon: 4.0, lat: 49.0, note: '1800s, bubbles tamed' },
  { label: 'Napa', lon: -122.3, lat: 38.5, note: '1976, the Paris tasting' },
  { label: 'Kent, England', lon: 1.0, lat: 51.2, note: 'today, sparkling boom' },
]);

const CONTENT = `<p>Wine is one of the oldest drinks humans ever made &mdash; older than writing, older than the wheel &mdash; and the trail starts in a country most people couldn&rsquo;t find on a map. (A fermented rice, honey and fruit drink from Jiahu, China, is older still &mdash; but for grape wine, this is where the story begins.) The story runs through Stone Age clay jars, Egyptian tomb paintings, Greek symposiums, Roman cellars, medieval monks who mapped vineyards one vintage at a time, a root louse that nearly killed every vine in Europe, and a blind tasting in Paris that humiliated the French wine establishment. Here&rsquo;s how fermented grape juice became civilization&rsquo;s favorite time capsule.</p>
<p><em>Companion piece: <a href="/blog/wine-untangled-every-type-explained">Wine, Untangled: Every Type Explained</a> &mdash; the grapes, the methods, and what&rsquo;s actually in the glass.</em></p>
<div data-widget="world-map" data-eyebrow="Wine's journey across 8,000 years" data-caption="Ten stops, one per section — the rest of this article walks through each in order." data-accent-color="#e05252" data-pins='${WINE_JOURNEY_PINS}'></div>
<h3>The beginning: Georgia, around 6000 BC</h3>
<p>The oldest hard evidence of winemaking comes from clay jars in what is now Georgia. Archaeologists found grape residue, including tartaric acid &mdash; the chemical fingerprint of grapes &mdash; inside pottery shards dating to roughly 6000 BC &mdash; about 8,000 years ago. The vessels were large, egg-shaped clay jars: ancestors of the qvevri Georgian winemakers still bury today. The buried-qvevri tradition itself is ancient, and Georgia never let go of it &mdash; families there still ferment grapes in vessels sealed with stone and earth.</p>
<p>Why Georgia? Wild Vitis vinifera grew thick in the South Caucasus, and the region&rsquo;s climate gave grapes enough sugar to ferment on their own. Somebody left crushed grapes in a pot, wild yeast did the rest, and the result kept better than water. Fermentation wasn&rsquo;t understood &mdash; nobody would know yeast existed for nearly 8,000 years &mdash; but the outcome was obvious: a drink that didn&rsquo;t spoil, tasted interesting, and made harvest season more fun.</p>
<p>Wine then traveled the way all early technology traveled: downhill and downstream. By 3000 BC it reached Egypt, where tomb paintings show every step &mdash; treading grapes, pressing, sealing jars &mdash; and labeled jars named the vineyard, the vintage, and the winemaker, a labeling habit we still follow. From Egypt and Phoenician traders it spread around the Mediterranean: to Greece by 2000 BC, to Italy and Spain around 1000 BC, and to southern France by about 600 BC with Greek traders. Everywhere vines landed, wine became tangled with religion, medicine, and social ritual within a generation.</p>
<h3>Greece and Rome: wine becomes civilization&rsquo;s drink</h3>
<p>The Greeks treated wine as a civilized art with rules. They drank it mixed with water at the symposium &mdash; undiluted wine was considered barbaric, literally something only non-Greeks did &mdash; and credited the god Dionysus with the gift. Greek physicians prescribed specific wines for specific ailments, and Greek merchants shipped named wines (Thasian, Lesbian, Chian) in stamped amphorae, a branded, origin-labeled trade at Mediterranean scale.</p>
<p>Rome industrialized all of it. Roman engineers built vineyard estates across Italy, France, Spain, and Germany; Roman writers like Columella wrote detailed manuals on soil, grafting, and vintages; and Roman cellars full of giant clay jars (dolia) standardized fermentation at scale. The Romans also planted the ancestors of famous regions: Bordeaux&rsquo;s vineyards, the Rhône valley, the Mosel&rsquo;s steep slate slopes &mdash; all Roman foundations. When the Empire fell, monasteries kept the vineyards alive through the Dark Ages, and monks became Europe&rsquo;s patient viticulturists: the Cistercians in Burgundy spent centuries noting which plots made the best wine, effectively inventing the terroir map Burgundy still uses.</p>
<h3>The Middle Ages: monks, maps, and the first wine laws</h3>
<p>Between roughly 500 and 1500, wine belonged to the Church and the nobility. Monasteries owned the best vineyard land in Burgundy, Champagne, the Mosel, and Rioja, and monks had three things secular growers didn&rsquo;t: centuries of written records, the patience to compare vintages, and no pressure to sell young. They walled the best plots (clos), noticed that wines from one walled plot consistently beat the neighbor&rsquo;s, and started the slow classification of Burgundy&rsquo;s slopes that continues today.</p>
<p>Trade made wine international again. Bordeaux shipped claret to England by the shipload &mdash; Eleanor of Aquitaine&rsquo;s marriage to Henry II in 1152 handed England three centuries of Bordeaux access, and the English have been Bordeaux&rsquo;s best customers ever since. The Hanseatic League carried wine to Scandinavia and Russia. And regions began protecting their names: Chianti&rsquo;s boundaries were legally defined in 1716, and Tokaji&rsquo;s soon after, in the 1730s &mdash; among the world&rsquo;s first appellations.</p>
<h3>Bordeaux 1855: the classification that froze time</h3>
<p>In 1855, Napoleon III asked Bordeaux&rsquo;s wine brokers to rank the region&rsquo;s châteaux for the Paris Exposition. The brokers did what brokers do: they ranked by price. Estates whose wine consistently sold for the most became First Growths, then Seconds, Thirds, Fourths, and Fifths. It was a snapshot of the market, meant for one exhibition.</p>
<p>It stuck. The 1855 Classification still governs Bordeaux prestige and pricing today, with only two changes ever: Cantemerle, added as a Fifth Growth in 1856 after being left off the original list, and Mouton Rothschild&rsquo;s promotion to First Growth in 1973. Wines ranked in 1855 sell at multiples of unranked neighbors making arguably equal wine, because the ranking itself <em>is</em> the value. It&rsquo;s the clearest example in wine of reputation compounding for centuries &mdash; and a standing lesson that classifications measure markets, not palates.</p>
<h3>Phylloxera: the louse that nearly ended wine</h3>
<p>In the 1860s, European vineyards started dying. Leaves yellowed, roots rotted, and entire regions collapsed within years. The cause was phylloxera, a microscopic American root louse that had crossed the Atlantic on imported vines. European <em>Vitis vinifera</em> had no resistance; American species, which had co-evolved with the pest, shrugged it off.</p>
<p>By the 1890s, phylloxera had destroyed an estimated 70% of European vineyards. Bordeaux, Burgundy, Champagne, Rioja, Chianti &mdash; all devastated. Desperate remedies failed: flooding vineyards, burying toads, injecting chemicals. The fix, when it came, was beautifully simple: graft European fruiting wood onto resistant American roots. The grapes stay European; the roots are American. Nearly every fine wine vine planted since &mdash; in Bordeaux, Napa, everywhere &mdash; grows on grafted roots, a quiet American immigrant under every Old World vineyard. A few ungrafted old vines survive only in sandy soils the louse can&rsquo;t cross.</p>
<h3>Champagne: bubbles by accident, luxury by design</h3>
<p>Sparkling wine started as a flaw. In cool Champagne, fermentation sometimes stalled in autumn and restarted in spring, trapping CO2 in the bottle. Bottles exploded; the wine was cloudy. The legend credits the monk Dom Pérignon with inventing Champagne, but he actually spent his career trying to <em>remove</em> bubbles. The real inventors were English glassmakers (stronger bottles that survived the pressure) and later the Widow Clicquot, who invented riddling &mdash; the slow turning of bottles to collect dead yeast in the neck for removal.</p>
<p>By the 1800s, Champagne&rsquo;s makers had turned the accident into the world&rsquo;s first luxury wine brand: consistent house styles blended across vintages, heavy bottles, foil, wire cages, and marketing that tied bubbles to celebration itself. The méthode champenoise &mdash; second fermentation in the bottle, aging on the lees &mdash; became the gold standard every sparkling region imitates or deliberately avoids.</p>
<h3>1976: the Judgment of Paris</h3>
<p>For most of the 20th century, fine wine meant France, full stop. California made jug wine; Australia and Chile barely registered. Then a British wine merchant named Steven Spurrier organized a blind tasting in Paris to celebrate the American bicentennial: top California Chardonnays and Cabernet Sauvignons against the best white Burgundies and red Bordeaux, judged by nine French experts.</p>
<p>California won both flights. A 1973 Stag&rsquo;s Leap Cabernet beat Mouton Rothschild and Haut-Brion; a Chateau Montelena Chardonnay beat Burgundy&rsquo;s finest. When the results leaked &mdash; <em>Time</em> magazine covered the tasting &mdash; the wine world convulsed. French judges demanded their ballots back. But the lesson held: great wine could come from anywhere with the right grapes, climate, and care. Napa Valley land prices took off, and every New World region &mdash; Australia, Chile, Argentina, New Zealand, South Africa &mdash; got its opening. Modern wine&rsquo;s Old World / New World split starts that day.</p>
<h3>Wine today: wilder and further north</h3>
<p>The newest chapter loops back to the oldest. Natural wine &mdash; native yeasts, little or no added sulfites, minimal intervention &mdash; took pét-nat and skin-contact &ldquo;orange&rdquo; wines from curiosity to wine-bar staple, and Georgia&rsquo;s buried qvevri, never abandoned at home, became an international trend. Eight thousand years on, the least modern method in wine is fashionable again.</p>
<p>Meanwhile the map is moving. As temperatures rise, vineyards creep uphill and north: England&rsquo;s chalk downs &mdash; the same white rock as Champagne, geologically speaking &mdash; now grow Champagne-method sparkling that wins international awards, and Champagne houses themselves have planted in Kent. Bordeaux is experimenting with heat-tolerant grapes; Scandinavia has commercial vineyards. The story that started in Caucasian clay is still adding stops.</p>
<p>That&rsquo;s the story. For the bottles &mdash; every grape, method, and style in one guide &mdash; read the companion piece: <a href="/blog/wine-untangled-every-type-explained">Wine, Untangled: Every Type Explained</a>.</p>
<h3>Sources</h3>
<ul>
<li>McGovern et al., &ldquo;Early Neolithic Wine of Georgia in the South Caucasus,&rdquo; <em>PNAS</em> (2017) &mdash; <a href="https://doi.org/10.1073/pnas.1714728114">doi.org/10.1073/pnas.1714728114</a></li>
<li>&ldquo;The Judgment of Paris: A Turning Point for Wine,&rdquo; NPR (2006) &mdash; <a href="https://www.nprillinois.org/2006-05-29/the-judgment-of-paris-a-turning-point-for-wine">nprillinois.org</a></li>
<li>&ldquo;Great French Wine Blight,&rdquo; Wikipedia &mdash; <a href="https://en.wikipedia.org/wiki/Great_French_Wine_Blight">en.wikipedia.org/wiki/Great_French_Wine_Blight</a></li>
<li>&ldquo;Bordeaux Wine Official Classification of 1855,&rdquo; Wikipedia &mdash; <a href="https://en.wikipedia.org/wiki/Bordeaux_Wine_Official_Classification_of_1855">en.wikipedia.org/wiki/Bordeaux_Wine_Official_Classification_of_1855</a></li>
</ul>
`;
async function main() {
  const row = {
    title: TITLE,
    slug: SLUG,
    content: CONTENT,
    excerpt: EXCERPT,
    published: true,
    category: CATEGORY,
    read_time: READ_TIME,
    quiz: QUIZ,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(row, { onConflict: 'slug' })
    .select('title, slug, published')
    .single();

  if (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }

  console.log(`Published: ${data.title} -> /blog/${data.slug}`);
}

function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
