'use client';

import { useCallback, useState } from 'react';
import {
  CODE_BREAKER_KEY,
  EMPTY_FL_STATS,
  FIVE_LETTERS_KEY,
  G2048_KEY,
  MINESWEEPER_KEY,
  readJSON,
  type FiveLettersStats,
} from '@/lib/games/records';
import { buildScorecardLine } from '@/lib/games/scorecard';

// End-of-article scorecard: best results per game, read from the same
// localStorage records each widget writes. Only games you have played
// appear — no empty placeholders. The article supplies the heading.
export default function GameScorecard() {
  const [fl] = useState<FiveLettersStats>(() => readJSON(FIVE_LETTERS_KEY, EMPTY_FL_STATS));
  const [g2048Best] = useState(() => readJSON<number>(G2048_KEY, 0));
  const [code] = useState<number | null>(() => readJSON(CODE_BREAKER_KEY, null));
  const [sweep] = useState<number | null>(() => readJSON(MINESWEEPER_KEY, null));
  const [copied, setCopied] = useState(false);

  const rows: [string, string][] = [
    ...(fl.played > 0 ? ([['Five Letters', `${fl.won}/${fl.played} won${fl.best !== null ? ` · best ${fl.best} guesses` : ''}`]] as [string, string][]) : []),
    ...(sweep !== null ? ([['Minesweeper', `cleared in ${sweep}s`]] as [string, string][]) : []),
    ...(code !== null ? ([['Code Breaker', `cracked in ${code}`]] as [string, string][]) : []),
    ...(g2048Best > 0 ? ([['2048', `best ${g2048Best.toLocaleString()}`]] as [string, string][]) : []),
  ];
  const played = rows.length > 0;
  const shareLine = buildScorecardLine({
    fiveLettersBest: fl.best,
    codeBreakerBest: code,
    minesweeperBest: sweep,
    g2048Best,
  });

  const share = useCallback(async () => {
    if (!shareLine) return;
    const text = `${shareLine} — Classic Games, Revisited: https://amoljadhav.ai/blog/classic-games-revisited`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dismissed share sheet: stay quiet.
    }
  }, [shareLine]);

  return (
    <div className="relative not-prose -mx-4 my-6 rounded-none border-y border-white/10 bg-[#1c1d20] px-4 py-5 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] sm:mx-0 sm:rounded-xl sm:border sm:px-6 lg:-mx-8">
      {played ? (
        <>
          <dl className="flex flex-col gap-2">
            {rows.map(([game, result]) => (
              <div
                key={game}
                className="flex items-baseline justify-between gap-4 rounded-xl border border-white/10 bg-[#24262b] px-4 py-3"
              >
                <dt className="text-[15px] font-medium text-white/85">{game}</dt>
                <dd className="font-mono text-sm font-bold tabular-nums text-[#f3ecd9]">{result}</dd>
              </div>
            ))}
          </dl>
          {shareLine ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="font-mono text-sm font-bold tabular-nums text-[#f3ecd9]">{shareLine}</p>
              <button
                type="button"
                onClick={share}
                className="mt-3 w-full touch-manipulation select-none rounded-xl bg-[#f3ecd9] px-4 py-3 text-[15px] font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
              >
                {copied ? 'Copied ✓' : 'Share'}
              </button>
            </div>
          ) : null}
          <p className="mt-3 text-[11px] leading-relaxed text-white/40">Your bests save in your browser.</p>
        </>
      ) : (
        <p className="rounded-xl border border-white/10 bg-[#24262b] px-4 py-3 text-[15px] text-white/60">
          Nothing yet — play a round above and your bests will land here.
        </p>
      )}
    </div>
  );
}
