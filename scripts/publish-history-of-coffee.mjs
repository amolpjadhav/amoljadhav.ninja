// One-off: publishes "The History of Coffee" (drafted in
// drafts/history-of-coffee.md, reviewed at /preview-history-of-coffee)
// straight into the Supabase blog_posts table.
//
// Usage:
//   node scripts/publish-history-of-coffee.mjs

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

const TITLE = "The History of Coffee: From a Goat Herder's Legend to Your Morning Cup";
const SLUG = 'the-history-of-coffee-from-a-goat-herders-legend-to-your-morning-cup';
const CATEGORY = 'Curiosity';
const EXCERPT =
  "A goat herder's legend, a stolen plant, a smuggler, and the Boston Tea Party — the real, surprisingly dramatic history of coffee, plus the chemistry behind why Arabica tastes smoother than Robusta.";
const READ_TIME = 10;

const QUIZ = [
  {
    question: 'Where does the coffee plant actually originate?',
    options: ['Yemen', 'Ethiopia', 'Brazil', 'Turkey'],
    correctIndex: 1,
    explanation:
      'The coffee plant is native to the forests of western Ethiopia — even though the species is officially named "Arabica."',
  },
  {
    question: 'Why is the coffee species called "Arabica" if it\'s native to Ethiopia?',
    options: [
      'It grows best in the Arabian desert climate',
      'Linnaeus named it after where Europeans got it from (via Yemen), not where it actually originated',
      'It was first roasted in Arabia',
      'Arabica beans are shaped like the Arabian peninsula',
    ],
    correctIndex: 1,
    explanation:
      "It's a nearly 300-year-old geography mix-up: Europe had been getting the plant through Arabia for a century by the time it was formally named, so the name stuck even though the plant is Ethiopian.",
  },
  {
    question: "What's usually credited with making coffee America's default hot drink?",
    options: ['The invention of instant coffee', 'The Boston Tea Party (1773)', 'Coffee vending machines', 'World War II'],
    correctIndex: 1,
    explanation:
      'After colonists dumped British tea into Boston Harbor in 1773, drinking tea looked pro-British — so coffee became the patriotic choice instead.',
  },
  {
    question: "What's the real reason Robusta tastes more bitter and stronger than Arabica?",
    options: [
      'Robusta beans are roasted for longer',
      'Robusta has almost double the caffeine plus more chlorogenic acid, both of which taste bitter',
      'Robusta is grown in worse soil',
      'Robusta beans are picked before they ripen',
    ],
    correctIndex: 1,
    explanation:
      "It's chemistry, not just branding — caffeine itself tastes bitter, and Robusta's extra chlorogenic acid breaks down into sharper compounds when roasted.",
  },
  {
    question: 'Does a darker roast actually have more caffeine than a lighter roast?',
    options: [
      'Yes, dark roast has significantly more caffeine',
      'No — caffeine barely changes with roast level; roasting mainly changes flavor',
      'No, light roast always has more caffeine',
      'Only true for Robusta beans',
    ],
    correctIndex: 1,
    explanation: 'By weight, light, medium, and dark roast all land within a hair of each other — the biggest myth in coffee.',
  },
  {
    question:
      'The plant gifted from Amsterdam to King Louis XIV in 1714 eventually became the ancestor of most Latin American coffee. What is that lineage called?',
    options: ['Typica', 'Robusta', 'Kaldi', 'Mocha Gold'],
    correctIndex: 0,
    explanation:
      "That plant's cutting traveled with Gabriel de Clieu to Martinique in 1723 and became Typica — one of Arabica's two founding varieties.",
  },
];

const JOURNEY_PINS = JSON.stringify([
  { label: 'Ethiopia', lon: 36.2, lat: 7.3, note: '1,000+ years ago' },
  { label: 'Yemen (Mocha)', lon: 43.25, lat: 13.3, note: '~600 years ago' },
  { label: 'Istanbul (Turkey)', lon: 28.98, lat: 41.0, note: '~500 years ago' },
  { label: 'Venice (Italy)', lon: 12.33, lat: 45.44, note: 'early 1600s' },
  { label: 'Vienna (Austria)', lon: 16.37, lat: 48.21, note: '1683' },
  { label: 'Paris (France)', lon: 2.35, lat: 48.86, note: '1689' },
  { label: 'London (England)', lon: -0.13, lat: 51.51, note: '1600s' },
  { label: 'Java (Indonesia)', lon: 106.8, lat: -6.2, note: '1696' },
  { label: 'Martinique (French Caribbean)', lon: -61.0, lat: 14.6, note: '1723' },
  { label: 'Brazil', lon: -43.2, lat: -22.9, note: '1727' },
  { label: 'Boston (United States)', lon: -71.06, lat: 42.36, note: '1773' },
]);

const COFFEE_FAMILY_TREE = JSON.stringify({
  label: 'Coffea',
  note: 'the coffee genus',
  icon: '🌍',
  children: [
    {
      label: 'Coffea arabica',
      color: '#a0785a',
      icon: '🌱',
      note: 'Ethiopia, 1,000+ yrs ago',
      children: [
        { label: 'Typica', color: '#a0785a', icon: '☕', note: 'Amsterdam → Martinique, 1723' },
        { label: 'Bourbon', color: '#a0785a', icon: '☕', note: 'via Réunion Island' },
      ],
    },
    {
      label: 'Coffea canephora',
      color: '#6b3410',
      icon: '🫘',
      note: 'Robusta — Congo Basin, 1890s',
    },
  ],
});

const SPECIES_CAFFEINE = JSON.stringify([
  { label: 'Arabica', value: 1.35, subtext: '~1.2–1.5% caffeine by weight' },
  { label: 'Robusta', value: 2.45, subtext: '~2.2–2.7% caffeine by weight' },
]);

const ROAST_CAFFEINE = JSON.stringify([
  { label: 'Light roast', value: 1.13 },
  { label: 'Medium roast', value: 1.17 },
  { label: 'Dark roast', value: 1.08 },
]);

const CONTENT = `<p>Coffee is one of the most-consumed things on Earth &mdash; in the U.S. alone, 66% of adults drink it every single day, more than any other beverage, including water &mdash; and almost nobody who drinks it knows where it actually came from. The real story runs through a goat herder in Ethiopia, monks in Yemen, coffeehouses that got banned for being <em>too</em> popular, a stolen plant, a smuggler who allegedly seduced a governor&rsquo;s wife, and a naval officer who supposedly shared his own drinking water with a seedling to keep it alive on a ship. Here&rsquo;s how a red cherry from one African forest ended up in most kitchens on the planet.</p>
<div data-widget="world-map" data-eyebrow="Coffee's route around the world" data-caption="Ten stops, roughly in order — the rest of this article walks through each one." data-accent-color="#facc15" data-pins='${JOURNEY_PINS}'></div>

<h3>The legend everyone tells (and can't quite prove)</h3>
<p>The most famous coffee origin story is set more than 1,000 years ago: a goat herder named Kaldi, in the highlands of Ethiopia, noticed his goats getting strangely energetic &mdash; practically dancing &mdash; after eating red cherries off a certain bush. Curious, he tried the cherries himself and felt the same jolt. He brought some to a nearby monastery, where the monks weren&rsquo;t impressed and tossed them in the fire &mdash; and the roasting beans smelled so good that someone fished them back out.</p>
<p>It&rsquo;s a great story. It&rsquo;s also almost certainly not true, or at least not provable &mdash; the tale wasn&rsquo;t written down until 1671, close to a thousand years after it supposedly happened. What historians agree on is the part that matters: the coffee plant really does originate in the forests of western Ethiopia, and people there were almost certainly the first to notice what it did to the body. That plant has a scientific name &mdash; <span style="color:#a0785a;font-weight:700"><em>Coffea arabica</em></span>, or just <span style="color:#a0785a;font-weight:700">Arabica</span> for short &mdash; and it&rsquo;s the species behind nearly every stop in the rest of this story.</p>

<h3>Yemen: where coffee became a drink, not just a plant</h3>
<p>The first solid written evidence of anyone actually cultivating and brewing coffee comes from Yemen, almost 900 years ago, just across the Red Sea from Ethiopia. Sufi Muslim monks there brewed it to stay alert through long nights of prayer &mdash; coffee&rsquo;s first job, essentially, was as a tool for staying awake on purpose.</p>
<p>By around 600 years ago, coffee beans were shipping out from Yemen through one port: Mocha. For a long stretch, Mocha was the <em>only</em> place in the world coffee legally left from, which is why &ldquo;mocha&rdquo; still means coffee today, centuries after the port stopped being the center of anything.</p>

<h3>The Ottoman Empire builds the first coffeehouses</h3>
<p>By about 500 years ago, coffee had reached the Ottoman Empire &mdash; a huge empire based in what&rsquo;s now Turkey, that at its peak stretched across the Middle East, North Africa, and into southeastern Europe. The Ottomans did something nobody had done yet: they built a public place specifically to drink it. The <em>kahvehane</em> &mdash; the coffeehouse &mdash; spread across the empire and became the place to talk politics, listen to music, play games, and argue, all fueled by coffee. It was such a genuine social disruption that rulers periodically tried to shut coffeehouses down, worried people were using them to organize against the government. Coffee survived every ban.</p>

<h3>Coffee crosses into Europe</h3>
<p>Venetian merchants, trading heavily with the Ottomans, brought coffee into Europe in the early 1600s, making Venice (Italy) the first European city with a real coffee scene. From there it spread fast:</p>
<ul>
<li><strong>Vienna (Austria)</strong> got its own coffeehouse culture after the failed Ottoman siege of 1683 &mdash; as the popular telling goes, retreating Ottoman soldiers left behind sacks of unfamiliar green beans, which a local turned into Vienna&rsquo;s first coffeehouse. Like the Kaldi story, this one&rsquo;s more folklore than verified fact, but Vienna&rsquo;s coffeehouse culture from that era was very real and lasted for centuries.</li>
<li><strong>Paris (France)</strong> got Caf&eacute; Procope in 1689, one of the oldest coffeehouses in the world.</li>
<li><strong>London (England)</strong>, through the mid-to-late 1600s, filled up with coffeehouses that charged a penny for a cup and unlimited access to newspapers and conversation &mdash; they were nicknamed &ldquo;penny universities.&rdquo; Two of London&rsquo;s coffeehouses became so central to specific trades that they turned into institutions: Jonathan&rsquo;s Coffee House evolved into the London Stock Exchange, and Edward Lloyd&rsquo;s Coffee House became the insurance market known today as Lloyd&rsquo;s of London.</li>
</ul>

<h3>The plant gets smuggled out of Arabia</h3>
<p>Notice that Europe&rsquo;s coffeehouses, from the last section, were already decades old at this point &mdash; Venice, Vienna, and Paris were all drinking coffee well before anyone outside Arabia could grow it themselves. That&rsquo;s because Europe was only ever getting the finished product. For a long time, Yemen &mdash; conquered by the Ottoman Empire in 1538 and ruled as one of its provinces from then on &mdash; tightly guarded its coffee monopoly, exporting only roasted or boiled beans that couldn&rsquo;t be planted. (The Ottoman Empire wasn&rsquo;t from Yemen; it&rsquo;s the other way around &mdash; the empire, based in what&rsquo;s now Turkey, expanded to take control of Yemen, the way it took control of many other regions.) That monopoly broke once other countries got their hands on a living plant.</p>
<p>The Dutch got there first. Dutch traders obtained coffee seedlings and, by 1696, had them growing on the island of Java (in modern Indonesia) under the Dutch East India Company. Java&rsquo;s coffee did so well that &ldquo;Java&rdquo; became, and still is, a nickname for coffee itself. The Dutch also sent a coffee plant, grown from their Java crop, to a botanical garden in Amsterdam (the Netherlands) in 1706 &mdash; and that single plant is the ancestor of nearly every coffee plant that later reached the Americas.</p>
<p>Here&rsquo;s how: over the next several years, the Amsterdam garden grew new young plants from that original tree&rsquo;s seeds. In 1714, the city gave one of those offspring plants to King Louis XIV of France as a gift. In 1723, a French naval officer named Gabriel de Clieu got a cutting from that royal plant and personally carried it by ship to Martinique, a French island in the Caribbean. The voyage was rough &mdash; storms, a pirate attack, and, as the story goes, a fellow passenger who tried to destroy the seedling out of jealousy. De Clieu is said to have shared his own limited drinking water with the plant to keep it alive. It survived, and within about 50 years, Martinique alone had over 18 million coffee trees, all descended from that one plant &mdash; and that plant became the parent of most of the coffee that would later grow across the Caribbean and Central and South America. This entire lineage even has a name: <strong>Typica</strong>, one of the two founding varieties of <span style="color:#a0785a;font-weight:700">Arabica</span> coffee (the other, Bourbon, spread separately through R&eacute;union Island in the Indian Ocean). Most of the &ldquo;heirloom&rdquo; coffee varieties grown across Latin America today trace straight back to that one plant de Clieu carried across the Atlantic.</p>
<p>That same Amsterdam plant did something else important: it&rsquo;s the reason the species is called <span style="color:#a0785a;font-weight:700">Arabica</span> at all. A French botanist studied a specimen grown from it around 1713&ndash;1715 and mistakenly classified it as a type of jasmine. In 1737, the Swedish scientist Carl Linnaeus &mdash; the same person who invented the naming system all living things are still classified with today &mdash; corrected the mistake and gave the plant its own genus, <em>Coffea</em>, keeping the species name <span style="color:#a0785a;font-weight:700">arabica</span>. He chose that name because Europe had been getting the plant through Arabia (by way of Yemen) for a century by then. The plant is actually native to Ethiopia, not Arabia &mdash; the name is a nearly 300-year-old geography mix-up that just stuck.</p>
<p>Brazil got its coffee a few years later, in 1727, under its own dramatic legend: a Brazilian officer named Francisco de Melo Palheta was sent to French Guiana to settle a border dispute, and &mdash; as the story goes &mdash; left with smuggled coffee seeds hidden in a bouquet, a gift from the French governor&rsquo;s wife. True or not, Brazil took coffee and ran: by the end of the 1800s it had become the world&rsquo;s largest coffee producer, and it still is today.</p>

<h3>Coffee crosses the Atlantic to America</h3>
<p>Coffee reached the American colonies by the 1640s, and coffeehouses followed within a few decades &mdash; Boston (United States) had a real coffeehouse scene by the 1670s, including one called the Green Dragon that later became famous for a very different reason.</p>
<p>Coffee didn&rsquo;t become America&rsquo;s default hot drink through gradual popularity, though &mdash; it happened almost overnight, for political reasons. After the Boston Tea Party in 1773, when colonists dumped a British tea shipment into Boston Harbor to protest taxation, drinking tea started to look like siding with the British, and coffee became the patriotic choice instead. The plotting for the Tea Party itself is said to have happened inside the Green Dragon. Coffee was already cheaper and more available than tea in the colonies before any of this &mdash; but the Tea Party is the moment usually credited with locking in America&rsquo;s coffee habit for good, the same habit behind that 66%-of-adults-daily number from the start of this article.</p>

<h3>The modern era: instant coffee and the "third wave"</h3>
<p>Coffee stayed a slow, hands-on drink for centuries until 1938, when a Nestl&eacute; chemist named Max Morgenthaler cracked a reliable way to make coffee that dissolves straight into hot water &mdash; Nescaf&eacute;, a name built from &ldquo;Nestl&eacute;&rdquo; and &ldquo;caf&eacute;.&rdquo; Instant coffee spread fast, especially through soldiers who needed caffeine without the equipment, during World War II.</p>
<p>More recently, coffee swung back the other way. Starting in the 2000s, a movement often called &ldquo;third wave&rdquo; coffee began treating coffee the way people treat wine &mdash; caring about exactly which farm the beans came from, how they were processed, and how precisely they were brewed &mdash; as a reaction against fast, industrial coffee.</p>
<p>One more thing worth noting: every plant in this entire story, from Ethiopia to Boston, was the same species &mdash; <span style="color:#a0785a;font-weight:700">Arabica</span>. Coffee&rsquo;s other major species, <span style="color:#6b3410;font-weight:700">Robusta</span>, wasn&rsquo;t discovered until the 1890s, in Africa&rsquo;s Congo Basin &mdash; a completely separate story that only later merged into the same cup, as the next section explains.</p>

<hr />

<h3>Types of coffee, untangled</h3>
<p>People use &ldquo;type of coffee&rdquo; to mean four completely different things, and mixing them up is where most coffee confusion comes from. Here&rsquo;s each one, clearly separated.</p>

<p><strong>1. Species &mdash; what plant it came from.</strong></p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Species</th><th>Share of world coffee</th><th>Personality</th><th>Why</th></tr>
</thead>
<tbody>
<tr><td><span style="color:#a0785a;font-weight:700">Arabica</span></td><td>~60&ndash;70%</td><td>Smoother, more aromatic, more acidic; needs cooler, higher-altitude growing conditions</td><td>Almost 2x the sugar and ~50% more natural oils than Robusta &mdash; sugar caramelizes into sweetness when roasted, oil carries aroma and adds a fuller mouthfeel. Evolved in Ethiopia&rsquo;s cooler highlands with fewer pests, so it could &ldquo;spend&rdquo; energy on flavor instead of defense &mdash; the same trade-off that makes it the more fragile plant today</td></tr>
<tr><td><span style="color:#6b3410;font-weight:700">Robusta</span></td><td>~30&ndash;40%</td><td>Stronger, more bitter, higher caffeine; hardier plant, grows at lower altitudes</td><td>Almost 2x the caffeine (bitter on its own), plus more chlorogenic acid, a compound that turns sharper and more bitter when roasted. Evolved in hot, pest-heavy Congo forests, where extra caffeine and bitterness work as a natural pesticide &mdash; the same toughness that lets it grow at lower altitudes today</td></tr>
</tbody>
</table>
</div>
<p>One more thing worth knowing: &ldquo;high acidity&rdquo; in a coffee review doesn&rsquo;t mean sour &mdash; it means bright, lively flavor, the way a squeeze of lemon perks up a dish. Arabica generally has more of this brightness, which is part of what people mean by &ldquo;more complex.&rdquo;</p>
<div data-widget="bar-compare" data-eyebrow="Caffeine by species" data-caption="Robusta packs close to double the caffeine of Arabica — which is exactly why it's a common ingredient in instant coffee and some espresso blends that want a stronger kick." data-value-suffix="%" data-accent-color="#a0785a" data-items='${SPECIES_CAFFEINE}'></div>

<div data-widget="family-tree" data-eyebrow="Coffee's family tree" data-caption="Everything in this article's history section, from Ethiopia to Brazil to Boston, comes from one branch. Robusta is a completely separate species that only joined the picture in the 1890s." data-tree='${COFFEE_FAMILY_TREE}'></div>

<p><strong>2. Processing &mdash; the coffee bean is actually the seed inside the coffee cherry (that red fruit from the start of this article). Processing is how that fruit gets stripped away, before roasting, to get to the bean underneath.</strong></p>
<ul>
<li><strong>Washed:</strong> the cherry is fully stripped off the bean before drying. Cleanest, brightest flavor.</li>
<li><strong>Natural:</strong> the whole cherry dries in the sun with the fruit still on, then gets peeled off after. Bolder, fruitier flavor, since the bean soaks up sugar from the drying fruit.</li>
<li><strong>Honey:</strong> a middle ground &mdash; the outer skin comes off, but the sticky layer of fruit underneath (called mucilage) stays on the bean during drying. Sweet, syrupy result.</li>
</ul>

<p><strong>3. Roast level &mdash; how long and hot the beans get roasted after processing.</strong></p>
<p>This is where the biggest myth in coffee lives: darker roast does <strong>not</strong> mean more caffeine. Roasting barely touches caffeine at all &mdash; what changes is flavor, as sugars caramelize and oils develop.</p>
<div data-widget="bar-compare" data-eyebrow="Caffeine by roast level" data-caption="Nearly flat — by weight, light, medium, and dark roast all land within a hair of each other. The real difference: dark roast beans lose more moisture and weigh less per bean, so a scoop of dark roast has more individual beans in it than the same scoop of light roast — which is the opposite of what most people assume." data-value-suffix="%" data-accent-color="#6b4226" data-items='${ROAST_CAFFEINE}'></div>

<p><strong>4. Drink recipe &mdash; what you actually order at a coffee shop.</strong></p>
<p>Nearly every espresso-based drink is the same two ingredients &mdash; espresso and milk &mdash; in different ratios:</p>
<div style="overflow-x:auto">
<table>
<thead>
<tr><th>Drink</th><th>What's in it</th></tr>
</thead>
<tbody>
<tr><td>Espresso</td><td>Just concentrated coffee &mdash; the base every other drink is built from</td></tr>
<tr><td>Americano</td><td>Espresso + hot water, no milk</td></tr>
<tr><td>Macchiato</td><td>Espresso + a small dollop of milk foam &mdash; the most espresso-forward milk drink</td></tr>
<tr><td>Flat white</td><td>Espresso + steamed milk, roughly 1:1 &mdash; strong and smooth</td></tr>
<tr><td>Cappuccino</td><td>Espresso + steamed milk + milk foam, roughly equal thirds</td></tr>
<tr><td>Latte</td><td>Espresso + a lot of steamed milk (roughly 1 part espresso to 2 parts milk) &mdash; the mildest of the bunch</td></tr>
</tbody>
</table>
</div>

<p>Once you separate these four questions &mdash; species, processing, roast, and drink recipe &mdash; &ldquo;what kind of coffee is this?&rdquo; stops being one confusing question and becomes four simple ones.</p>
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
