'use client';

import dynamic from 'next/dynamic';
import type { QuizCategory } from '@/lib/quiz/types';

// Client-only island boundary: play state (shuffle, progress, review deep
// link) never touches SSR.
const QuizPlay = dynamic(() => import('./QuizPlay'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-64 rounded-xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse"
    />
  ),
});

export default function QuizPlayIsland({
  category,
  initialStart,
}: {
  category: QuizCategory;
  initialStart?: 'smart';
}) {
  return <QuizPlay category={category} initialStart={initialStart} />;
}
