// Scrapes the current Set 18 comp list off tftacademy and normalises it into
// the shape components/blog/widgets/tftCompData.ts uses.
//
// WHY THIS EXISTS
// The comp sheet was transcribed by hand from the tierlist page, and every data
// bug found since has been a transcription slip: a champion called "Sentry" who
// does not exist, a Rival breakpoint short by one step, five comps with no
// opener listed. Ratings also drift — the whole S tier can vanish in a fortnight.
// This reads the site's own data instead, so a refresh is a command rather than
// an afternoon.
//
// WHERE THE DATA COMES FROM
// The page itself is a SvelteKit app that renders comps client-side, so its HTML
// is an empty shell and asking a model to read the rendered page produces
// plausible nonsense (it mis-assigned carries when tried). SvelteKit publishes
// the data its own loaders received at <route>/__data.json, which is the exact
// payload the page hydrates from. It arrives in devalue's flat format: an array
// where index 0 is the root and every number is a pointer to another slot, so it
// has to be unflattened before it means anything.
//
// Champion and item IDs are Riot's internal apiNames ("DA_18_Sentry" for
// Pebbles), so display names come from Community Dragon — the same source the
// trait reference already uses, which keeps both halves of the article naming
// units identically.
//
// Board positions come from `boardIndex`, a slot on the 7-wide hex grid, so
// front/mid/back is read off the real board rather than inferred from a unit's
// class. Row 0 is the line nearest the enemy.
//
// Usage:
//   node scripts/fetch-tft-comps.mjs              # human-readable report
//   node scripts/fetch-tft-comps.mjs --json       # normalised JSON on stdout
//   node scripts/fetch-tft-comps.mjs --diff       # what changed vs the current file
//   node scripts/fetch-tft-comps.mjs --write      # regenerate tftCompsGenerated.ts

import { readFileSync, writeFileSync, existsSync } from 'fs';

const COMPS_URL = 'https://tftacademy.com/tierlist/comps/__data.json';
const CDRAGON_URL = 'https://raw.communitydragon.org/latest/cdragon/tft/en_us.json';
const CDRAGON_CACHE = '/tmp/cdragon-tft.json'; // 24MB; cached so reruns are cheap
const SET = 18;
const BOARD_WIDTH = 7;

const mode = process.argv.includes('--json')
  ? 'json'
  : process.argv.includes('--diff')
    ? 'diff'
    : process.argv.includes('--write')
      ? 'write'
      : 'report';
const OUT = new URL('../components/blog/widgets/tftCompsGenerated.ts', import.meta.url);

// ---------------------------------------------------------------------------
// devalue's flat format: values live in one array, numbers are pointers into
// it, and a handful of negative indices stand for undefined/NaN/Infinity.
// ---------------------------------------------------------------------------
const HOLE = Symbol('hole');
function unflatten(flat) {
  const memo = new Map();
  const hydrate = (index) => {
    if (index === -1) return undefined;
    if (index === -2) return HOLE;
    if (index === -3) return NaN;
    if (index === -4) return Infinity;
    if (index === -5) return -Infinity;
    if (index === -6) return -0;
    if (memo.has(index)) return memo.get(index);

    const value = flat[index];
    if (Array.isArray(value)) {
      const [tag] = value;
      if (tag === 'Date') return new Date(value[1]);
      if (tag === 'Set') return value.slice(1).map(hydrate);
      if (tag === 'Map') {
        const pairs = value.slice(1).map(hydrate);
        const out = {};
        for (let i = 0; i < pairs.length; i += 2) out[pairs[i]] = pairs[i + 1];
        return out;
      }
      if (tag === 'BigInt' || tag === 'RegExp') return value[1];
      const arr = [];
      memo.set(index, arr);
      for (const item of value) arr.push(hydrate(item));
      return arr;
    }
    if (value && typeof value === 'object') {
      const obj = {};
      memo.set(index, obj);
      for (const [key, pointer] of Object.entries(value)) obj[key] = hydrate(pointer);
      return obj;
    }
    memo.set(index, value);
    return value;
  };
  return hydrate(0);
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; comp-sheet-refresh/1.0)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function cdragon() {
  if (existsSync(CDRAGON_CACHE)) return JSON.parse(readFileSync(CDRAGON_CACHE, 'utf-8'));
  const data = await getJson(CDRAGON_URL);
  writeFileSync(CDRAGON_CACHE, JSON.stringify(data));
  return data;
}

// ---------------------------------------------------------------------------

const POSITION_BY_ROW = ['front', 'mid', 'mid', 'back'];

function normalise(guide, names) {
  const unit = (u) => ({
    name: names.champion(u.apiName),
    stars: u.stars ?? 1,
    items: (u.items ?? []).map(names.item),
    emblem: u.trait ? names.trait(u.trait) : null,
  });

  const placed = (guide.finalComp ?? [])
    .filter((u) => typeof u.boardIndex === 'number')
    .sort((a, b) => a.boardIndex - b.boardIndex)
    .map((u) => ({
      ...unit(u),
      row: Math.floor(u.boardIndex / BOARD_WIDTH),
      position: POSITION_BY_ROW[Math.floor(u.boardIndex / BOARD_WIDTH)] ?? 'flex',
    }));

  // A unit with no boardIndex is in the list but not placed on the grid.
  const unplaced = (guide.finalComp ?? [])
    .filter((u) => typeof u.boardIndex !== 'number')
    .map((u) => ({ ...unit(u), row: null, position: 'flex' }));

  return {
    title: guide.title,
    slug: guide.compSlug,
    tier: guide.tier,
    style: guide.style,
    difficulty: guide.difficulty,
    carry: names.champion(guide.mainChampion?.apiName),
    early: (guide.earlyComp ?? []).map(unit),
    final: [...placed, ...unplaced],
    maxCap: (guide.maxCap ?? []).map((u) => ({ ...unit(u), replaces: (u.predecessors ?? []).map(names.champion) })),
    carousel: (guide.carousel ?? []).map((c) => names.item(c.apiName)),
    augments: (guide.augments ?? []).filter((a) => !a.disabled).map((a) => names.augment(a.apiName)),
    note: (guide.augmentsTip ?? '').trim(),
    tips: (guide.tips ?? []).map((t) => ({ stage: t.stage, tip: (t.tip ?? '').trim() })),
    updated: guide.updated?.slice(0, 10) ?? null,
  };
}


const DIFFICULTY = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard', CONDITIONAL: 'Conditional' };

// Emits the data file the widgets read. Positions on the final board come from
// boardIndex; an early-board unit has no board slot, so it inherits the row it
// stands in on that comp's own final board, falling back to where the other 30
// comps most often place it. Nothing here is a hand-written class list.
function writeGenerated(comps, iconFor) {
  const votes = new Map();
  for (const c of comps)
    for (const u of c.final)
      if (u.position !== 'flex') {
        const tally = votes.get(u.name) ?? {};
        tally[u.position] = (tally[u.position] ?? 0) + 1;
        votes.set(u.name, tally);
      }
  const commonest = (name) => {
    const tally = votes.get(name);
    if (!tally) return 'flex';
    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  };

  const usedItems = new Set();
  const clean = (u, positionOf) => {
    for (const i of u.items) usedItems.add(i);
    return {
      name: u.name,
      position: positionOf(u),
      ...(u.stars > 1 ? { stars: u.stars } : {}),
      ...(u.items.length ? { items: u.items } : {}),
      ...(u.emblem ? { emblem: u.emblem } : {}),
    };
  };

  const out = comps.map((c) => {
    const onFinal = new Map(c.final.map((u) => [u.name, u.position]));
    return {
      name: c.title,
      tier: c.tier,
      style: c.style,
      difficulty: DIFFICULTY[c.difficulty] ?? 'Medium',
      carry: c.carry,
      early: c.early.map((u) => clean(u, (x) => onFinal.get(x.name) ?? commonest(x.name))),
      final: c.final.map((u) => clean(u, (x) => x.position)),
      tips: c.tips.filter((t) => t.tip),
      ...(c.note ? { note: c.note } : {}),
      carousel: c.carousel,
    };
  });

  const icons = {};
  for (const name of [...usedItems].sort()) if (iconFor.has(name)) icons[name] = iconFor.get(name);
  const missing = [...usedItems].filter((n) => !iconFor.has(n));

  const body = `// GENERATED FILE — do not edit by hand.
//
// Every public Set 18 comp, read off tftacademy's own data layer and named with
// Riot's display names via Community Dragon. Regenerate with:
//
//   node scripts/fetch-tft-comps.mjs --write
//
// Board positions are real: they come from each unit's slot on the hex grid,
// not from a guess about what its class implies. Item icon URLs come from the
// same Community Dragon entry as the item's name, so an item can never be
// listed without art.
//
// Source last updated ${comps.map((c) => c.updated).filter(Boolean).sort().pop()}; generated ${new Date().toISOString().slice(0, 10)}.

import type { Position } from './tftCompData';

export interface BoardUnit {
  name: string;
  position: Position;
  /** Present only when the comp wants the unit above 1-star. */
  stars?: number;
  items?: string[];
  /** A trait emblem the comp wants on this unit. */
  emblem?: string;
}

export interface StageTip {
  stage: string;
  tip: string;
}

export interface GeneratedComp {
  name: string;
  tier: string;
  style: string;
  difficulty: string;
  carry: string;
  early: BoardUnit[];
  final: BoardUnit[];
  tips: StageTip[];
  note?: string;
  carousel: string[];
}

/** Item display name -> icon URL, for every item any comp asks for. */
export const ITEM_ICONS: Record<string, string> = ${JSON.stringify(icons, null, 2)};

export const COMPS_SOURCE_UPDATED = ${JSON.stringify(comps.map((c) => c.updated).filter(Boolean).sort().pop() ?? null)};

export const GENERATED_COMPS: GeneratedComp[] = ${JSON.stringify(out, null, 2)};
`;

  writeFileSync(OUT, body);
  console.log(`Wrote ${out.length} comps to tftCompsGenerated.ts`);
  console.log(`  ${Object.keys(icons).length} item icons; ${missing.length ? `no art for: ${missing.join(', ')}` : 'every item has art'}`);
  const tiers = out.reduce((acc, c) => ({ ...acc, [c.tier]: (acc[c.tier] ?? 0) + 1 }), {});
  console.log(`  tiers: ${Object.entries(tiers).sort().map(([t, n]) => `${t}=${n}`).join(' ')}`);
  console.log(`  comps with an opener: ${out.filter((c) => c.early.length >= 2).length}/${out.length}`);
  console.log(`  comps with stage tips: ${out.filter((c) => c.tips.length).length}/${out.length}`);
  const flex = out.flatMap((c) => c.final.filter((u) => u.position === 'flex').map((u) => `${c.name}: ${u.name}`));
  if (flex.length) console.log(`  unplaced units (no board slot): ${flex.join(', ')}`);
}

async function main() {
  const [payload, cd] = await Promise.all([getJson(COMPS_URL), cdragon()]);

  const node = (payload.nodes ?? []).find((n) => n?.data && JSON.stringify(n.data[0] ?? '').includes('guides'));
  if (!node) throw new Error('No node in the payload carries a `guides` root — the site layout may have changed.');
  const guides = unflatten(node.data).guides ?? [];

  const set = cd.setData.find((s) => s.mutator === `TFTSet${SET}`);
  const champions = new Map(set.champions.map((c) => [c.apiName, c.name]));
  const traits = new Map(set.traits.map((t) => [t.apiName, t.name]));

  // The Elderwood plants and the level-N flex placeholders are on boards but
  // are not shop champions, so Riot's champion list has no entry for them.
  champions.set('DA_Elderwood18_StonebarkTree', 'Stonebark');
  champions.set('DA_Elderwood18_Lifeblossom', 'Lifeblossom');
  for (const lv of [8, 9, 10]) champions.set(`TFT_Flex_Lv${lv}`, `Flex slot (level ${lv})`);

  // Items appear several times over — a base copy, a Corrupted one, an
  // augment-granted one — and the variants sometimes carry a sloppier display
  // name ("Warmogs Armor" for Warmog's Armor). Prefer the plainest apiName so
  // the canonical spelling wins, and keep the icon path while we are here.
  const items = new Map();
  const rank = (apiName) =>
    (/^TFT_Item_[A-Z]/.test(apiName) ? 0 : 2) +
    (/(Corrupted|Free|Encounter|ChoiceItem|Augment)/i.test(apiName) ? 4 : 0);
  for (const it of cd.items) {
    if (!it.apiName || !it.name) continue;
    const held = items.get(it.apiName);
    if (!held) items.set(it.apiName, it);
  }
  const itemName = new Map(); // apiName -> display name
  const iconFor = new Map(); // display name -> icon url
  const byName = new Map(); // display name -> best entry
  // Grouped on the name with punctuation and case stripped, so "Warmogs Armor"
  // and "Warmog's Armor" are recognised as one item and the better-spelled
  // variant supplies the display name.
  const key = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const it of cd.items) {
    if (!it.apiName || !it.name) continue;
    const prev = byName.get(key(it.name));
    if (!prev || rank(it.apiName) < rank(prev.apiName)) byName.set(key(it.name), it);
  }
  for (const it of cd.items) {
    if (!it.apiName || !it.name) continue;
    const best = byName.get(key(it.name)) ?? it;
    if (!itemName.has(it.apiName)) itemName.set(it.apiName, best.name);
    if (best.icon && !iconFor.has(best.name)) {
      iconFor.set(best.name, `https://raw.communitydragon.org/latest/game/${best.icon.toLowerCase().replace(/\.(tex|dds)$/, '.png')}`);
    }
  }

  const unknown = { champion: new Set(), item: new Set(), trait: new Set(), augment: new Set() };
  const lookup = (map, bucket) => (id) => {
    if (!id) return null;
    const hit = map.get(id);
    if (hit) return hit;
    unknown[bucket].add(id);
    // Fall back to a readable guess so a rename does not blank a whole board.
    return id.replace(/^DA_(18_)?/, '').replace(/(18)?(_AD|_AP)?$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  };
  const names = {
    champion: lookup(champions, 'champion'),
    trait: lookup(traits, 'trait'),
    item: lookup(itemName, 'item'),
    augment: lookup(itemName, 'augment'),
  };

  const comps = guides
    .filter((g) => g.set === SET && g.isPublic)
    .map((g) => normalise(g, names))
    .sort((a, b) => a.tier.localeCompare(b.tier) || a.title.localeCompare(b.title));

  if (mode === 'write') {
    writeGenerated(comps, iconFor);
    return;
  }

  if (mode === 'json') {
    process.stdout.write(JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), comps }, null, 2));
    return;
  }

  if (mode === 'diff') {
    diff(comps);
    return;
  }

  console.log(`${comps.length} public Set 18 comps, source last updated ${comps.map((c) => c.updated).sort().pop()}\n`);
  for (const c of comps) {
    console.log(`[${c.tier}] ${c.title}  —  ${c.style}, ${c.difficulty.toLowerCase()}, carry ${c.carry}`);
    const line = (u) =>
      `${u.name}${u.stars > 1 ? ` ${u.stars}★` : ''}${u.emblem ? ` +${u.emblem} emblem` : ''}` +
      (u.items.length ? ` [${u.items.join(', ')}]` : '');
    console.log(`     early : ${c.early.map(line).join(' · ') || '(none)'}`);
    for (const pos of ['front', 'mid', 'back', 'flex']) {
      const units = c.final.filter((u) => u.position === pos);
      if (units.length) console.log(`     ${pos.padEnd(6)}: ${units.map(line).join(' · ')}`);
    }
    for (const t of c.tips) console.log(`     ${t.stage}: ${t.tip}`);
    if (c.note) console.log(`     note  : ${c.note}`);
    console.log();
  }

  for (const [kind, ids] of Object.entries(unknown)) {
    if (ids.size) console.log(`unmapped ${kind} ids (guessed from the id): ${[...ids].join(', ')}`);
  }
}

// Compares the scrape against whatever is in the widget's data file today.
//
// Matched on board composition, not on name. Names are unreliable here: the
// site renamed half the list, and matching on words pairs "Fae Rengar" with
// "Yi Rengar" and swaps the two Kayle comps. Two comps are the same comp if
// they are largely the same eight units, so overlap decides and the name is
// only reported.
function diff(comps) {
  const path = new URL('../components/blog/widgets/tftCompData.ts', import.meta.url);
  const src = readFileSync(path, 'utf-8');
  const body = src.slice(src.indexOf('export const COMPS'));

  const mine = [];
  for (const block of body.split(/\n {2}\{\n/).slice(1)) {
    const name = block.match(/name: '([^']*)'/)?.[1] ?? block.match(/name: "([^"]*)"/)?.[1];
    if (!name) continue;
    const list = (key) =>
      (block.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))?.[1] ?? '')
        .split(',')
        .map((u) => u.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    mine.push({
      name,
      tier: block.match(/tier: '([^']+)'/)?.[1],
      carry: block.match(/carry: '([^']+)'/)?.[1],
      units: new Set(list('final')),
    });
  }

  const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Share of the larger board. Dividing by the smaller one let two of our
  // aliases for the same unit (Crimson Raptor / Mama Beak) push it over 100%.
  const overlap = (a, b) => {
    const matched = new Set();
    for (const u of a) for (const v of b) if (norm(u) === norm(v)) matched.add(norm(v));
    return matched.size / Math.max(1, a.size, b.size);
  };

  const theirs = comps.map((c) => ({ ...c, units: new Set(c.final.map((u) => u.name)) }));
  const taken = new Set();
  const rows = [];

  // Strongest pairings first, so a clear match is never stolen by a weak one.
  const candidates = [];
  for (const a of mine)
    for (const b of theirs)
      candidates.push({
        a,
        b,
        overlap: overlap(a.units, b.units),
        // The carry breaks ties between boards that overlap equally; it is not
        // part of the reported percentage.
        score: overlap(a.units, b.units) + (norm(a.carry) === norm(b.carry) ? 0.15 : 0),
      });
  candidates.sort((x, y) => y.score - x.score);

  const pairedMine = new Set();
  for (const { a, b, overlap: shared } of candidates) {
    if (pairedMine.has(a.name) || taken.has(b.title)) continue;
    if (shared < 0.6) continue; // below 60% of the larger board it is a different comp
    pairedMine.add(a.name);
    taken.add(b.title);
    rows.push({ a, b, shared });
  }

  console.log(`ours: ${mine.length} comps · source: ${theirs.length} comps\n`);

  const changed = rows.filter((r) => r.a.tier !== r.b.tier || r.a.name !== r.b.title);
  console.log(`SAME COMP, CHANGED (${changed.length})`);
  for (const { a, b, shared } of changed) {
    const tier = a.tier === b.tier ? `${a.tier} unchanged` : `${a.tier} → ${b.tier}`;
    const rename = a.name === b.title ? '' : `  renamed "${b.title}"`;
    console.log(`  ${tier.padEnd(14)} ${a.name}${rename}   (${Math.round(shared * 100)}% same board)`);
  }

  const held = rows.filter((r) => r.a.tier === r.b.tier && r.a.name === r.b.title);
  if (held.length) console.log(`\nUNCHANGED (${held.length})\n  ${held.map((r) => r.a.name).join(', ')}`);

  const dropped = mine.filter((a) => !pairedMine.has(a.name));
  console.log(`\nNO LONGER LISTED (${dropped.length})`);
  for (const a of dropped) console.log(`  [${a.tier}] ${a.name}`);

  const added = theirs.filter((b) => !taken.has(b.title));
  console.log(`\nNEW (${added.length})`);
  for (const b of added) console.log(`  [${b.tier}] ${b.title}  —  ${b.style}, carry ${b.carry}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
