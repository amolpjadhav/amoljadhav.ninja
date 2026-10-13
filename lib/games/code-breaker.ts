// Code Breaker (Mastermind mechanics): 4 pegs from 6 colors, scored as
// black (right color, right slot) and white (right color, wrong slot).
export const PEGS = 4;
export const COLORS = 6;
export const MAX_TRIES = 10;

export interface PegScore {
  black: number;
  white: number;
}

// Blacks first, then whites from the unmatched remainder — duplicates
// in the guess can never score more than the code holds.
export function scoreCode(code: number[], guess: number[]): PegScore {
  let black = 0;
  const codeLeft = new Map<number, number>();
  const guessLeft = new Map<number, number>();
  for (let i = 0; i < PEGS; i += 1) {
    if (guess[i] === code[i]) {
      black += 1;
    } else {
      const c = code[i] as number;
      const g = guess[i] as number;
      codeLeft.set(c, (codeLeft.get(c) ?? 0) + 1);
      guessLeft.set(g, (guessLeft.get(g) ?? 0) + 1);
    }
  }
  let white = 0;
  for (const [color, n] of guessLeft) {
    white += Math.min(n, codeLeft.get(color) ?? 0);
  }
  return { black, white };
}

export type FeedbackPeg = 'black' | 'white' | 'miss';

// One feedback slot per peg in the code, blacks first, then whites, then
// the misses a guess earned nothing for — always PEGS slots in total.
export function feedbackPegs(score: PegScore): FeedbackPeg[] {
  const black = Math.max(0, Math.min(PEGS, score.black));
  const white = Math.max(0, Math.min(PEGS - black, score.white));
  return [
    ...Array.from({ length: black }, (): FeedbackPeg => 'black'),
    ...Array.from({ length: white }, (): FeedbackPeg => 'white'),
    ...Array.from({ length: PEGS - black - white }, (): FeedbackPeg => 'miss'),
  ];
}

export function randomCode(rand: () => number = Math.random): number[] {
  return Array.from({ length: PEGS }, () => Math.floor(rand() * COLORS));
}
