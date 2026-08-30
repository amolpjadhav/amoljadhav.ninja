// TFT Set 18 "Enchanted Wilds" comp data.
//
// THIS IS THE ONLY FILE TO EDIT WHEN THE META MOVES. The article prose is
// written to stay true regardless of which comps are strong, so a new patch
// means updating PATCH_LABEL and the COMPS array below — nothing else.
//
// Comp ratings are editorial (sourced from tftacademy.com/tierlist/comps) and
// go stale fast; Set 18 launched 26 Aug 2026, so early ratings are volatile.
// Item icons come from Riot's own art via Community Dragon and are stable.
//
// The `early` boards come from tftflow instead, because the tierlist page shows
// openers as icons only. tftflow treats an opener as a named, reusable thing —
// "Blossom", "Coven", "Riftbeast" — that several comps share, and each one has
// a formula (the units it needs) plus an example (formula + filler). What is
// recorded here is the formula, with the opener's name in a trailing comment.
// `node scripts/fetch-tft-openers.mjs` re-reads them all and reports drift.
//
// Note: Riot had not published Set 18 champion portraits to Community Dragon
// at the time of writing, so champions are shown as text chips rather than
// images. If/when portraits land, add an `icon` to the champion rendering.

export const SET_LABEL = 'Set 18 · Enchanted Wilds';
export const PATCH_LABEL = 'Patch 18.1';
export const SOURCE_URL = 'https://tftacademy.com/tierlist/comps';

const HEX = 'https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/';

// Item name -> icon URL. Riot's internal filenames often differ from the
// display name (Giant Slayer is "madredsbloodrazor"), so these are taken
// from the data rather than guessed.
const RAW_ICONS: Record<string, string> = {
  'Adaptive Helm': 'tft_item_adaptivehelm.png',
  "Archangel's Staff": 'tft_item_archangelsstaff.png',
  'Blue Buff': 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/blue_buff.png',
  'Bramble Vest': 'tft_item_bramblevest.png',
  Crownguard: 'tft_item_crownguard.png',
  Deathblade: 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/tft_item_deathblade.png',
  "Dragon's Claw": 'tft_item_dragonsclaw.png',
  'Edge of Night': 'tft_item_guardianangel.png',
  Evenshroud: 'tft_item_spectralgauntlet.png',
  'Gargoyle Stoneplate': 'tft_item_gargoylestoneplate.png',
  'Giant Slayer': 'tft_item_madredsbloodrazor.png',
  "Guinsoo's Rageblade": 'tft_item_guinsoosrageblade.png',
  'Hand of Justice': 'tft_item_unstableconcoction.png',
  'Hextech Gunblade': 'tft_item_hextechgunblade.png',
  'Infinity Edge': 'tft_item_infinityedge.png',
  'Ionic Spark': 'tft_item_ionicspark.png',
  'Jeweled Gauntlet': 'tft_item_jeweledgauntlet.png',
  "Kraken's Fury": 'tft_item_krakenslayer.png',
  'Last Whisper': 'tft_item_lastwhisper.png',
  Morellonomicon: 'tft_item_morellonomicon.png',
  "Nashor's Tooth": 'tft_item_leviathan.png',
  "Protector's Vow": 'tft_item_frozenheart.png',
  Quicksilver: 'tft_item_quicksilver.png',
  "Rabadon's Deathcap": 'tft_item_rabadonsdeathcap.png',
  'Red Buff': 'tft_item_rapidfirecannon.png',
  'Spear of Shojin': 'tft_item_spearofshojin.png',
  'Spirit Visage': 'tft_item_spiritvisagerr.png',
  'Steadfast Heart': 'tft_item_nightharvester.png',
  "Sterak's Gage": 'tft_item_steraksgage.png',
  "Striker's Flail": 'tft_item_powergauntlet.png',
  'Sunfire Cape': 'tft_item_redbuff.png',
  "Tactician's Crown": 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/tacticians_crown.png',
  "Thief's Gloves": 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/thieves_gloves.png',
  "Titan's Resolve": 'tft_item_titansresolve.png',
  'Void Staff': 'tft_item_voidstaff.png',
  "Warmog's Armor": 'tft_item_warmogsarmor.png',
};

// Shorthand players actually type, mapped to the canonical name above.
const ALIASES: Record<string, string> = {
  Rageblade: "Guinsoo's Rageblade",
  Shojin: 'Spear of Shojin',
  "Rabadon's": "Rabadon's Deathcap",
  "Sterak's": "Sterak's Gage",
  "Warmog's": "Warmog's Armor",
  Gargoyle: 'Gargoyle Stoneplate',
  Bramble: 'Bramble Vest',
  "Titan's": "Titan's Resolve",
  "Archangel's": "Archangel's Staff",
  "Nashor's": "Nashor's Tooth",
  Morello: 'Morellonomicon',
  IE: 'Infinity Edge',
};

export function itemIcon(name: string): string | null {
  const key = ALIASES[name] ?? name;
  const v = RAW_ICONS[key];
  if (!v) return null;
  return v.startsWith('http') ? v : HEX + v;
}

// ---------------------------------------------------------------------------
// Where each unit stands on the board.
//
// Three bands, split by what a unit DOES rather than by its class trait:
//
//   front  tanks — soak the damage
//   mid    fighters — melee damage, including magic fighters like Diana
//   back   carries — ranged damage, mages and support
//
// An earlier version derived these from the Set 18 class and got it wrong,
// because Vanguard is not a tank class: Taric and Sentinel are Vanguards who
// hold the front, while Diana and Hecarim are Vanguards who dive and belong
// mid. No single class maps cleanly onto a row, so every unit is listed by
// hand below.
//
// Verified against a real positioning board for Aphelios Vanguards:
// Taric + Sentinel front, Brambleback + Diana + Hecarim mid, Aphelios +
// Mama Beak + Zyra back. The rest follow the same role logic — if one looks
// wrong in game, it is a one-line fix here.
//
// Stonebark and Lifeblossom are not shop units at all — they are plants the
// Elderwood trait gives you to place, so they get their own band.
//
// Anything missing from these lists falls through to `flex`, which the drill
// treats as "not a unit you buy" and drops from its answers. That is a useful
// alarm: five boards used to list a "Sentry", which showed up under Flex here
// and was skipped by compTraits — because no such champion exists. It was
// Pebbles all along. If a champion you recognise renders as Flex, either the
// band list below is missing it or the comp data has its name wrong.
// ---------------------------------------------------------------------------

export type Position = 'front' | 'mid' | 'back' | 'plant' | 'flex';

export const POSITION_META: Record<Position, { icon: string; label: string; hint: string; color: string }> = {
  front: { icon: '🛡', label: 'Front line', hint: 'tanks — soak the damage', color: '#60a5fa' },
  mid: { icon: '⚔', label: 'Midline', hint: 'fighters — melee damage', color: '#fb923c' },
  back: { icon: '🏹', label: 'Back line', hint: 'carries, mages, support', color: '#f472b6' },
  plant: { icon: '🌱', label: 'Plants', hint: 'Elderwood placeables, not shop units', color: '#34d399' },
  flex: { icon: '◇', label: 'Flex', hint: 'place to taste', color: '#94a3b8' },
};

export const POSITION_ORDER: Position[] = ['front', 'mid', 'back', 'plant', 'flex'];

// Tanks. Defenders, Brawlers, Juggernauts and the two Vanguards that really
// do hold the line (Taric, Sentinel).
const FRONT = [
  'Alistar', 'Amumu', 'Elder Dragon', 'Gnar', 'Kobuko', 'Krug', 'Leona', 'Lillia', 'Malphite',
  'Maokai', 'Ornn', 'Rakan', 'Rammus', "Rek'Sai", 'Scuttlecrab', 'Sejuani', 'Sentinel', 'Sett',
  'Shen', 'Taric', 'Vi', 'Yorick',
];

// Melee damage. Ravagers, Adaptors, the Rival assassins, and the diving
// Vanguards — Diana is a magic fighter, not a tank.
const MID = [
  'Akali', 'Brambleback', 'Camille', 'Diana', 'Elise', 'Gromp', 'Hecarim', "Kha'Zix",
  'Master Yi', 'Murkwolf', 'Nidalee', 'Rengar', 'Warwick',
];

// Ranged damage, mages and support. Fiddlesticks is here despite Defender
// because he is played as a backline mage carry.
const BACK = [
  'Ahri', 'Alune', 'Aphelios', 'Ashe', 'Azir', 'Caitlyn', 'Cassiopeia', 'Cinderling',
  'Crimson Raptor', 'Draven', 'Ezreal', 'Fiddlesticks', 'Ivern', 'Karma', 'Kayle', 'Kennen',
  "Kog'Maw", 'Lux', 'LeBlanc', 'Mama Beak', 'Morgana', 'Pebbles', 'Sivir', 'Soraka', 'Teemo',
  'Tristana', 'Varus', 'Veigar', 'Xayah', 'Yunara', 'Zyra',
];

const PLANT = ['Stonebark', 'Lifeblossom'];

const POSITIONS: Record<string, Position> = Object.fromEntries([
  ...FRONT.map((n) => [n, 'front' as Position]),
  ...MID.map((n) => [n, 'mid' as Position]),
  ...BACK.map((n) => [n, 'back' as Position]),
  ...PLANT.map((n) => [n, 'plant' as Position]),
]);

// Anything unrecognised — including deliberate placeholders like
// "5-cost AP flex" — falls through to flex rather than being guessed at.
export function unitPosition(name: string): Position {
  return POSITIONS[name] ?? 'flex';
}

// ---------------------------------------------------------------------------
// Trait synergies, computed from the final board rather than written by hand.
//
// The comps originally carried a free-text `traits` note, but only 12 of 27
// had one and the formats disagreed ("5 Blossom · 2 Defender" vs "Flora
// Fatalis (2) · Blackthorn"). Counting from the board instead means every
// comp gets the same treatment and the numbers cannot drift from the units
// listed above them.
//
// A trait only shows once it reaches its first breakpoint, so a lone
// Elderwood unit does not appear as "Elderwood 1".
// ---------------------------------------------------------------------------

const TRAIT_BREAKPOINTS: Record<string, number[]> = {
  // Origins
  Blackthorn: [2, 4, 6],
  Blossom: [3, 5, 7, 9, 11],
  Coven: [3, 4, 5, 7],
  Elderwood: [3, 5, 7, 9, 11],
  Fae: [2, 4],
  'Flora Fatalis': [1, 2],
  Inferno: [2, 3, 5, 7],
  Lunar: [2, 3, 4, 5],
  Primal: [2, 4],
  Riftbeast: [3, 5, 7, 10],
  // Riot's data has a step at 1 and at 2: fielding both Rivals together is a
  // real upgrade, not just the same bonus twice.
  Rival: [1, 2],
  Solar: [3],
  Sprykin: [3, 5, 7],
  // Classes
  Adaptor: [2, 3, 4],
  Brawler: [2, 4, 6],
  Defender: [2, 4, 6],
  Executioner: [2, 3, 4],
  Hunter: [2, 3, 4, 5],
  Invoker: [2, 3, 4, 5],
  Juggernaut: [2, 4, 6],
  Rapidfire: [2, 3, 4, 5],
  Ravager: [2, 4, 6],
  Spellweaver: [2, 4, 6],
  Summoner: [2, 3],
  Vanguard: [2, 4, 6],
  // Uniques — one champion each
  'Apex Predator': [1],
  Attuned: [1],
  Avatar: [1],
  'Bounty Seeker': [1],
  Caustic: [1],
  'Emerald Aspect': [1],
  Greenfather: [1],
  Monolith: [1],
  'Old Growth': [1],
  Thornmaiden: [1],
};

const CHAMPION_TRAITS: Record<string, string[]> = {
  // 1-cost
  Akali: ['Ravager', 'Inferno', 'Adaptor'],
  Camille: ['Ravager', 'Coven'],
  Cinderling: ['Riftbeast', 'Hunter'],
  Karma: ['Blossom', 'Spellweaver'],
  Kobuko: ['Sprykin', 'Brawler'],
  Leona: ['Solar', 'Defender'],
  Ornn: ['Elderwood', 'Defender'],
  Pebbles: ['Riftbeast', 'Invoker'],
  Rakan: ['Juggernaut', 'Fae', 'Vanguard'],
  "Rek'Sai": ['Brawler', 'Blackthorn'],
  Varus: ['Rapidfire', 'Inferno'],
  Veigar: ['Sprykin', 'Spellweaver', 'Blackthorn'],
  Xayah: ['Elderwood', 'Fae', 'Rapidfire'],
  Yorick: ['Juggernaut', 'Summoner', 'Blossom'],
  // 2-cost
  Alistar: ['Elderwood', 'Brawler'],
  Caitlyn: ['Hunter', 'Coven'],
  Elise: ['Vanguard', 'Coven'],
  Gromp: ['Riftbeast', 'Adaptor'],
  Kayle: ['Solar', 'Rapidfire'],
  LeBlanc: ['Elderwood', 'Spellweaver'],
  Murkwolf: ['Riftbeast', 'Ravager'],
  Scuttlecrab: ['Juggernaut', 'Riftbeast'],
  Sejuani: ['Juggernaut', 'Solar'],
  Shen: ['Inferno', 'Defender'],
  Teemo: ['Sprykin', 'Invoker'],
  Warwick: ['Ravager', 'Blackthorn'],
  Yunara: ['Blossom', 'Executioner'],
  // 3-cost
  Azir: ['Summoner', 'Executioner', 'Blackthorn'],
  Cassiopeia: ['Spellweaver', 'Coven'],
  Diana: ['Lunar', 'Vanguard', 'Ravager'],
  Fiddlesticks: ['Spellweaver', 'Defender', 'Flora Fatalis'],
  Hecarim: ['Elderwood', 'Vanguard'],
  "Kha'Zix": ['Rival'],
  "Kog'Maw": ['Invoker', 'Adaptor', 'Caustic'],
  Krug: ['Riftbeast', 'Brawler'],
  'Mama Beak': ['Summoner', 'Riftbeast', 'Rapidfire'],
  'Master Yi': ['Blossom', 'Adaptor'],
  Rammus: ['Sprykin', 'Defender'],
  Rengar: ['Rival'],
  Tristana: ['Sprykin', 'Fae', 'Hunter'],
  Vi: ['Primal', 'Juggernaut'],
  // 4-cost
  Ahri: ['Blossom', 'Spellweaver'],
  Amumu: ['Juggernaut', 'Inferno'],
  Aphelios: ['Rapidfire', 'Lunar'],
  Brambleback: ['Riftbeast', 'Ravager'],
  Ezreal: ['Elderwood', 'Executioner'],
  Lillia: ['Fae', 'Defender'],
  Malphite: ['Monolith', 'Blackthorn'],
  Morgana: ['Invoker', 'Coven'],
  Nidalee: ['Primal', 'Adaptor'],
  Sentinel: ['Riftbeast', 'Invoker', 'Vanguard'],
  Sett: ['Blossom', 'Brawler'],
  Sivir: ['Primal', 'Hunter'],
  Soraka: ['Executioner', 'Flora Fatalis'],
  Zyra: ['Summoner', 'Thornmaiden'],
  // 5-cost
  Alune: ['Lunar', 'Spellweaver', 'Attuned'],
  Ashe: ['Hunter', 'Blossom'],
  Draven: ['Bounty Seeker'],
  'Elder Dragon': ['Riftbeast', 'Apex Predator'],
  Gnar: ['Sprykin', 'Elderwood', 'Brawler'],
  Ivern: ['Greenfather'],
  Kennen: ['Inferno', 'Executioner'],
  Lux: ['Avatar'],
  Maokai: ['Juggernaut', 'Old Growth'],
  Taric: ['Emerald Aspect', 'Vanguard'],
};

// The comp lists call Mama Beak by its in-game display name in some boards.
const CHAMPION_ALIASES: Record<string, string> = {
  'Crimson Raptor': 'Mama Beak',
};

// Single-champion traits that every copy of that unit brings along. They are
// always "active" and never a reason to pick one board over another, so they
// are left out of the synergy row — same as the tierlist sites do. Rival is
// deliberately not here: it is an origin, and the comps are built around it.
const UNIQUE_TRAITS = new Set([
  'Apex Predator', 'Attuned', 'Avatar', 'Bounty Seeker', 'Caustic', 'Emerald Aspect',
  'Greenfather', 'Monolith', 'Old Growth', 'Thornmaiden',
]);

export interface ActiveTrait {
  name: string;
  count: number;
  /** Index of the highest breakpoint reached — drives the bronze/silver/gold styling. */
  tier: number;
}

/**
 * Traits a single unit brings, resolving the display-name aliases the boards
 * use. Empty for anything that is not a shop champion — the Elderwood plants,
 * and placeholders like "5-cost AP flex" — so callers can just check length.
 */
export function unitTraits(name: string): string[] {
  return CHAMPION_TRAITS[CHAMPION_ALIASES[name] ?? name] ?? [];
}

export function compTraits(units: string[]): ActiveTrait[] {
  const counts: Record<string, number> = {};
  for (const u of units) {
    for (const t of unitTraits(u)) counts[t] = (counts[t] ?? 0) + 1;
  }

  const active: ActiveTrait[] = [];
  for (const [name, count] of Object.entries(counts)) {
    if (UNIQUE_TRAITS.has(name)) continue;
    const breaks = TRAIT_BREAKPOINTS[name];
    if (!breaks) continue;
    const tier = breaks.filter((b) => count >= b).length - 1;
    if (tier < 0) continue; // hasn't reached its first breakpoint
    active.push({ name, count, tier });
  }

  return active.sort((a, b) => b.tier - a.tier || b.count - a.count || a.name.localeCompare(b.name));
}

export type Tier = 'S' | 'A' | 'B' | 'C' | 'X';

export interface ItemSet {
  unit: string;
  items: string[];
}

export interface Comp {
  name: string;
  tier: Tier;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  carry: string;
  tag?: 'Rising' | 'Risky';
  requires?: string;
  early: string[];
  final: string[];
  items: ItemSet[];
  plan?: string;
}

export const COMPS: Comp[] = [
  // ---------- S ----------
  {
    name: 'Aphelios Vanguards',
    tier: 'S',
    difficulty: 'Medium',
    style: '4-cost Fast 8',
    carry: 'Aphelios',
    early: ['Ornn', 'Varus', 'Xayah', 'Shen'],
    final: ['Diana', 'Hecarim', 'Crimson Raptor', 'Zyra', 'Aphelios', 'Brambleback', 'Sentinel', 'Taric'],
    items: [
      { unit: 'Aphelios', items: ['Red Buff', 'Deathblade', 'Giant Slayer'] },
      { unit: 'Brambleback', items: ['Edge of Night', 'Quicksilver', "Sterak's Gage"] },
      { unit: 'Sentinel', items: ["Protector's Vow", "Protector's Vow", "Warmog's Armor"] },
      { unit: 'Crimson Raptor', items: ['Last Whisper'] },
    ],
    plan:
      'True core is Aphelios + Diana + Sentinel + Crimson Raptor ("Mama Beak"). Red Buff is best-in-slot on Aphelios; Rageblade is a fine substitute. Flex slots: Hecarim, Rakan, Scuttlecrab, Zyra, Morgana, Alune.',
  },
  {
    name: 'Spirit Blossom Ahri',
    tier: 'S',
    difficulty: 'Easy',
    style: '4-cost Fast 8',
    carry: 'Ahri',
    early: ['Karma', 'Rakan', 'Yorick', 'Yunara'],
    final: ['Karma', 'Yorick', 'Vi', 'Sivir', 'Zyra', 'Ahri', 'Sett', 'Gnar', 'Ashe'],
    items: [
      { unit: 'Ahri', items: ['Spear of Shojin', 'Jeweled Gauntlet', "Striker's Flail"] },
      { unit: 'Sett', items: ['Bramble Vest', "Dragon's Claw", "Warmog's Armor"] },
      { unit: 'Ashe', items: ['Red Buff', 'Spear of Shojin', 'Last Whisper'] },
    ],
    plan:
      'Stage 2: find 3 Blossom and winstreak, holding items on Karma to transfer to Ahri later. Stage 3: go 5 Blossom plus a Defender. Stage 4: level and roll for Ahri 2 and Sett. You can sit on 7 Blossom for economy before pushing 9.',
  },
  {
    name: 'Malphite / Soraka AP Flex',
    tier: 'S',
    difficulty: 'Medium',
    style: '4-cost Fast 8',
    carry: 'Soraka',
    early: ['Ornn', "Rek'Sai", 'Veigar', 'Alistar', 'LeBlanc'], // Elderwood opener
    final: ['Malphite', 'Soraka', 'Zyra', 'Azir', 'Fiddlesticks', 'Kennen'],
    items: [
      { unit: 'Soraka', items: ["Rabadon's Deathcap", "Nashor's Tooth", 'Adaptive Helm'] },
      { unit: 'Malphite', items: ['Gargoyle Stoneplate', 'Gargoyle Stoneplate', "Warmog's Armor"] },
      { unit: 'Zyra', items: ['Void Staff', 'Spear of Shojin', 'Jeweled Gauntlet'] },
    ],
    plan:
      'Core is Malphite + Azir + 2 Flora Fatalis for the healing. Soraka, Zyra or Ezreal all work as the carry; Lillia, Amumu, Kennen and Maokai all work as frontline. Do not tunnel — flex onto whatever you actually hit.',
  },
  {
    name: 'Defender Cassiopeia',
    tier: 'S',
    difficulty: 'Easy',
    style: '3-cost reroll',
    carry: 'Cassiopeia',
    early: ['Cassiopeia', 'Fiddlesticks'], // Defender Cassiopeia opener
    final: ['Cassiopeia', 'Rammus', 'Fiddlesticks', 'Shen', 'Leona', 'Ornn', 'Lillia', '5-cost AP flex'],
    items: [
      { unit: 'Cassiopeia', items: ['Spear of Shojin', 'Hextech Gunblade', "Archangel's Staff"] },
      { unit: 'Fiddlesticks', items: ["Titan's Resolve", 'Adaptive Helm', 'Crownguard'] },
      { unit: 'Rammus', items: ['Steadfast Heart'] },
      { unit: 'Lillia', items: ["Thief's Gloves"] },
    ],
    plan: 'Roll at 7 for Cassiopeia 2 and Fiddlesticks 2. Stay above 50 gold and slow-roll for the AP carry duo.',
  },
  {
    name: 'Aphelios Elderwood',
    tier: 'S',
    difficulty: 'Medium',
    style: '4-cost Fast 8',
    carry: 'Aphelios',
    tag: 'Rising',
    early: ['Ornn', 'Varus', 'Xayah'],
    final: ['Lifeblossom', 'Stonebark', 'Stonebark', 'Ornn', 'Xayah', 'Alistar', 'Aphelios', 'Gnar', 'Alune'],
    items: [
      { unit: 'Aphelios', items: ['Red Buff', 'Deathblade', 'Giant Slayer'] },
      { unit: 'Alune', items: ['Spear of Shojin', "Rabadon's Deathcap", 'Jeweled Gauntlet'] },
      { unit: 'Hecarim', items: ['Crownguard', "Warmog's Armor", 'Evenshroud'] },
      { unit: 'Gnar / Diana', items: ["Thief's Gloves"] },
    ],
    plan:
      'Build an AD winstreak around the Rapidfire units (Ornn, Varus, Xayah with Red Buff), then hold for 4-costs. Delay going to 9 until most of your 4-costs are 2-star.',
  },

  // ---------- A ----------
  {
    name: 'Cashout Morgana',
    tier: 'A',
    difficulty: 'Hard',
    style: 'Losestreak · Invoker',
    carry: 'Morgana',
    early: ['Kobuko', 'Pebbles', 'Teemo', 'Rammus'],
    final: ['Morgana', 'Sentinel', 'Diana', 'Hecarim', 'Taric', 'Pebbles', 'Alune', 'Brambleback'],
    items: [
      { unit: 'Morgana', items: ['Morellonomicon', "Rabadon's Deathcap", 'Void Staff'] },
      { unit: 'Brambleback', items: ['Giant Slayer', 'Quicksilver'] },
    ],
    plan:
      'Coven cashout wants 250+ essence for Morgana 2 plus item conversion. Roll on 8 for Morgana 2, Sentinel and 4 Invoker. Ahri or Nidalee are the pivot if you lack Brambleback items.',
  },
  {
    name: 'Adaptor Reroll (Master Yi)',
    tier: 'A',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: 'Master Yi',
    early: ['Master Yi', 'Gromp', 'Scuttlecrab', 'Yorick'], // Adaptor Yi opener
    final: ['Sett', 'Krug', 'Vi', 'Yorick', 'Master Yi', "Kog'Maw"],
    items: [
      { unit: 'Master Yi', items: ["Guinsoo's Rageblade", 'Edge of Night', "Titan's Resolve"] },
      { unit: "Kog'Maw", items: ['Spear of Shojin', "Rabadon's Deathcap", 'Jeweled Gauntlet'] },
      { unit: 'Nidalee', items: ["Guinsoo's Rageblade", 'Spear of Shojin', "Rabadon's Deathcap"] },
    ],
    plan:
      'Master Yi opener that winstreaks. Level 7, roll for Yi 2 and Kog 2 plus a Juggernaut tank, then econ and slow-roll for 3-stars. Gains a full tier with an Artifact or a Brawler emblem.',
  },
  {
    name: 'Solar Kayle',
    tier: 'A',
    difficulty: 'Easy',
    style: '2-cost reroll',
    carry: 'Kayle',
    early: ['Kayle', 'Ornn'],
    final: ['Kayle', 'Ornn', 'Xayah', 'Leona', 'Sejuani', 'Rakan', 'Lifeblossom', 'Stonebark', 'Hecarim'],
    items: [
      { unit: 'Kayle', items: ["Guinsoo's Rageblade", "Rabadon's Deathcap"] },
      { unit: 'Xayah', items: ["Guinsoo's Rageblade", 'Red Buff', 'Deathblade'] },
      { unit: 'Ornn', items: ["Warmog's Armor", 'Spirit Visage'] },
    ],
    plan:
      'Open Kayle plus Ornn. Roll at 3-1 to finish a 1-cost 3-star, stay above 50 gold on level 5, level for 2-costs in stage 3, then level for Elderwood in stage 4. Navori Flickerblades is the artifact you want on Kayle.',
  },
  {
    name: 'Riftbeast Reroll (Cinderling)',
    tier: 'A',
    difficulty: 'Easy',
    style: '1-cost reroll',
    carry: 'Cinderling',
    early: ['Cinderling', 'Pebbles'],
    final: ['Cinderling', 'Pebbles', 'Murkwolf', 'Scuttlecrab', 'Krug', 'Sentinel', 'Brambleback'],
    items: [
      { unit: 'Cinderling', items: ['Infinity Edge', 'Blue Buff', 'Last Whisper'] },
      { unit: 'Pebbles', items: ["Rabadon's Deathcap", 'Jeweled Gauntlet'] },
      { unit: 'Krug', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Spirit Visage'] },
      { unit: 'Brambleback', items: ["Thief's Gloves"] },
    ],
    plan:
      'Roll a little on 5 for copies but get to 7 fast for the 7-Riftbeast winstreak. Once the 3-star carry is done, go 8 then 9 and swap Ravagers for Elder Dragon.',
  },
  {
    name: 'Adaptor / Invoker Nidalee',
    tier: 'A',
    difficulty: 'Medium',
    style: '4-cost Fast 8',
    carry: 'Nidalee',
    early: ['Camille', 'Caitlyn', 'Elise', 'Cassiopeia'], // Coven opener
    final: ['Nidalee', 'Morgana', 'Sentinel', 'Taric', 'Scuttlecrab', 'Vi', "Kog'Maw", 'Pebbles'],
    items: [
      { unit: 'Nidalee', items: ['Jeweled Gauntlet', "Guinsoo's Rageblade", "Striker's Flail"] },
      { unit: 'Morgana', items: ['Morellonomicon', "Archangel's Staff", 'Adaptive Helm'] },
      { unit: 'Sentinel', items: ["Protector's Vow", "Warmog's Armor", 'Adaptive Helm'] },
    ],
    plan:
      'Item priority is Nidalee first, then Morellonomicon on Morgana plus a tank, then leftovers. Alpha mark goes on Scuttlecrab; Kog’Maw gives free Sunder and Shred. Level 8 in stage 4 for 4 Invoker. Primal pick: Phoenix if Nidalee is above 50 HP, otherwise Execute.',
  },

  // ---------- B ----------
  {
    name: 'Elderwood Executioners (Draven)',
    tier: 'B',
    difficulty: 'Hard',
    style: 'Fast 9',
    carry: 'Draven',
    early: ['Rengar', "Rek'Sai", 'Alistar', 'Warwick'],
    final: ['Lifeblossom', 'Stonebark', 'Alistar', 'Amumu', 'Draven', 'Ivern', 'Maokai', 'Ezreal'],
    items: [
      { unit: 'Draven', items: ["Kraken's Fury", "Guinsoo's Rageblade", 'Deathblade'] },
      { unit: 'Maokai', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Bramble Vest'] },
      { unit: 'Ezreal', items: ['Spear of Shojin', 'Last Whisper', 'Deathblade'] },
    ],
    plan:
      'Only playable from an early winstreak plus a big gold lead. Fast 7 around 3-3, take losses through mid stage 4, then level 9 at the end of stage 4 or start of stage 5.',
  },
  {
    name: 'Dragon Princess (Elder Dragon)',
    tier: 'B',
    difficulty: 'Hard',
    style: 'Fast 9 · 5-cost',
    carry: 'Elder Dragon',
    early: ['Cinderling', 'Pebbles', 'Yorick', 'Scuttlecrab'],
    final: ['Elder Dragon', 'Amumu', 'Sentinel', 'Morgana', 'Ivern', 'Taric', 'Kennen', 'Maokai'],
    items: [
      { unit: 'Elder Dragon', items: ['Infinity Edge', 'Deathblade', "Striker's Flail"] },
      { unit: 'Morgana', items: ['Void Staff', "Rabadon's Deathcap", 'Jeweled Gauntlet'] },
      { unit: 'Maokai', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Crownguard'] },
      { unit: 'Amumu', items: ["Protector's Vow"] },
      { unit: 'Kennen', items: ["Thief's Gloves"] },
    ],
    plan: 'Slam items, hard winstreak stage 2, econ hard by stage 4, then a 70 gold rolldown into 5-costs.',
  },
  {
    name: 'Caitlyn Hunters',
    tier: 'B',
    difficulty: 'Easy',
    style: '2-cost reroll',
    carry: 'Caitlyn',
    tag: 'Rising',
    early: ['Caitlyn', 'Scuttlecrab', 'Sejuani', 'Cinderling'], // Juggernaut Hunter opener
    final: ['Caitlyn', 'Rakan', 'Sejuani', 'Scuttlecrab', 'Tristana', 'Sivir'],
    items: [
      { unit: 'Caitlyn', items: ["Guinsoo's Rageblade", "Kraken's Fury", "Kraken's Fury"] },
      { unit: 'Scuttlecrab', items: ['Spirit Visage', 'Gargoyle Stoneplate', "Warmog's Armor"] },
      { unit: 'Sivir', items: ['Infinity Edge', 'Last Whisper', 'Red Buff'] },
    ],
    plan:
      'Rageblade plus bows on Caitlyn to winstreak. Level 6 in stage 3, econ above 50 gold and slow-roll, finish your 3-stars mid stage 4, then level for more Hunter.',
  },
  {
    name: 'Pebbles 3 Tempo',
    tier: 'B',
    difficulty: 'Easy',
    style: '1-cost reroll',
    carry: 'Pebbles',
    early: ['Cinderling', 'Pebbles', 'Gromp', 'Murkwolf', 'Scuttlecrab'], // Riftbeast opener
    final: ['Pebbles', 'Scuttlecrab', 'Teemo', "Kog'Maw", 'Morgana', 'Sentinel', 'Ivern', 'Maokai', 'Taric'],
    items: [
      { unit: 'Pebbles', items: ['Blue Buff', "Rabadon's Deathcap", 'Hextech Gunblade'] },
      { unit: 'Sentinel', items: ["Protector's Vow", "Warmog's Armor", 'Adaptive Helm'] },
    ],
    plan:
      'Only play this with 4+ Pebbles copies on stage 2. Finish the 3-star via shop guarantees rather than chasing the whole board. Stage 4: level 8 for 4-cost Invokers, or pivot to Morgana.',
  },
  {
    name: 'Moo Nara (Yunara)',
    tier: 'B',
    difficulty: 'Medium',
    style: '2-cost reroll',
    carry: 'Yunara',
    early: ["Rek'Sai", 'Alistar', 'Yunara', 'Azir'], // Brawler Executioner opener
    final: ['Alistar', 'Yunara', 'Ezreal', 'Azir', 'Gnar', 'Yorick', 'Lifeblossom', 'Sett', "Rek'Sai", 'Stonebark'],
    items: [
      { unit: 'Yunara', items: ['Deathblade', 'Spear of Shojin', "Striker's Flail"] },
      { unit: 'Alistar', items: ['Gargoyle Stoneplate', 'Spirit Visage', "Warmog's Armor"] },
      { unit: 'Ezreal', items: ['Last Whisper', 'Red Buff'] },
    ],
    plan:
      'Needs a lot of early Yunara copies plus sword items. Roll at 3-2 then econ; Azir and Rek’Sai hold level 6 until Sett and Ezreal come online. Biggest spike is 3 Executioner; Kennen caps the board.',
  },
  {
    name: 'Primal Hunters (Sivir)',
    tier: 'B',
    difficulty: 'Medium',
    style: '4-cost Fast 8',
    carry: 'Sivir',
    early: ['Cinderling', 'Gromp', 'Scuttlecrab', 'Yorick'],
    final: ['Tristana', 'Amumu', 'Sivir', 'Ivern', 'Ashe', 'Lillia', 'Vi', 'Shen', 'Kennen'],
    items: [
      { unit: 'Sivir', items: ['Infinity Edge', 'Deathblade', 'Blue Buff'] },
      { unit: 'Ashe', items: ['Spear of Shojin', 'Last Whisper'] },
      { unit: 'Amumu', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Spirit Visage'] },
      { unit: 'Kennen', items: ["Thief's Gloves"] },
    ],
    plan:
      'AD opener off Cinderling and the Riftbeasts, then level 8 in stage 4. You need Sivir — without her the comp falls off hard.',
  },
  {
    name: 'Rengar Reroll',
    tier: 'B',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: 'Rengar',
    tag: 'Risky',
    early: ['Rengar', 'Rakan', 'Xayah'], // Rengar Rapidfire opener
    final: ['Rengar', 'Hecarim', 'Diana', 'Crimson Raptor', 'Sentinel', 'Taric'],
    items: [
      { unit: 'Rengar', items: ['Edge of Night', "Titan's Resolve", "Guinsoo's Rageblade"] },
      { unit: 'Hecarim', items: ["Protector's Vow", 'Sunfire Cape', "Warmog's Armor"] },
      { unit: 'Crimson Raptor', items: ['Last Whisper', "Kraken's Fury", "Guinsoo's Rageblade"] },
      { unit: 'Diana', items: ["Thief's Gloves"] },
    ],
    plan:
      'Only with early Rengar plus items to snowball Rival. Econ to 7 and slow-roll. If you cannot hit Crimson Raptor 3, go the Aphelios duo instead. Rengar has no traits, which makes him very flexible and great with artifacts.',
  },

  // ---------- C ----------
  {
    name: 'Warwick Reroll',
    tier: 'C',
    difficulty: 'Medium',
    style: '2-cost reroll',
    carry: 'Warwick',
    early: ['Warwick', "Rek'Sai"], // Blackthorn Brawler opener
    final: ["Rek'Sai", 'Murkwolf', 'Warwick', 'Azir', 'Krug', 'Brambleback', 'Malphite'],
    items: [
      { unit: 'Warwick', items: ["Sterak's Gage", "Titan's Resolve", 'Spear of Shojin'] },
      { unit: 'Murkwolf', items: ['Deathblade', 'Edge of Night', 'Hand of Justice'] },
      { unit: 'Malphite', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Crownguard'] },
    ],
    plan:
      'Put a 3-star (ideally Krug 3) on the Blackthorn centre hex for max stats. Level 6 in stage 3 and roll for Warwick 2 with 4 Blackthorn and 2 Ravager. Prioritise Shojin early — losestreaking to guarantee it is acceptable. Murkwolf is the backup carry.',
  },
  {
    name: "Lunarwood Kha'Zix",
    tier: 'C',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: "Kha'Zix",
    early: ["Kha'Zix"],
    final: ['LeBlanc', 'Diana', 'Hecarim', "Kha'Zix", 'Ezreal', 'Aphelios', 'Alune'],
    items: [
      { unit: "Kha'Zix", items: ['Hand of Justice', "Rabadon's Deathcap", 'Edge of Night'] },
      { unit: 'Diana', items: ['Jeweled Gauntlet', 'Hand of Justice', 'Ionic Spark'] },
      { unit: 'Hecarim', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Spirit Visage'] },
    ],
    plan:
      "Only with early Kha'Zix plus items to snowball Rival. Takedown priority: Ravager, then Executioner, then Rapidfire, then Spellweaver. Econ to 7 and slow-roll.",
  },
  {
    name: 'Elderwood Executioners (Ezreal)',
    tier: 'C',
    difficulty: 'Medium',
    style: 'Fast 8 into 9',
    carry: 'Ezreal',
    early: ['Xayah'],
    final: ['Ornn', 'Alistar', 'Taric', 'Fiddlesticks', 'Ezreal', 'Soraka', 'Lux', 'Stonebark', 'Gnar', 'Hecarim', 'Lifeblossom'],
    items: [
      { unit: 'Ezreal', items: ['Spear of Shojin', 'Last Whisper', 'Deathblade'] },
      { unit: 'Soraka', items: ['Spear of Shojin', "Rabadon's Deathcap", 'Void Staff'] },
      { unit: 'Lux', items: ['Spear of Shojin'] },
    ],
    plan:
      'Slam AD on Xayah early, then transition to Ezreal. Hit the 3-Executioner spike in stage 3, level 8 in stage 4 while saving to reach 9. The progression path is finding Elderwood Lux.',
  },
  {
    name: 'Sprykin Teemo',
    tier: 'C',
    difficulty: 'Easy',
    style: '2-cost reroll',
    carry: 'Teemo',
    requires: 'Sprykin emblem',
    early: ['Teemo'],
    final: ['Teemo', "Rek'Sai", 'Fiddlesticks', 'Veigar', 'Rammus', "Kog'Maw", 'Kobuko'],
    items: [
      { unit: 'Teemo', items: ['Spear of Shojin', "Rabadon's Deathcap", 'Jeweled Gauntlet'] },
      { unit: "Rek'Sai", items: ['Gargoyle Stoneplate', "Warmog's Armor"] },
      { unit: "Kog'Maw", items: ['Morellonomicon'] },
    ],
    plan:
      'Needs the emblem plus early Teemo copies. Winstreak, item Teemo immediately, level 6 in stage 3, slow-roll above 50 gold, then level for cap. Kobuko gets sacrificed for Rek’Sai stats.',
  },

  // ---------- X ----------
  {
    name: 'Dark Mages (Veigar)',
    tier: 'X',
    difficulty: 'Easy',
    style: '1-cost reroll',
    carry: 'Veigar',
    requires: 'Flora Fatalis emblem augment',
    early: ['Veigar', 'Kobuko', "Rek'Sai"], // Veigar Sprykin opener
    final: ['Veigar', "Rek'Sai", 'Kobuko', 'Rammus', 'Sett', 'Gnar', 'Fiddlesticks', 'Teemo'],
    items: [
      { unit: 'Veigar', items: ['Jeweled Gauntlet', 'Blue Buff'] },
      { unit: "Rek'Sai", items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Gargoyle Stoneplate'] },
    ],
    plan:
      'Roll hard in stage 3 for Veigar 3-star if you already have 7+ copies, then level for Sprykin, Blackthorn and Brawler scaling.',
  },
  {
    name: 'Solar Kayle (Cursed Crown)',
    tier: 'X',
    difficulty: 'Easy',
    style: '2-cost reroll · all 3-star',
    carry: 'Kayle',
    requires: 'Cursed Crown',
    early: ['Kayle', 'Ornn'],
    final: ['Kayle', 'Xayah', 'Ornn', 'Sejuani', 'Leona', 'Rakan', 'Lifeblossom', 'Stonebark'],
    items: [
      { unit: 'Kayle', items: ["Guinsoo's Rageblade", 'Jeweled Gauntlet', "Striker's Flail"] },
      { unit: 'Xayah', items: ["Guinsoo's Rageblade", "Kraken's Fury", 'Deathblade'] },
      { unit: 'Ornn', items: ['Gargoyle Stoneplate', "Warmog's Armor", 'Spirit Visage'] },
    ],
    plan:
      'Cursed Crown lets you chase the 8-unit 3-star Solar bonus. Roll on 5 for 1-costs and 6 for 2-costs, slow-roll above 50 gold in stage 3 prioritising Solar units, and stay level 6 through stage 4 to finish every 3-star.',
  },
  {
    name: "Unrivaled Reroll (Kha'Zix)",
    tier: 'X',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: "Kha'Zix",
    requires: 'Rivals / Unrivaled augment',
    early: ["Kha'Zix", 'Rengar', 'Hecarim', 'LeBlanc'], // Unrivaled opener
    final: ['Hecarim', "Kha'Zix", 'Rengar', 'Lifeblossom', 'Stonebark', 'Diana', 'LeBlanc', 'Ezreal'],
    items: [
      { unit: "Kha'Zix", items: ['Hand of Justice', "Rabadon's Deathcap", 'Edge of Night'] },
      { unit: 'Rengar', items: ['Edge of Night', "Titan's Resolve", "Guinsoo's Rageblade"] },
      { unit: 'Hecarim', items: ["Warmog's Armor", 'Gargoyle Stoneplate', 'Spirit Visage'] },
    ],
    plan:
      'Items are everything here — Edge of Night first. Level 7 in stage 4 and slow-roll above 50 gold. Same takedown order: Ravager, Executioner, Rapidfire, Spellweaver.',
  },
  {
    name: 'Trait Ladder (Fiddlesticks)',
    tier: 'X',
    difficulty: 'Hard',
    style: 'Fast 9',
    carry: 'Fiddlesticks',
    requires: 'Trait Ladder augment',
    early: ["Kha'Zix"],
    final: ['Fiddlesticks', 'Aphelios', 'Xayah', 'LeBlanc', 'Diana', 'Rakan', "Kha'Zix", 'Ornn', 'Stonebark'],
    items: [
      { unit: 'Fiddlesticks', items: ["Warmog's Armor", 'Sunfire Cape', 'Spirit Visage'] },
      { unit: 'Aphelios', items: ["Guinsoo's Rageblade", "Kraken's Fury", 'Last Whisper'] },
    ],
    plan:
      "Open Kha'Zix for 10 takedowns as fast as possible, then add cheap 1- and 2-costs purely to switch traits on. You need exactly 10 traits to trigger the Tactician's Crown. Coronation gives +1 team size. After cashout go 9 and swap to 5-costs — Amumu at 8, Kennen or Draven at 9.",
  },
  {
    name: 'Fae Tristana',
    tier: 'X',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: 'Tristana',
    requires: 'Fae emblem',
    early: ['Tristana', 'Kobuko', 'Rakan'], // Sprykin Tristana opener
    final: ['Rammus', 'Tristana', 'Sivir', 'Vi', 'Lillia', 'Rakan', 'Kobuko'],
    items: [
      { unit: 'Tristana', items: ["Guinsoo's Rageblade", 'Hextech Gunblade', 'Giant Slayer'] },
      { unit: 'Rammus', items: ['Gargoyle Stoneplate', 'Spirit Visage', "Warmog's Armor"] },
      { unit: 'Sivir', items: ['Last Whisper', 'Red Buff'] },
    ],
    plan:
      'Stack 4 Fae as soon as possible for the gold engine. Winstreak with your Rageblade holders, level 7 and roll above 50 gold for Rammus 3 and Tristana 3, funding level pushes with Fae cashouts.',
  },
  {
    name: 'Fae Rengar',
    tier: 'X',
    difficulty: 'Medium',
    style: '3-cost reroll',
    carry: 'Rengar',
    requires: 'Sprykin emblem on Rengar',
    early: [],
    final: ['Kobuko', 'Rammus', 'Rengar', 'Tristana', 'Lillia', 'Sivir', 'Gnar'],
    items: [
      { unit: 'Rengar', items: ['Edge of Night', "Guinsoo's Rageblade"] },
      { unit: 'Rammus', items: ['Gargoyle Stoneplate', 'Spirit Visage', "Warmog's Armor"] },
      { unit: 'Tristana', items: ["Guinsoo's Rageblade", 'Last Whisper', 'Deathblade'] },
    ],
    plan:
      'Position emblem-Rengar to snipe the backline. Level 7 in stage 4 and roll above 50 gold for Rengar 3 and Rammus 3. Same 4-Fae-fast gold rule as the Tristana version.',
  },
];
