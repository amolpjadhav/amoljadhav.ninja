'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types/database';
import ShareButtons from './ShareButtons';

const CORRECT = '#0aee3c';
const WRONG = '#f472b6';

// Past two dozen questions the order stops being authored and starts being
// arbitrary, so that is where shuffling begins.
const SHUFFLE_ABOVE = 24;

function shuffledIndices(count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

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
  // A long quiz is shuffled, so someone who comes back does not sit through
  // the same opening twenty flags and never meet the rest. Short quizzes keep
  // the order they were written in, because five questions can be deliberately
  // sequenced and shuffling would throw that away.
  //
  // Safe to randomise in an initialiser rather than an effect: QuickCheck only
  // mounts once the reader has opened the quiz, so this never runs during
  // server rendering and there is nothing to mismatch.
  const shuffleOnOpen = questions.length > SHUFFLE_ABOVE;
  const [order, setOrder] = useState<number[]>(() =>
    shuffleOnOpen ? shuffledIndices(questions.length) : questions.map((_, i) => i)
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[order[index] ?? 0];
  const isLast = index === questions.length - 1;

  function reshuffle() {
    setOrder(shuffledIndices(questions.length));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

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
          embedded={embedded}
        />
      ) : (
        <>
          {/* One segment per question is the right picture for a five-question
              quiz and the wrong one for a two-hundred-question quiz, where the
              segments collapse into a smear. Past a couple of dozen it becomes
              a single filling bar instead. */}
          {questions.length <= 24 ? (
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
          ) : (
            <div className="h-1.5 mb-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${((index + 1) / questions.length) * 100}%`, background: accent }}
              />
            </div>
          )}

          {/* A running tally, because a long quiz is unreadable without one:
              after forty flags nobody remembers how they are doing.
              `answered` is index plus this one if it is answered, so the
              counts never lead the question still on screen.

              A tick and a cross rather than the words: this component is
              shared by every quiz on the site, and a symbol keeps score
              without scolding anyone forty questions deep. */}
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="text-xs text-white/40">
              Question {index + 1} of {questions.length}
            </p>
            <span className="flex items-center gap-3">
              {(() => {
                const answered = index + (selected !== null ? 1 : 0);
                const wrong = answered - score;
                return (
                  answered > 0 && (
                    <span className="text-xs tabular-nums flex items-center gap-2.5">
                      <span style={{ color: accent }}>{score} &#10003;</span>
                      <span className="text-white/35">{wrong} &#10007;</span>
                      <span className="text-white/25">{Math.round((score / answered) * 100)}%</span>
                    </span>
                  )
                );
              })()}
              {/* Deals a fresh order from the top. Worth having whatever the
                  length: on a long quiz it is how you get away from flags you
                  already know, and on a short one it is a replay. */}
              <button
                onClick={reshuffle}
                className="text-xs text-white/35 hover:text-white/70 transition-colors"
                title="Shuffle the questions and start again"
              >
                Shuffle
              </button>
            </span>
          </div>
          <p className="text-white/95 font-semibold mb-4">{question.question}</p>

          {/* A question can carry a picture — a flag, a diagram — so a quiz can
              ask "which country is this?" rather than only asking in words. */}
          {question.image && (
            <div className="flex justify-center mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={question.image}
                src={question.image}
                alt={question.imageAlt ?? ''}
                className="widget-img rounded-lg border border-white/15"
                style={{
                  width: 'min(260px, 100%)',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
            </div>
          )}

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
            <div className="mt-4">
              <p className="text-sm text-white/60 leading-relaxed">{question.explanation}</p>
              {/* The flag notes come from Wikipedia, which is CC BY-SA, so the
                  article they came from gets a credit and a link. */}
              {question.sourceUrl && (
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1.5 text-[11px] text-white/30 underline decoration-white/15 hover:text-white/60"
                >
                  More on this flag — Wikipedia
                </a>
              )}
            </div>
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
  embedded,
}: {
  score: number;
  total: number;
  accent: string;
  onRetake: () => void;
  title?: string;
  slug?: string;
  embedded?: boolean;
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
          <ShareButtons
            title={title}
            slug={slug}
            text={`I scored ${score}/${total} on the ${title} quiz`}
            quiz={embedded}
          />
        )}
      </div>
    </div>
  );
}
