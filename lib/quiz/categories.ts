// Quiz category registry: the /quiz hub lists these, /quiz/[category]
// plays them. Add a category module + one line here — no UI changes.
import { pocketLaws } from './pocket-laws';
import { chessOpenings } from './chess-openings';
import { gameTheory } from './game-theory';
import { financialStatements } from './financial-statements';
import { optionsBasics } from './options-basics';
import type { QuizCategory } from './types';

export const QUIZ_CATEGORIES: QuizCategory[] = [
  pocketLaws,
  chessOpenings,
  gameTheory,
  financialStatements,
  optionsBasics,
];

export function quizCategoryById(id: string): QuizCategory | null {
  return QUIZ_CATEGORIES.find((c) => c.id === id) ?? null;
}

// Article slug → deck id. The matching article page ends with a
// "Quiz yourself" card linking into spaced repetition.
export const QUIZ_BY_ARTICLE_SLUG: Record<string, string> = {
  'pocket-laws-101-the-mental-models-worth-carrying-around': 'pocket-laws',
  'game-theory-101-the-strategic-models-worth-knowing': 'game-theory',
  'financial-statements-101-a-beginners-guide-to-the-balance-sheet-income-statement': 'financial-statements',
};
