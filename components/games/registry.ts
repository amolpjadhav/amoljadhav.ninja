// Arcade game registry: one entry per play route. Route slugs are the
// canonical deep links (/games/sudoku); OLD_ANCHORS maps the legacy
// article anchors (#game-2048) to the new slugs so old links keep working.

export type GameSlug = 'five-letters' | 'minesweeper' | 'sudoku' | 'code-breaker' | '2048' | 'chess';

export interface GameMeta {
  slug: GameSlug;
  name: string;
  pitch: string;
  accentVar: string;
  accent: string;
  modes: string[];
  description: string;
}

export const GAMES: GameMeta[] = [
  {
    slug: 'chess',
    name: 'Chess',
    pitch: 'Outplay the computer, from Pawn to King.',
    accentVar: '--chess',
    accent: '#E5C07B',
    modes: ['Play'],
    description:
      'Play chess online vs the computer — free, no ads. Six levels from total beginner to full strength.',
  },
  {
    slug: 'five-letters',
    name: 'Five Letters',
    pitch: 'Six tries to find the five-letter word.',
    accentVar: '--five-letters',
    accent: '#64D2FF',
    modes: ['Daily', 'Practice'],
    description:
      'Play Five Letters online — free, no ads, daily puzzle. Six tries to find the five-letter word.',
  },
  {
    slug: 'minesweeper',
    name: 'Minesweeper',
    pitch: 'Clear the field without hitting a mine.',
    accentVar: '--minesweeper',
    accent: '#BF5AF2',
    modes: ['Beginner', 'Intermediate', 'Expert', 'Daily'],
    description:
      'Play Minesweeper online — free, no ads, daily puzzle. Clear the field without hitting a mine.',
  },
  {
    slug: 'sudoku',
    name: 'Sudoku',
    pitch: 'Fill every row, column and box.',
    accentVar: '--sudoku',
    accent: '#FF9F0A',
    modes: ['Easy', 'Medium', 'Hard', 'Daily'],
    description:
      'Play Sudoku online — free, no ads, daily puzzle. Fill every row, column and box.',
  },
  {
    slug: 'code-breaker',
    name: 'Code Breaker',
    pitch: 'Crack the hidden four-peg code in ten tries.',
    accentVar: '--code-breaker',
    accent: '#FF6FB5',
    modes: ['Classic'],
    description:
      'Play Code Breaker online — free, no ads. Crack the hidden four-peg code in ten tries.',
  },
  {
    slug: '2048',
    name: '2048',
    pitch: 'Merge tiles to reach 2048.',
    accentVar: '--g2048',
    accent: '#30D158',
    modes: ['Classic'],
    description: 'Play 2048 online — free, no ads. Merge tiles to reach 2048.',
  },
];

export const GAME_BY_SLUG: Record<GameSlug, GameMeta> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g]),
) as Record<GameSlug, GameMeta>;

export function isGameSlug(v: unknown): v is GameSlug {
  return typeof v === 'string' && v in GAME_BY_SLUG;
}

// Legacy article anchors (#sudoku, #game-2048, …) → new play-route slugs.
export const OLD_ANCHORS: Record<string, GameSlug> = {
  'five-letters': 'five-letters',
  minesweeper: 'minesweeper',
  sudoku: 'sudoku',
  'code-breaker': 'code-breaker',
  'game-2048': '2048',
};

export const GAME_ORDER: GameSlug[] = ['chess', 'five-letters', 'minesweeper', 'sudoku', 'code-breaker', '2048'];

export function nextGame(slug: GameSlug): GameMeta {
  const i = GAME_ORDER.indexOf(slug);
  return GAMES[(i + 1) % GAMES.length] as GameMeta;
}
