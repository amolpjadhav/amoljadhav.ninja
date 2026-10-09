// One-off: publishes "Wine, Untangled: Every Type Explained" (drafted in
// drafts/wine-untangled.md, reviewed at /preview-wine-untangled)
// straight into the Supabase blog_posts table.
//
// Usage:
//   node scripts/publish-wine-untangled.mjs

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

const TITLE = 'Wine, Untangled: Every Type Explained';
const SLUG = 'wine-untangled-every-type-explained';
const CATEGORY = 'Curiosity';
const EXCERPT =
  'Red, white, rosé, sparkling, sweet, fortified: what the words mean, which grapes matter, and why Dry is sweeter than Brut — every wine type in one guide.';
const READ_TIME = 8;

const QUIZ = [
  {
    question: 'What actually gives red wine its color?',
    options: [
      'Red grape juice',
      'Oak barrels during aging',
      'Skin contact during fermentation',
      'Caramel coloring',
    ],
    correctIndex: 2,
    explanation:
      'The juice of nearly all grapes runs clear. Red wine gets its color (and tannin) from fermenting with the dark skins — which is exactly why white Blanc de Noirs can come from red grapes.',
  },
  {
    question: 'A Blanc de Noirs is a white wine made from red grapes. What does that prove?',
    options: [
      'Red grapes have white juice — color comes from the skins',
      'All white wine is secretly blended',
      'Red grapes turn white when chilled',
      'Blanc de Noirs contains no alcohol',
    ],
    correctIndex: 0,
    explanation:
      'Press red grapes and remove the skins immediately, and the wine stays white. Skin contact is the whole difference between red and white.',
  },
  {
    question: 'Which is sweeter: Brut or Dry?',
    options: [
      'Dry — roughly twice the sugar of Brut',
      'Brut',
      'They contain the same sugar',
      'Neither contains any sugar',
    ],
    correctIndex: 0,
    explanation:
      'Brut caps at 12 g/L of sugar; Dry runs 17–32 g/L. The words date from when all Champagne was sweet — read the scale, not the word.',
  },
  {
    question: 'In Champagne, where does the second fermentation happen?',
    options: [
      'In a steel tank',
      'In the bottle you buy',
      'In an oak barrel',
      'It doesn’t happen — the bubbles are injected',
    ],
    correctIndex: 1,
    explanation:
      'Still wine plus yeast and sugar is sealed in the bottle, and the trapped CO2 becomes the bubbles. The wine then ages on the dead yeast (lees), which adds the toasty, brioche notes.',
  },
  {
    question: 'What most likely causes a red-wine headache?',
    options: [
      'Sulfites',
      'Dehydration, alcohol, and histamines',
      'A tannin allergy',
      'Serving temperature',
    ],
    correctIndex: 1,
    explanation:
      'Dried fruit contains far more sulfites than wine, and red wine has fewer than white. Sulfites keep the bottle fresh — drink water instead.',
  },
  {
    question: 'Amarone is made from dried grapes. How does it taste?',
    options: [
      'Dry — its sweet sibling is Recioto',
      'Very sweet, like Port',
      'Sparkling',
      'Salty, like fino Sherry',
    ],
    correctIndex: 0,
    explanation:
      'Amarone uses the same dried-grape passito method as Recioto, but it is fermented to dryness — rich and powerful, not sweet.',
  },
];

const WINE_STYLES_TREE = JSON.stringify({
  label: 'Wine',
  note: 'crushed grapes + yeast',
  color: '#d4d4d8', icon: '',
  children: [
    {
      label: 'Still',
      note: 'no bubbles',
      color: '#dc2626', icon: '',
      children: [
        { label: 'Red', note: 'skins on, weeks', color: '#dc2626', icon: '' },
        { label: 'White', note: 'no skins', color: '#dc2626', icon: '' },
        { label: 'Rosé', note: 'skins briefly, hours', color: '#dc2626', icon: '' },
      ],
    },
    {
      label: 'Sparkling',
      note: 'CO2 trapped',
      color: '#eab308', icon: '',
      children: [
        { label: 'Bottle method', note: 'Champagne, Cava', color: '#eab308', icon: '' },
        { label: 'Tank method', note: 'Prosecco', color: '#eab308', icon: '' },
        { label: 'Ancestral', note: 'pét-nat', color: '#eab308', icon: '' },
      ],
    },
    {
      label: 'Sweet',
      note: 'sugar kept',
      color: '#f59e0b', icon: '',
      children: [
        { label: 'Late harvest', note: 'Sauternes, Tokaji', color: '#f59e0b', icon: '' },
        { label: 'Icewine', note: 'frozen on the vine', color: '#f59e0b', icon: '' },
      ],
    },
    {
      label: 'Fortified',
      note: 'spirit added, 15-22%',
      color: '#92400e', icon: '',
      children: [
        { label: 'Port', note: 'rich + fruity', color: '#92400e', icon: '' },
        { label: 'Sherry', note: 'dry to sweet', color: '#92400e', icon: '' },
      ],
    },
  ],
});

const CONTENT = `<p>Every wine starts the same way: crushed grapes plus yeast, which eats sugar and makes alcohol and CO2. Everything after that &mdash; skin contact, oak, bubbles, sweetness &mdash; is a choice. This guide maps all of it: the grapes, the methods, and what&rsquo;s actually in the glass. (For the 8,000-year backstory, read <a href="/blog/8-000-years-of-wine-from-clay-pots-in-georgia-to-your-dinner-table">8,000 Years of Wine: From Clay Pots in Georgia to Your Dinner Table</a>.)</p>
<div data-widget="family-tree" data-eyebrow="The wine family tree" data-caption="Every bottle starts as crushed grapes plus yeast. What happens next — skins, bubbles, sugar, spirit — decides which branch it lands on. Each branch gets its own color below." data-tree='${WINE_STYLES_TREE}'></div>
<h3>Red wine: skins make the wine</h3>
<p>All red wine comes from dark grapes fermented <em>with</em> their skins. The juice of nearly every grape &mdash; red or white &mdash; runs clear; color, tannin, and much of the flavor leach out of the skins during days or weeks of contact. More contact means darker color, more grip, more structure. Pinot Noir (thin skins) makes pale, silky wine; Cabernet Sauvignon (thick skins) makes dark, tannic wine built for decades.</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Grape</th><th>Body</th><th>Tastes like</th><th>Classic home</th></tr>
</thead>
<tbody>
<tr><td>Pinot Noir</td><td>Light</td><td>Cherry, raspberry, earth, flowers</td><td>Burgundy, Oregon</td></tr>
<tr><td>Nebbiolo</td><td>Light-looking, heavy-hitting</td><td>Rose, tar, cherry, leather</td><td>Barolo &amp; Barbaresco</td></tr>
<tr><td>Sangiovese</td><td>Medium, built for food</td><td>Sour cherry, herbs, tomato leaf</td><td>Chianti, Tuscany</td></tr>
<tr><td>Merlot</td><td>Medium</td><td>Plum, chocolate, soft herbs</td><td>Right-bank Bordeaux</td></tr>
<tr><td>Tempranillo</td><td>Medium</td><td>Cherry, tobacco, vanilla (from oak)</td><td>Rioja, Ribera del Duero</td></tr>
<tr><td>Syrah / Shiraz</td><td>Full, the barbecue red</td><td>Blackberry, pepper, smoke, meat</td><td>Rhône, Barossa</td></tr>
<tr><td>Cabernet Sauvignon</td><td>Full</td><td>Blackcurrant, cedar, graphite</td><td>Left-bank Bordeaux, Napa</td></tr>
<tr><td>Malbec</td><td>Full</td><td>Black plum, cocoa, violets</td><td>Mendoza, Argentina</td></tr>
</tbody>
</table>
</div>
<p>The useful axis for reds is body: light (Pinot Noir) through medium (Merlot, Sangiovese) to full (Cabernet, Syrah). Within a body weight, regions differ in flavor accent &mdash; cool climates lean herbal and red-fruited, warm climates lean ripe and dark-fruited.</p>
<h3>White wine: no skins, all freshness (usually)</h3>
<p>White wine is pressed off its skins immediately, so it stays pale and tannin-free. The levers are grape acidity, fermentation vessel (steel preserves fruit; oak adds butter, vanilla, and texture), and whether it goes through malolactic fermentation, which turns sharp apple-like acids soft and buttery.</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Grape</th><th>Style</th><th>Tastes like</th><th>Classic home</th></tr>
</thead>
<tbody>
<tr><td>Riesling</td><td>Aromatic, high acid</td><td>Lime, petrol (!) with age, flowers</td><td>Mosel, Alsace</td></tr>
<tr><td>Sauvignon Blanc</td><td>Crisp, herbal</td><td>Grapefruit, gooseberry, cut grass</td><td>Loire, New Zealand</td></tr>
<tr><td>Pinot Grigio</td><td>Light, neutral</td><td>Lemon, pear, white flowers</td><td>Veneto, Alto Adige</td></tr>
<tr><td>Albariño</td><td>Crisp, saline</td><td>Peach, citrus, sea spray</td><td>Rías Baixas, Spain</td></tr>
<tr><td>Chardonnay (unoaked)</td><td>Fresh, mineral</td><td>Green apple, citrus, chalk</td><td>Chablis</td></tr>
<tr><td>Chardonnay (oaked)</td><td>Rich, round, the shape-shifter</td><td>Butter, vanilla, tropical fruit</td><td>Burgundy, California</td></tr>
<tr><td>Viognier</td><td>Rich, perfumed</td><td>Apricot, honeysuckle, peach</td><td>Condrieu (Rhône)</td></tr>
<tr><td>Gewürztraminer</td><td>Intensely aromatic</td><td>Lychee, rose, spice</td><td>Alsace</td></tr>
</tbody>
</table>
</div>
<p>Chardonnay appears twice on purpose: it&rsquo;s the most shape-shifting grape in the world. Steel-fermented Chablis and oaky California Chardonnay taste like different species &mdash; same grape, opposite winemaking.</p>
<h3>Rosé: red grapes, briefly</h3>
<p>Rosé is red wine with short skin contact &mdash; hours instead of weeks. Pink isn&rsquo;t a blend of red and white (that&rsquo;s illegal in most of Europe, Champagne excepted); it&rsquo;s limited extraction. Provence pioneered the pale, dry style the world now copies, made mostly from Grenache, Cinsault, and Mourvèdre. Spanish rosado and Italian chiaretto run deeper and fuller. Nearly all rosé is made to drink young &mdash; within a year or two &mdash; which is why last year&rsquo;s vintage on the shelf is a feature, not a flaw.</p>
<h3>Sparkling: the bubbles are (usually) a second fermentation</h3>
<p>Most sparkling wine gets its fizz from CO2 trapped during a second fermentation &mdash; but <em>where</em> that fermentation happens defines the style and the price:</p>
<ol>
<li><strong>Traditional method</strong> (Champagne, Cava, Franciacorta): second fermentation in the bottle, aged on lees for richness. Slow, expensive, toasty.</li>
<li><strong>Tank method</strong> (Prosecco): second fermentation in a pressurized steel tank. Fast, cheap, fresh and fruity.</li>
<li><strong>Ancestral method</strong> (pét-nat): bottled before the first fermentation finishes. Cloudy, funky, unfiltered &mdash; the oldest method, now the trendiest.</li>
</ol>
<p>Two exceptions to the &ldquo;second fermentation&rdquo; rule: pét-nat finishes its <em>first</em> fermentation in the bottle (there is no second one), and the cheapest sparklers are simply carbonated like soda.</p>
<div class="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
<p class="text-xs uppercase tracking-wide text-white/40 mb-1">Sugar in sparkling wine</p>
<p class="text-white/70 text-sm mb-2">One scale, driest to sweetest. Brut &mdash; the default on most shelves &mdash; sits well below Extra Dry and Dry, a leftover from when all Champagne was sweet. Read the scale, not the word.</p>
<div style="position:relative;height:132px;margin:4px 2px 0;">
<div style="position:absolute;left:0;right:0;top:56px;height:8px;border-radius:4px;background:linear-gradient(90deg,#3f3f46,#eab308);"></div>
<div style="position:absolute;left:4.6%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:4.6%;bottom:68px;white-space:nowrap;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Brut Nature</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">0&ndash;3 g/L</p></div>
<div style="position:absolute;left:9.2%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:9.2%;top:72px;transform:translateX(-50%);white-space:nowrap;text-align:center;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Extra Brut</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">to 6 g/L</p></div>
<div style="position:absolute;left:18.5%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid #eab308;transform:translateX(-50%);"></div>
<div style="position:absolute;left:18.5%;bottom:68px;transform:translateX(-50%);white-space:nowrap;text-align:center;"><p style="font-size:11px;font-weight:700;color:#eab308;margin:0;">Brut &#9733;</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">to 12 g/L</p></div>
<div style="position:absolute;left:26%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:26%;top:72px;transform:translateX(-50%);white-space:nowrap;text-align:center;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Extra Dry</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">12&ndash;17 g/L</p></div>
<div style="position:absolute;left:49%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:49%;bottom:68px;transform:translateX(-50%);white-space:nowrap;text-align:center;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Dry</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">17&ndash;32 g/L</p></div>
<div style="position:absolute;left:77%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:77%;top:72px;transform:translateX(-50%);white-space:nowrap;text-align:center;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Demi-Sec</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">32&ndash;50 g/L</p></div>
<div style="position:absolute;left:93%;top:54px;width:12px;height:12px;border-radius:50%;background:#1c1d20;border:2px solid rgba(255,255,255,0.4);transform:translateX(-50%);"></div>
<div style="position:absolute;left:93%;bottom:68px;transform:translateX(-100%);white-space:nowrap;text-align:right;"><p style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">Doux</p><p style="font-size:10px;color:rgba(255,255,255,0.45);margin:0;">50+ g/L</p></div>
</div>
<div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.35);"><span>driest</span><span>sweetest</span></div>
</div>
<p>Champagne&rsquo;s price isn&rsquo;t just marketing: hand-riddling (now mostly machines), years of cellar aging, and grapes from one expensive region genuinely cost more. But the method matters more than the map &mdash; a well-made Cava or Cr&eacute;mant uses the same technique as Champagne at a third of the price.</p>
<h3>Sweet and fortified: stopping (or spiking) fermentation</h3>
<p>Sweet wines keep residual sugar by stopping fermentation early or concentrating the grapes first. The great ones balance sugar with ripping acidity &mdash; that&rsquo;s why German Riesling and Loire Chenin dominate the category:</p>
<ul>
<li><strong>Late harvest:</strong> grapes picked overripe (and sometimes shriveled by noble rot), as in Sauternes and Tokaji.</li>
<li><strong>Icewine:</strong> grapes frozen on the vine, pressed while frozen &mdash; water stays behind as ice, sugar flows. Canada and Germany lead.</li>
<li><strong>Dried grapes:</strong> passito wines like Recioto and Vin Santo (sweet). Amarone uses the same dried grapes but is fermented dry.</li>
</ul>
<p>Fortified wines add grape spirit to push alcohol to 15&ndash;22%. Timing is everything: Port (Douro Valley) adds the spirit mid-fermentation, killing the yeast and keeping the wine rich, sweet, and fruity. Sherry (Jerez) is fortified after fermentation, so it can be bone-dry &mdash; fino is about 15%, saline and nutty. Madeira is deliberately heated and oxidized, and nearly indestructible: an open bottle keeps for months.</p>
<h3>Serving and storing: the 20% that matters</h3>
<p>Most serving rules collapse to temperature and air. Reds show best at cool room temperature (60–65°F, not 75°F); whites and rosés at 45–55°F; Champagne coldest, around 45°F. The universal fix: 20 minutes in the fridge improves almost any red served too warm, and letting a white warm up for 15 minutes out of the fridge fixes over-chilling.</p>
<p>Decanting helps young, tannic reds (air softens them) and old reds with sediment (pour carefully, leave the grit behind). A cheap wine that smells flat will often wake up with 30 minutes of air &mdash; the best free upgrade in wine. And once opened, wine keeps 3–5 days re-corked in the fridge (yes, reds too); sparkling needs a proper stopper and gives you 1–2 days.</p>
<h3>Myths worth dropping</h3>
<p><strong>Sulfites cause headaches.</strong> Almost certainly not &mdash; dried fruit contains far more sulfites than wine, and red wine (usually blamed) has <em>fewer</em> sulfites than white. Dehydration, histamines, and alcohol itself are the likelier culprits. Sulfites keep wine fresh; without them, most bottles would spoil.</p>
<p><strong>Older is always better.</strong> Over 90% of wine is made to drink within a few years, and most bottles on shelves are already at their peak. Only structured reds, high-acid whites, and fortified wines reliably improve with age &mdash; and they need proper storage (cool, dark, sideways) to do it.</p>
<p><strong>The legs (tears) mean quality.</strong> Legs show alcohol and sugar content, not quality. They&rsquo;re pretty physics &mdash; alcohol evaporating at different rates &mdash; and nothing more.</p>
<p><strong>You must spend a lot for good wine.</strong> The steepest quality jump is from $5 to $15; $15 to $30 buys character and place; beyond $50 you&rsquo;re often paying for rarity, brand, and age rather than deliciousness. An $18 bottle from an unfamous region (Portugal, Sicily, Chile) routinely beats a $40 bottle coasting on a famous name.</p>
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
