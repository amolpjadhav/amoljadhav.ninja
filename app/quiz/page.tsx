import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { QUIZ_CATEGORIES } from '@/lib/quiz/categories';

// Client-only island (same pattern as the games hub): progress lives in
// localStorage, so the server emits a skeleton and the island hydrates it.
const QuizHub = dynamic(() => import('@/components/quiz/QuizHub'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 sm:grid-cols-2 min-[1200px]:grid-cols-3" aria-hidden>
      {QUIZ_CATEGORIES.map((c) => (
        <div key={c.id} className="h-56 rounded-xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse" />
      ))}
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Quiz | Amol Jadhav',
  description:
    'Short quizzes on ideas worth keeping — spaced repetition, flashcards, and mastery tracking. Free, no ads.',
  alternates: { canonical: 'https://amoljadhav.ai/quiz' },
};

export default function QuizHubPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 pt-24 pb-16">
      <p className="mb-4">
        <Link href="/" className="text-sm text-white/60 hover:text-white no-underline" aria-label="Back home">
          <span aria-hidden>← </span>Home
        </Link>
      </p>
      <p className="font-mono text-xs uppercase tracking-widest text-white/40">Quiz</p>
      <h1 className="font-mono text-3xl font-bold mt-1">Ideas worth keeping</h1>
      <p className="font-sans text-base text-white/60 mt-2 max-w-[60ch]">
        Short quizzes that bring back what you miss.
      </p>
      <div className="mt-6">
        <QuizHub categories={QUIZ_CATEGORIES} />
      </div>
    </div>
  );
}
