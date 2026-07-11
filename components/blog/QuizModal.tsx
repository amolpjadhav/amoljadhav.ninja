'use client';

import { useEffect, useState } from 'react';
import { Brain, X } from 'lucide-react';
import type { QuizQuestion } from '@/types/database';
import QuickCheck from './QuickCheck';

export default function QuizModal({
  questions,
  accent,
}: {
  questions: QuizQuestion[];
  accent: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 mb-6"
        style={{ borderColor: `${accent}40`, background: `${accent}0d` }}
      >
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Brain size={16} style={{ color: accent }} />
          <span>Think you already know this? Test yourself before reading.</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded transition-transform hover:scale-105 shrink-0"
          style={{ background: accent, color: '#0a0a0a' }}
        >
          Take the quiz
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeInFast"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close quiz"
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#1c1d20] border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <QuickCheck questions={questions} accent={accent} embedded />
          </div>
        </div>
      )}
    </>
  );
}
