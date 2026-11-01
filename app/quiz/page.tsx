import type { Metadata } from 'next';
import QuizHubIsland from '@/components/quiz/QuizHubIsland';
import { QUIZ_CATEGORIES } from '@/lib/quiz/categories';

export const metadata: Metadata = {
  title: 'Quiz | Amol Jadhav',
  description:
    'Short quizzes on ideas worth keeping — spaced repetition, flashcards, and mastery tracking. Free, no ads.',
  alternates: { canonical: 'https://amoljadhav.ai/quiz' },
};

export default function QuizHubPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 pt-24 pb-16">
      <p className="font-mono text-xs uppercase tracking-widest text-white/40">Quiz</p>
      <h1 className="font-mono text-3xl font-bold mt-1 text-white/90">Ideas worth keeping</h1>
      <p className="font-sans text-base text-white/60 mt-2 max-w-[60ch]">
        Short quizzes that bring back what you miss.
      </p>
      <div className="mt-6">
        <QuizHubIsland categories={QUIZ_CATEGORIES} />
      </div>
    </div>
  );
}
