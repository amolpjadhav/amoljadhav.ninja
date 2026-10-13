import type { ChangeTone } from '@/lib/homepage';

// One palette for every move on the Stock Lookup card — index rows, the
// intraday chart and the Mag 7 block — so green can never mean one thing in
// one corner of the card and something else in another. Flat is deliberately
// gray: see formatChangePct in lib/homepage.
export const TONE_TEXT: Record<ChangeTone, string> = {
  up: 'text-[#0aee3c]',
  down: 'text-red-400',
  flat: 'text-white/45',
};

export const TONE_STROKE: Record<ChangeTone, string> = {
  up: '#0aee3c',
  down: '#f87171',
  flat: 'rgba(255,255,255,0.45)',
};

// Chart shading is split at the previous close rather than colored by the
// day's sign: time spent above the line is green even on a red day.
export const FILL_ABOVE = 'rgba(10,238,60,0.12)';
export const FILL_BELOW = 'rgba(248,113,113,0.12)';
