'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  categoryStats,
  loadProgress,
  questionsForMode,
  recordAnswer,
  saveProgress,
  shuffle,
} from '@/lib/quiz/engine';
import type { ProgressMap, QuizCategory, QuizMode, QuizQuestion } from '@/lib/quiz/types';

interface Picked {
  text: string;
  correct: boolean;
}

interface Session {
  list: QuizQuestion[];
  i: number;
  correct: number;
  missed: QuizQuestion[];
  title: string;
  answered: boolean;
  opts: Picked[];
}

interface FlashState {
  cards: { name: string; short: string }[];
  i: number;
  flipped: boolean;
}

function masteryTone(pct: number): string {
  if (pct >= 80) return 'bg-emerald-400';
  if (pct >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function resultTitle(pct: number): string {
  if (pct === 100) return '🏆 Perfect!';
  if (pct >= 80) return '🔥 Great job!';
  if (pct >= 50) return '👍 Getting there';
  return '📖 Keep practicing';
}

const MODES: { mode: Exclude<QuizMode, 'drill'>; emoji: string; name: string; blurb: string }[] = [
  { mode: 'smart', emoji: '🎯', name: 'Smart Review', blurb: '20 questions, weakest & unseen first' },
  { mode: 'all', emoji: '📚', name: 'Full Exam', blurb: 'Every question, shuffled' },
  { mode: 'mistakes', emoji: '🔁', name: 'Fix My Mistakes', blurb: "Only questions you've missed" },
  { mode: 'which', emoji: '🕵️', name: 'Name That Law', blurb: 'Scenario-only: which law is at play?' },
  { mode: 'flash', emoji: '🃏', name: 'Flashcards', blurb: 'Law ↔ meaning, flip to reveal' },
];

export default function QuizPlay({ category }: { category: QuizCategory }) {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress(category.legacyStorageKey));
  const [view, setView] = useState<'home' | 'quiz' | 'flash' | 'results'>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [flash, setFlash] = useState<FlashState | null>(null);
  const [drill, setDrill] = useState('');
  const stats = useMemo(() => categoryStats(category, progress), [category, progress]);

  const goHome = useCallback(() => {
    setSession(null);
    setFlash(null);
    setView('home');
  }, []);

  const startSession = useCallback(
    (list: QuizQuestion[], title: string) => {
      if (list.length === 0) {
        alert('Nothing here yet. Try another mode!');
        return;
      }
      const q = list[0] as QuizQuestion;
      setSession({
        list,
        i: 0,
        correct: 0,
        missed: [],
        title,
        answered: false,
        opts: shuffle(q.a.map((text, idx) => ({ text, correct: idx === 0 }))),
      });
      setView('quiz');
    },
    [],
  );

  const startMode = useCallback(
    (mode: QuizMode, topic?: string) => {
      if (mode === 'flash') {
        setFlash({
          cards: shuffle(Object.values(category.topics)),
          i: 0,
          flipped: false,
        });
        setView('flash');
        return;
      }
      startSession(questionsForMode(category, progress, mode, topic), mode === 'smart' ? 'Smart Review' : mode === 'all' ? 'Full Exam' : mode === 'mistakes' ? 'Fix My Mistakes' : mode === 'which' ? `Name That ${category.topicLabel}` : (topic && category.topics[topic]?.name) || 'Drill');
    },
    [category, progress, startSession],
  );

  const answer = useCallback(
    (idx: number) => {
      if (!session || session.answered || !session.opts[idx]) return;
      const q = session.list[session.i] as QuizQuestion;
      const ok = (session.opts[idx] as Picked).correct;
      const nextMap = recordAnswer(progress, q, ok);
      setProgress(nextMap);
      saveProgress(category.legacyStorageKey, nextMap);
      setSession({
        ...session,
        answered: true,
        correct: session.correct + (ok ? 1 : 0),
        missed: ok ? session.missed : [...session.missed, q],
      });
    },
    [category.legacyStorageKey, progress, session],
  );

  const next = useCallback(() => {
    if (!session || !session.answered) return;
    const i = session.i + 1;
    if (i >= session.list.length) {
      setView('results');
      return;
    }
    const q = session.list[i] as QuizQuestion;
    setSession({
      ...session,
      i,
      answered: false,
      opts: shuffle(q.a.map((text, idx) => ({ text, correct: idx === 0 }))),
    });
  }, [session]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view === 'quiz') {
        if (e.key >= '1' && e.key <= '4') answer(Number(e.key) - 1);
        else if (e.key === 'Enter') {
          e.preventDefault();
          next();
        }
      } else if (view === 'flash') {
        if (e.key === ' ') {
          e.preventDefault();
          setFlash((f) => (f ? { ...f, flipped: !f.flipped } : f));
        } else if (e.key === 'ArrowRight') {
          setFlash((f) => (f ? { ...f, i: (f.i + 1) % f.cards.length, flipped: false } : f));
        } else if (e.key === 'ArrowLeft') {
          setFlash((f) => (f ? { ...f, i: (f.i - 1 + f.cards.length) % f.cards.length, flipped: false } : f));
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [view, answer, next]);

  const resetAll = useCallback(() => {
    if (!window.confirm('Reset all progress?')) return;
    setProgress({});
    saveProgress(category.legacyStorageKey, {});
  }, [category.legacyStorageKey]);

  if (view === 'quiz' && session) {
    const q = session.list[session.i] as QuizQuestion;
    const topic = category.topics[q.topic];
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0aee3c]/15 text-[#0aee3c]">
            {q.type === 'which' ? `Which ${category.topicLabel}?` : (topic?.name ?? q.topic)}
          </span>
          <span className="flex-1" />
          <span className="text-sm text-white/50 tabular-nums">
            {session.i + 1} / {session.list.length}
          </span>
          <button type="button" onClick={goHome} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-[#0aee3c]/60">
            Quit
          </button>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden my-3">
          <div className="h-full bg-[#0aee3c] transition-all" style={{ width: `${(100 * session.i) / session.list.length}%` }} />
        </div>
        <p className="text-lg font-semibold my-4">{q.q}</p>
        <div className="grid gap-2.5">
          {session.opts.map((o, i) => (
            <button
              key={i}
              type="button"
              disabled={session.answered}
              onClick={() => answer(i)}
              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                session.answered
                  ? o.correct
                    ? 'border-emerald-400/70 bg-emerald-400/10'
                    : 'border-white/10 opacity-70'
                  : 'border-white/10 bg-white/[0.02] hover:border-[#0aee3c]/60'
              }`}
            >
              <kbd className="inline-block min-w-[22px] text-center mr-2 text-xs text-white/50 border border-white/10 rounded px-1">
                {i + 1}
              </kbd>
              {o.text}
            </button>
          ))}
        </div>
        {session.answered && (
          <div className="mt-4 p-4 rounded-xl border-l-4 border-[#0aee3c] bg-[#0aee3c]/[0.07]">
            <p className="font-bold">{q.ex}</p>
            {topic && (
              <p className="text-sm text-white/60 mt-2">
                {topic.name} — {topic.short}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs text-white/40">Keys: 1–4 to answer, Enter for next</span>
          <span className="flex-1" />
          {session.answered && (
            <button type="button" onClick={next} className="px-5 py-2.5 rounded-xl bg-[#0aee3c] text-black font-semibold text-center">
              {session.i + 1 < session.list.length ? 'Next →' : 'See results'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'flash' && flash) {
    const card = flash.cards[flash.i] as { name: string; short: string };
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50 tabular-nums">
            {flash.i + 1} / {flash.cards.length}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={goHome} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-[#0aee3c]/60">
            Done
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFlash((f) => (f ? { ...f, flipped: !f.flipped } : f))}
          className="w-full min-h-[180px] flex flex-col items-center justify-center text-center my-3 px-4"
        >
          {flash.flipped ? (
            <>
              <span className="text-white/50">{card.name}</span>
              <span className="text-lg mt-2">{card.short}</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold">{card.name}</span>
              <span className="text-white/50 mt-2">What does it mean?</span>
            </>
          )}
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFlash((f) => (f ? { ...f, i: (f.i - 1 + f.cards.length) % f.cards.length, flipped: false } : f))}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:border-[#0aee3c]/60"
          >
            ← Prev
          </button>
          <span className="flex-1 text-center text-xs text-white/40">Click card or press Space to flip</span>
          <button
            type="button"
            onClick={() => setFlash((f) => (f ? { ...f, i: (f.i + 1) % f.cards.length, flipped: false } : f))}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:border-[#0aee3c]/60"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (view === 'results' && session) {
    const pct = Math.round((100 * session.correct) / session.list.length);
    const byTopic = new Map<string, number>();
    for (const q of session.missed) byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1);
    const missedRows = [...byTopic.entries()].sort((a, b) => b[1] - a[1]);
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-bold mt-0">{resultTitle(pct)}</h2>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{session.correct}/{session.list.length}</b>
            <span className="text-xs text-white/50">correct</span>
          </div>
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{pct}%</b>
            <span className="text-xs text-white/50">score</span>
          </div>
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{stats.mastered}/{stats.total}</b>
            <span className="text-xs text-white/50">mastered overall</span>
          </div>
        </div>
        <div className="mt-4">
          {missedRows.length ? (
            <>
              <b>Review these {category.topicLabel}s:</b>
              <ul className="mt-2 grid gap-2">
                {missedRows.map(([key, n]) => (
                  <li key={key} className="text-sm p-3 rounded-xl border border-white/10">
                    <b>{category.topics[key]?.name ?? key}</b>
                    <span className="text-white/50"> · {n} missed</span>
                    {category.topics[key] && <div className="text-white/50">{category.topics[key]?.short}</div>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-white/50">No mistakes this round.</p>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          {session.missed.length > 0 && (
            <button
              type="button"
              onClick={() => startSession(shuffle(session.missed), 'Retry missed')}
              className="px-5 py-2.5 rounded-xl bg-[#0aee3c] text-black font-semibold"
            >
              Retry missed
            </button>
          )}
          <button type="button" onClick={goHome} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/80 hover:border-[#0aee3c]/60">
            Home
          </button>
        </div>
      </div>
    );
  }

  const unseenCount = category.questions.length - stats.seen;
  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => startMode(m.mode)}
              className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#0aee3c]/60"
            >
              <b className="block">
                {m.emoji} {m.name}
              </b>
              <span className="text-sm text-white/50">{m.mode === 'which' ? `Scenario-only: which ${category.topicLabel} is at play?` : m.blurb}</span>
            </button>
          ))}
          <div className="px-4 py-3 rounded-xl border border-white/10">
            <b className="block">🔎 Drill one {category.topicLabel}</b>
            <select
              value={drill}
              onChange={(e) => {
                const key = e.target.value;
                setDrill('');
                if (key) startMode('drill', key);
              }}
              className="w-full mt-2 px-2.5 py-2 rounded-xl border border-white/10 bg-black text-white"
              aria-label={`Drill one ${category.topicLabel}`}
            >
              <option value="">Choose a {category.topicLabel}…</option>
              {Object.entries(category.topics).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name} ({category.questions.filter((q) => q.topic === key).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mt-4">
        <div className="flex items-center gap-3">
          <b>Your mastery</b>
          <span className="flex-1" />
          <button type="button" onClick={resetAll} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:border-red-400/60">
            Reset progress
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{stats.total}</b>
            <span className="text-xs text-white/50">questions</span>
          </div>
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{stats.seen}</b>
            <span className="text-xs text-white/50">seen</span>
          </div>
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{stats.mastered}</b>
            <span className="text-xs text-white/50">mastered</span>
          </div>
          <div className="text-center p-3 border border-white/10 rounded-xl">
            <b className="block text-xl tabular-nums">{stats.accuracy === null ? '—' : `${stats.accuracy}%`}</b>
            <span className="text-xs text-white/50">accuracy</span>
          </div>
        </div>
        <table className="w-full mt-4 text-sm">
          <thead>
            <tr className="text-left text-white/50">
              <th className="py-2 pr-2 font-medium">{category.title} topic</th>
              <th className="py-2 pr-2 font-medium">Mastered</th>
              <th className="py-2 font-medium w-[35%]" aria-label="Mastery bar" />
            </tr>
          </thead>
          <tbody>
            {stats.perTopic.map((row) => (
              <tr key={row.key} className="border-t border-white/10">
                <td className="py-2 pr-2">
                  <b>{category.topics[row.key]?.name ?? row.key}</b>
                  <div className="text-white/50 text-xs">{category.topics[row.key]?.short}</div>
                </td>
                <td className="py-2 pr-2 tabular-nums whitespace-nowrap">
                  {row.mastered}/{row.total}
                </td>
                <td className="py-2">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden min-w-[80px]">
                    <div className={`h-full ${masteryTone(row.pct)}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-white/40 mt-3">
          Mastery: a question counts as mastered after you get it right 3 times in a row. Getting it wrong resets it to 0.
          {unseenCount > 0 ? ` ${unseenCount} unseen.` : ' All seen.'}
        </p>
      </div>
    </>
  );
}
