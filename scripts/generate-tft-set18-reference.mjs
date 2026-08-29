// Generates components/blog/widgets/tftReferenceData.ts — every Set 18 trait
// and champion, with Riot's own wording for what each one does.
//
// Source is Community Dragon's aggregated TFT data, which is Riot's shipped
// text rather than a community write-up, so nothing here is editorial and
// nothing here needs a human to re-check when a patch lands: re-run the script.
//
// Usage:
//   node scripts/generate-tft-set18-reference.mjs

import { writeFileSync } from 'fs';

const DATA_URL = 'https://raw.communitydragon.org/latest/cdragon/tft/en_us.json';
const OUT = new URL('../components/blog/widgets/tftReferenceData.ts', import.meta.url);

// Riot ships no origin/class split, so it comes from the grouping the comp
// sheet already uses. Anything not listed is a unique — one champion's own
// trait — which the script cross-checks against the champion count below.
const ORIGINS = [
  'Blackthorn', 'Blossom', 'Coven', 'Elderwood', 'Fae', 'Flora Fatalis', 'Inferno',
  'Lunar', 'Primal', 'Riftbeast', 'Rival', 'Solar', 'Sprykin',
];
const CLASSES = [
  'Adaptor', 'Brawler', 'Defender', 'Executioner', 'Hunter', 'Invoker', 'Juggernaut',
  'Rapidfire', 'Ravager', 'Spellweaver', 'Summoner', 'Vanguard',
];

// %i:scaleAD% and friends say which stat a value scales off, and that is the
// part that tells you whether an ability wants AD or AP items.
const SCALE_WORDS = {
  scaleAD: 'AD',
  scaleAP: 'AP',
  scaleAS: 'attack speed',
  scaleArmor: 'armor',
  scaleMR: 'magic resist',
  scaleHealth: 'health',
  scaleMana: 'mana',
  scaleManaRegen: 'mana regen',
  scaleCrit: 'crit',
};

// Trait values are keyed by a hash of the variable name rather than the name
// itself, which is why they look unresolvable at first glance. The hash is
// FNV-1a over the lowercased name, so every one of them can be matched back to
// a name lifted out of the description text.
function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function varNames(desc) {
  return [...new Set([...(desc ?? '').matchAll(/@([A-Za-z0-9_]+?)(?:\*100)?@/g)].map((m) => m[1]))];
}

function resolveVars(effect, names) {
  const out = {};
  for (const [key, value] of Object.entries(effect?.variables ?? {})) {
    if (!key.startsWith('{')) {
      out[key.toLowerCase()] = value;
      continue;
    }
    const hex = key.slice(1, -1);
    const hit = names.find((n) => fnv1a32(n.toLowerCase()) === hex);
    if (hit) out[hit.toLowerCase()] = value;
  }
  return out;
}

const num = (v) => {
  const rounded = Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  return String(rounded);
};

// A trait value below 1 is a fraction of something — 0.18 max Health, 0.5 of a
// Health bar — and reads as a percentage. At or above 1 it is a flat amount or
// a duration and stands as it is.
const fmt = (v, scaled) => (scaled ? num(v * 100) : Math.abs(v) < 1 && v !== 0 ? `${num(v * 100)}%` : num(v));

function clean(raw, vars) {
  if (!raw) return '';
  let s = raw
    .replace(/\r\\n|\r\n|\\n/g, '\n')
    .replace(/%i:(\w+)%/g, (_, k) => SCALE_WORDS[k] ?? '');

  if (vars) {
    s = s
      .replace(/@([A-Za-z0-9_]+)\*100@/g, (m, name) => {
        const v = vars[name.toLowerCase()];
        return v === undefined ? '…' : fmt(v, true);
      })
      .replace(/@([A-Za-z0-9_]+)@/g, (m, name) => {
        const v = vars[name.toLowerCase()];
        return v === undefined ? '…' : fmt(v, false);
      });
  }

  return s
    .replace(/@[^@]+@%/g, '…')
    .replace(/@[^@]+@/g, '…')
    .replace(/…(\s*\/\s*…)+/g, '…')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+/g, ' ')
        .replace(/ ([.,;:%])/g, '$1')
        .replace(/…%/g, '…')
        .replace(/\( *\)/g, '')
        .trim()
    )
    .filter(Boolean)
    .join('\n')
    .trim();
}

// Abilities are written as an optional "Passive:" block, an "Active:" block,
// and sometimes a trailing "<Colour> Buff:" clause — the bonus a Riftbeast gets
// from the Alpha Mark. Splitting them is what makes "what does this unit
// actually do" readable.
//
// Three things have to come out before the split, or they end up welded to the
// wrong part: <rules> blocks, which explain a keyword rather than the ability
// (Sentinel's "Mana Reave: increase the Mana cost of the next Ability cast");
// {Augment.Variant...} template references, which are a pointer to other text
// and not text; and the scale icons, which pile up unreadably when an ability
// scales off two stats at once ("%i:scaleAP%%i:scaleHealth%"). The scales are
// worth keeping — they are what marks a unit as a mage or a carry — so they are
// collected into a list instead of left inline.
function splitAbility(raw) {
  if (!raw) return { active: '', scales: [] };

  const notes = [...raw.matchAll(/<rules>([\s\S]*?)<\/rules>/g)].map((m) => clean(m[1], null)).filter(Boolean);
  const scales = [];
  const stripped = raw
    .replace(/<rules>[\s\S]*?<\/rules>/g, '')
    .replace(/\{[A-Za-z0-9_.]+\}/g, '')
    .replace(/%i:(\w+)%/g, (_, k) => {
      const word = SCALE_WORDS[k];
      if (word && !scales.includes(word)) scales.push(word);
      return '';
    });

  const text = clean(stripped, null);
  const buffMatch = text.match(/^(\w+ Buff):\s*([\s\S]+)$/m);
  const buff = buffMatch ? { label: buffMatch[1], text: buffMatch[2].trim() } : undefined;
  const body = buffMatch ? text.slice(0, buffMatch.index).trim() : text;

  const passiveAt = body.search(/^Passive:/im);
  const activeAt = body.search(/^Active:/im);
  const extras = { scales, ...(notes.length ? { notes } : {}), ...(buff ? { buff } : {}) };

  if (passiveAt === -1 && activeAt === -1) return { active: body, ...extras };

  const parts = { active: '' };
  if (passiveAt !== -1) {
    const end = activeAt > passiveAt ? activeAt : body.length;
    parts.passive = body.slice(passiveAt, end).replace(/^Passive:\s*/i, '').trim();
  }
  if (activeAt !== -1) {
    const end = passiveAt > activeAt ? passiveAt : body.length;
    parts.active = body.slice(activeAt, end).replace(/^Active:\s*/i, '').trim();
  }
  return { ...parts, ...extras };
}

// Trait text is one <row> per breakpoint, each opening with (@MinUnits@), and
// the rows line up with the effects array in order — which is where the real
// numbers come from. Several traits also open with a line that applies at every
// breakpoint (Elderwood's "Gain placeable Elderwood plants."); dropping it
// leaves the rows reading as sentence fragments.
function traitRows(trait) {
  const desc = trait.desc ?? '';
  const names = varNames(desc);
  const rows = [...desc.matchAll(/<(?:expandRow|row)>([\s\S]*?)<\/(?:expandRow|row)>/g)].map((m) => m[1]);
  const breakpoints = trait.effects.map((e) => e.minUnits);

  if (!rows.length) {
    return {
      intro: '',
      breakpoints,
      rows: [{ at: breakpoints[0] ?? 1, text: clean(desc, resolveVars(trait.effects[0], names)) }],
    };
  }

  const firstRow = desc.indexOf('<row>');
  return {
    // The intro's values are the same at every breakpoint — anything that
    // scales lives in a row — so the first effect resolves it.
    intro: clean(desc.slice(0, firstRow), resolveVars(trait.effects[0], names)),
    breakpoints,
    rows: rows.map((text, i) => ({
      at: breakpoints[i] ?? breakpoints[breakpoints.length - 1],
      // `at` already carries the count, so the row's own marker is noise.
      text: clean(text.replace(/^\s*\(@MinUnits@\)\s*/, ''), resolveVars(trait.effects[i], names)),
    })),
  };
}

async function main() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching Community Dragon`);
  const data = await res.json();

  const set = data.setData.find((s) => s.mutator === 'TFTSet18');
  if (!set) throw new Error('No TFTSet18 entry in the Community Dragon data.');

  // DA_ is Set 18's own prefix. Everything else at these costs is a neutral
  // round monster (TFT_Krug, TFT_Razorbeak) that shares a name with a real
  // unit, and the Lux variants are one champion listed once per origin.
  const champions = set.champions
    .filter((c) => c.apiName.startsWith('DA_') && c.cost >= 1 && c.cost <= 5 && !/^Lux \(/.test(c.name))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
    .map((c) => ({
      name: c.name,
      cost: c.cost,
      traits: c.traits,
      ability: { name: c.ability?.name ?? '', ...splitAbility(c.ability?.desc) },
      stats: {
        hp: Math.round(c.stats.hp ?? 0),
        damage: Math.round(c.stats.damage ?? 0),
        armor: Math.round(c.stats.armor ?? 0),
        magicResist: Math.round(c.stats.magicResist ?? 0),
        mana: Math.round(c.stats.mana ?? 0),
        range: Math.round(c.stats.range ?? 0),
        attackSpeed: Number((c.stats.attackSpeed ?? 0).toFixed(2)),
      },
    }));

  const traits = set.traits
    .map((t) => ({
      name: t.name,
      kind: ORIGINS.includes(t.name) ? 'origin' : CLASSES.includes(t.name) ? 'class' : 'unique',
      champions: champions.filter((c) => c.traits.includes(t.name)).map((c) => c.name),
      ...traitRows(t),
    }))
    .filter((t) => t.champions.length)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Sanity checks. A unique with more than one champion, or a listed
  // origin/class with exactly one, means the grouping above has gone stale.
  for (const t of traits) {
    if (t.kind === 'unique' && t.champions.length > 1) {
      console.log(`  note: "${t.name}" is treated as a unique but has ${t.champions.length} champions.`);
    }
    if (t.kind !== 'unique' && t.champions.length === 1) {
      console.log(`  note: "${t.name}" is grouped as a ${t.kind} but only one champion has it.`);
    }
  }

  const unresolved = traits.filter((t) => [t.intro, ...t.rows.map((r) => r.text)].join(' ').includes('…'));
  const body = `// GENERATED FILE — do not edit by hand.
//
// Every Set 18 trait and champion, straight from Riot's shipped text via
// Community Dragon. Regenerate with:
//
//   node scripts/generate-tft-set18-reference.mjs
//
// Trait numbers are real: the source hashes their variable names, and the
// generator matches the hashes back. Champion ability numbers are not — the
// feed ships them empty for all but a handful of units — so those values read
// as an ellipsis. Ability numbers move every patch anyway; the mechanics do
// not, and the mechanics are the reason this file exists.
//
// Generated ${new Date().toISOString().slice(0, 10)} from ${DATA_URL}

export type TraitKind = 'origin' | 'class' | 'unique';

export interface TraitRow {
  /** Champion count this row switches on at. */
  at: number;
  text: string;
}

export interface TraitInfo {
  name: string;
  kind: TraitKind;
  breakpoints: number[];
  /** Text that applies at every breakpoint, printed above the rows. */
  intro: string;
  rows: TraitRow[];
  champions: string[];
}

export interface ChampionAbility {
  name: string;
  passive?: string;
  active: string;
  /** Stats the ability's values scale off — AP, AD, health and so on. */
  scales: string[];
  /** The bonus this unit gets from a Riftbeast Alpha Mark, where it has one. */
  buff?: { label: string; text: string };
  /** Riot's own explanation of a keyword the ability uses. */
  notes?: string[];
}

export interface ChampionInfo {
  name: string;
  cost: number;
  traits: string[];
  ability: ChampionAbility;
  stats: {
    hp: number;
    damage: number;
    armor: number;
    magicResist: number;
    mana: number;
    range: number;
    attackSpeed: number;
  };
}

export const TRAITS: TraitInfo[] = ${JSON.stringify(traits, null, 2)};

export const CHAMPIONS: ChampionInfo[] = ${JSON.stringify(champions, null, 2)};
`;

  writeFileSync(OUT, body);
  console.log(`Wrote ${traits.length} traits and ${champions.length} champions to tftReferenceData.ts`);
  console.log(`  ${champions.filter((c) => c.ability.passive).length} champions have a passive`);
  console.log(`  ${unresolved.length} traits still carry an unresolved value: ${unresolved.map((t) => t.name).join(', ') || 'none'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
