'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  activityStreak,
  categoryStats,
  dueQuestions,
  loadActivityDays,
  loadProgress,
} from '@/lib/quiz/engine';
import type { ProgressMap, QuizCategory } from '@/lib/quiz/types';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Ring({ pct, accent, label }: { pct: number; accent: string; label: string }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-block h-11 w-11 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
        {pct > 0 && (
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * c} ${c}`}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white/70 tabular-nums">
        {pct}%
      </span>
    </span>
  );
}

export default function QuizHub({ categories }: { categories: QuizCategory[] }) {
  // Client-only island: mount state reads storage directly, no effects.
  const [progress] = useState<Record<string, ProgressMap>>(() => {
    const map: Record<string, ProgressMap> = {};
    for (const c of categories) map[c.id] = loadProgress(c.legacyStorageKey);
    return map;
  });
  const [days] = useState<string[]>(() => loadActivityDays());

  const rows = categories.map((c) => {
    const all = progress[c.id] ?? {};
    const stats = categoryStats(c, all);
    return { category: c, stats, due: dueQuestions(c, all).length };
  });
  const totalDue = rows.reduce((n, r) => n + r.due, 0);
  const topDue = [...rows].sort((a, b) => b.due - a.due)[0];
  const streak = activityStreak(days, todayStr());

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {totalDue > 0 && topDue && (
          <Link
            href={`/quiz/${topDue.category.id}?start=smart`}
            className="px-5 py-2.5 rounded-xl bg-[#0aee3c] text-black font-sans font-semibold tabular-nums no-underline"
          >
            Review {totalDue} due →
          </Link>
        )}
        {streak > 0 && (
          <span className="font-sans text-sm text-white/70 tabular-nums" aria-label={`${streak} day streak`}>
            🔥 {streak} day{streak === 1 ? '' : 's'}
          </span>
        )}
        <details className="ml-auto font-sans text-sm text-white/50">
          <summary className="cursor-pointer hover:text-white/80">How it works</summary>
          <p className="mt-2 max-w-[60ch] text-white/60">
            Missed questions come back more often. A question counts as mastered after 3 correct
            answers in a row. Progress is saved in this browser.
          </p>
        </details>
      </div>

      <ul className="grid gap-4 mt-6 sm:grid-cols-2 min-[1200px]:grid-cols-3">
        {rows.map(({ category: c, stats, due }) => {
          const sample = c.questions[0];
          const started = stats.seen > 0;
          return (
            <li
              key={c.id}
              className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-bold leading-snug">
                    <Link href={`/quiz/${c.id}`} className="text-white/90 hover:text-white no-underline">
                      {c.title}
                    </Link>
                  </p>
                  <p className="font-sans text-sm text-white/50 mt-0.5">{c.description}</p>
                </div>
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: c.accent }}
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Ring
                  pct={stats.total ? Math.round((100 * stats.mastered) / stats.total) : 0}
                  accent={c.accent}
                  label={`${stats.mastered} of ${stats.total} mastered`}
                />
                <div className="font-sans text-sm tabular-nums">
                  <p className="text-white/80">
                    {stats.mastered}/{stats.total} mastered
                  </p>
                  <p className="text-white/50">{due > 0 ? `${due} due today` : 'All caught up ✓'}</p>
                </div>
              </div>
              {sample && (
                <p className="mt-3 font-sans text-sm text-white/40 line-clamp-1" aria-label="Sample question">
                  e.g. “{sample.q}”
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/quiz/${c.id}`}
                  className="px-5 py-2 rounded-xl bg-[#0aee3c] text-black font-sans text-sm font-semibold no-underline"
                >
                  {started ? 'Continue' : 'Start'}
                </Link>
                {c.source && (
                  <a
                    href={c.source}
                    target={c.source.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="font-sans text-sm text-white/60 hover:text-white"
                  >
                    Read the article
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
