// Guided openings + recall (spec: Guided play + Recall, no picker).
// The book is the EPD-keyed tree in /data/openings.json (see
// lib/games/openings.ts); every user-to-move book position is a recall
// node keyed by EPD. Progress persists in localStorage under NODES_KEY.
//
// Recall model per node: { seen, correct, streak, reviews, lastSeen,
// nextReview, path }. "Correct" = the main-line move by default, or any
// book move when acceptAnyBook is on — the component classifies each
// attempt with decideUserMove and records it with recordNodeCorrect /
// recordNodeMiss / recordNodeUngraded (hinted). Pure and framework-free
// so node --test can exercise it.

export const NODES_KEY = 'games:v1:chess:openings:nodes';

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Spaced-repetition ladder for Test-stage correct answers. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export type RecallStage = 'learn' | 'practice' | 'test';

export interface NodeRecord {
  seen: number;
  correct: number;
  /** Consecutive correct (unhinted) answers. 0–1 Learn, 2–3 Practice, 4+ Test. */
  streak: number;
  /** Successful recalls while in Test stage (drives the interval ladder). */
  reviews: number;
  lastSeen: number;
  /** 0 = never scheduled (fresh node, not due). */
  nextReview: number;
  /** SANs from startpos to this node (for Review-due autoplay). */
  path: string[];
}

export type NodeStore = Record<string, NodeRecord>;

export function emptyNodeRecord(path: string[] = []): NodeRecord {
  return { seen: 0, correct: 0, streak: 0, reviews: 0, lastSeen: 0, nextReview: 0, path };
}

export function stageOf(streak: number): RecallStage {
  if (streak >= 4) return 'test';
  if (streak >= 2) return 'practice';
  return 'learn';
}

function withPath(prev: NodeRecord | undefined, path: string[]): string[] {
  // Keep the first recorded path; every sighting replays from startpos,
  // so the first one is always a valid route to the node.
  return prev && prev.path.length > 0 ? prev.path : path;
}

/** Ungraded sighting (hint used): counts as seen, never as correct. */
export function recordNodeUngraded(
  store: NodeStore,
  key: string,
  path: string[],
  now: number = Date.now(),
): NodeStore {
  const prev = store[key] ?? emptyNodeRecord();
  return {
    ...store,
    [key]: { ...prev, seen: prev.seen + 1, lastSeen: now, path: withPath(prev, path) },
  };
}

/** Correct user move at a node. Test-stage corrects climb the review ladder. */
export function recordNodeCorrect(
  store: NodeStore,
  key: string,
  path: string[],
  now: number = Date.now(),
): NodeStore {
  const prev = store[key] ?? emptyNodeRecord();
  const streak = prev.streak + 1;
  const inTest = streak >= 4;
  const reviews = inTest ? prev.reviews + 1 : prev.reviews;
  const nextReview = inTest
    ? now + REVIEW_INTERVALS_DAYS[Math.min(reviews - 1, REVIEW_INTERVALS_DAYS.length - 1)] * DAY_MS
    : prev.nextReview;
  return {
    ...store,
    [key]: {
      seen: prev.seen + 1,
      correct: prev.correct + 1,
      streak,
      reviews,
      lastSeen: now,
      nextReview,
      path: withPath(prev, path),
    },
  };
}

/** Miss (wrong recall, or a non-main book move when main-line-only is on):
 *  ladder resets to Practice and the node is due again tomorrow. */
export function recordNodeMiss(
  store: NodeStore,
  key: string,
  path: string[],
  now: number = Date.now(),
): NodeStore {
  const prev = store[key] ?? emptyNodeRecord();
  return {
    ...store,
    [key]: {
      ...prev,
      seen: prev.seen + 1,
      streak: 0,
      lastSeen: now,
      nextReview: now + DAY_MS,
      path: withPath(prev, path),
    },
  };
}

export type UserMoveVerdict = 'correct' | 'branch' | 'offbook' | 'snapback';

/**
 * Classify a user move against the book children of the current node.
 * - correct: main-line move (or any book move when acceptAnyBook is on).
 * - branch: another book move while main-line-only is on (followed, but a miss).
 * - offbook: not a book move (Learn/Practice: the guide exits here).
 * - snapback: not a book move in Test stage (piece returns, retry/show).
 */
export function decideUserMove(opts: {
  bookUcis: string[];
  mainUci: string | null;
  playedUci: string;
  acceptAnyBook: boolean;
  stage: RecallStage;
}): UserMoveVerdict {
  const { bookUcis, mainUci, playedUci, acceptAnyBook, stage } = opts;
  if (playedUci === mainUci) return 'correct';
  if (bookUcis.includes(playedUci)) return acceptAnyBook ? 'correct' : 'branch';
  return stage === 'test' ? 'snapback' : 'offbook';
}

export type AssistExit = 'user-left' | 'line-ended' | 'playout';

/** Banner copy when guidance ends. Pure so the wording is unit-tested. */
export function exitBanner(
  exit: AssistExit,
  name: string | null,
  moveNo: number,
  mainSan: string | null,
  playedSan: string | null = null,
): string {
  const line = name ?? 'this line';
  if (exit === 'user-left') {
    if (playedSan && mainSan) return `You left the book with ${playedSan} — book was ${mainSan}`;
    return mainSan
      ? `You left the book at move ${moveNo} — main line was ${mainSan}`
      : `You left the book at move ${moveNo} — middlegame starts now`;
  }
  if (exit === 'playout') return `Opening complete: ${line} — middlegame starts now`;
  if (playedSan) return `Stockfish left the book with ${playedSan} — ${line} · middlegame starts now`;
  return `Opening complete: ${line}. Middlegame starts now`;
}

/** Due = scheduled and the review date has passed, oldest first. */
export function dueNodeKeys(store: NodeStore, now: number = Date.now()): string[] {
  return Object.entries(store)
    .filter(([, r]) => r.nextReview > 0 && r.nextReview <= now)
    .sort((a, b) => a[1].nextReview - b[1].nextReview)
    .map(([key]) => key);
}

export function dueCount(store: NodeStore, now: number = Date.now()): number {
  return dueNodeKeys(store, now).length;
}

/** Human next-review label for the session sheet. */
export function nextReviewLabel(store: NodeStore, now: number = Date.now()): string | null {
  let best: number | null = null;
  for (const r of Object.values(store)) {
    if (r.nextReview > now && (best === null || r.nextReview < best)) best = r.nextReview;
  }
  if (best === null) return null;
  const days = Math.max(1, Math.round((best - now) / DAY_MS));
  if (days <= 1) return 'tomorrow';
  return `in ${days} days`;
}
