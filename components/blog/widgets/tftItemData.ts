// TFT item recipes for the Item Combinator widget.
//
// Recipes (which two components make what) and base stats are plain game
// facts, cross-checked against Community Dragon item data. The one-line
// `blurb` on each item is ours, written for the beginner article this
// widget lives in — not copied from any item site.
//
// Icons: full items reuse the repo's ITEM_ICONS (already proven in the comps
// widgets); the eight base components come from Community Dragon, same host.
// `itemIcon()` returns null for anything no comp asks for, so every entry
// carries a `fallbackIcon` that is always used for components and used for
// full items only when ITEM_ICONS has no entry.
//
// Scope: the 36 core component-pair items. Spatula / Frying Pan emblems are
// deliberately out — they change every set, which is why the article gives
// the Pan its own section. If a patch renames an item, update the name here
// and in `recipe` together; the widget derives everything else from this file.

import { itemIcon } from './tftCompData';

// Display names use in-game casing ("Hand of Justice"), which does not always
// match the generated map's keys ("Hand Of Justice") — those entries land on
// the per-row fallback URL, which is why every fallback below is itself a
// verified Community Dragon URL rather than a guess.
function iconFor(name: string, fallback: string): string {
  return itemIcon(name) ?? fallback;
}

export interface ComponentInfo {
  id: string;
  name: string;
  statLine: string;
  icon: string;
}

export interface ItemInfo {
  name: string;
  recipe: [string, string];
  stats: string[];
  blurb: string;
  icon: string;
}

const CD = 'https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore';

export const COMPONENTS: ComponentInfo[] = [
  { id: 'sword', name: 'B.F. Sword', statLine: '10 attack damage', icon: `${CD}/tft_item_bfsword.png` },
  { id: 'bow', name: 'Recurve Bow', statLine: '15% attack speed', icon: `${CD}/tft_item_recurvebow.png` },
  { id: 'rod', name: 'Needlessly Large Rod', statLine: '10 ability power', icon: `${CD}/tft_item_needlesslylargerod.png` },
  { id: 'tear', name: 'Tear of the Goddess', statLine: '15 mana', icon: `${CD}/tft_item_tearofthegoddess.png` },
  { id: 'vest', name: 'Chain Vest', statLine: '20 armor', icon: `${CD}/tft_item_chainvest.png` },
  { id: 'cloak', name: 'Negatron Cloak', statLine: '20 magic resist', icon: `${CD}/tft_item_negatroncloak.png` },
  { id: 'belt', name: "Giant's Belt", statLine: '150 health', icon: `${CD}/tft_item_giantsbelt.png` },
  { id: 'gloves', name: 'Sparring Gloves', statLine: '10% crit chance', icon: `${CD}/tft_item_sparringgloves.png` },
];

export const COMPONENT_IDS = COMPONENTS.map((c) => c.id);

export const componentById = (id: string): ComponentInfo => COMPONENTS.find((c) => c.id === id) ?? COMPONENTS[0]!;

// [name, recipeA, recipeB, stats, blurb, fallbackIcon]
type Row = [string, string, string, string[], string, string];

const ROWS: Row[] = [
  ['Deathblade', 'sword', 'sword', ['50 AD'], 'Pure attack damage that keeps growing with takedowns.', `${CD}/tft_item_deathblade.png`],
  ['Infinity Edge', 'sword', 'gloves', ['35 AD', '35% crit'], 'Lets abilities critically strike — the heart of every crit carry.', `${CD}/tft_item_infinityedge.png`],
  ['Giant Slayer', 'sword', 'bow', ['10 AD', '15% AS', '+dmg'], 'Hits extra hard — and far harder against big healthy tanks.', `${CD}/tft_item_madredsbloodrazor.png`],
  ['Hextech Gunblade', 'sword', 'rod', ['30 AD', '30 AP', 'Omnivamp'], 'Spell damage heals its holder back up.', `${CD}/tft_item_hextechgunblade.png`],
  ['Bloodthirster', 'sword', 'cloak', ['25 AD', '25 MR', 'Omnivamp'], 'Heals on every hit, plus a lifesaving shield when low.', `${CD}/tft_item_bloodthirster.png`],
  ['Spear of Shojin', 'sword', 'tear', ['15 AD', '15 mana'], 'Attacks refill mana fast — the holder casts constantly.', `${CD}/tft_item_spearofshojin.png`],
  ['Edge of Night', 'sword', 'vest', ['15 AD', '20 armor'], 'Hides invisible when the fight starts, then strikes back.', `${CD}/tft_item_guardianangel.png`],
  ["Sterak's Gage", 'sword', 'belt', ['20 AD', '200 HP'], 'Pops a huge shield the moment its holder is nearly dying.', `${CD}/tft_item_steraksgage.png`],
  ['Red Buff', 'bow', 'bow', ['30% AS', 'Burn + wound'], 'Attacks burn and stop enemies healing — anti-heal for hitters.', `${CD}/tft_item_redbuff.png`],
  ['Last Whisper', 'bow', 'gloves', ['15% AS', '10% crit', '+dmg'], 'Cuts enemy armor so your whole team hits harder.', `${CD}/tft_item_lastwhisper.png`],
  ["Guinsoo's Rageblade", 'bow', 'rod', ['30% AS'], 'Attacks faster every single second — and never stops speeding up.', `${CD}/tft_item_guinsoosrageblade.png`],
  ["Kraken's Fury", 'bow', 'cloak', ['15% AS', '20 MR'], 'Every third hit deals huge damage that ignores defenses.', `${CD}/tft_item_krakenslayer.png`],
  ['Void Staff', 'bow', 'tear', ['15% AS', '15 mana'], 'Spells cut straight through enemy magic defense.', `${CD}/tft_item_voidstaff.png`],
  ["Nashor's Tooth", 'bow', 'belt', ['15% AS', '150 HP'], 'Attacks zap extra magic damage on every hit.', `${CD}/tft_item_leviathan.png`],
  ["Titan's Resolve", 'bow', 'vest', ['15% AS', '20 armor'], 'Grows stronger every time its holder fights.', `${CD}/tft_item_titansresolve.png`],
  ["Rabadon's Deathcap", 'rod', 'rod', ['80 AP'], 'An enormous pile of spell power — and then some more.', `${CD}/tft_item_rabadonsdeathcap.png`],
  ['Jeweled Gauntlet', 'rod', 'gloves', ['40 AP', '20% crit'], 'Makes spells able to land critical strikes.', `${CD}/tft_item_jeweledgauntlet.png`],
  ["Archangel's Staff", 'rod', 'tear', ['40 AP', '15 mana'], 'Grows stronger the longer the fight drags on.', `${CD}/tft_item_archangelsstaff.png`],
  ['Morellonomicon', 'rod', 'belt', ['40 AP', '150 HP'], 'Burns enemies and stops them healing back up.', `${CD}/tft_item_morellonomicon.png`],
  ['Ionic Spark', 'rod', 'cloak', ['25 MR', '15 mana'], 'Weakens the magic defense of everyone standing nearby.', `${CD}/tft_item_ionicspark.png`],
  ['Crownguard', 'rod', 'vest', ['30 AP', '20 armor'], 'Starts every single fight wearing a fat shield.', `${CD}/tft_item_crownguard.png`],
  ['Blue Buff', 'tear', 'tear', ['20 AP', '30 mana'], 'Casts its spell again and again, almost without stopping.', `${CD}/tft_item_bluebuff.png`],
  ['Hand of Justice', 'tear', 'gloves', ['15 mana', '10% crit'], 'Flips a coin each fight: bonus damage or bonus spells.', `${CD}/tft_item_unstableconcoction.png`],
  ['Spirit Visage', 'tear', 'belt', ['200 HP', '15 mana'], 'Quietly heals itself through the whole fight.', `${CD}/tft_item_spiritvisagerr.png`],
  ['Adaptive Helm', 'tear', 'cloak', ['20 AP', '20 MR'], 'Softens the first big spell that hits it each fight.', `${CD}/tft_item_adaptivehelm.png`],
  ["Protector's Vow", 'tear', 'vest', ['15 mana', '20 armor'], 'Hands a nearby friend a shield when the fight starts.', `${CD}/tft_item_frozenheart.png`],
  ['Bramble Vest', 'vest', 'vest', ['60 armor'], 'Punishes enemies for daring to hit it back.', `${CD}/tft_item_bramblevest.png`],
  ['Gargoyle Stoneplate', 'vest', 'cloak', ['20 armor', '20 MR'], 'Gets tougher for every enemy ganging up on it.', `${CD}/tft_item_gargoylestoneplate.png`],
  ['Sunfire Cape', 'vest', 'belt', ['25 armor', '200 HP'], 'Burns nearby enemies just by standing next to them.', `${CD}/tft_item_redbuff.png`],
  ['Steadfast Heart', 'vest', 'gloves', ['20 armor', '10% crit'], 'Takes much less damage for as long as it stays healthy.', `${CD}/tft_item_nightharvester.png`],
  ["Dragon's Claw", 'cloak', 'cloak', ['50 MR'], 'Shrugs off magic damage and heals itself over time.', `${CD}/tft_item_dragonsclaw.png`],
  ['Quicksilver', 'gloves', 'cloak', ['20% crit'], 'Blocks the first stun or spell thrown at it, every fight.', `${CD}/tft_item_quicksilver.png`],
  ['Evenshroud', 'cloak', 'belt', ['25 MR', '150 HP'], 'Melts the armor AND magic defense of nearby enemies.', `${CD}/tft_item_spectralgauntlet.png`],
  ["Warmog's Armor", 'belt', 'belt', ['800 HP'], 'A giant pile of health — and then a little more health.', `${CD}/tft_item_warmogsarmor.png`],
  ["Striker's Flail", 'belt', 'gloves', ['150 HP', '10% crit'], 'Smashes straight through enemy shields.', `${CD}/tft_item_powergauntlet.png`],
  ["Thief's Gloves", 'gloves', 'gloves', ['20% crit'], 'Shows up wearing two random borrowed items every fight.', `${CD}/tft_item_thiefsgloves.png`],
];

function toItem([name, a, b, stats, blurb, fallbackIcon]: Row): ItemInfo {
  return { name, recipe: [a, b], stats, blurb, icon: iconFor(name, fallbackIcon) };
}

export const ITEMS: ItemInfo[] = ROWS.map(toItem);

// Every full item buildable from one component — the "what can I make with
// this Sword?" view. Sorted alphabetically so the list is scannable.
export function itemsFromComponent(id: string): ItemInfo[] {
  return ITEMS.filter((it) => it.recipe[0] === id || it.recipe[1] === id).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// The single item two components combine into, regardless of tap order.
// Exact pair equality (not two `includes`) so Sword + Sword can only ever be
// Deathblade, never the first Sword item in the list.
export function combine(a: string, b: string): ItemInfo | null {
  return (
    ITEMS.find((it) => {
      const [x, y] = it.recipe;
      return (x === a && y === b) || (x === b && y === a);
    }) ?? null
  );
}
