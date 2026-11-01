// Quiz result sharing, mirroring lib/games/share: finishing a quiz session
// offers Share-on-X + copy-link buttons whose link lands on
// /share/quiz-<deck>?score=… — crawlers read a personalized OG score card
// (/api/og/quiz) from that URL, humans bounce to /quiz/<deck>. All card
// text travels through the query string, so everything is sanitized and
// clamped here and re-validated on the way back in (never trust the URL).
// NOTE: unlike lib/games/share, deck validation takes an explicit deck
// list instead of importing ./categories. Source files must use
// extensionless imports (tsc TS5097 forbids '.ts'), which plain node
// cannot resolve — so the registry is injected by callers (QuizPlay and
// the share page resolve it through Next; tests pass fixtures).
export interface QuizDeckRef {
  id: string;
  title: string;
}

const SITE = 'https://amoljadhav.ai';

export function quizShareSlug(deckId: string): string {
  return `quiz-${deckId}`;
}

export function isQuizShareSlug(slug: string, decks: QuizDeckRef[]): boolean {
  if (!slug.startsWith('quiz-')) return false;
  const deckId = slug.slice('quiz-'.length);
  return decks.some((c) => c.id === deckId);
}

export function deckIdFromQuizSlug(slug: string, decks: QuizDeckRef[]): string | null {
  if (!isQuizShareSlug(slug, decks)) return null;
  return slug.slice('quiz-'.length);
}

export function deckTitle(deckId: string, decks: QuizDeckRef[]): string | null {
  return decks.find((c) => c.id === deckId)?.title ?? null;
}

export interface QuizShareInput {
  /** Deck id, e.g. 'pocket-laws'. Must match a registered category. */
  deck: string;
  /** Headline stat on the card, e.g. "9/10". */
  big: string;
  /** Sentence under the stat, e.g. "90% accuracy · Full Exam". */
  line: string;
  /** Prefilled X post text. */
  text: string;
  /** Up to two label/value chips. */
  stats: [string, string][];
}

export interface ParsedQuizCard {
  deck: string;
  title: string;
  big: string;
  line: string;
  stats: [string, string][];
}

// Card-bound text: keep the characters a score line legitimately uses,
// drop everything else, collapse whitespace, clamp length.
export function sanitizeQuizText(v: unknown, max = 28): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[^A-Za-z0-9 ·/%:.,+#'’\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'string' && v !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function buildQuizCardParams(input: QuizShareInput): URLSearchParams {
  const params = new URLSearchParams({
    deck: sanitizeQuizText(input.deck, 32),
    big: sanitizeQuizText(input.big, 16),
    line: sanitizeQuizText(input.line, 60),
  });
  input.stats.slice(0, 2).forEach(([label, value], i) => {
    params.set(`l${i + 1}`, sanitizeQuizText(label, 16));
    params.set(`v${i + 1}`, sanitizeQuizText(value, 16));
  });
  return params;
}

export function buildQuizShareUrl(input: QuizShareInput): string {
  return `${SITE}/share/${quizShareSlug(input.deck)}?${buildQuizCardParams(input).toString()}`;
}

export function buildQuizXUrl(input: QuizShareInput): string {
  const text = encodeURIComponent(input.text);
  const url = encodeURIComponent(buildQuizShareUrl(input));
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

export function parseQuizCardParams(
  get: (key: string) => string | null,
  decks: QuizDeckRef[],
): ParsedQuizCard | null {
  const deck = get('deck');
  const title = deck ? deckTitle(deck, decks) : null;
  if (!deck || !title) return null;
  const scoreM = /^(\d+)\s*\/\s*(\d+)$/.exec(get('big') ?? '');
  const score = scoreM ? clampInt(scoreM[1], 0, 999) : null;
  const total = scoreM ? clampInt(scoreM[2], 1, 999) : null;
  if (score === null || total === null) return null;
  const stats: [string, string][] = [];
  for (let i = 1; i <= 2; i += 1) {
    const label = sanitizeQuizText(get(`l${i}`), 16);
    const value = sanitizeQuizText(get(`v${i}`), 16);
    if (label && value) stats.push([label, value]);
  }
  return {
    deck,
    title,
    big: `${score}/${total}`,
    line: sanitizeQuizText(get('line'), 60),
    stats,
  };
}
