// TFT Set 18 "Enchanted Wilds" comp data.
//
// The comps themselves are GENERATED — see tftCompsGenerated.ts and
// `node scripts/fetch-tft-comps.mjs --write`. This file holds what the
// generator cannot know: the trait tables, the display metadata, and the
// glue that turns the generated shape into what the widgets consume.
//
// It used to hold all 27 comps written out by hand, transcribed off the
// tierlist page. Every data bug found in it was a transcription slip — a
// champion called "Sentry" who does not exist, a Rival breakpoint short by one
// step, five comps with no opener — and the ratings went stale within a
// fortnight, which is how an entire S tier came to be listed that the source
// had already deleted. Regenerating is a command now.
//
// Item icons and board positions come from the generated file too: icons from
// the same Community Dragon entry that supplies the item's name, and positions
// from each unit's real slot on the hex grid rather than a guess about what its
// class implies.

import {
  GENERATED_COMPS,
  ITEM_ICONS,
  COMPS_SOURCE_UPDATED,
  type BoardUnit,
  type StageTip,
} from './tftCompsGenerated';

export type { BoardUnit, StageTip };

export const SET_LABEL = 'Set 18 · Enchanted Wilds';
export const SOURCE_URL = 'https://tftacademy.com/tierlist/comps';
export const SOURCE_UPDATED = COMPS_SOURCE_UPDATED;

/** Icon art for an item, or null if the item is not one any comp asks for. */
export function itemIcon(name: string): string | null {
  return ITEM_ICONS[name] ?? null;
}

// ---------------------------------------------------------------------------
// Where each unit stands on the board.
//
// Three bands: front takes the hits, mid is melee, back is damage. Which band a
// unit belongs to is not a property of the unit — the same champion is played
// in different rows by different comps — so a comp's own board is authoritative
// and every unit carries its own position.
//
// unitPosition() exists for the cases with no comp in hand (the drill's reveal,
// a lone chip). It answers with where the 31 comps most often place that unit,
// which beats the hand-written class lists this replaced: those put Sentinel in
// the wrong row and silently dropped Pebbles for not being listed at all.
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
// The Elderwood plants are placed, not bought, so they get their own band
// regardless of where a board puts them.
const PLANTS = new Set(['Stonebark', 'Lifeblossom']);

const POSITION_BY_UNIT: Record<string, Position> = (() => {
  const votes: Record<string, Partial<Record<Position, number>>> = {};
  for (const comp of GENERATED_COMPS) {
    for (const unit of comp.final) {
      if (unit.position === 'flex') continue;
      votes[unit.name] ??= {};
      votes[unit.name][unit.position] = (votes[unit.name][unit.position] ?? 0) + 1;
    }
  }
  const out: Record<string, Position> = {};
  for (const [name, tally] of Object.entries(votes)) {
    out[name] = (Object.entries(tally).sort((a, b) => b[1]! - a[1]!)[0][0] as Position) ?? 'flex';
  }
  return out;
})();

export function unitPosition(name: string): Position {
  if (PLANTS.has(name)) return 'plant';
  return POSITION_BY_UNIT[name] ?? 'flex';
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

export interface Comp {
  name: string;
  tier: Tier;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Conditional';
  style: string;
  carry: string;
  /** The units to hold early, with any items the source wants slammed on them. */
  early: BoardUnit[];
  /** The finished board, in reading order: front line first. */
  final: BoardUnit[];
  /** The source's own stage-by-stage advice. */
  tips: StageTip[];
  /** Free-text note on cores, substitutions and item priority. */
  note?: string;
  /** Item components worth taking off the carousel, in priority order. */
  carousel: string[];
}

const POSITION_RANK: Record<Position, number> = { front: 0, mid: 1, back: 2, plant: 3, flex: 4 };

/** Names only, for the trait maths and the search index. */
export function unitNames(units: BoardUnit[]): string[] {
  return units.map((u) => u.name);
}

export const COMPS: Comp[] = GENERATED_COMPS.map((comp) => ({
  ...comp,
  tier: comp.tier as Tier,
  difficulty: comp.difficulty as Comp['difficulty'],
  // Plants are placed rather than bought, so the generated position is
  // overridden here rather than in the scrape.
  early: comp.early.map((u) => ({ ...u, position: unitPosition(u.name) === 'plant' ? 'plant' : u.position })),
  final: [...comp.final]
    .map((u) => ({ ...u, position: unitPosition(u.name) === 'plant' ? 'plant' : u.position }))
    .sort((a, b) => POSITION_RANK[a.position] - POSITION_RANK[b.position]),
}));
