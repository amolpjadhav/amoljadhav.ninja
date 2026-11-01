'use client';

import dynamic from 'next/dynamic';
import type { QuizCategory } from '@/lib/quiz/types';

// Client-only island boundary (same pattern as the games hub): progress
// lives in localStorage, so the server emits the skeleton and never
// executes the island. next/dynamic with ssr:false is only allowed here,
// never in a Server Component.
const QuizHub = dynamic(() => import('./QuizHub'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 sm:grid-cols-2 min-[1200px]:grid-cols-3" aria-hidden>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-56 rounded-xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse"
        />
      ))}
    </div>
  ),
});

export default function QuizHubIsland({ categories }: { categories: QuizCategory[] }) {
  return <QuizHub categories={categories} />;
}
