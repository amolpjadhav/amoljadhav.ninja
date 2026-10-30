import type { Metadata } from 'next';
import Link from 'next/link';
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
      <p className="mb-4">
        <Link href="/" className="text-sm text-white/60 hover:text-white no-underline" aria-label="Back home">
          <span aria-hidden>← </span>Home
        </Link>
      </p>
      <p className="text-xs uppercase tracking-widest text-white/40">Quiz</p>
      <h1 className="text-3xl font-bold mt-1">Ideas worth keeping</h1>
      <p className="text-white/60 mt-2 max-w-[60ch]">
        Short quizzes drilled with spaced repetition: what you miss comes back
        more often, and a question counts as mastered after three correct answers
        in a row. Progress is saved in your browser.
      </p>

      <ul className="grid gap-4 mt-8">
        {QUIZ_CATEGORIES.map((c) => (
          <li key={c.id}>
            <Link
              href={`/quiz/${c.id}`}
              className="block no-underline rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#0aee3c]/60 transition-colors"
            >
              <p className="text-2xl" aria-hidden>
                {c.emoji}
              </p>
              <p className="text-xl font-bold mt-2">{c.title}</p>
              <p className="text-sm text-white/60 mt-1">{c.description}</p>
              <p className="text-xs text-white/40 mt-3 tabular-nums">
                {Object.keys(c.topics).length} topics · {c.questions.length} questions
              </p>
              <p className="text-sm font-semibold text-[#0aee3c] mt-2">Start →</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
