'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  boxOf,
  colOf,
  generatePuzzle,
  rowOf,
  seededRand,
  type Difficulty,
  type Grid,
} from '@/lib/games/sudoku';
import { EMPTY_SUDOKU_BESTS, SUDOKU_KEY, readJSON, writeJSON, type SudokuBests } from '@/lib/games/records';
import { buildXUrl } from '@/lib/games/share';
import { formatClock } from '@/lib/games/scorecard';
import HowToPlay from './HowToPlay';
import XShare from './XShare';
import WidgetShareBar from './WidgetShareBar';

// Sudoku: a fresh unique-solution puzzle per game, three difficulties
// plus a daily (same seed for everyone, streak tracked). Tap a cell,
// enter digits from the pad or keyboard; pencil mode writes notes.
// Wrong digits bounce and count a mistake, never stick.

function nowMs(): number {
  return Date.now();
}

type Mode = Difficulty | 'daily';

const MODES: Mode[] = ['easy', 'medium', 'hard', 'daily'];
const MODE_LABEL: Record<Mode, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', daily: 'Daily' };

interface Deal {
  puzzle: Grid;
  solution: Grid;
  givens: boolean[];
}

function todayKey(d = Date.now()): string {
  return new Date(d).toISOString().slice(0, 10);
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deal(mode: Mode): Deal {
  // Daily is a medium puzzle from the date seed — everyone gets the
  // same board, the Wordle trick for coming back tomorrow.
  const { puzzle, solution } =
    mode === 'daily' ? generatePuzzle('medium', seededRand(hashStr(`sudoku-${todayKey()}`))) : generatePuzzle(mode);
  return { puzzle, solution, givens: puzzle.map((v) => v !== 0) };
}

// One consistent snapshot per run. Like 2048's lazy dealBoard, the
// randomness lives in this module-scope constructor so initializers
// stay a pure read of one snapshot — no deal effect, no re-sync.
function newRun(mode: Mode): { deal: Deal; values: Grid; notes: Set<number>[] } {
  const d = deal(mode);
  return { deal: d, values: [...d.puzzle], notes: Array.from({ length: 81 }, () => new Set<number>()) };
}

/** Unit keys for the completion shimmer: the cell's row, column, box. */
function unitKeys(i: number): string[] {
  return [`r${rowOf(i)}`, `c${colOf(i)}`, `b${boxOf(i)}`];
}

function moveSel(sel: number, key: string): number {
  const r = rowOf(sel);
  const c = colOf(sel);
  if (key === 'ArrowUp') return Math.max(0, r - 1) * 9 + c;
  if (key === 'ArrowDown') return Math.min(8, r + 1) * 9 + c;
  if (key === 'ArrowLeft') return r * 9 + Math.max(0, c - 1);
  return r * 9 + Math.min(8, c + 1);
}

export default function Sudoku() {
  const [mode, setMode] = useState<Mode>('easy');
  const [boot] = useState(() => newRun('easy'));
  const [dealState, setDealState] = useState<Deal>(() => boot.deal);
  const [values, setValues] = useState<Grid>(() => boot.values);
  const [notes, setNotes] = useState<Set<number>[]>(() => boot.notes);
  const [selected, setSelected] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [bests, setBests] = useState<SudokuBests>(() => readJSON(SUDOKU_KEY, EMPTY_SUDOKU_BESTS));
  const [shake, setShake] = useState<number | null>(null);
  const [flashUnits, setFlashUnits] = useState<Set<string>>(new Set());
  const [confirmRestart, setConfirmRestart] = useState(false);
  const startRef = useRef(0);
  const pausedRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const confirmTimer = useRef<number | null>(null);

  // Clock truth lives in refs so the tick stays exact. The clock only
  // ever starts from a tap (Start button); hidden tabs freeze it via
  // visibilitychange. This effect only subscribes (no setState).
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (hiddenAtRef.current === null) hiddenAtRef.current = nowMs();
      } else if (hiddenAtRef.current !== null) {
        pausedRef.current += nowMs() - hiddenAtRef.current;
        hiddenAtRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const stamp = useCallback(() => {
    const frozen = hiddenAtRef.current !== null ? hiddenAtRef.current : nowMs();
    return Math.max(0, Math.floor((frozen - startRef.current - pausedRef.current) / 1000));
  }, []);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const t = window.setInterval(() => setElapsed(stamp()), 500);
    return () => window.clearInterval(t);
  }, [status, stamp]);

  // New deals land idle behind a Start overlay — the clock must never
  // run before the first tap. Dealing and beginning are separate taps.
  const startDeal = useCallback((m: Mode) => {
    const r = newRun(m);
    setMode(m);
    setDealState(r.deal);
    setValues(r.values);
    setNotes(r.notes);
    setSelected(null);
    setNotesMode(false);
    setMistakes(0);
    setHintsLeft(3);
    setStatus('idle');
    setElapsed(0);
    setFlashUnits(new Set());
    setConfirmRestart(false);
    pausedRef.current = 0;
    hiddenAtRef.current = null;
  }, []);

  const beginPlay = useCallback(() => {
    startRef.current = nowMs();
    pausedRef.current = 0;
    hiddenAtRef.current = null;
    setStatus('playing');
  }, []);

  const solution = dealState.solution;

  // Units (row/col/box) the placed cell completes in the next grid.
  const completedUnits = useCallback((next: Grid, i: number): string[] => {
    const out: string[] = [];
    const r = rowOf(i);
    const c = colOf(i);
    let rowFull = true;
    let colFull = true;
    for (let k = 0; k < 9; k += 1) {
      if (next[r * 9 + k] === 0) rowFull = false;
      if (next[k * 9 + c] === 0) colFull = false;
    }
    if (rowFull) out.push(`r${r}`);
    if (colFull) out.push(`c${c}`);
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    let boxFull = true;
    for (let dr = 0; dr < 3 && boxFull; dr += 1) {
      for (let dc = 0; dc < 3; dc += 1) {
        if (next[(br + dr) * 9 + (bc + dc)] === 0) {
          boxFull = false;
          break;
        }
      }
    }
    if (boxFull) out.push(`b${Math.floor(r / 3) * 3 + Math.floor(c / 3)}`);
    return out;
  }, []);

  const flashCompleted = useCallback(
    (next: Grid, i: number) => {
      const fresh = completedUnits(next, i).filter(
        (u) => ![...flashUnits].includes(u),
      );
      if (fresh.length === 0) return;
      setFlashUnits((f) => new Set([...f, ...fresh]));
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => {
        setFlashUnits((f) => {
          const out = new Set(f);
          for (const u of fresh) out.delete(u);
          return out;
        });
      }, 600);
    },
    [completedUnits, flashUnits],
  );

  const finishIfWon = useCallback(
    (next: Grid) => {
      if (!next.every((v) => v !== 0)) return;
      const secs = stamp();
      setElapsed(secs);
      setStatus('won');
      setBests((b) => {
        if (mode === 'daily') {
          const t = todayKey();
          if (b.dailyLast === t) return b;
          const yesterday = todayKey(Date.now() - 86400000);
          const out = { ...b, dailyLast: t, dailyStreak: b.dailyLast === yesterday ? b.dailyStreak + 1 : 1 };
          writeJSON(SUDOKU_KEY, out);
          return out;
        }
        // Daily tracks streaks, not times; the early return above guards it.
        const key = mode as Difficulty;
        const prev = b[key];
        if (prev !== null && secs >= prev) return b;
        const out = { ...b, [key]: secs };
        writeJSON(SUDOKU_KEY, out);
        return out;
      });
    },
    [mode, stamp],
  );

  const remaining = useMemo(() => {
    const counts = new Array(10).fill(9);
    for (const v of values) {
      if (v !== 0) counts[v] -= 1;
    }
    return counts;
  }, [values]);

  const enterDigit = useCallback(
    (v: number) => {
      if (status !== 'playing' || selected === null || !dealState || !solution) return;
      if (dealState.givens[selected]) return;
      // A finished digit has nowhere legal to go — swallow it instead of
      // manufacturing a mistake out of a full row.
      if (remaining[v] <= 0) return;
      if (notesMode) {
        setNotes((ns) => {
          const next = ns.map((s) => new Set(s));
          const cell = next[selected];
          if (values[selected] !== 0) return ns;
          if (cell.has(v)) cell.delete(v);
          else if (cell.size < 5) cell.add(v);
          return next;
        });
        return;
      }
      if (solution[selected] !== v) {
        setMistakes((m) => m + 1);
        setShake(selected);
        window.setTimeout(() => setShake((s) => (s === selected ? null : s)), 350);
        return;
      }
      setValues((vals) => {
        if (vals[selected] === v) return vals;
        const next = [...vals];
        next[selected] = v;
        // A solved digit retires itself from every peer's notes.
        setNotes((ns) =>
          ns.map((s, i) => {
            if (i === selected || !s.has(v)) return s;
            const r = rowOf(i);
            const c = colOf(i);
            if (r === rowOf(selected) || c === colOf(selected) || boxOf(i) === boxOf(selected)) {
              const copy = new Set(s);
              copy.delete(v);
              return copy;
            }
            return s;
          }),
        );
        flashCompleted(next, selected);
        finishIfWon(next);
        return next;
      });
    },
    [status, selected, dealState, solution, notesMode, values, remaining, finishIfWon, flashCompleted],
  );

  const erase = useCallback(() => {
    if (status !== 'playing' || selected === null || !dealState) return;
    if (dealState.givens[selected]) return;
    setValues((vals) => {
      if (vals[selected] === 0) return vals;
      const next = [...vals];
      next[selected] = 0;
      return next;
    });
    setNotes((ns) => {
      if (ns[selected].size === 0) return ns;
      const next = ns.map((s) => new Set(s));
      next[selected].clear();
      return next;
    });
  }, [status, selected, dealState]);

  const hint = useCallback(() => {
    if (status !== 'playing' || !dealState || !solution || hintsLeft <= 0) return;
    const empties: number[] = [];
    for (let i = 0; i < 81; i += 1) {
      if (!dealState.givens[i] && values[i] === 0) empties.push(i);
    }
    if (empties.length === 0) return;
    const pick = selected !== null && empties.includes(selected) ? selected : empties[Math.floor(Math.random() * empties.length)];
    setValues((vals) => {
      const next = [...vals];
      next[pick] = solution[pick];
      flashCompleted(next, pick);
      finishIfWon(next);
      return next;
    });
    setHintsLeft((h) => h - 1);
  }, [status, dealState, solution, hintsLeft, values, selected, finishIfWon, flashCompleted]);

  const selVal = selected !== null && values.length === 81 ? values[selected] : 0;
  const peerOfSel = useMemo(() => {
    if (selected === null) return new Set<number>();
    const s = new Set<number>();
    for (let i = 0; i < 81; i += 1) {
      if (i !== selected && (rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected))) {
        s.add(i);
      }
    }
    return s;
  }, [selected]);

  const best = mode === 'daily' ? null : bests[mode];
  const time = formatClock(elapsed);
  const hintsUsed = 3 - hintsLeft;
  const streakLine = mode === 'daily' && bests.dailyStreak > 0 ? ` · ${bests.dailyStreak}-day streak` : '';

  // Two-tap restart: arm on first tap, deal on second. A stray thumb
  // never wipes a ten-minute board.
  const restartTap = useCallback(() => {
    if (!confirmRestart) {
      setConfirmRestart(true);
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
      confirmTimer.current = window.setTimeout(() => setConfirmRestart(false), 2500);
      return;
    }
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    startDeal(mode);
  }, [confirmRestart, mode, startDeal]);

  const onBoardKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (status !== 'playing') {
        if (status === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          beginPlay();
        }
        return;
      }
      if (e.key >= '1' && e.key <= '9') {
        enterDigit(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        erase();
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesMode((m) => !m);
      } else if (e.key === 'h' || e.key === 'H') {
        hint();
      } else if (e.key === 'Escape') {
        setSelected(null);
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        setSelected((s) => moveSel(s ?? 40, e.key));
      }
    },
    [enterDigit, erase, hint, status, beginPlay],
  );

  return (
    <div className="relative not-prose my-6 rounded-xl border border-white/10 bg-[#1c1d20] px-4 pb-5 pt-3 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] sm:px-6 sm:pb-6">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="flex items-center justify-between gap-2 py-2">
          <div className="flex gap-1 overflow-x-auto rounded-full bg-white/5 p-1" role="tablist" aria-label="Difficulty">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={m === mode}
                onClick={() => startDeal(m)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  m === mode ? 'bg-[#ece7db] text-black' : 'text-white/55 hover:text-white'
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
        </div>
        <p className="pb-2 font-sans text-sm tabular-nums text-white/65" aria-live="polite">
          {MODE_LABEL[mode]} · {mistakes === 1 ? '1 mistake' : `${mistakes} mistakes`} · {time}
          {streakLine}
          {status === 'won' ? ' · solved ✓' : ''}
        </p>

        {
          <div className="relative">
          <div
            className="grid grid-cols-3 gap-2 rounded-2xl bg-black/40 p-2.5 shadow-[0_0_18px_rgba(10,132,255,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:p-3"
            role="grid"
            aria-label="Sudoku board. Arrow keys move, digits fill, N notes, H hint."
            tabIndex={0}
            onKeyDown={onBoardKey}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bx) => {
              const br = Math.floor(bx / 3) * 3;
              const bc = (bx % 3) * 3;
              const cells: number[] = [];
              for (let dr = 0; dr < 3; dr += 1) {
                for (let dc = 0; dc < 3; dc += 1) cells.push((br + dr) * 9 + (bc + dc));
              }
              return (
                <div key={bx} className="grid grid-cols-3 gap-[3px]">
                  {cells.map((i) => {
                    const v = values[i];
                    const given = dealState.givens[i];
                    const isSel = i === selected;
                    const sameVal = selVal !== 0 && v === selVal;
                    const inPeer = peerOfSel.has(i);
                    const flashing = unitKeys(i).some((u) => flashUnits.has(u));
                    const r = rowOf(i);
                    const c = colOf(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        role="gridcell"
                        aria-selected={isSel}
                        aria-label={`Row ${r + 1} column ${c + 1}${v === 0 ? ', empty' : `, ${v}`}${given ? ', given' : ''}`}
                        onClick={() => setSelected(i)}
                        tabIndex={-1}
                        className={`flex aspect-square items-center justify-center rounded-md text-lg transition-colors touch-manipulation sm:text-xl ${
                          isSel
                            ? 'bg-[rgba(10,132,255,0.4)]'
                            : sameVal
                              ? 'bg-[rgba(10,132,255,0.2)]'
                              : inPeer
                                ? 'bg-white/[0.09]'
                                : 'bg-white/[0.05] hover:bg-white/[0.09]'
                        } ${shake === i ? 'animate-[sudoku-shake_0.35s]' : ''} ${
                          flashing ? 'animate-[sudoku-flash_0.6s]' : ''
                        }`}
                      >
                        {v !== 0 ? (
                          <span className={given ? 'font-semibold text-white' : 'font-medium text-[#0A84FF]'}>
                            {v}
                          </span>
                        ) : notes[i].size > 0 ? (
                          <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-[2px] text-[11px] leading-none text-white/45">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                              <span key={n} className="flex items-center justify-center">
                                {notes[i].has(n) ? n : ''}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70 backdrop-blur-[2px]">
              <p className="font-sans text-[22px] font-semibold text-white/95">{MODE_LABEL[mode]} Sudoku</p>
              <p className="font-sans text-sm tabular-nums text-white/65">
                {mode === 'daily'
                  ? bests.dailyStreak > 0
                    ? `${bests.dailyStreak}-day streak on the line`
                    : 'One shared puzzle · new every day'
                  : best !== null
                    ? `Best ${formatClock(best)}`
                    : `${dealState.puzzle.filter((v) => v !== 0).length} givens · unique solution`}
              </p>
              <button
                type="button"
                onClick={beginPlay}
                className="touch-manipulation select-none rounded-full bg-[#0A84FF] px-8 py-3 font-sans text-[17px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
              >
                Start
              </button>
            </div>
          )}
          </div>
        }
        <style>{`@keyframes sudoku-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } } @keyframes sudoku-flash { 0% { filter: brightness(1.9); } 100% { filter: brightness(1); } }`}</style>

        <div className="mt-3 grid grid-cols-9 gap-1" role="group" aria-label="Enter a digit">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => enterDigit(v)}
              disabled={status !== 'playing' || remaining[v] <= 0}
              className="flex touch-manipulation select-none flex-col items-center rounded-lg border border-white/10 bg-white/[0.04] py-1.5 transition-all hover:border-[#0aee3c]/40 active:scale-95 disabled:opacity-40"
            >
              <span className="text-lg font-bold text-white/90">{v}</span>
              <span className="font-sans text-[10px] tabular-nums text-white/35">{remaining[v]} left</span>
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setNotesMode((m) => !m)}
            aria-pressed={notesMode}
            className={`touch-manipulation select-none rounded-lg border px-2 py-2 text-xs font-bold transition-all active:scale-95 ${
              notesMode
                ? 'border-[#0A84FF] bg-[#0A84FF] text-white'
                : 'border-white/10 bg-white/[0.04] text-white/60'
            }`}
          >
            ✎ {notesMode ? 'Notes on' : 'Notes'}
          </button>
          <button
            type="button"
            onClick={erase}
            className="touch-manipulation select-none rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-bold text-white/60 transition-all hover:text-white active:scale-95"
          >
            Erase
          </button>
          <button
            type="button"
            onClick={hint}
            disabled={status !== 'playing' || hintsLeft <= 0}
            className="touch-manipulation select-none rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-bold text-white/60 transition-all hover:text-white active:scale-95 disabled:opacity-40"
          >
            Hint ({hintsLeft})
          </button>
          <button
            type="button"
            onClick={restartTap}
            className={`touch-manipulation select-none rounded-lg border px-2 py-2 text-xs font-bold transition-all active:scale-95 ${
              confirmRestart
                ? 'border-red-400/60 bg-red-400/10 text-red-200'
                : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
            }`}
          >
            {confirmRestart ? 'Sure?' : 'Restart'}
          </button>
        </div>

        {status === 'won' && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-center">
            <p className="font-sans text-[22px] font-semibold text-white/95">Solved in {time} ✓</p>
            <p className="mt-1 font-sans text-sm tabular-nums text-white/65">
              {MODE_LABEL[mode]} · {mistakes === 1 ? '1 mistake' : `${mistakes} mistakes`} · {hintsUsed}{' '}
              {hintsUsed === 1 ? 'hint' : 'hints'}
              {mode === 'daily'
                ? streakLine || ' · streak started'
                : best !== null
                  ? ` · best ${formatClock(best)}`
                  : ''}
            </p>
            <div className="mt-3 flex gap-2">
              <XShare
                className="flex-1"
                href={buildXUrl({
                  game: 'sudoku',
                  big: time,
                  line: `to solve ${mode} sudoku`,
                  text: `Sudoku · ${MODE_LABEL[mode]} · ${time} · ${mistakes} mistakes · ${hintsUsed} hints — can you beat it?`,
                  stats: [
                    ...(mode === 'daily'
                      ? ([['Streak', `${bests.dailyStreak}-day`]] as [string, string][])
                      : best !== null
                        ? ([['Best', formatClock(best)]] as [string, string][])
                        : []),
                    ['Mistakes', String(mistakes)],
                    ['Hints used', String(hintsUsed)],
                  ],
                })}
              />
              <button
                type="button"
                onClick={() => startDeal(mode)}
                className="touch-manipulation select-none rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all hover:bg-white/5 active:scale-[0.97]"
              >
                New puzzle
              </button>
            </div>
          </div>
        )}

        <WidgetShareBar game="sudoku" />
        <HowToPlay
          rows={[
            ['Pick a cell, tap a digit', 'Bold white digits are givens; yours are blue. Wrong ones bounce with a shake and count a mistake. Keyboard: arrows move, 1–9 fill, Backspace erases, N notes, H hint.'],
            ['Pencil notes', 'Toggle Notes and tap digits to pencil in candidates. Solved digits clean themselves out of related notes.'],
            ['Stuck?', 'You get 3 hints per game — a hint fills the selected cell (or a random one) from the solution.'],
            ['Win', 'Fill every cell. Best times save per difficulty; the Daily tab deals one shared puzzle a day and tracks your streak.'],
          ]}
        />
      </div>
    </div>
  );
}
