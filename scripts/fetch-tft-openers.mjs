// Pulls early-game openers for Set 18 comps off tftflow and reports how they
// line up with the `early` arrays in components/blog/widgets/tftCompData.ts.
//
// Why this exists: the comp sheet's early-game rows were thin — 5 comps had no
// opener at all and 12 listed a single unit — and the tierlist page the rest of
// the data came from shows openers as icons only, so there was nothing to read
// off it. tftflow renders its opener boards into the HTML, so they can be read
// exactly rather than eyeballed.
//
// This only PRINTS a report. It never edits the data file: the comp names on
// the two sites differ, so matching is a judgement call and belongs with a
// human. Re-run it when the meta moves to see which openers have changed.
//
// Usage:
//   node scripts/fetch-tft-openers.mjs            # all comps
//   node scripts/fetch-tft-openers.mjs caitlyn    # only slugs matching a term

import { readFileSync } from 'fs';

const INDEX_URL = 'https://tftflow.com/composition/set18';
const BASE = 'https://tftflow.com';
const DELAY_MS = 400; // be polite to someone else's server

const filter = process.argv[2]?.toLowerCase();

async function getPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; comp-sheet-check/1.0)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

function slugsFromIndex(html) {
  const found = new Map();
  for (const m of html.matchAll(/href="(?:https:\/\/tftflow\.com)?(\/composition\/set18\/([a-z0-9-]+))"/g)) {
    found.set(m[2], m[1]);
  }
  return [...found.entries()].map(([slug, path]) => ({ slug, path }));
}

// Champion tile filenames look like t_18_scuttle_crab_square.png. The alt text
// sitting next to them is the display name, which is what the comp data uses.
function championsIn(segment) {
  const names = [];
  for (const m of segment.matchAll(/alt="([^"]+)"\s+class="champion-icon"/g)) names.push(m[1]);
  return names;
}

// A page can carry several opener cards — the comp's own plus generic trait
// openers ("Coven", "Riftbeast") that several comps share. Each card is a
// custom-opener-container holding a name, a Formula (the units the opener
// actually requires) and an Example (formula plus flex filler). Reading them
// as one list, which an earlier version did, silently welds two openers
// together, so they are kept separate and labelled.
//
// Within a card the slots repeat because the page renders a desktop and a
// mobile copy, and trait markers share the slot class — both are filtered.
function slotUnits(segment, cls) {
  const names = [];
  const re = new RegExp(`<div class="${cls}([^"]*)"[^>]*>\\s*<img[^>]*?alt="([^"]+)"`, 'g');
  for (const m of segment.matchAll(re)) {
    if (m[1].includes('--trait')) continue;
    const name = decode(m[2]);
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

function decode(s) {
  return s
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&amp;/g, '&');
}

function openerCards(html) {
  const body = html.slice(html.indexOf('</style>'));
  const marks = [...body.matchAll(/<div class="custom-opener-container[^"]*"/g)].map((m) => m.index);
  return marks.map((at, i) => {
    const seg = body.slice(at, marks[i + 1] ?? at + 4000);
    return {
      name: decode(seg.match(/custom-opener-name[^>]*>([^<]+)</)?.[1]?.trim() ?? '(unnamed)'),
      formula: slotUnits(seg, 'custom-opener-slot'),
      example: slotUnits(seg, 'custom-opener-example-slot'),
    };
  });
}

// The positioning board is an SVG of 28 hexes, 7 per row, row 0 nearest the
// enemy. Only the units baked into the server response show up here, so this
// is used for matching comps rather than as a board of record.
function boardUnits(html) {
  const svg = html.match(/<svg id="team-builder-svg"[\s\S]*?<\/svg>/);
  if (!svg) return [];
  const block = svg[0];
  const marks = [...block.matchAll(/<g class="hex-container" data-index="(\d+)"/g)].map((m) => ({
    at: m.index,
    idx: Number(m[1]),
  }));
  const units = [];
  marks.forEach((mark, i) => {
    const seg = block.slice(mark.at, marks[i + 1]?.at ?? block.length);
    const file = seg.match(/champions\/tileIcon\/([a-z0-9_]+)_square/);
    if (file) units.push({ row: Math.floor(mark.idx / 7), file: file[1] });
  });
  return units;
}

function title(html) {
  const m = html.match(/<h1[^>]*class="[^"]*comp-title[^"]*"[^>]*>([^<]+)</) || html.match(/<title>([^<]+)</);
  return m ? m[1].replace(/\s*[-|].*$/, '').trim() : '(untitled)';
}

// Our own data, parsed out of the TS source rather than imported (the file is
// TypeScript and this is a plain node script).
function localComps() {
  const src = readFileSync(new URL('../components/blog/widgets/tftCompData.ts', import.meta.url), 'utf-8');
  const body = src.slice(src.indexOf('export const COMPS'));
  return body
    .split(/\n  \{\n/)
    .slice(1)
    .map((block) => {
      const str = (key) => block.match(new RegExp(`${key}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1];
      const list = (key) => {
        const raw = block.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))?.[1] ?? '';
        return raw
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      };
      return { name: str('name'), carry: str('carry'), early: list('early'), final: list('final') };
    })
    .filter((c) => c.name);
}

const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

// Tile filenames are Riot's internal names, which do not always match the
// display name: "sentry" is Pebbles, "raptor" is Mama Beak, and a few carry a
// stray t_ prefix.
const TILE_ALIASES = { sentry: 'pebbles', raptor: 'mamabeak', tamumu: 'amumu' };
const tileName = (file) => {
  const n = norm(file.replace(/^t_18_/, ''));
  return TILE_ALIASES[n] ?? n;
};

function bestLocalMatch(remote, comps) {
  const remoteUnits = new Set(remote.board.map((u) => tileName(u.file)));
  const ranked = comps
    .map((c) => {
      const hit = c.final.filter((u) => remoteUnits.has(norm(u))).length;
      // Share of the smaller board, so a 6-unit comp is not penalised against
      // a 10-unit one.
      const coverage = remoteUnits.size ? hit / Math.min(c.final.length, remoteUnits.size) : 0;
      const carryHit = norm(remote.title).includes(norm(c.carry)) ? 0.25 : 0;
      return { comp: c, hit, score: coverage + carryHit };
    })
    .sort((a, b) => b.score - a.score);
  return ranked;
}

async function main() {
  const index = await getPage(INDEX_URL);
  let slugs = slugsFromIndex(index);
  if (filter) slugs = slugs.filter((s) => s.slug.includes(filter));
  if (!slugs.length) {
    console.error('No composition links found — the index page layout may have changed.');
    process.exit(1);
  }
  console.log(`Found ${slugs.length} composition${slugs.length === 1 ? '' : 's'} on tftflow.\n`);

  const comps = localComps();
  const results = [];

  for (const { slug, path } of slugs) {
    try {
      const html = await getPage(BASE + path);
      results.push({ slug, title: title(html), cards: openerCards(html), board: boardUnits(html) });
    } catch (err) {
      console.log(`  ${slug}: FAILED — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  for (const r of results) {
    const ranked = bestLocalMatch(r, comps);
    const [top, second] = ranked;
    console.log(`${r.title}  [${r.slug}]`);
    for (const card of r.cards) {
      console.log(`  opener "${card.name}"`);
      console.log(`     formula: ${card.formula.join(', ') || '(empty)'}`);
      if (card.example.length && card.example.join() !== card.formula.join()) {
        console.log(`     example: ${card.example.join(', ')}`);
      }
    }
    const rows = [0, 1, 2, 3]
      .map((n) => r.board.filter((u) => u.row === n).map((u) => tileName(u.file)))
      .map((units, n) => (units.length ? `r${n} ${units.join(' ')}` : null))
      .filter(Boolean);
    console.log(`  board (partial, ${r.board.length}): ${rows.join(' | ') || '(none)'}`);
    console.log(
      `  ours: ${top.comp.name} — ${top.hit} board units shared (${top.score.toFixed(2)})` +
        `, next best ${second.comp.name} (${second.score.toFixed(2)})`
    );
    console.log(`  ours early: ${top.comp.early.join(', ') || '(EMPTY)'}`);
    console.log();
  }

  const matched = new Set(results.map((r) => bestLocalMatch(r, comps)[0].comp.name));
  const unmatched = comps.filter((c) => !matched.has(c.name));
  if (unmatched.length) {
    console.log(`No tftflow page landed on: ${unmatched.map((c) => c.name).join(' | ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
