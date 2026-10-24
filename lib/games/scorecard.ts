// Combined scorecard line for the end-of-article share card. Only games
// with a recorded result appear — no placeholders for games not played.
export interface ScorecardResults {
  fiveLettersBest: number | null;
  codeBreakerBest: number | null;
  minesweeperBest: number | null;
  g2048Best: number;
  sudokuBest: { difficulty: string; seconds: number } | null;
}

/** 65 → "01:05", 3661 → "1:01:01". Padded, so timers never jitter. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${String(m).padStart(2, '0')}:${ss}`;
}

export function buildScorecardLine(results: ScorecardResults): string {
  const parts: string[] = [];
  if (results.fiveLettersBest !== null) parts.push(`Five Letters ${results.fiveLettersBest}/6`);
  if (results.minesweeperBest !== null) parts.push(`Swept in ${results.minesweeperBest}s`);
  if (results.codeBreakerBest !== null) parts.push(`Cracked the code in ${results.codeBreakerBest}`);
  if (results.g2048Best > 0) parts.push(`2048 best ${results.g2048Best.toLocaleString()}`);
  if (results.sudokuBest !== null) {
    parts.push(`Sudoku ${results.sudokuBest.difficulty} in ${formatClock(results.sudokuBest.seconds)}`);
  }
  return parts.join(' · ');
}
