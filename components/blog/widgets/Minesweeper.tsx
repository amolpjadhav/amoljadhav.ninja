'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MS_MINES, MS_SIZE, adjacency, placeMines, reveal } from '@/lib/games/minesweeper';
import { MINESWEEPER_KEY, readJSON, writeJSON } from '@/lib/games/records';
import { buildXUrl } from '@/lib/games/share';
import HowToPlay from './HowToPlay';
import XShare from './XShare';

// Minesweeper: 9×9, 10 mines. Mines drop after the first click so the
// opener is always safe. Right-click, long-press, or flag mode to flag.
// Timer runs until the board is solved or explodes.

// Module scope (not component scope): the purity lint forbids impure calls
// inside the component, so the clock and randomness enter through here.
function nowMs(): number {
  return Date.now();
}

function dealMines(safeIdx: number): Set<number> {
  return placeMines(MS_SIZE, MS_MINES, safeIdx);
}

const NUM_COLORS = ['', 'text-sky-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-300', 'text-teal-300', 'text-white', 'text-white/60'];

export default function Minesweeper() {
  const [mines, setMines] = useState<Set<number> | null>(null);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [flagMode, setFlagMode] = useState(false);
  const [status, setStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<number | null>(() => readJSON(MINESWEEPER_KEY, null));
  const [exploded, setExploded] = useState<number | null>(null);
  const startRef = useRef(0);
  const pressTimer = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const t = window.setInterval(() => setElapsed(Math.floor((nowMs() - startRef.current) / 1000)), 500);
    return () => window.clearInterval(t);
  }, [status]);

  const restart = useCallback(() => {
    setMines(null);
    setOpened(new Set());
    setFlagged(new Set());
    setStatus('ready');
    startRef.current = 0;
    setElapsed(0);
    setExploded(null);
  }, []);

  const toggleFlag = useCallback(
    (idx: number) => {
      if (status === 'won' || status === 'lost' || opened.has(idx)) return;
      setFlagged((f) => {
        const next = new Set(f);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    },
    [opened, status],
  );

  const open = useCallback(
    (idx: number) => {
      if (status === 'won' || status === 'lost' || flagged.has(idx) || opened.has(idx)) return;
      const field = mines ?? dealMines(idx);
      if (!mines) {
        setMines(field);
        startRef.current = nowMs();
        setStatus('playing');
      }
      if (field.has(idx)) {
        setExploded(idx);
        setStatus('lost');
        setOpened(new Set(field));
        return;
      }
      const next = reveal(opened, field, flagged, idx);
      setOpened(next);
      if (next.size === MS_SIZE * MS_SIZE - field.size) {
        const secs = Math.floor((nowMs() - startRef.current) / 1000);
        setElapsed(secs);
        setStatus('won');
        setFlagged(new Set(field));
        setBest((b) => {
          const nb = b === null ? secs : Math.min(b, secs);
          writeJSON(MINESWEEPER_KEY, nb);
          return nb;
        });
      }
    },
    [flagged, mines, opened, status],
  );

  const tap = useCallback(
    (idx: number) => {
      if (flagMode) toggleFlag(idx);
      else open(idx);
    },
    [flagMode, open, toggleFlag],
  );

  const onPressStart = (idx: number) => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => toggleFlag(idx), 450);
  };
  const onPressEnd = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const minesLeft = MS_MINES - flagged.size;
  const showAll = status === 'lost' || status === 'won';

  const totalSafe = MS_SIZE * MS_SIZE - MS_MINES;
  const newBtn =
    'flex-1 touch-manipulation select-none rounded-xl bg-[#f3ecd9] px-4 py-3 text-[15px] font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]';
  const flagBtn = (extra: string) =>
    `flex-1 touch-manipulation select-none rounded-xl border px-4 py-3 text-[15px] font-bold transition-all duration-150 active:scale-[0.97] ${extra} ${
      flagMode
        ? 'border-[#0aee3c]/60 bg-[#0aee3c]/10 text-[#0aee3c] shadow-[0_0_14px_rgba(10,238,60,0.25)]'
        : 'border-white/20 text-white/85 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)]'
    }`;

  return (
    <div className="relative not-prose -mx-4 my-6 rounded-none border-y border-white/10 bg-[#1c1d20] px-4 pb-5 pt-2 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] [container:widget/inline-size] sm:mx-0 sm:rounded-xl sm:border sm:px-6 sm:pb-6 sm:pt-3 lg:-mx-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div
          className="rounded-md bg-black/60 px-3 py-1.5 font-mono text-2xl font-bold tabular-nums leading-none text-[#f3ecd9] shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]"
          aria-label={`${elapsed} seconds elapsed`}
        >
          {elapsed}
          <span className="ml-1 align-middle font-sans text-[10px] font-bold uppercase tracking-widest text-white/40">sec</span>
        </div>
        <dl className="flex gap-4 text-right sm:gap-6">
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">Mines left</dt>
            <dd className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]" aria-label={`${minesLeft} mines left`}>
              {minesLeft}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">Open</dt>
            <dd className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
              {opened.size}/{totalSafe}
            </dd>
          </div>
          {best !== null ? (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">Best</dt>
              <dd className="font-mono text-lg font-bold tabular-nums text-amber-300">{best}s</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#f3ecd9] transition-[width] duration-300"
          style={{ width: `${Math.min(100, (opened.size / totalSafe) * 100)}%` }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          <div className="mb-2 flex gap-2 lg:hidden">
            <button type="button" onClick={() => setFlagMode((f) => !f)} aria-pressed={flagMode} className={flagBtn('')}>
              🚩 Flag {flagMode ? 'on' : 'off'}
            </button>
            <button type="button" onClick={restart} className={newBtn}>
              New game
            </button>
          </div>

          <div className="mx-auto w-full max-w-[340px] rounded-xl border border-white/10 bg-black/30 p-2 shadow-[0_0_18px_rgba(10,238,60,0.12),0_0_60px_rgba(10,238,60,0.05)] sm:max-w-[430px] sm:p-2.5 lg:max-w-[500px]">
            <div
              className="grid shrink-0 grid-cols-9 gap-1 sm:gap-1.5"
              role="group"
              aria-label={`Minesweeper board${status === 'lost' ? ', exploded' : status === 'won' ? ', solved' : ''}`}
            >
              {Array.from({ length: MS_SIZE * MS_SIZE }, (_, idx) => {
                const isOpen = opened.has(idx);
                const isFlag = flagged.has(idx);
                const isMine = mines?.has(idx) ?? false;
                const n = mines ? adjacency(idx, mines) : 0;
                const label = isOpen && !isMine ? (n === 0 ? 'empty' : `${n}`) : isFlag ? 'flagged' : 'hidden';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => tap(idx)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFlag(idx);
                    }}
                    onTouchStart={() => onPressStart(idx)}
                    onTouchEnd={onPressEnd}
                    onTouchMove={onPressEnd}
                    aria-label={`Cell ${idx + 1}, ${label}`}
                    className={`flex aspect-square touch-manipulation select-none items-center justify-center rounded-md text-sm font-bold shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-[filter,transform] duration-75 sm:text-base lg:text-lg ${
                      isOpen
                        ? isMine
                          ? idx === exploded
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white'
                          : 'bg-black/60 text-white shadow-none'
                        : 'bg-white/10 text-white/85 hover:brightness-[1.15] active:translate-y-px active:brightness-90'
                    } ${isOpen && !isMine && n > 0 ? (NUM_COLORS[n] as string) : ''}`}
                  >
                    {isOpen ? (isMine ? '💣' : n > 0 ? n : '') : isFlag ? '🚩' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <p aria-live="polite" className="mt-3 flex min-h-6 items-center justify-center text-center text-sm font-bold text-[#f3ecd9] lg:text-base">
            {status === 'won'
              ? `Cleared in ${elapsed}s${best !== null && elapsed <= best ? ' — new best!' : '.'}`
              : status === 'lost'
                ? 'Boom. Try again?'
                : status === 'ready'
                  ? 'Tap a cell to start.'
                  : showAll
                    ? ''
                    : `${opened.size} open`}
          </p>
          {(status === 'won' || status === 'lost') && (
            <div className="mx-auto mt-2 flex w-full max-w-[500px] gap-2">
              <XShare
                className="flex-1"
                href={buildXUrl({
                  game: 'minesweeper',
                  big: status === 'won' ? `${elapsed}s` : 'BOOM',
                  line: status === 'won' ? 'to clear the minefield' : 'the minefield won this round',
                  text:
                    status === 'won'
                      ? `I cleared Minesweeper in ${elapsed}s — can you beat it?`
                      : 'Minesweeper blew me up — think you can clear it?',
                  stats: [
                    ...(best !== null ? ([['Best', `${best}s`]] as [string, string][]) : []),
                    ['Open', `${opened.size}/${totalSafe}`],
                    ['Mines', String(MS_MINES)],
                  ],
                })}
              />
              <button type="button" onClick={restart} className={newBtn}>
                Play again
              </button>
            </div>
          )}
          <HowToPlay
            rows={[
              ['Tap / click', 'Open a cell.'],
              ['Right-click · long-press · Flag mode', 'Flag a suspected mine.'],
              ['Numbers', 'Count the mines touching that cell.'],
            ]}
          />
        </div>

        <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
          <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#24262b] px-4 py-3">
                <span className="text-[15px] font-medium text-white/85">Flag mode</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={flagMode}
                  aria-label="Flag mode"
                  onClick={() => setFlagMode((f) => !f)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-150 active:scale-95 ${flagMode ? 'bg-teal-600' : 'bg-white/15'}`}
                >
                  <span aria-hidden="true" className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${flagMode ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <button type="button" onClick={restart} className={`${newBtn} flex w-full items-center justify-center gap-2`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                New game
              </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
