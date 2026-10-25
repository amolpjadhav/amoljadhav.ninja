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

export interface ChildLabel {
  eco: string;
  name: string;
  /** True when no name exists at the child and this is the most popular
   *  named descendant ("usually …"). */
  usually: boolean;
}

/**
 * Name a book child: its own opening entry when named, else the most
 * popular named descendant within maxPlies ("usually …"). Null when the
 * subtree stays nameless (or the UCI is illegal here).
 */
export function labelChild(data: OpeningsData, fen: string, uci: string, maxPlies = 6): ChildLabel | null {
  let cur: Chess;
  try {
    cur = new Chess(fen);
    cur.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: (uci.slice(4) as 'q' | undefined) || undefined });
  } catch {
    return null;
  }
  for (let i = 0; i <= maxPlies; i += 1) {
    const hit = lookupOpening(data, epdOf(cur.fen()));
    if (hit) return { eco: hit.eco, name: hit.name, usually: i > 0 };
    const kids = bookChildren(data, epdOf(cur.fen()));
    if (kids.length === 0) return null;
    try {
      const next = kids[0] as { uci: string };
      cur.move({
        from: next.uci.slice(0, 2),
        to: next.uci.slice(2, 4),
        promotion: (next.uci.slice(4) as 'q' | undefined) || undefined,
      });
    } catch {
      return null;
    }
  }
  return null;
}

export type OpeningStyle = 'solid' | 'sharp' | 'positional' | 'gambit' | 'open';

let stylesCache: Record<string, OpeningStyle> | null = null;
let stylesFailed = false;

/** Lazy fetch of the generated style tags (small file); null when offline. */
export async function loadOpeningStyles(): Promise<Record<string, OpeningStyle> | null> {
  if (stylesCache) return stylesCache;
  if (stylesFailed) return null;
  try {
    const res = await fetch('/data/opening-styles.json');
    if (!res.ok) throw new Error(`styles ${res.status}`);
    stylesCache = (await res.json()) as Record<string, OpeningStyle>;
    return stylesCache;
  } catch {
    stylesFailed = true;
    return null;
  }
}

/**
 * Compact row label for "Your options": "Sicilian Defense" → "Sicilian",
 * "Ruy Lopez: Morphy Defense" → "Morphy". The 1…e5 reply (C20 King's
 * Pawn Game) reads "Open Game"; the header keeps the full name once the
 * move is played.
 */
export function shortOpeningName(eco: string, name: string): string {
  if (/king's pawn/i.test(name) && /^C\d\d/i.test(eco)) return 'Open Game';
  const tail = name.includes(':') ? name.slice(name.lastIndexOf(':') + 1).trim() : name;
  return tail.replace(/\s+(defense|defence|opening|game|variation|deferred|declined)$/i, '');
}

/**
 * Header name for the CURRENT position. Dataset entries often carry a
 * deeper subline after a comma ("Rubinstein Variation, Ellis Gambit");
 * that tail describes continuations, so the header drops it — it names
 * where you are, never where you might go.
 */
export function headerOpeningName(name: string): string {
  return name.split(',')[0]?.trim() || name;
}

/**
 * Distinguishing row label: the child name minus the current header
 * ("Rubinstein Variation, Ellis Gambit" → "Ellis Gambit"). A child that
 * adds nothing is the "Main line" when most popular, else "—".
 */
export function rowDistinguishingName(
  childFull: string,
  header: string,
  eco: string,
  isMostPopular: boolean,
): string {
  if (childFull === header) return isMostPopular ? 'Main line' : '—';
  const prefix = `${header}, `;
  if (childFull.startsWith(prefix)) {
    const tail = childFull.slice(prefix.length).trim();
    return tail ? shortOpeningName(eco, tail) : isMostPopular ? 'Main line' : '—';
  }
  return shortOpeningName(eco, childFull);
}

export interface ExplorerMove {
  uci: string;
  games: number;
}

export interface MergedKid {
  uci: string;
  san: string;
  weight: number;
  /** Share 0–100 when real counts exist (explorer, else dataset); null hides % everywhere. */
  pct: number | null;
  games: number | null;
}

/**
 * Options = dataset tree children ∪ explorer moves (≥1% share or ≥50
 * games), ranked by real games first, dataset weight after. Explorer
 * pct wins when it has data; dataset weights stay as the fallback; a
 * row with neither hides its % instead of inventing one.
 */
export function mergeExplorerKids(
  base: BookChildStat[],
  explorer: ExplorerMove[] | null,
  fen: string,
): MergedKid[] {
  const expTotal = (explorer ?? []).reduce((n, m) => n + m.games, 0);
  const expByUci = new Map((explorer ?? []).map((m) => [m.uci, m.games]));
  const out: MergedKid[] = base.map((k) => {
    const games = expByUci.get(k.uci) ?? null;
    return {
      uci: k.uci,
      san: k.san ?? k.uci,
      weight: k.weight,
      pct: games !== null && expTotal > 0 ? Math.round((100 * games) / expTotal) : k.weight > 0 ? k.pct : null,
      games,
    };
  });
  if (explorer && expTotal > 0) {
    const have = new Set(out.map((k) => k.uci));
    for (const m of explorer) {
      if (have.has(m.uci)) continue;
      const share = (100 * m.games) / expTotal;
      if (share < 1 && m.games < 50) continue;
      const san = uciToSan(fen, m.uci);
      if (!san) continue;
      out.push({ uci: m.uci, san, weight: 0, pct: Math.round(share), games: m.games });
    }
  }
  return out.sort((a, b) => (b.games ?? -1) - (a.games ?? -1) || b.weight - a.weight);
}

/** Style tag for an ECO|name pair; null when untagged (UI hides the tag). */
export function styleFor(styles: Record<string, OpeningStyle> | null, eco: string, name: string): OpeningStyle | null {
  if (!styles) return null;
  return styles[`${eco}|${name}`] ?? null;
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
