// Dedicated quiz section: category schema. A category is one topic set
// (Pocket Laws first); the engine and UI work against this shape so new
// categories plug into lib/quiz/categories.ts with no UI changes.

export interface QuizTopic {
  name: string;
  short: string;
  /** Laws readers mix this one up with (drives "Don't confuse with"). */
  confusableWith?: string[];
  learnMore?: {
    /** 2–3 sentences: the real story behind the law. */
    origin: string;
    /** 2–3 short sightings in the wild. */
    wild: string[];
    /** Topic key + 1–2 sentences contrasting the closest confusable. */
    confusedWith?: { topic: string; note: string };
  };
}

export interface QuizQuestion {
  /** Topic key into the category's topics map. */
  topic: string;
  q: string;
  /** First option is the correct one; shuffled at display time. */
  a: string[];
  /** Explanation shown after answering. */
  ex: string;
  /** "which" = scenario-only: identify the topic. */
  type?: 'which';
}

export interface QuizCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** Article this category drills (shown as "from the article"). */
  source: string;
  /** Singular noun for one topic ("law", "bias", …). */
  topicLabel: string;
  /** localStorage key — reused verbatim so standalone-quiz progress carries over. */
  legacyStorageKey: string;
  topics: Record<string, QuizTopic>;
  questions: QuizQuestion[];
}

/** Per-question Leitner state: mastered at streak >= 3. */
export interface QuestionProgress {
  streak: number;
  seen: number;
  wrong: number;
  last: number;
}

export type ProgressMap = Record<string, QuestionProgress>;

export type QuizMode = 'smart' | 'all' | 'mistakes' | 'which' | 'flash' | 'drill';
