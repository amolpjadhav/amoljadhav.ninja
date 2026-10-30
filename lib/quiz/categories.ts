// Quiz category registry: the /quiz hub lists these, /quiz/[category]
// plays them. Add a category module + one line here — no UI changes.
import { pocketLaws } from './pocket-laws';
import type { QuizCategory } from './types';

export const QUIZ_CATEGORIES: QuizCategory[] = [pocketLaws];

export function quizCategoryById(id: string): QuizCategory | null {
  return QUIZ_CATEGORIES.find((c) => c.id === id) ?? null;
}
