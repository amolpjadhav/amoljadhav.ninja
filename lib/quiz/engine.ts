// Quiz engine: pure, framework-free selection + Leitner progress so
// node --test can exercise it; the React view owns persistence + UI.

import type {
  ProgressMap,
  QuestionProgress,
  QuizCategory,
  QuizMode,
  QuizQuestion,
} from './types';

export const MASTERED_STREAK = 3;
export const SMART_ROUND_SIZE = 20;

/** Stable id: topic + question text (matches the standalone quiz format). */
export function qid(q: Pick<QuizQuestion, 'topic' | 'q'>): string {
  return `${q.topic}|${q.q}`;
}

export function blankProgress(): QuestionProgress {
  return { streak: 0, seen: 0, wrong: 0, last: 0 };
}

export function progressOf(all: ProgressMap, q: Pick<QuizQuestion, 'topic' | 'q'>): QuestionProgress {
  return all[qid(q)] ?? blankProgress();
}

export function isMastered(p: QuestionProgress): boolean {
  return p.streak >= MASTERED_STREAK;
}

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function cleanEntry(v: unknown): QuestionProgress {
  if (!isRecord(v)) return blankProgress();
  const num = (k: string) => (typeof v[k] === 'number' && Number.isFinite(v[k]) && (v[k] as number) >= 0 ? (v[k] as number) : 0);
  return { streak: Math.floor(num('streak')), seen: Math.floor(num('seen')), wrong: Math.floor(num('wrong')), last: num('last') };
}

// localStorage reads never throw: missing keys, corrupt JSON, and blocked
// storage all fall back to empty progress.
export function loadProgress(storageKey: string): ProgressMap {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};
    const out: ProgressMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === 'string' && k.includes('|')) out[k] = cleanEntry(v);
    }
    return out;
  } catch {
    return {};
  }
}

export function saveProgress(storageKey: string, all: ProgressMap): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(storageKey, JSON.stringify(all));
  } catch {
    // Private mode / quota: progress just doesn't persist.
  }
}

// Record one answer. Correct extends the streak; wrong resets it to 0 and
// counts a mistake. Returns the new map (input untouched).
export function recordAnswer(
  all: ProgressMap,
  q: Pick<QuizQuestion, 'topic' | 'q'>,
  ok: boolean,
  now: number = Date.now(),
): ProgressMap {
  const id = qid(q);
  const p = { ...(all[id] ?? blankProgress()) };
  p.seen += 1;
  p.last = now;
  if (ok) p.streak += 1;
  else {
    p.streak = 0;
    p.wrong += 1;
  }
  return { ...all, [id]: p };
}

// Smart Review priority: unseen first, then low streak, then most wrong,
// then least recently seen — plus a small random jitter.
export function smartPick(
  questions: readonly QuizQuestion[],
  all: ProgressMap,
  n: number = SMART_ROUND_SIZE,
  rand: () => number = Math.random,
  now: number = Date.now(),
): QuizQuestion[] {
  const scored = questions.map((q) => {
    const p = all[qid(q)] ?? blankProgress();
    const score =
      (p.seen === 0 ? 0 : 1 + p.streak * 2 - p.wrong * 0.5 + (now - p.last < 3600e3 ? 3 : 0)) +
      rand() * 1.5;
    return { q, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return shuffle(
    scored.slice(0, n).map((s) => s.q),
    rand,
  );
}

export interface CategoryStats {
  total: number;
  seen: number;
  mastered: number;
  accuracy: number | null;
  perTopic: { key: string; mastered: number; total: number; pct: number }[];
}

export function categoryStats(category: QuizCategory, all: ProgressMap): CategoryStats {
  let seen = 0;
  let mastered = 0;
  let totalSeen = 0;
  let totalWrong = 0;
  for (const q of category.questions) {
    const p = all[qid(q)] ?? blankProgress();
    if (p.seen > 0) seen += 1;
    if (isMastered(p)) mastered += 1;
    totalSeen += p.seen;
    totalWrong += p.wrong;
  }
  const perTopic = Object.entries(category.topics).map(([key]) => {
    const qs = category.questions.filter((q) => q.topic === key);
    const m = qs.filter((q) => isMastered(all[qid(q)] ?? blankProgress())).length;
    return { key, mastered: m, total: qs.length, pct: qs.length ? Math.round((100 * m) / qs.length) : 0 };
  });
  return {
    total: category.questions.length,
    seen,
    mastered,
    accuracy: totalSeen ? Math.round((100 * (totalSeen - totalWrong)) / totalSeen) : null,
    perTopic,
  };
}

// Build the question list for a mode. drill needs a topic key; empty list
// means the mode button should explain there's nothing to do yet.
export function questionsForMode(
  category: QuizCategory,
  all: ProgressMap,
  mode: QuizMode,
  drillTopic?: string,
  n: number = SMART_ROUND_SIZE,
  rand: () => number = Math.random,
  now: number = Date.now(),
): QuizQuestion[] {
  switch (mode) {
    case 'smart':
      return smartPick(category.questions, all, n, rand, now);
    case 'all':
      return shuffle(category.questions, rand);
    case 'mistakes':
      return shuffle(
        category.questions.filter((q) => {
          const p = all[qid(q)] ?? blankProgress();
          return p.wrong > 0 && !isMastered(p);
        }),
        rand,
      );
    case 'which':
      return shuffle(
        category.questions.filter((q) => q.type === 'which'),
        rand,
      );
    case 'drill':
      if (!drillTopic) return [];
      return shuffle(
        category.questions.filter((q) => q.topic === drillTopic),
        rand,
      );
    case 'flash':
      return [];
  }
}
