// Per-game X sharing for the classic-games article, mirroring the chess
// notation trainer: finishing a game offers a Share-on-X button whose link
// lands on /share/<slug>?g=… — crawlers read a personalized OG score card
// (/api/og/games) from that URL, humans bounce to the article. All card
// text travels through the query string, so everything is sanitized and
// clamped here and re-validated on the way back in (never trust the URL).
import type { Mark } from './five-letters';

export const ARTICLE_SLUG = 'classic-games-revisited';
export const ARTICLE_TITLE = 'Classic Games, Revisited';
const SITE = 'https://amoljadhav.ai';

export type GameId = 'five-letters' | 'game-2048' | 'code-breaker' | 'minesweeper' | 'sudoku';

export const GAME_LABEL: Record<GameId, string> = {
  'five-letters': 'Five Letters',
  'game-2048': '2048',
  'code-breaker': 'Code Breaker',
  minesweeper: 'Minesweeper',
  sudoku: 'Sudoku',
};

const GAME_IDS = Object.keys(GAME_LABEL) as GameId[];

// Deep-link anchors: each game widget's placeholder id in the article.
// A shared game link bounces humans to /blog/<slug>#<anchor> so they
// land on that exact widget.
export const GAME_ANCHOR: Record<GameId, string> = {
  'five-letters': 'five-letters',
  'game-2048': 'game-2048',
  'code-breaker': 'code-breaker',
  minesweeper: 'minesweeper',
  sudoku: 'sudoku',
};

export function isGameId(v: unknown): v is GameId {
  return typeof v === 'string' && (GAME_IDS as string[]).includes(v);
}

/** Scoreless challenge: no result yet, just "play this game". */
export function buildGameChallenge(game: GameId): { shareUrl: string; anchorUrl: string; text: string } {
  const label = GAME_LABEL[game];
  const shareUrl = `${SITE}/share/${ARTICLE_SLUG}?g=${game}`;
  return {
    shareUrl,
    anchorUrl: `${SITE}/blog/${ARTICLE_SLUG}#${GAME_ANCHOR[game]}`,
    text: `Can you beat me at ${label}?`,
  };
}

export function buildGameChallengeXUrl(game: GameId): string {
  const { text, shareUrl } = buildGameChallenge(game);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
}

export interface GameShareInput {
  game: GameId;
  /** Headline stat on the card, e.g. "4/6", "12,340", "38s". */
  big: string;
  /** Sentence under the stat, e.g. "tries to crack the code". */
  line: string;
  /** Prefilled X post text. */
  text: string;
  /** Up to three label/value chips. */
  stats: [string, string][];
  /** Five Letters only: encoded guess marks (see encodeMarks). */
  grid?: string;
}

export interface ParsedCard {
  game: GameId;
  label: string;
  big: string;
  line: string;
  stats: [string, string][];
  grid: Mark[][];
}

const MARK_TO_CHAR: Record<Mark, string> = { correct: 'c', present: 'p', absent: 'a' };
const CHAR_TO_MARK: Record<string, Mark> = { c: 'correct', p: 'present', a: 'absent' };

export function encodeMarks(rows: Mark[][]): string {
  return rows
    .slice(0, 6)
    .map((row) => row.slice(0, 5).map((m) => MARK_TO_CHAR[m]).join(''))
    .join('');
}

export function parseMarks(raw: string | null): Mark[][] {
  if (!raw) return [];
  const chars = raw.split('').filter((c) => c in CHAR_TO_MARK);
  const rows: Mark[][] = [];
  for (let i = 0; i + 5 <= chars.length && rows.length < 6; i += 5) {
    rows.push(chars.slice(i, i + 5).map((c) => CHAR_TO_MARK[c] as Mark));
  }
  return rows;
}

// Card-bound text: keep the characters a score line legitimately uses,
// drop everything else, collapse whitespace, clamp length.
export function sanitizeCardText(v: unknown, max = 28): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[^A-Za-z0-9 ·/%:.,+#'’-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function buildCardParams(input: GameShareInput): URLSearchParams {
  const params = new URLSearchParams({
    g: input.game,
    big: sanitizeCardText(input.big, 16),
    line: sanitizeCardText(input.line, 60),
  });
  input.stats.slice(0, 3).forEach(([label, value], i) => {
    params.set(`l${i + 1}`, sanitizeCardText(label, 16));
    params.set(`v${i + 1}`, sanitizeCardText(value, 16));
  });
  if (input.grid) params.set('grid', input.grid.replace(/[^cpa]/g, '').slice(0, 30));
  return params;
}

export function buildShareUrl(input: GameShareInput): string {
  return `${SITE}/share/${ARTICLE_SLUG}?${buildCardParams(input).toString()}`;
}

export function buildXUrl(input: GameShareInput): string {
  const text = encodeURIComponent(input.text);
  const url = encodeURIComponent(buildShareUrl(input));
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

export function parseCardParams(get: (key: string) => string | null): ParsedCard | null {
  const game = get('g') as GameId | null;
  if (!game || !GAME_IDS.includes(game)) return null;
  const stats: [string, string][] = [];
  for (let i = 1; i <= 3; i += 1) {
    const label = sanitizeCardText(get(`l${i}`), 16);
    const value = sanitizeCardText(get(`v${i}`), 16);
    if (label && value) stats.push([label, value]);
  }
  return {
    game,
    label: GAME_LABEL[game],
    big: sanitizeCardText(get('big'), 16) || '—',
    line: sanitizeCardText(get('line'), 60),
    stats,
    grid: parseMarks(get('grid')),
  };
}
