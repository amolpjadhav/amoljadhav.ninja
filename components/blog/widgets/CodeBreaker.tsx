'use client';

import { useCallback, useState } from 'react';
import { COLORS, MAX_TRIES, PEGS, feedbackPegs, randomCode, scoreCode, type PegScore } from '@/lib/games/code-breaker';
import { CODE_BREAKER_KEY, readJSON, writeJSON } from '@/lib/games/records';
import { buildXUrl } from '@/lib/games/share';
import HowToPlay from './HowToPlay';
import XShare from './XShare';
import WidgetShareBar from './WidgetShareBar';

// Code Breaker: crack the secret 4-peg code in 10 tries. Black peg = right
// color in the right slot, white peg = right color, wrong slot. Colors are
// always paired with symbols so the game plays colorblind-safe.

const FACES = [
  { name: 'Red', symbol: '●', bg: 'bg-red-500', text: 'text-red-400' },
  { name: 'Blue', symbol: '▲', bg: 'bg-blue-500', text: 'text-blue-400' },
  { name: 'Green', symbol: '■', bg: 'bg-green-500', text: 'text-green-400' },
  { name: 'Yellow', symbol: '★', bg: 'bg-yellow-400', text: 'text-yellow-300' },
  { name: 'Purple', symbol: '◆', bg: 'bg-purple-500', text: 'text-purple-400' },
  { name: 'Orange', symbol: '♥', bg: 'bg-orange-500', text: 'text-orange-400' },
] as const;

// Module scope (not component scope): the purity lint forbids impure calls
// inside the component, so randomness enters through here.
function dealCode(): number[] {
  return randomCode();
}

interface Try {
  guess: number[];
  score: PegScore;
}

export default function CodeBreaker() {
  const [code, setCode] = useState<number[]>(dealCode);
  const [tries, setTries] = useState<Try[]>([]);
  const [draft, setDraft] = useState<number[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [best, setBest] = useState<number | null>(() => readJSON(CODE_BREAKER_KEY, null));

  const restart = useCallback(() => {
    setCode(dealCode());
    setTries([]);
    setDraft([]);
    setStatus('playing');
  }, []);

  const addPeg = useCallback(
    (color: number) => {
      if (status !== 'playing' || draft.length >= PEGS) return;
      setDraft((d) => [...d, color]);
    },
    [draft.length, status],
  );

  const backPeg = useCallback(() => setDraft((d) => d.slice(0, -1)), []);

  const submit = useCallback(() => {
    if (status !== 'playing' || draft.length !== PEGS || code.length === 0) return;
    const score = scoreCode(code, draft);
    const next = [...tries, { guess: draft, score }];
    setTries(next);
    setDraft([]);
    if (score.black === PEGS) {
      setStatus('won');
      setBest((b) => {
        const nb = b === null ? next.length : Math.min(b, next.length);
        writeJSON(CODE_BREAKER_KEY, nb);
        return nb;
      });
    } else if (next.length >= MAX_TRIES) {
      setStatus('lost');
    }
  }, [code, draft, status, tries]);

  const filled = tries.length + (status === 'playing' ? 1 : 0);
  const rows: (Try | 'draft' | null)[] = [...tries];
  if (status === 'playing') rows.push('draft');
  while (rows.length < MAX_TRIES) rows.push(null);

  const newCodeBtn =
    'touch-manipulation select-none rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]';

  return (
    <div className="relative not-prose -mx-4 my-6 rounded-none border-y border-white/10 bg-[#1c1d20] px-4 pb-5 pt-2 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] [container:widget/inline-size] sm:mx-0 sm:rounded-xl sm:border sm:px-6 sm:pb-6 sm:pt-3 lg:-mx-8">
      <dl className="mb-2 flex flex-wrap items-end gap-4 sm:gap-6">
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-white/40">Try</dt>
          <dd className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
            {Math.min(filled, MAX_TRIES)}/{MAX_TRIES}
          </dd>
        </div>
        {best !== null ? (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">Best</dt>
            <dd className="font-mono text-lg font-bold tabular-nums text-amber-300">{best}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-white/40">Code</dt>
          <dd className="whitespace-nowrap font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
            {PEGS} pegs · {COLORS} colors
          </dd>
        </div>
      </dl>

      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#f3ecd9] transition-[width] duration-300"
          style={{ width: `${(tries.length / MAX_TRIES) * 100}%` }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-end lg:hidden">
            <button type="button" onClick={restart} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-white/85 transition-all hover:bg-white/5 active:scale-[0.97]">
              New code
            </button>
          </div>

          <div className="mx-auto w-full max-w-[340px] rounded-xl border border-white/10 bg-black/30 p-3 shadow-[0_0_18px_rgba(10,238,60,0.12),0_0_60px_rgba(10,238,60,0.05)] sm:max-w-[430px] lg:max-w-[480px]">
            <div className="flex flex-col gap-1.5 sm:gap-2" role="group" aria-label="Guesses">
              {rows.map((row, r) => (
                <div key={r} className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 sm:gap-2">
                    {Array.from({ length: PEGS }, (_, i) => {
                      const color =
                        row === 'draft' ? draft[i] : row === null ? undefined : (row.guess[i] as number);
                      const face = color === undefined ? null : FACES[color];
                      return (
                        <div
                          key={i}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-base shadow-[0_2px_8px_rgba(0,0,0,0.3)] sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:text-lg ${
                            face ? `${face.bg} border-transparent text-black/80` : 'border-white/20 bg-white/[0.02]'
                          }`}
                        >
                          {face ? face.symbol : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex w-12 flex-wrap justify-end gap-1 sm:w-14" aria-label={row && row !== 'draft' ? `${row.score.black} black, ${row.score.white} white` : 'No score yet'}>
                    {row && row !== 'draft' ? (
                      feedbackPegs(row.score).map((peg, i) => (
                        <span
                          key={`${peg}${i}`}
                          className={`h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3 ${
                            peg === 'black'
                              ? 'border border-white/80 bg-black'
                              : peg === 'white'
                                ? 'bg-white'
                                : 'border border-white/20 bg-transparent'
                          }`}
                        />
                      ))
                    ) : (
                      feedbackPegs({ black: 0, white: 0 }).map((peg, i) => (
                        <span key={`${peg}${i}`} className="h-2.5 w-2.5 rounded-full border border-white/15 bg-transparent lg:h-3 lg:w-3" />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {status !== 'playing' ? (
            <div className="mx-auto mt-4 w-full max-w-[480px] text-center">
              <p aria-live="polite" className="text-sm font-bold text-[#f3ecd9] lg:text-base">
                {status === 'won'
                  ? `Cracked in ${tries.length} ${tries.length === 1 ? 'try' : 'tries'}!`
                  : 'Out of tries — the code was:'}
              </p>
              {status === 'lost' && (
                <div className="mt-2 flex justify-center gap-1.5 sm:gap-2">
                  {code.map((c, i) => {
                    const face = FACES[c] as (typeof FACES)[number];
                    return (
                      <div
                        key={i}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-base text-black/80 shadow-[0_2px_8px_rgba(0,0,0,0.3)] lg:h-11 lg:w-11 lg:text-lg ${face.bg}`}
                      >
                        {face.symbol}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <XShare
                  className="flex-1"
                  href={buildXUrl({
                    game: 'code-breaker',
                    big: status === 'won' ? `${tries.length}/${MAX_TRIES}` : `X/${MAX_TRIES}`,
                    line: status === 'won' ? 'tries to crack the code' : 'the code survived',
                    text:
                      status === 'won'
                        ? `I cracked Code Breaker in ${tries.length} ${tries.length === 1 ? 'try' : 'tries'} — can you beat it?`
                        : 'Code Breaker beat me this time — think you can crack it?',
                    stats: [
                      ...(best !== null ? ([['Best', String(best)]] as [string, string][]) : []),
                      ['Tries', `${tries.length}/${MAX_TRIES}`],
                      ['Code', `${PEGS} pegs`],
                    ],
                  })}
                />
                <button type="button" onClick={restart} className={`${newCodeBtn} flex-1`}>
                  New code
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-4 w-full max-w-[480px]">
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2" role="group" aria-label="Colors">
                {FACES.map((f, i) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => addPeg(i)}
                    aria-label={`Add ${f.name}`}
                    className={`flex aspect-square touch-manipulation select-none items-center justify-center rounded-full text-lg text-black/80 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-[filter,transform] duration-75 hover:brightness-[1.12] active:translate-y-px active:brightness-90 lg:text-2xl ${f.bg}`}
                  >
                    {f.symbol}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={backPeg}
                  disabled={draft.length === 0}
                  className="touch-manipulation select-none rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97] disabled:opacity-40 disabled:hover:shadow-none"
                >
                  ⌫ Undo
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={draft.length !== PEGS}
                  className="touch-manipulation select-none rounded-xl bg-[#f3ecd9] px-4 py-3 text-[15px] font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97] disabled:opacity-40"
                >
                  Check
                </button>
              </div>
            </div>
          )}
          <WidgetShareBar game="code-breaker" />
          <HowToPlay
            rows={[
              ['Tap colors', 'Tap colors to fill the row, then press Check to score it. Undo removes the last peg.'],
              ['Repeats allowed', 'A color can appear more than once in the code.'],
              ['Symbols', 'Every color carries its own shape, so the code reads without color vision.'],
            ]}
          />
        </div>

        <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
          <button type="button" onClick={restart} className={`${newCodeBtn} flex w-full items-center justify-center gap-2`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New code
          </button>
        </aside>
      </div>
    </div>
  );
}
