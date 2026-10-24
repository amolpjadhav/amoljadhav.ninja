// Opening book (spec §A trainer prep): EPD-keyed names from the Lichess
// chess-openings dataset (CC0, compiled by scripts/build-openings.mjs),
// plus per-ply book analysis for badges and bot variety. EPD matching
// (FEN without move counters) detects transpositions.

import { Chess } from 'chess.js';

export interface OpeningEntry {
  eco: string;
  name: string;
}

export interface OpeningsData {
  positions: Record<string, OpeningEntry>;
  children: Record<string, Record<string, number>>;
}

/** FEN without the halfmove/fullmove counters — the transposition key. */
export function epdOf(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

let cache: OpeningsData | null = null;
let failed = false;

/** Lazy fetch (only the chess route pays the ~1.5MB); null when offline. */
export async function loadOpenings(): Promise<OpeningsData | null> {
  if (cache) return cache;
  if (failed) return null;
  try {
    const res = await fetch('/data/openings.json');
    if (!res.ok) throw new Error(`openings ${res.status}`);
    cache = (await res.json()) as OpeningsData;
    return cache;
  } catch {
    failed = true;
    return null;
  }
}

export function lookupOpening(data: OpeningsData, epd: string): OpeningEntry | null {
  return data.positions[epd] ?? null;
}

/** Named replies from a position, heaviest first (popularity proxy). */
export function bookChildren(data: OpeningsData, epd: string): { uci: string; weight: number }[] {
  const kids = data.children[epd];
  if (!kids) return [];
  return Object.entries(kids)
    .map(([uci, weight]) => ({ uci, weight }))
    .sort((a, b) => b.weight - a.weight);
}

/** Weighted pick among book replies (bot variety + "main line was …"). */
export function pickBookMove(
  children: { uci: string; weight: number }[],
  rand: () => number = Math.random,
): string | null {
  const total = children.reduce((n, c) => n + c.weight, 0);
  if (total <= 0) return null;
  let r = rand() * total;
  for (const c of children) {
    r -= c.weight;
    if (r < 0) return c.uci;
  }
  return children[children.length - 1]?.uci ?? null;
}

/** UCI (e2e4, g7g8q) to SAN in a position; null when illegal. */
export function uciToSan(fen: string, uci: string): string | null {
  try {
    const c = new Chess(fen);
    const mv = c.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: (uci.slice(4) as 'q' | 'r' | 'b' | 'n' | undefined) || undefined,
    });
    return mv.san;
  } catch {
    return null;
  }
}

export interface BookChildStat {
  uci: string;
  san: string | null;
  weight: number;
  /** Share of the node's book weight, 0–100. */
  pct: number;
  main: boolean;
}

/**
 * Book continuations with SAN + popularity share, heaviest first.
 * The first child is the main line (dataset order fallback when no
 * explorer counts are cached).
 */
export function bookChildStats(data: OpeningsData, fen: string): BookChildStat[] {
  const kids = bookChildren(data, epdOf(fen));
  const total = kids.reduce((n, c) => n + c.weight, 0);
  return kids.map((c, i) => ({
    uci: c.uci,
    san: uciToSan(fen, c.uci),
    weight: c.weight,
    pct: total > 0 ? Math.round((100 * c.weight) / total) : 0,
    main: i === 0,
  }));
}

/** Opening plies the bot plays from book before Stockfish takes over. */
export function bookPliesForLevel(levelId: string): number {
  if (levelId === 'pawn') return 4;
  if (levelId === 'knight') return 6;
  if (levelId === 'bishop') return 8;
  return 12;
}

export interface BookAnalysis {
  /** Per-ply: was the resulting position known theory? */
  flags: boolean[];
  /** Deepest named position reached (refines as the line deepens). */
  name: string | null;
  eco: string | null;
  /** 1-based full-move number where theory ended (null = still in book). */
  outAtMove: number | null;
  /** SAN of the most popular reply at the exit position. */
  expectedSan: string | null;
}

/** Replay SAN history through the book. Pure — feeds badges + UI. */
export function analyzeBook(data: OpeningsData, sans: string[]): BookAnalysis {
  const flags: boolean[] = [];
  let name: string | null = null;
  let eco: string | null = null;
  let outAtMove: number | null = null;
  let expectedSan: string | null = null;
  const c = new Chess();
  for (let i = 0; i < sans.length; i += 1) {
    try {
      c.move(sans[i] as string);
    } catch {
      break;
    }
    const epd = epdOf(c.fen());
    const hit = lookupOpening(data, epd);
    flags.push(hit !== null);
    if (hit) {
      name = hit.name;
      eco = hit.eco;
    } else if (outAtMove === null) {
      outAtMove = Math.floor(i / 2) + 1;
      // The exit position is pre-move: step back one ply for children.
      const before = new Chess();
      for (let j = 0; j < i; j += 1) {
        try {
          before.move(sans[j] as string);
        } catch {
          break;
        }
      }
      const kids = bookChildren(data, epdOf(before.fen()));
      if (kids.length > 0) expectedSan = uciToSan(before.fen(), (kids[0] as { uci: string }).uci);
    }
  }
  return { flags, name, eco, outAtMove, expectedSan };
}
