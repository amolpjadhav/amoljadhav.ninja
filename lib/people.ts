// Respected-people directory for podcast person search. Editorial by design:
// these are people worth listening to, each with match terms and timeless
// essentials. Aliases must stay distinctive — "Harris" or "Jobs" alone would
// match politics and employment reports, so short aliases are full names or
// unique first names only ("Naval", never "Sam").
//
// Self-contained (no sibling imports): explicit .ts extensions fail tsc,
// extensionless ones fail node --test.
export interface PersonEssential {
  title: string;
  url: string; // verified YouTube watch URL
  note?: string;
}

export type PersonGroup =
  | 'AI'
  | 'Tech & Founders'
  | 'Investing & Markets'
  | 'Science & Health'
  | 'Business & Strategy'
  | 'Ideas & Thinking'
  | 'History & Geopolitics'
  | 'Classic Talks';

export const PERSON_GROUPS: PersonGroup[] = [
  'AI',
  'Tech & Founders',
  'Investing & Markets',
  'Science & Health',
  'Business & Strategy',
  'Ideas & Thinking',
  'History & Geopolitics',
  'Classic Talks',
];

export interface Person {
  id: string; // slug, the ?person= key
  name: string;
  aliases: string[]; // distinctive match terms (see rule above)
  blurb: string; // one line on why they're worth hearing
  group: PersonGroup;
  ownShow: string | null; // show they host, when known
  essentials: PersonEssential[];
}

export const PEOPLE: Person[] = [
  // AI
  { id: 'alexandr-wang', name: 'Alexandr Wang', aliases: ['Alex Wang'], blurb: 'Scale AI founder; data and the AI labs race.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'andrej-karpathy', name: 'Andrej Karpathy', aliases: ['Karpathy'], blurb: 'Ex-Tesla, ex-OpenAI; teaches AI from scratch.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'demis-hassabis', name: 'Demis Hassabis', aliases: ['Hassabis'], blurb: 'Google DeepMind CEO; AlphaGo to Gemini.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'dario-amodei', name: 'Dario Amodei', aliases: ['Amodei'], blurb: 'Anthropic CEO; safe, powerful AI.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'sam-altman', name: 'Sam Altman', aliases: ['Sam Altman', 'Altman'], blurb: 'OpenAI CEO; AGI timelines and deployment.', group: 'AI', ownShow: null, essentials: [{ title: 'Lex Fridman Podcast #367', url: 'https://www.youtube.com/watch?v=L_Guz73e6fw', note: 'GPT-4 era: the famous first interview.' }] },
  { id: 'jensen-huang', name: 'Jensen Huang', aliases: ['Jensen Huang', 'Jensen'], blurb: 'NVIDIA CEO; GPUs, AI factories, and accelerated computing.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'ilya-sutskever', name: 'Ilya Sutskever', aliases: ['Sutskever'], blurb: 'OpenAI cofounder, SSI; deep learning and superintelligence.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'yann-lecun', name: 'Yann LeCun', aliases: ['LeCun'], blurb: 'Meta chief AI scientist; open-weights AI.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'geoffrey-hinton', name: 'Geoffrey Hinton', aliases: ['Geoffrey Hinton', 'Geoff Hinton', 'Hinton'], blurb: 'Godfather of deep learning; why AI keeps him up at night.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'fei-fei-li', name: 'Fei-Fei Li', aliases: [], blurb: 'ImageNet creator; human-centered AI.', group: 'AI', ownShow: null, essentials: [] },
  { id: 'mustafa-suleyman', name: 'Mustafa Suleyman', aliases: [], blurb: 'DeepMind cofounder, Microsoft AI; the coming wave.', group: 'AI', ownShow: null, essentials: [] },
  // Tech & Founders
  { id: 'elon-musk', name: 'Elon Musk', aliases: ['Elon', 'Elon Musk'], blurb: 'SpaceX, Tesla, xAI; Mars, manufacturing, and AI risk.', group: 'Tech & Founders', ownShow: null, essentials: [{ title: 'Joe Rogan Experience #1169', url: 'https://www.youtube.com/watch?v=ycPr5-27vSI', note: 'The 2018 episode that broke the internet.' }] },
  { id: 'satya-nadella', name: 'Satya Nadella', aliases: [], blurb: 'Microsoft CEO; cloud, AI, and culture.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'mark-zuckerberg', name: 'Mark Zuckerberg', aliases: ['Zuckerberg'], blurb: 'Meta founder; social, VR, and open AI.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'patrick-collison', name: 'Patrick Collison', aliases: ['Patrick Collison'], blurb: 'Stripe CEO; progress, science funding, and institutions.', group: 'Tech & Founders', ownShow: null, essentials: [{ title: 'Dwarkesh Podcast: Craft, Beauty & the Future of Payments', url: 'https://www.youtube.com/watch?v=WU-lBOAS1VQ', note: 'Stripe, progress, and craft.' }] },
  { id: 'brian-chesky', name: 'Brian Chesky', aliases: [], blurb: 'Airbnb CEO; design-led companies.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'marc-andreessen', name: 'Marc Andreessen', aliases: ['Marc Andreessen', 'Andreessen'], blurb: 'a16z cofounder; techno-optimism and builders.', group: 'Tech & Founders', ownShow: 'a16z', essentials: [{ title: 'Joe Rogan Experience #2234', url: 'https://www.youtube.com/watch?v=ye8MOfxD5nU', note: 'Tech, power, and building.' }] },
  { id: 'peter-thiel', name: 'Peter Thiel', aliases: [], blurb: 'PayPal, Palantir; contrarian company building.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'palmer-luckey', name: 'Palmer Luckey', aliases: [], blurb: 'Oculus, Anduril; defense tech.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'tobi-lutke', name: 'Tobi Lütke', aliases: ['Tobi Lutke'], blurb: 'Shopify CEO; commerce and craft.', group: 'Tech & Founders', ownShow: null, essentials: [] },
  { id: 'john-carmack', name: 'John Carmack', aliases: ['John Carmack', 'Carmack'], blurb: 'Doom, Quake, Oculus; engines, AGI, and first-principles engineering.', group: 'Tech & Founders', ownShow: null, essentials: [{ title: 'Lex Fridman Podcast #309', url: 'https://www.youtube.com/watch?v=I845O57ZSy4', note: 'Doom to AGI in five hours.' }] },
  { id: 'steve-jobs', name: 'Steve Jobs', aliases: ['Steve Jobs'], blurb: 'Apple cofounder; taste, focus, and saying no.', group: 'Classic Talks', ownShow: null, essentials: [{ title: 'Stanford Commencement Address, 2005', url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc', note: 'Stay hungry, stay foolish — 15 minutes.' }] },
  // Investing & Markets
  { id: 'aswath-damodaran', name: 'Aswath Damodaran', aliases: ['Damodaran'], blurb: 'Valuation professor; intrinsic value.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'naval-ravikant', name: 'Naval Ravikant', aliases: ['Naval', 'Naval Ravikant'], blurb: 'AngelList founder; essays on wealth, leverage, and happiness.', group: 'Investing & Markets', ownShow: 'Naval', essentials: [{ title: 'Joe Rogan Experience #1309', url: 'https://www.youtube.com/watch?v=3qHkcs3kG44', note: 'Wealth, leverage, and happiness in two hours.' }] },
  { id: 'howard-marks', name: 'Howard Marks', aliases: [], blurb: 'Oaktree; risk and market cycles.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'ray-dalio', name: 'Ray Dalio', aliases: [], blurb: 'Bridgewater; principles and debt cycles.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'stanley-druckenmiller', name: 'Stanley Druckenmiller', aliases: ['Druckenmiller'], blurb: 'Macro investor; liquidity and regime change.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'bill-gurley', name: 'Bill Gurley', aliases: [], blurb: 'Benchmark; marketplaces and burn.', group: 'Investing & Markets', ownShow: 'BG2', essentials: [] },
  { id: 'morgan-housel', name: 'Morgan Housel', aliases: [], blurb: 'Psychology of Money; behavior beats math.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'chamath-palihapitiya', name: 'Chamath Palihapitiya', aliases: ['Chamath'], blurb: 'Social Capital; SPACs and tech politics.', group: 'Investing & Markets', ownShow: 'All-In Podcast', essentials: [] },
  { id: 'warren-buffett', name: 'Warren Buffett', aliases: ['Warren Buffett', 'Buffett'], blurb: 'Berkshire Hathaway; value investing and business sense.', group: 'Investing & Markets', ownShow: null, essentials: [] },
  { id: 'charlie-munger', name: 'Charlie Munger', aliases: ['Charlie Munger', 'Munger'], blurb: 'Berkshire vice chairman; mental models and inversion.', group: 'Classic Talks', ownShow: null, essentials: [{ title: 'USC Law Commencement, May 2007 (complete)', url: 'https://www.youtube.com/watch?v=jY1eNlL6NKs', note: 'Inversion and the psychology of misjudgment.' }] },
  // Science & Health
  { id: 'andrew-huberman', name: 'Andrew Huberman', aliases: ['Huberman'], blurb: 'Stanford neuroscientist; protocols for everything.', group: 'Science & Health', ownShow: 'Huberman Lab', essentials: [] },
  { id: 'peter-attia', name: 'Peter Attia', aliases: [], blurb: 'Longevity medicine; lifespan and healthspan.', group: 'Science & Health', ownShow: 'Peter Attia', essentials: [] },
  { id: 'rhonda-patrick', name: 'Rhonda Patrick', aliases: [], blurb: 'Biomedical science, translated.', group: 'Science & Health', ownShow: 'FoundMyFitness', essentials: [] },
  { id: 'matthew-walker', name: 'Matthew Walker', aliases: [], blurb: 'Sleep scientist; why we sleep.', group: 'Science & Health', ownShow: null, essentials: [] },
  { id: 'neil-degrasse-tyson', name: 'Neil deGrasse Tyson', aliases: ['Neil Tyson'], blurb: 'Astrophysicist; the universe, explained.', group: 'Science & Health', ownShow: 'StarTalk', essentials: [] },
  { id: 'sean-carroll', name: 'Sean Carroll', aliases: [], blurb: 'Physicist; cosmology and many worlds.', group: 'Science & Health', ownShow: 'Sean Carroll', essentials: [] },
  { id: 'brian-greene', name: 'Brian Greene', aliases: [], blurb: 'String theory and the fabric of reality.', group: 'Science & Health', ownShow: null, essentials: [] },
  { id: 'david-deutsch', name: 'David Deutsch', aliases: ['David Deutsch', 'Deutsch'], blurb: 'Quantum computing pioneer; explanations and the multiverse.', group: 'Science & Health', ownShow: null, essentials: [] },
  { id: 'richard-feynman', name: 'Richard Feynman', aliases: ['Richard Feynman', 'Feynman'], blurb: 'Physicist and teacher; curiosity as a way of life.', group: 'Classic Talks', ownShow: null, essentials: [{ title: 'The Character of Physical Law (1964), complete', url: 'https://www.youtube.com/watch?v=kEx-gRfuhhk', note: 'Physics as joy — the Cornell Messenger Lectures.' }] },
  // Business & Strategy
  { id: 'ben-thompson', name: 'Ben Thompson', aliases: ['Stratechery'], blurb: 'Stratechery; aggregation theory.', group: 'Business & Strategy', ownShow: null, essentials: [] },
  { id: 'hamilton-helmer', name: 'Hamilton Helmer', aliases: [], blurb: '7 Powers; strategy that lasts.', group: 'Business & Strategy', ownShow: null, essentials: [] },
  { id: 'shreyas-doshi', name: 'Shreyas Doshi', aliases: [], blurb: 'Product sense and stakeholder craft.', group: 'Business & Strategy', ownShow: null, essentials: [] },
  { id: 'keith-rabois', name: 'Keith Rabois', aliases: [], blurb: 'PayPal mafia; hiring bar-raisers.', group: 'Business & Strategy', ownShow: null, essentials: [] },
  { id: 'annie-duke', name: 'Annie Duke', aliases: [], blurb: 'Poker champion; deciding under uncertainty.', group: 'Business & Strategy', ownShow: null, essentials: [] },
  // Ideas & Thinking
  { id: 'nassim-taleb', name: 'Nassim Nicholas Taleb', aliases: ['Nassim Taleb'], blurb: 'Antifragile; skin in the game.', group: 'Ideas & Thinking', ownShow: null, essentials: [] },
  { id: 'yuval-noah-harari', name: 'Yuval Noah Harari', aliases: ['Yuval Harari'], blurb: 'Sapiens; stories that run the world.', group: 'Ideas & Thinking', ownShow: null, essentials: [] },
  { id: 'malcolm-gladwell', name: 'Malcolm Gladwell', aliases: [], blurb: 'Outliers; the overlooked obvious.', group: 'Ideas & Thinking', ownShow: 'Revisionist History', essentials: [] },
  { id: 'adam-grant', name: 'Adam Grant', aliases: [], blurb: 'Organizational psychology; rethinking.', group: 'Ideas & Thinking', ownShow: null, essentials: [] },
  { id: 'tim-ferriss', name: 'Tim Ferriss', aliases: [], blurb: '4-Hour experiments; tools of top performers.', group: 'Ideas & Thinking', ownShow: 'Tim Ferriss', essentials: [] },
  { id: 'daniel-kahneman', name: 'Daniel Kahneman', aliases: ['Daniel Kahneman', 'Kahneman'], blurb: 'Thinking, Fast and Slow; judgment under uncertainty.', group: 'Classic Talks', ownShow: null, essentials: [{ title: 'Lex Fridman Podcast #65', url: 'https://www.youtube.com/watch?v=UwwBG-MbniY', note: 'Biases, happiness, and AI.' }] },
  { id: 'tyler-cowen', name: 'Tyler Cowen', aliases: ['Tyler Cowen', 'Cowen'], blurb: 'Economist; talent, progress, and uncomfortable questions.', group: 'Ideas & Thinking', ownShow: null, essentials: [] },
  { id: 'sam-harris', name: 'Sam Harris', aliases: ['Sam Harris'], blurb: 'Neuroscientist and host; minds, morals, and meditation.', group: 'Ideas & Thinking', ownShow: null, essentials: [{ title: 'Joe Rogan Experience #804', url: 'https://www.youtube.com/watch?v=RJ5_hAEsLkU', note: 'AI, free will, and consciousness.' }] },
  // History & Geopolitics
  { id: 'niall-ferguson', name: 'Niall Ferguson', aliases: [], blurb: 'Historian; empires and money.', group: 'History & Geopolitics', ownShow: null, essentials: [] },
  { id: 'ian-bremmer', name: 'Ian Bremmer', aliases: [], blurb: 'Eurasia Group; geopolitical risk.', group: 'History & Geopolitics', ownShow: null, essentials: [] },
  { id: 'peter-zeihan', name: 'Peter Zeihan', aliases: ['Zeihan'], blurb: 'Geopolitics; demography is destiny.', group: 'History & Geopolitics', ownShow: null, essentials: [] },
  { id: 'dan-carlin', name: 'Dan Carlin', aliases: [], blurb: 'Hardcore History; the past, vividly.', group: 'History & Geopolitics', ownShow: 'Hardcore History', essentials: [] },
];

export function personById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

// Free-text person lookup: exact term matches first, then substring matches
// across names and aliases. One hit resolves; several become picker chips.
export function personByQuery(query: string): Person[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = (p: Person) => [p.name, p.id, ...p.aliases].map((t) => t.toLowerCase());
  const exact = PEOPLE.filter((p) => terms(p).some((t) => t === q));
  if (exact.length > 0) return exact;
  return PEOPLE.filter((p) => terms(p).some((t) => t.includes(q)));
}

function termRegex(term: string): RegExp | null {
  const t = term.trim();
  // Word boundaries keep "Elon" from matching "felon" and "Deutsch" from
  // "Deutsche" — true-crime and history descriptions are full of traps.
  if (!t) return null;
  return new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
}

// Where an episode mentions a person: title (an appearance) vs description
// only (a mention in passing) vs no match.
export function episodeMentions<T extends { title: string; description?: string | null }>(
  ep: T,
  person: Person,
): 'title' | 'description' | null {
  const res = [person.name, ...person.aliases].map(termRegex).filter((r): r is RegExp => r !== null);
  if (res.some((r) => r.test(ep.title))) return 'title';
  const desc = ep.description ?? null;
  if (desc && res.some((r) => r.test(desc))) return 'description';
  return null;
}

export interface PersonStats {
  appearances: number;
  shows: number;
  latest: { show: string; thumb?: string; at: string } | null;
}

// Directory aggregation: all-time appearances, distinct shows, and the
// latest appearance (powers the Active-this-week row) for one person.
export function personStats<
  T extends {
    title: string;
    description?: string | null;
    channelId: string;
    channel: string;
    channelThumb?: string;
    publishedAt: string;
  },
>(episodes: T[], person: Person): PersonStats {
  const matched = matchPersonEpisodes(episodes, person);
  let latest: PersonStats['latest'] = null;
  for (const ep of matched) {
    if (!latest || ep.publishedAt > latest.at) {
      latest = { show: ep.channel, thumb: ep.channelThumb, at: ep.publishedAt };
    }
  }
  return {
    appearances: matched.length,
    shows: new Set(matched.map((ep) => ep.channelId)).size,
    latest,
  };
}

// Matches episodes by guest appearance, title hits before description-only
// mentions. Order within each tier preserved; callers rank by views.
export function matchPersonEpisodes<T extends { title: string; description?: string | null }>(
  episodes: T[],
  person: Person,
): T[] {
  const scored = episodes
    .map((ep) => ({ ep, where: episodeMentions(ep, person) }))
    .filter((s): s is { ep: T; where: 'title' | 'description' } => s.where !== null);
  return [
    ...scored.filter((s) => s.where === 'title'),
    ...scored.filter((s) => s.where === 'description'),
  ].map((s) => s.ep);
}
