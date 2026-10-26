// Chess Play support (spec §A): opponent levels, UCI setup, game
// outcome/material helpers. Pure and framework-free so node --test can
// exercise it; the React view owns the mutable Chess instance.

import { Chess } from 'chess.js';
import type { Move, Square } from 'chess.js';

export const CHESS_SLUG = 'chess';
export const CHESS_ACCENT = '#E5C07B';
export const CHESS_ACCENT_VAR = '--chess';
export const CHESS_SAVE_KEY = 'games:v1:chess';
export const CHESS_STATS_KEY = 'games:v1:chess:stats';
export const CHESS_HOWTO_KEY = 'games:v1:howto:chess';
export const CHESS_CASUAL_KEY = 'games:v1:chess:casual';

export type ChessColor = 'white' | 'black';
export type ChessColorChoice = ChessColor | 'random';
export type ChessTimeControl = 'none' | '10+0' | '5+3';
/** Opening coach: passive book info (off), guided arrows, or recall stages. */
export type CoachKind = 'off' | 'guided' | 'recall';

export interface ChessLevel {
  id: string;
  name: string;
  piece: string;
  blurb: string;
  skill: number;
  depth: number;
  /** Fixed search time per engine reply ( King uses a full movetime). */
  movetimeMs: number;
  limitStrength: boolean;
  elo: number | null;
  /** Share of engine replies replaced by a uniform random legal move. */
  randomShare: number;
}

// Spec §A3: opponents named after pieces. The lite engine's UCI_Elo floor
// is 1320, so Rook 1500 / Queen 1900 both fit without clamping.
export const CHESS_LEVELS: ChessLevel[] = [
  { id: 'pawn', name: 'Pawn', piece: '♟', blurb: 'Total beginner', skill: 0, depth: 1, movetimeMs: 50, limitStrength: false, elo: null, randomShare: 0.3 },
  { id: 'knight', name: 'Knight', piece: '♞', blurb: 'Around 800', skill: 3, depth: 4, movetimeMs: 100, limitStrength: false, elo: null, randomShare: 0 },
  { id: 'bishop', name: 'Bishop', piece: '♝', blurb: 'Around 1200', skill: 7, depth: 8, movetimeMs: 200, limitStrength: false, elo: null, randomShare: 0 },
  { id: 'rook', name: 'Rook', piece: '♜', blurb: 'Around 1500', skill: 20, depth: 12, movetimeMs: 300, limitStrength: true, elo: 1500, randomShare: 0 },
  { id: 'queen', name: 'Queen', piece: '♛', blurb: 'Around 1900', skill: 20, depth: 14, movetimeMs: 500, limitStrength: true, elo: 1900, randomShare: 0 },
  { id: 'king', name: 'King', piece: '♚', blurb: 'Very strong', skill: 20, depth: 18, movetimeMs: 1000, limitStrength: false, elo: null, randomShare: 0 },
];

export function levelById(id: string): ChessLevel {
  return CHESS_LEVELS.find((l) => l.id === id) ?? CHESS_LEVELS[0] as ChessLevel;
}

/** UCI setoption lines that configure the engine for a level. */
export function engineSetupCommands(level: ChessLevel): string[] {
  const cmds = [`setoption name Skill Level value ${level.skill}`];
  cmds.push(`setoption name UCI_LimitStrength value ${level.limitStrength ? 'true' : 'false'}`);
  if (level.limitStrength && level.elo !== null) cmds.push(`setoption name UCI_Elo value ${level.elo}`);
  return cmds;
}

/** Go command for an engine reply at this level (depth-bounded levels
 *  stay snappy; King gets a fixed movetime instead). */
export function engineGoCommand(level: ChessLevel): string {
  if (level.id === 'king') return `go movetime ${level.movetimeMs}`;
  return `go depth ${level.depth} movetime ${level.movetimeMs}`;
}

export function shouldPlayRandom(level: ChessLevel, rand: () => number = Math.random): boolean {
  return level.randomShare > 0 && rand() < level.randomShare;
}

/** Uniform random legal move (pawn-level chaos + engine-outage fallback). */
export function randomLegalMove(chess: Chess, rand: () => number = Math.random): ParsedBestmove | null {
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;
  const m = moves[Math.floor(rand() * moves.length)] as Move;
  const out: ParsedBestmove = { from: m.from, to: m.to };
  if (m.promotion) out.promotion = m.promotion;
  return out;
}

export function resolveColor(choice: ChessColorChoice, rand: () => number = Math.random): ChessColor {
  if (choice === 'white' || choice === 'black') return choice;
  return rand() < 0.5 ? 'white' : 'black';
}

export interface ChessClock {
  startMs: number;
  incMs: number;
}

export function clockFor(control: ChessTimeControl): ChessClock | null {
  if (control === '10+0') return { startMs: 10 * 60 * 1000, incMs: 0 };
  if (control === '5+3') return { startMs: 5 * 60 * 1000, incMs: 3000 };
  return null;
}

export type ChessResult = 'white' | 'black' | 'draw';

export interface ChessOutcome {
  over: boolean;
  result: ChessResult | null;
  reason: string | null;
}

/** Terminal state via chess.js (covers castling/en-passant correctness
 *  downstream: all moves are applied through Chess.move). */
export function gameOutcome(chess: Chess): ChessOutcome {
  if (chess.isCheckmate()) {
    // The side to move is mated, so the other side won.
    return { over: true, result: chess.turn() === 'w' ? 'black' : 'white', reason: 'checkmate' };
  }
  if (chess.isStalemate()) return { over: true, result: 'draw', reason: 'stalemate' };
  if (chess.isThreefoldRepetition()) return { over: true, result: 'draw', reason: 'threefold repetition' };
  if (chess.isDrawByFiftyMoves()) return { over: true, result: 'draw', reason: 'fifty-move rule' };
  if (chess.isInsufficientMaterial()) return { over: true, result: 'draw', reason: 'insufficient material' };
  if (chess.isDraw()) return { over: true, result: 'draw', reason: 'draw' };
  return { over: false, result: null, reason: null };
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Material balance in pawns from White's perspective + captured lists. */
export function materialSummary(chess: Chess): {
  balance: number;
  capturedByWhite: string[];
  capturedByBlack: string[];
} {
  const start: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
  const white: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const black: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.color === 'w') white[piece.type] += 1;
      else black[piece.type] += 1;
    }
  }
  const capturedByWhite: string[] = [];
  const capturedByBlack: string[] = [];
  let balance = 0;
  for (const t of Object.keys(start)) {
    const missingBlack = start[t]! - black[t]!;
    const missingWhite = start[t]! - white[t]!;
    for (let i = 0; i < missingBlack; i += 1) capturedByWhite.push(t);
    for (let i = 0; i < missingWhite; i += 1) capturedByBlack.push(t);
    balance += (missingBlack - missingWhite) * PIECE_VALUES[t]!;
  }
  const order = (a: string, b: string) => PIECE_VALUES[b]! - PIECE_VALUES[a]!;
  capturedByWhite.sort(order);
  capturedByBlack.sort(order);
  return { balance, capturedByWhite, capturedByBlack };
}

/** Pair a SAN history into two-column move-list rows. */
export function pairMoves(san: string[]): [string, string | null][] {
  const rows: [string, string | null][] = [];
  for (let i = 0; i < san.length; i += 2) {
    rows.push([san[i] as string, (san[i + 1] as string | undefined) ?? null]);
  }
  return rows;
}

/** Plies one Undo press takes back: a full round on the player's turn,
 *  otherwise just the player's last move. Repeated presses walk the
 *  whole game back to the start. */
export function undoKeepCount(histLength: number, playerToMove: boolean): number {
  return Math.min(histLength, playerToMove ? 2 : 1);
}

/** True when the side to move in `fen` is the engine's (undo landed on
 *  it, so the engine must be kicked to reply). */
export function isEngineTurn(fen: string, playerColor: ChessColor): boolean {
  try {
    return (new Chess(fen).turn() === 'w') !== (playerColor === 'white');
  } catch {
    return false;
  }
}

/** Promotion piece options when from→to is a promoting pawn push. */
export function promotionChoices(chess: Chess, from: Square, to: Square): ('q' | 'r' | 'b' | 'n')[] {
  const moves = chess.moves({ square: from, verbose: true }) as Move[];
  const promos = moves.filter((m) => m.to === to && m.promotion);
  const kinds = [...new Set(promos.map((m) => m.promotion))] as ('q' | 'r' | 'b' | 'n')[];
  return kinds.sort();
}

/** Spec §A5: the engine accepts a draw when its eval is within ±0.3
 *  (30 cp) and at least 30 full moves have been played. */
export function engineAcceptsDraw(scoreCp: number | null, fullMoves: number): boolean {
  return scoreCp !== null && Math.abs(scoreCp) <= 30 && fullMoves >= 30;
}

export interface ParsedBestmove {
  from: string;
  to: string;
  promotion?: string;
}

/** Parse an engine `bestmove e2e4 [ponder …]` / `bestmove (none)` line. */
export function parseBestmove(line: string): ParsedBestmove | null {
  const m = /^bestmove\s+([a-h][1-8])([a-h][1-8])([qrbn])?\b/.exec(line.trim());
  if (!m) return null;
  const out: ParsedBestmove = { from: m[1] as string, to: m[2] as string };
  if (m[3]) out.promotion = m[3];
  return out;
}

export type EngineScore = { type: 'cp'; value: number } | { type: 'mate'; value: number };

/** Latest score from an engine `info … score cp|mate …` line. */
export function parseEngineScore(line: string): EngineScore | null {
  const m = /\bscore\s+(cp|mate)\s+(-?\d+)\b/.exec(line);
  if (!m) return null;
  return { type: m[1] as 'cp' | 'mate', value: Number(m[2]) };
}

/** Score from White's perspective (engine reports side-to-move). */
export function whitePerspective(score: EngineScore, turn: 'w' | 'b'): number | null {
  if (score.type === 'mate') return score.value > 0 ? (turn === 'w' ? 100000 : -100000) : turn === 'w' ? -100000 : 100000;
  return turn === 'w' ? score.value : -score.value;
}

/** Option-row eval from White's perspective ("+0.3"); null stays null. */
export function fmtEvalCp(cp: number | null): string | null {
  if (cp === null || !Number.isFinite(cp)) return null;
  const v = cp / 100;
  return `${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(1)}`;
}

/** White's share of a logistic eval bar, 0–100 (50 = level). */
export function evalWhiteShare(cp: number): number {
  return 100 / (1 + Math.exp(-0.004 * cp));
}

export type EvalTone = 'best' | 'even' | 'loose' | 'bad';

/**
 * Option-row delta vs the best known eval, from the side to move:
 * best → "Best", dead even → "=", the rest as "−0.4" pawns worse
 * (U+2212 minus). Sort stays popularity — this only re-labels. Null
 * when either eval is unknown.
 */
export function deltaEvalText(
  cp: number | null,
  bestCp: number | null,
  side: 'w' | 'b',
  isBest: boolean,
): { text: string; tone: EvalTone } | null {
  if (cp === null || bestCp === null || !Number.isFinite(cp) || !Number.isFinite(bestCp)) return null;
  if (isBest) return { text: 'Best', tone: 'best' };
  const behind = ((bestCp - cp) * (side === 'w' ? 1 : -1)) / 100;
  if (Math.abs(behind) < 0.05) return { text: '=', tone: 'even' };
  const text = `−${Math.abs(behind).toFixed(1)}`;
  const tone: EvalTone = behind <= 0.3 ? 'even' : behind <= 1.0 ? 'loose' : 'bad';
  return { text, tone };
}

export function chessShareText(opts: {
  outcome: 'win' | 'loss' | 'draw';
  level: ChessLevel;
  moves: number;
  url: string;
}): string {
  const { outcome, level, moves, url } = opts;
  const tag = `${level.piece} ${level.name}`;
  if (outcome === 'win') return `Chess · beat ${tag} in ${moves}\n${url}`;
  if (outcome === 'loss') return `Chess · lost to ${tag} in ${moves}\n${url}`;
  return `Chess · drew ${tag} in ${moves}\n${url}`;
}

export const CHESS_OPENING_STATS_KEY = 'games:v1:chess:openings';

export interface ChessLevelStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface OpeningRepertoire {
  eco: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  /** Sum of exit-move numbers (or final move when never leaving book). */
  depthSum: number;
}

export type OpeningStats = Record<string, OpeningRepertoire>;

/** Record a rated game against the repertoire (skipped when off-book anonymous). */
export function recordOpeningGame(
  stats: OpeningStats,
  eco: string,
  name: string,
  outcome: 'win' | 'loss' | 'draw',
  depthMoves: number,
): OpeningStats {
  const prev = stats[eco] ?? { eco, name, games: 0, wins: 0, losses: 0, draws: 0, depthSum: 0 };
  return {
    ...stats,
    [eco]: {
      ...prev,
      name,
      games: prev.games + 1,
      wins: prev.wins + (outcome === 'win' ? 1 : 0),
      losses: prev.losses + (outcome === 'loss' ? 1 : 0),
      draws: prev.draws + (outcome === 'draw' ? 1 : 0),
      depthSum: prev.depthSum + depthMoves,
    },
  };
}

/** Top repertoire lines by games played, with win% + avg book depth. */
export function repertoireTop(
  stats: OpeningStats,
  limit = 4,
): { eco: string; name: string; games: number; winPct: number; avgDepth: number }[] {
  return Object.values(stats)
    .sort((a, b) => b.games - a.games)
    .slice(0, limit)
    .map((r) => ({
      eco: r.eco,
      name: r.name,
      games: r.games,
      winPct: r.games > 0 ? Math.round((100 * r.wins) / r.games) : 0,
      avgDepth: r.games > 0 ? Math.round(r.depthSum / r.games) : 0,
    }));
}

/** Post-game review headline for the result sheet. */
export function reviewHeadline(opts: {
  name: string | null;
  outAtMove: number | null;
  fullMoves: number;
}): string {
  if (!opts.name) return 'No named opening this game.';
  if (opts.outAtMove === null) return `You played the ${opts.name} — stayed in book.`;
  return `You played the ${opts.name}, left theory at move ${opts.outAtMove}.`;
}

export type ChessStats = Partial<Record<string, ChessLevelStats>>;

export function emptyLevelStats(): ChessLevelStats {
  return { wins: 0, losses: 0, draws: 0 };
}

export function recordChessResult(
  stats: ChessStats,
  levelId: string,
  outcome: 'win' | 'loss' | 'draw',
): ChessStats {
  const prev = stats[levelId] ?? emptyLevelStats();
  const key = outcome === 'win' ? 'wins' : outcome === 'loss' ? 'losses' : 'draws';
  return { ...stats, [levelId]: { ...prev, [key]: prev[key] + 1 } };
}

/** Compact per-level record for setup cards (e.g. "2–1", draws appended
 *  when nonzero). Null when the level is unplayed — callers show Elo text. */
export function recordLabel(s: ChessLevelStats | undefined): string | null {
  if (!s || s.wins + s.losses + s.draws === 0) return null;
  const base = `${s.wins}–${s.losses}`;
  return s.draws > 0 ? `${base}–${s.draws}` : base;
}
