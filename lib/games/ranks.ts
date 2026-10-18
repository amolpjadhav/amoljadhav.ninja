// Speed ranks for the chess notation trainer, per round duration. Each
// ladder is independent (the 60s bar is not simply double the 30s one).
// Glyphs (♟♞…) are for X post text and the web results screen only —
// never the OG image, whose edge runtime has no chess-glyph font and
// would render tofu boxes.
export type RankDuration = 15 | 30 | 60;

export interface RankInfo {
  rank: string;
  /** Lower bound of the next tier, or null at King. */
  next: string | null;
  nextAt: number | null;
}

interface Tier {
  rank: string;
  min: number;
}

const LADDERS: Record<RankDuration, Tier[]> = {
  15: [
    { rank: 'Pawn', min: 0 },
    { rank: 'Knight', min: 5 },
    { rank: 'Bishop', min: 8 },
    { rank: 'Rook', min: 10 },
    { rank: 'Queen', min: 13 },
    { rank: 'King', min: 15 },
  ],
  30: [
    { rank: 'Pawn', min: 0 },
    { rank: 'Knight', min: 10 },
    { rank: 'Bishop', min: 15 },
    { rank: 'Rook', min: 20 },
    { rank: 'Queen', min: 25 },
    { rank: 'King', min: 30 },
  ],
  60: [
    { rank: 'Pawn', min: 0 },
    { rank: 'Knight', min: 20 },
    { rank: 'Bishop', min: 30 },
    { rank: 'Rook', min: 40 },
    { rank: 'Queen', min: 50 },
    { rank: 'King', min: 60 },
  ],
};

export const RANK_GLYPH: Record<string, string> = {
  Pawn: '♟',
  Knight: '♞',
  Bishop: '♝',
  Rook: '♜',
  Queen: '♛',
  King: '♚',
};

/** Rank for a score, or null when the duration has no ladder. */
export function rankFor(score: number, secs: number): RankInfo | null {
  if (!Number.isFinite(score) || score < 0) return null;
  const ladder = secs === 15 || secs === 30 || secs === 60 ? LADDERS[secs] : undefined;
  if (!ladder) return null;
  let tier = ladder[0];
  for (const t of ladder) {
    if (score >= t.min) tier = t;
    else break;
  }
  const idx = ladder.indexOf(tier);
  const next = ladder[idx + 1] ?? null;
  return { rank: tier.rank, next: next?.rank ?? null, nextAt: next?.min ?? null };
}
