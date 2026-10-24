// Compile lichess-org/chess-openings TSVs (CC0) into a position-keyed book:
// public/data/openings.json — { positions: {EPD: {eco, name}}, children: {EPD: {uci: weight}} }.
// EPD = FEN without move counters, so transpositions match. Children weights
// count named lines through each reply (popularity proxy for the bot + "main line").
// Run: node scripts/build-openings.mjs (needs network + chess.js).
import { mkdirSync, writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const FILES = ['a', 'b', 'c', 'd', 'e'];
const OUT = new URL('../public/data/openings.json', import.meta.url);

const epdOf = (fen) => fen.split(' ').slice(0, 4).join(' ');

const rows = [];
for (const f of FILES) {
  const url = `https://raw.githubusercontent.com/lichess-org/chess-openings/master/${f}.tsv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${f}.tsv: ${res.status}`);
  const [, ...lines] = (await res.text()).trim().split('\n');
  for (const line of lines) {
    const [eco, name, pgn] = line.split('\t');
    if (eco && name && pgn) rows.push({ eco, name, pgn });
  }
}

const positions = {};
const children = {};
let skipped = 0;
for (const { eco, name, pgn } of rows) {
  const line = new Chess();
  try {
    line.loadPgn(pgn);
  } catch {
    skipped += 1;
    continue;
  }
  const hist = line.history({ verbose: true });
  if (hist.length === 0) {
    skipped += 1;
    continue;
  }
  const replay = new Chess();
  for (const m of hist) {
    const parent = epdOf(replay.fen());
    const uci = `${m.from}${m.to}${m.promotion ?? ''}`;
    replay.move({ from: m.from, to: m.to, promotion: m.promotion });
    const e = epdOf(replay.fen());
    // Shared prefix positions (e.g. 1.e4) appear in deep sideline rows too.
    // The shortest ROW through a position names its family ("King's Pawn
    // Opening" beats a 20-ply Ruy Lopez sideline); deeper positions keep
    // only their own rows, so labels still refine with depth.
    const prev = positions[e];
    if (!prev || hist.length < prev.len || (hist.length === prev.len && name.length < prev.name.length)) {
      positions[e] = { eco, name, len: hist.length };
    }
    children[parent] ??= {};
    children[parent][uci] = (children[parent][uci] ?? 0) + 1;
  }
}

const slim = Object.fromEntries(
  Object.entries(positions).map(([epd, v]) => [epd, { eco: v.eco, name: v.name }]),
);
mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    meta: {
      source: 'lichess-org/chess-openings',
      license: 'CC0',
      rows: rows.length,
      skipped,
      positions: Object.keys(positions).length,
    },
    positions: slim,
    children,
  }),
);
console.log(`openings: ${rows.length} rows, ${Object.keys(positions).length} positions, skipped ${skipped}`);
