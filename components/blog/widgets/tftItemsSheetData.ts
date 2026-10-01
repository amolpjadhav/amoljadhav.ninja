// Holder math behind the items cheat sheet (TftItemsSheet.tsx). Runtime
// imports are type-only, so this file loads anywhere — including the
// node:test suite (see tftItemsSheetData.test.mjs) — with no bundler.

import type { ItemInfo } from './tftItemData';

export type Role = 'Attack' | 'Magic' | 'Tank';
export const ROLES: Role[] = ['Attack', 'Magic', 'Tank'];

// Roles come from the item's own stat line, so an item can belong to several.
// That is honest: Bloodthirster really is both an attack and a survival item.
export function rolesFor(item: Pick<ItemInfo, 'stats'>): Role[] {
  const stats = item.stats.join(' ');
  const roles: Role[] = [];
  if (/AD|AS|crit/i.test(stats)) roles.push('Attack');
  if (/AP|mana/i.test(stats)) roles.push('Magic');
  if (/armor|\bMR\b|HP/i.test(stats)) roles.push('Tank');
  return roles;
}

export interface Holder {
  unit: string;
  comps: number;
  carryComps: number;
}

// Minimal structural view of a comp board — GeneratedComp satisfies this,
// and so do test fixtures.
export interface HolderBoard {
  carry: string;
  early: { name: string; items?: string[] }[];
  final: { name: string; items?: string[] }[];
}

// Item names disagree on casing between sources ("Hand Of Justice" vs "Hand
// of Justice"), so matching lowercases both sides. A unit holding the item
// on two comps counts twice; carries sort first, then raw board count.
export function countHolders(comps: HolderBoard[]): Map<string, Holder[]> {
  const perItem = new Map<string, Map<string, { comps: number; carry: number }>>();
  for (const comp of comps) {
    for (const unit of [...comp.early, ...comp.final]) {
      for (const item of unit.items ?? []) {
        const key = item.toLowerCase();
        let units = perItem.get(key);
        if (!units) {
          units = new Map();
          perItem.set(key, units);
        }
        const entry = units.get(unit.name) ?? { comps: 0, carry: 0 };
        entry.comps += 1;
        if (unit.name === comp.carry) entry.carry += 1;
        units.set(unit.name, entry);
      }
    }
  }
  const out = new Map<string, Holder[]>();
  for (const [key, units] of perItem) {
    out.set(
      key,
      [...units.entries()]
        .map(([unit, e]) => ({ unit, comps: e.comps, carryComps: e.carry }))
        .sort((a, b) => b.carryComps - a.carryComps || b.comps - a.comps),
    );
  }
  return out;
}

export function topHolders(holders: Map<string, Holder[]>, itemName: string): Holder[] {
  return holders.get(itemName.toLowerCase()) ?? [];
}

// ---------------------------------------------------------------------------
// By-champion "why": one honest line per champion, assembled from what the
// game files say (what the ability scales off, how much mana it costs, which
// traits it carries) rather than written by hand — hand-written lines rot
// every patch, these move with the data.
// ---------------------------------------------------------------------------

const TANK_TRAITS = new Set(['Defender', 'Brawler', 'Juggernaut', 'Vanguard']);

export interface ChampLike {
  traits: string[];
  ability: { scales: string[] };
  stats: { mana: number };
}

// Why a SPECIFIC item is good on THIS champion: match the item's stats to
// the champion's needs, and say the match out loud. A Protector's Vow on a
// 150-mana frontliner is about the Tear's mana and the Vest's armor — not
// the shield it hands a friend, which is why a fixed per-item line would lie
// here. Purposes, never numbers, so patches cannot rot a word of this.

type Need = 'mana' | 'ap' | 'ad' | 'tank';

// Stat fragment -> plain word -> which champion need it serves.
const STAT_WORDS: [RegExp, string, Need][] = [
  [/mana/i, 'mana', 'mana'],
  [/AP/i, 'spell power', 'ap'],
  [/\bAD\b/, 'attack damage', 'ad'],
  [/AS/i, 'attack speed', 'ad'],
  [/crit/i, 'crit chance', 'ad'],
  [/armor/i, 'armor', 'tank'],
  [/\bMR\b/, 'magic resist', 'tank'],
  [/HP/i, 'health', 'tank'],
];

// Stat fragments whose purpose needs no champion context to state.
const STAT_EXTRAS: [RegExp, string][] = [
  [/omnivamp/i, 'healing as it fights'],
  [/burn|wound/i, 'burn and anti-heal'],
];

// Fallback purposes for the rare held item whose stats match none of this
// champion's needs — still true, just not tailored.
const ITEM_PURPOSES: Record<string, string> = {
  quicksilver: 'ignores the first stun or spell every fight',
  "thief's gloves": 'shows up wearing two borrowed items every fight',
  crownguard: 'starts every fight behind a fat shield',
  "edge of night": 'dodges the opening burst, then strikes back',
  "sterak's gage": 'pops a huge shield the moment it is nearly dying',
  "adaptive helm": 'softens the first big spell each fight',
  'hand of justice': 'gives a little of everything each fight',
  "protector's vow": 'hands a nearby friend a shield at the start',
};

export interface HeldItem {
  name: string;
  stats: string[];
}

interface Needs {
  mana: boolean;
  ap: boolean;
  ad: boolean;
  tank: boolean;
}

function tailFor(need: Need, mana: number): string {
  switch (need) {
    case 'mana':
      return mana >= 40 ? `to feed the ${mana}-mana cast` : 'to cast sooner';
    case 'ap':
      return 'to scale its spells';
    case 'ad':
      return 'to hit harder';
    case 'tank':
      return 'to live longer up front';
  }
}

function itemClause(item: HeldItem, needs: Needs, mana: number): string | null {
  const stats = item.stats.join(' ');
  const matched: Need[] = [];
  const words: string[] = [];
  for (const [re, word, need] of STAT_WORDS) {
    if (re.test(stats) && needs[need]) {
      if (!matched.includes(need)) matched.push(need);
      if (!words.includes(word)) words.push(word);
    }
  }
  const extras = STAT_EXTRAS.filter(([re]) => re.test(stats)).map(([, text]) => text);
  if (!matched.length && !extras.length) {
    const purpose = ITEM_PURPOSES[item.name.toLowerCase()];
    return purpose ? `${item.name} ${purpose}` : null;
  }
  const why = matched.map((n) => tailFor(n, mana)).join(', ');
  return `${item.name} brings ${[...words, ...extras].join(' and ')} — ${why}`;
}

function emblemLine(item: string): string | null {
  const emblem = item.match(/^(.*) emblem$/i);
  return emblem ? `${item} unlocks ${emblem[1]} just by being held` : null;
}

export function championWhy(ch: ChampLike, topItems: HeldItem[] = []): string {
  const scales = (ch.ability?.scales ?? []).map((s) => s.toUpperCase());
  const ad = scales.includes('AD');
  const ap = scales.includes('AP');
  const tanky = (ch.traits ?? []).some((t) => TANK_TRAITS.has(t));
  const mana = ch.stats?.mana ?? 0;
  const needs: Needs = { mana: mana >= 40, ap, ad, tank: tanky };

  let opener: string;
  if (ad && !ap) {
    opener =
      `Attack scaler${mana >= 40 ? ` with a ${mana}-mana cast` : ''}` +
      `${tanky ? ' up front' : ''} — attack speed and crit are never wasted here.`;
  } else if (ap && !ad) {
    opener =
      `${mana >= 40 ? `Mana-hungry ${mana}-mana caster` : 'Caster'}` +
      `${tanky ? ' sturdy enough to hold the line' : ''} — attack damage does nothing for it.`;
  } else if (tanky) {
    opener = 'Frontline body — damage stats are a luxury here, not the job.';
  } else {
    opener = 'Flexible holder — it takes whatever the comp has left over.';
  }

  const clauses = topItems
    .map((it) => {
      if (!it.stats.length) return emblemLine(it.name) ?? `${it.name} came from an encounter, not the bench — a bonus, not a plan`;
      return itemClause(it, needs, mana);
    })
    .filter((c): c is string => c !== null);
  if (!clauses.length) return opener;
  return `${opener} ${clauses.slice(0, 3).join('; ')}.`;
}
