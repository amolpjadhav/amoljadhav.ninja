'use client';

import { useCallback, useState } from 'react';
import {
  CODE_BREAKER_KEY,
  EMPTY_FL_STATS,
  EMPTY_SUDOKU_BESTS,
  FIVE_LETTERS_KEY,
  G2048_KEY,
  MINESWEEPER_KEY,
  SUDOKU_KEY,
  readJSON,
  type FiveLettersStats,
  type SudokuBests,
} from '@/lib/games/records';
import { buildScorecardLine, formatClock } from '@/lib/games/scorecard';
import {
  GAME_LABEL,
  buildGameChallenge,
  buildGameChallengeXUrl,
  type GameId,
} from '@/lib/games/share';

// End-of-article scorecard: best results per game, read from the same
// localStorage records each widget writes. Only games you have played
// appear — no empty placeholders. The article supplies the heading.
export default function GameScorecard() {
  const [fl] = useState<FiveLettersStats>(() => readJSON(FIVE_LETTERS_KEY, EMPTY_FL_STATS));
  const [g2048Best] = useState(() => readJSON<number>(G2048_KEY, 0));
  const [code] = useState<number | null>(() => readJSON(CODE_BREAKER_KEY, null));
  const [sweep] = useState<number | null>(() => readJSON(MINESWEEPER_KEY, null));
  const [sudoku] = useState<SudokuBests>(() => readJSON(SUDOKU_KEY, EMPTY_SUDOKU_BESTS));
  const [copied, setCopied] = useState(false);

  // Hardest difficulty solved, so the row brags about the best win.
  const sudokuBest =
    sudoku.hard !== null
      ? { difficulty: 'hard', seconds: sudoku.hard }
      : sudoku.medium !== null
        ? { difficulty: 'medium', seconds: sudoku.medium }
        : sudoku.easy !== null
          ? { difficulty: 'easy', seconds: sudoku.easy }
          : null;
  const rows: [string, string][] = [
    ...(fl.played > 0 ? ([['Five Letters', `${fl.won}/${fl.played} won${fl.best !== null ? ` · best ${fl.best} guesses` : ''}`]] as [string, string][]) : []),
    ...(sweep !== null ? ([['Minesweeper', `cleared in ${sweep}s`]] as [string, string][]) : []),
    ...(code !== null ? ([['Code Breaker', `cracked in ${code}`]] as [string, string][]) : []),
    ...(g2048Best > 0 ? ([['2048', `best ${g2048Best.toLocaleString()}`]] as [string, string][]) : []),
    ...(sudokuBest !== null
      ? ([['Sudoku', `${sudokuBest.difficulty} in ${formatClock(sudokuBest.seconds)}`]] as [string, string][])
      : []),
  ];
  const played = rows.length > 0;
  const shareLine = buildScorecardLine({
    fiveLettersBest: fl.best,
    codeBreakerBest: code,
    minesweeperBest: sweep,
    g2048Best,
    sudokuBest,
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
      <ChallengeList />
    </div>
  );
}

// One row per game: challenge a friend straight at that widget. The X
// link unfurls the game's OG card; the copy link drops them on the
// widget itself via its #anchor.
function ChallengeList() {
  const [copiedGame, setCopiedGame] = useState<string | null>(null);

  const copyAnchor = useCallback(async (game: GameId) => {
    try {
      await navigator.clipboard.writeText(buildGameChallenge(game).anchorUrl);
      setCopiedGame(game);
      window.setTimeout(() => setCopiedGame((g) => (g === game ? null : g)), 2000);
    } catch {
      // Clipboard denied: the X link still works.
    }
  }, []);

  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
        Challenge a friend to one game
      </p>
      <ul className="flex flex-col gap-1.5">
        {(Object.keys(GAME_LABEL) as GameId[]).map((game) => (
          <li
            key={game}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#24262b] px-4 py-2.5"
          >
            <span className="text-[15px] font-medium text-white/85">{GAME_LABEL[game]}</span>
            <span className="flex shrink-0 items-center gap-2">
              <a
                href={buildGameChallengeXUrl(game)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Challenge a friend at ${GAME_LABEL[game]} on X`}
                className="flex h-8 w-8 touch-manipulation items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/85 transition-all hover:bg-white/20 active:scale-95"
              >
                𝕏
              </a>
              <button
                type="button"
                onClick={() => copyAnchor(game)}
                aria-label={`Copy link to ${GAME_LABEL[game]}`}
                className="flex h-8 touch-manipulation items-center rounded-full bg-white/10 px-3 text-xs font-bold text-white/85 transition-all hover:bg-white/20 active:scale-95"
              >
                {copiedGame === game ? 'Copied ✓' : 'Copy link'}
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
