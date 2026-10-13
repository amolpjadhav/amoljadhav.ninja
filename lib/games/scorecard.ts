// Combined scorecard line for the end-of-article share card. Only games
// with a recorded result appear — no placeholders for games not played.
export interface ScorecardResults {
  fiveLettersBest: number | null;
  codeBreakerBest: number | null;
  minesweeperBest: number | null;
  g2048Best: number;
}

export function buildScorecardLine(results: ScorecardResults): string {
  const parts: string[] = [];
  if (results.fiveLettersBest !== null) parts.push(`Five Letters ${results.fiveLettersBest}/6`);
  if (results.minesweeperBest !== null) parts.push(`Swept in ${results.minesweeperBest}s`);
  if (results.codeBreakerBest !== null) parts.push(`Cracked the code in ${results.codeBreakerBest}`);
  if (results.g2048Best > 0) parts.push(`2048 best ${results.g2048Best.toLocaleString()}`);
  return parts.join(' · ');
}
