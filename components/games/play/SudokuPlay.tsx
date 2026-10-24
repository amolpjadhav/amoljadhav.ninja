'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../GameShell';
import StatChip from '../StatChip';
import { DockButton } from '../ControlDock';
import ControlDock from '../ControlDock';
import HowToPlaySheet from '../HowToPlaySheet';
import ResultSheet from '../ResultSheet';
import ConfirmDialog from '../ConfirmDialog';
import Toast from '../Toast';
import GameMenu from '../GameMenu';
import { GAME_BY_SLUG, nextGame } from '../registry';
import { DIFFICULTY_GIVENS, generatePuzzle, isComplete, isValidPlacement, seededRand, type Difficulty } from '@/lib/games/sudoku';
import {
  gameState,
  loadStore,
  mulberry32,
  playUrl,
  ptDate,
  recordResult,
  saveStore,
  seedFromDate,
  shareText,
} from '@/lib/games/arcade';

const META = GAME_BY_SLUG['sudoku'];
const SAVE_KEY = 'games:v1:sudoku';
const HOWTO_KEY = 'games:v1:howto:sudoku';
const MODE_TO_DIFF: Record<string, Difficulty> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  Daily: 'medium',
};

// Daily deals the same Medium board for everyone, seeded by the PT date.
function dealPuzzle(m: string) {
  const diff = MODE_TO_DIFF[m] ?? 'medium';
  const rand = m === 'Daily' ? mulberry32(seedFromDate(ptDate())) : seededRand((Date.now() % 100000) || 1);
  const p = generatePuzzle(diff, rand);
  return { puzzle: p.puzzle, grid: [...p.puzzle], solution: [...p.solution] };
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function SudokuPlay({ initialMode }: { initialMode: string }) {
  // Client-only (ssr:false): restore-on-mount via lazy initializers.
  const [boot] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as {
          puzzle: number[];
          grid: number[];
          solution: number[];
          secs: number;
          mistakes: number;
          mode: string;
        };
        if (
          Array.isArray(s.puzzle) &&
          s.puzzle.length === 81 &&
          Array.isArray(s.grid) &&
          Array.isArray(s.solution) &&
          s.solution.length === 81
        ) {
          return {
            puzzle: s.puzzle,
            grid: s.grid,
            solution: s.solution,
            secs: s.secs ?? 0,
            mistakes: s.mistakes ?? 0,
            mode: s.mode || initialMode,
          };
        }
      }
    } catch {
      /* fresh deal below */
    }
    const p = dealPuzzle(initialMode);
    return { puzzle: p.puzzle, grid: p.grid, solution: p.solution, secs: 0, mistakes: 0, mode: initialMode };
  });
  const [mode, setMode] = useState(boot.mode);
  const [puzzle, setPuzzle] = useState<number[]>(boot.puzzle);
  const [solution, setSolution] = useState<number[]>(boot.solution);
  const [grid, setGrid] = useState<number[]>(boot.grid);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(boot.mistakes);
  const [hints, setHints] = useState(3);
  const [secs, setSecs] = useState(boot.secs);
  const [running, setRunning] = useState(true);
  const [solved, setSolved] = useState(false);
  const [past, setPast] = useState<number[][]>([]);
  const [streak, setStreak] = useState<number>(() => gameState(loadStore(), 'sudoku').streak);
  const [howTo, setHowTo] = useState(() => {
    try {
      return !localStorage.getItem(HOWTO_KEY);
    } catch {
      return false;
    }
  });
  const [confirm, setConfirm] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string | null; key: number }>({ message: null, key: 0 });
  // Timer fix: startTime = now on load/restart (offset by restored secs).
  const startRef = useRef(new Date().getTime() - boot.secs * 1000);

  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  const deal = useCallback((m: string) => {
    const p = dealPuzzle(m);
    setPuzzle(p.puzzle);
    setSolution(p.solution);
    setGrid(p.grid);
    setSelected(null);
    setMistakes(0);
    setHints(3);
    setSecs(0);
    setSolved(false);
    setPast([]);
    setResultOpen(false);
    // Timer fix: startTime = Date.now() on load/restart.
    startRef.current = Date.now();
    setRunning(true);
  }, []);

  // Initial deal/restore happens in the lazy `boot` initializer above.

  // Pause when the tab is hidden; stop on solve.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setSecs(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (puzzle.length === 0) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ puzzle, solution, grid, secs, mistakes, mode }));
    } catch {
      /* ignore */
    }
  }, [puzzle, solution, grid, secs, mistakes, mode]);

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const resetStats = useCallback(() => {
    const store = loadStore();
    const next = { ...store };
    delete next['sudoku'];
    saveStore(next);
    setStreak(0);
    say('Stats reset');
  }, [say]);

  const place = useCallback(
    (v: number) => {
      if (solved || selected === null || puzzle[selected] !== 0) return;
      if (grid[selected] === v) {
        setPast((p) => [...p.slice(-49), grid]);
        setGrid((g) => {
          const n = [...g];
          n[selected] = 0;
          return n;
        });
        return;
      }
      if (!isValidPlacement(grid, selected, v)) {
        const m = mistakes + 1;
        setMistakes(m);
        say(m >= 3 ? 'Three mistakes — keep practicing' : 'That digit breaks the rules');
        return;
      }
      const next = [...grid];
      next[selected] = v;
      setPast((p) => [...p.slice(-49), grid]);
      setGrid(next);
      if (isComplete(next)) {
        setSolved(true);
        setRunning(false);
        const store = loadStore();
        saveStore(recordResult(store, 'sudoku', secs, true));
        setStreak(gameState(loadStore(), 'sudoku').streak);
        try {
          navigator.vibrate?.([30, 60, 30, 60, 60]);
        } catch {
          /* ignore */
        }
        try {
          localStorage.removeItem(SAVE_KEY);
        } catch {
          /* ignore */
        }
        setTimeout(() => setResultOpen(true), 400);
      }
    },
    [grid, mistakes, puzzle, secs, selected, solved, say],
  );

  const undo = useCallback(() => {
    if (solved || past.length === 0) return;
    setGrid(past[past.length - 1] as number[]);
    setPast(past.slice(0, -1));
  }, [solved, past]);

  const hint = useCallback(() => {
    if (solved || hints <= 0 || selected === null || puzzle[selected] !== 0) return;
    const v = solution[selected] ?? 0;
    if (!v || grid[selected] === v) return;
    const next = [...grid];
    next[selected] = v;
    setPast((p) => [...p.slice(-49), grid]);
    setGrid(next);
    setHints((h) => h - 1);
    if (isComplete(next)) {
      setSolved(true);
      setRunning(false);
      const store = loadStore();
      saveStore(recordResult(store, 'sudoku', secs, true));
      setStreak(gameState(loadStore(), 'sudoku').streak);
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        /* ignore */
      }
      setTimeout(() => setResultOpen(true), 400);
    } else {
      say('Hint placed');
    }
  }, [grid, hints, puzzle, secs, selected, solution, solved, say]);

  // Keyboard: arrows, 1–9, Backspace, H (hint), Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') place(Number(e.key));
      else if (e.key === 'Backspace') {
        if (selected !== null) place(grid[selected] ?? 0);
      }
      else if (e.key === 'Escape') setSelected(null);
      else if (e.key === 'h' || e.key === 'H') hint();
      else if (e.key.startsWith('Arrow') && selected !== null) {
        e.preventDefault();
        const r = Math.floor(selected / 9);
        const c = selected % 9;
        const nr =
          e.key === 'ArrowUp' ? Math.max(0, r - 1) : e.key === 'ArrowDown' ? Math.min(8, r + 1) : r;
        const nc =
          e.key === 'ArrowLeft' ? Math.max(0, c - 1) : e.key === 'ArrowRight' ? Math.min(8, c + 1) : c;
        setSelected(nr * 9 + nc);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [place, grid, hint, selected]);

  const givens = DIFFICULTY_GIVENS[MODE_TO_DIFF[mode] ?? 'medium'] as number;

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          deal(m);
        }}
        stats={
          <>
            <StatChip label="Mistakes" value={`${mistakes}/3`} />
            <StatChip label="Hints" value={String(hints)} />
            <StatChip label="Time" value={fmt(secs)} />
          </>
        }
        menu={
          <GameMenu
            gameName={META.name}
            onHowToPlay={() => setHowTo(true)}
            onResetStats={resetStats}
          />
        }
        board={
          <div
            className="grid w-full mx-auto"
            style={{
              gridTemplateColumns: 'repeat(9, 1fr)',
              // Square by construction: equal 1fr tracks both ways.
              gridTemplateRows: 'repeat(9, 1fr)',
              aspectRatio: '1 / 1',
              maxWidth: 'min(100%, min(70vh, 560px))',
            }}
            role="grid"
            aria-label="Sudoku board"
          >
            {grid.map((v, i) => {
              const r = Math.floor(i / 9);
              const c = i % 9;
              const given = puzzle[i] !== 0;
              const sel = selected === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  aria-label={v === 0 ? `Empty cell row ${r + 1} column ${c + 1}` : `${v} row ${r + 1} column ${c + 1}`}
                  onClick={() => setSelected(i)}
                  className="games-press inline-flex items-center justify-center games-type-body"
                  style={{
                    minWidth: 0,
                    minHeight: 0,
                    fontWeight: given ? 600 : 500,
                    color: given ? 'var(--text-1)' : 'var(--info)',
                    background: sel
                      ? 'color-mix(in srgb, var(--sudoku) 35%, transparent)'
                      : 'transparent',
                    borderTop: `1px solid ${r % 3 === 0 ? 'rgba(255,255,255,.28)' : 'var(--hairline)'}`,
                    borderLeft: `1px solid ${c % 3 === 0 ? 'rgba(255,255,255,.28)' : 'var(--hairline)'}`,
                    borderRight: c === 8 ? '2px solid rgba(255,255,255,.28)' : 'none',
                    borderBottom: r === 8 ? '2px solid rgba(255,255,255,.28)' : 'none',
                    borderRadius: 0,
                  }}
                >
                  {v === 0 ? '' : v}
                </button>
              );
            })}
          </div>
        }
        dock={
          <ControlDock>
            <DockButton label="Undo last move" onClick={undo} disabled={past.length === 0 || solved}>
              Undo
            </DockButton>
            <DockButton label="Erase cell" onClick={() => selected !== null && place(grid[selected] ?? 0)}>
              Erase
            </DockButton>
            <DockButton label="Use hint" onClick={hint} disabled={hints <= 0}>
              Hint · {hints}
            </DockButton>
            <DockButton
              label="New game"
              onClick={() => (grid.some((v, i) => v !== puzzle[i]) ? setConfirm(true) : deal(mode))}
            >
              New game
            </DockButton>
          </ControlDock>
        }
        sidePanel={
          <>
            <div className="games-card p-5">
              <h2 className="games-type-headline">How to play</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Fill every row, column and 3×3 box with 1–9. Tap a cell, then the keypad below.
                Givens: {givens} this difficulty.
              </p>
            </div>
            <div className="games-card p-5">
              <h2 className="games-type-headline">Why it works</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Each placement chains constraints — one certain digit unlocks the next.
              </p>
            </div>
          </>
        }
        howToPlay={null}
      />
      {/* Keypad: 9 keys. */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-6 grid grid-cols-9 gap-1.5" aria-label="Digit keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Place ${n}`}
            onClick={() => place(n)}
            className="games-press games-type-headline rounded-[10px] h-11 inline-flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
          >
            {n}
          </button>
        ))}
      </div>
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Tap an empty cell', body: 'Rows, columns and boxes highlight.' },
          { title: 'Place 1–9', body: 'Use the keypad or your keyboard. Wrong digits bounce out.' },
          { title: 'Three mistakes', body: 'Use hints sparingly — only 3 per game.' },
        ]}
        whyItWorks="Sudoku is pure constraint chaining: each certain digit narrows the rest."
      />
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome="Solved"
        context={`${META.name} · ${mode}`}
        stats={[
          { label: 'time', value: fmt(secs) },
          { label: 'mistakes', value: String(mistakes) },
          { label: 'hints', value: String(3 - hints) },
        ]}
        streak={streak}
        onShare={() => {
          const text = `Sudoku ${mode} · ${fmt(secs)} · ${mistakes} mistakes 🟧\n${playUrl('sudoku')}`;
          void shareText(text, say);
        }}
        onPlayAgain={() => deal(mode)}
        onClose={() => setResultOpen(false)}
      />
      <ConfirmDialog
        open={confirm}
        title="Start a new game?"
        body="Your current puzzle will be lost."
        confirmLabel="New game"
        onConfirm={() => {
          setConfirm(false);
          deal(mode);
        }}
        onCancel={() => setConfirm(false)}
      />
      <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} />
    </>
  );
}
