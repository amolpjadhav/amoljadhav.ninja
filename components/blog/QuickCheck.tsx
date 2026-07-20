'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types/database';
import ShareButtons from './ShareButtons';

const CORRECT = '#0aee3c';
const WRONG = '#f472b6';

export default function QuickCheck({
  questions,
  accent,
  embedded = false,
  title,
  slug,
}: {
  questions: QuizQuestion[];
  accent: string;
  embedded?: boolean;
  title?: string;
  slug?: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function choose(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function retake() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  return (
    <div
      id={embedded ? undefined : 'quick-check'}
      className={
        embedded
          ? 'rounded-lg border bg-[#1c1d20] p-6 md:p-8'
          : 'my-10 rounded-lg border bg-[#1c1d20] p-6 md:p-8 scroll-mt-24'
      }
      style={{ borderColor: `${accent}40` }}
    >
      <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
        <span>$</span>
        <span>./quick_check.sh</span>
      </div>

      {done ? (
        <ResultScreen
          score={score}
          total={questions.length}
          accent={accent}
          onRetake={retake}
          title={title}
          slug={slug}
        />
      ) : (
        <>
          <div className="flex gap-1.5 mb-5">
            {questions.map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  background: i < index ? accent : i === index ? `${accent}80` : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          <p className="text-xs text-white/40 mb-2">
            Question {index + 1} of {questions.length}
          </p>
          <p className="text-white/95 font-semibold mb-5">{question.question}</p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = i === selected;
              const revealed = selected !== null;

              let borderColor = 'rgba(255,255,255,0.15)';
              let textColor = 'rgba(255,255,255,0.85)';
              let background = 'transparent';

              if (revealed && isCorrect) {
                borderColor = CORRECT;
                textColor = CORRECT;
                background = `${CORRECT}14`;
              } else if (revealed && isSelected && !isCorrect) {
                borderColor = WRONG;
                textColor = WRONG;
                background = `${WRONG}14`;
              }

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={revealed}
                  className="text-left text-sm rounded-md border px-4 py-2.5 transition-colors disabled:cursor-default"
                  style={{ borderColor, color: textColor, background }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && question.explanation && (
            <p className="mt-4 text-sm text-white/60 leading-relaxed">{question.explanation}</p>
          )}

          {selected !== null && (
            <button
              onClick={next}
              className="mt-5 text-sm font-bold px-4 py-2 rounded-md transition-transform hover:scale-105"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              {isLast ? 'See results' : 'Next question →'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ResultScreen({
  score,
  total,
  accent,
  onRetake,
  title,
  slug,
}: {
  score: number;
  total: number;
  accent: string;
  onRetake: () => void;
  title?: string;
  slug?: string;
}) {
  const pct = Math.round((score / total) * 100);
  const message = pct === 100 ? 'Perfect score!' : pct >= 60 ? 'Nice work.' : 'Worth a re-read.';

  return (
    <div className="text-center py-4">
      <p className="text-4xl font-bold mb-2" style={{ color: accent }}>
        {score} / {total}
      </p>
      <p className="text-white/70 mb-6">{message}</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={onRetake}
          className="text-sm border rounded-md px-4 py-2 text-white/70 hover:text-white transition-colors"
          style={{ borderColor: 'rgba(255,255,255,0.2)' }}
        >
          Retake quiz
        </button>
        {title && slug && (
          <ShareButtons title={title} slug={slug} text={`I scored ${score}/${total} on the ${title} quiz`} />
        )}
      </div>
    </div>
  );
}
