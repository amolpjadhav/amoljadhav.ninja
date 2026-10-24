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
import {
  adjacency,
  chord,
  difficultyForMode,
  placeMines,
  reveal,
} from '@/lib/games/minesweeper';
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

const META = GAME_BY_SLUG['minesweeper'];
const SAVE_KEY = 'games:v1:minesweeper';
const HOWTO_KEY = 'games:v1:howto:minesweeper';
const NUM_COLORS = ['#64D2FF', '#30D158', '#FF453A', '#BF5AF2', '#FF9F0A', '#40C8E0', '#FFFFFF', '#8E8E93'];
const LONG_PRESS_MS = 350;

type Status = 'ready' | 'playing' | 'won' | 'lost';

interface Boot {
  mines: Set<number>;
  open: Set<number>;
  flags: Set<number>;
  secs: number;
  status: Status;
  lostIdx: number | null;
}

export default function MinesweeperPlay({ initialMode }: { initialMode: string }) {
  const [mode, setMode] = useState(initialMode);
  const diff = mode === 'Daily' ? difficultyForMode('Intermediate') : difficultyForMode(mode);
  const { cols, rows } = diff;
  const total = diff.mines;
  const cells = cols * rows;

  // Client-only (ssr:false): restore-on-mount via lazy initializers.
  const [boot] = useState<Boot>(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as {
          mines: number[];
          open: number[];
          flags: number[];
          secs: number;
          cols: number;
          rows: number;
          total: number;
          lostIdx: number | null;
        };
        if (Array.isArray(s.mines) && s.cols === cols && s.rows === rows && s.total === total) {
          return {
            mines: new Set(s.mines),
            open: new Set(s.open ?? []),
            flags: new Set(s.flags ?? []),
            secs: s.secs ?? 0,
            status: s.mines.length > 0 ? ('playing' as const) : ('ready' as const),
            lostIdx: s.lostIdx ?? null,
          };
        }
      }
    } catch {
      /* fresh start */
    }
    return { mines: new Set<number>(), open: new Set<number>(), flags: new Set<number>(), secs: 0, status: 'ready' as const, lostIdx: null };
  });
  const [mines, setMines] = useState<Set<number>>(boot.mines);
  const [open, setOpen] = useState<Set<number>>(boot.open);
  const [flags, setFlags] = useState<Set<number>>(boot.flags);
  const [flagMode, setFlagMode] = useState(false);
  const [status, setStatus] = useState<Status>(boot.status);
  const [lostIdx, setLostIdx] = useState<number | null>(boot.lostIdx);
  const [shownLost, setShownLost] = useState(0);
  const [secs, setSecs] = useState(boot.secs);
  const [streak, setStreak] = useState<number>(() => gameState(loadStore(), 'minesweeper').streak);
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
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressFired = useRef(false);
  const recorded = useRef(false);

  const changeMode = (m: string) => {
    if (m === mode) return;
    recorded.current = false;
    setMines(new Set());
    setOpen(new Set());
    setFlags(new Set());
    setFlagMode(false);
    setStatus('ready');
    setShownLost(0);
    setLostIdx(null);
    setSecs(0);
    setResultOpen(false);
    setConfirm(false);
    setMode(m);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  useEffect(() => {
    if (status === 'playing') {
      const t = setInterval(() => setSecs((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
    return undefined;
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ mines: [...mines], open: [...open], flags: [...flags], secs, cols, rows, total, lostIdx }),
      );
    } catch {
      /* ignore */
    }
  }, [mines, open, flags, secs, status, cols, rows, total, lostIdx]);

  // Loss reveal: mines appear one after another (40 ms stagger, spec §5.2).
  // shownLost is set alongside the status transitions below, never here.
  useEffect(() => {
    if (status !== 'lost') return undefined;
    const t = setInterval(() => {
      setShownLost((n) => {
        if (n >= mines.size) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 40);
    return () => clearInterval(t);
  }, [status, mines]);

  // Record finished games into games:v1 (best, streak) exactly once.
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || recorded.current) return;
    recorded.current = true;
    const store = loadStore();
    saveStore(recordResult(store, 'minesweeper', secs, status === 'won'));
    setStreak(gameState(loadStore(), 'minesweeper').streak);
    try {
      if (status === 'won') navigator.vibrate?.(30);
    } catch {
      /* ignore */
    }
  }, [status, secs]);

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const reset = useCallback(() => {
    recorded.current = false;
    setMines(new Set());
    setOpen(new Set());
    setFlags(new Set());
    setFlagMode(false);
    setStatus('ready');
    setShownLost(0);
    setLostIdx(null);
    setSecs(0);
    setResultOpen(false);
    setConfirm(false);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const resetStats = useCallback(() => {
    const store = loadStore();
    const next = { ...store };
    delete next['minesweeper'];
    saveStore(next);
    setStreak(0);
    say('Stats reset');
  }, [say]);

  const finishOpen = useCallback(
    (next: Set<number>, field: Set<number>, hitIdx: number | null) => {
      if (hitIdx !== null && field.has(hitIdx)) {
        setLostIdx(hitIdx);
        setShownLost(1);
        setStatus('lost');
        try {
          navigator.vibrate?.([20, 40, 20]);
        } catch {
          /* ignore */
        }
        setTimeout(() => setResultOpen(true), 600);
        return;
      }
      setOpen(next);
      if (next.size === cells - field.size) {
        // Win: every unflagged mine gets a flag automatically.
        setFlags(new Set([...field]));
        setStatus('won');
        setTimeout(() => setResultOpen(true), 600);
      }
    },
    [cells],
  );

  const ensureField = useCallback(
    (firstIdx: number): Set<number> => {
      if (mines.size > 0) return mines;
      const rand = mode === 'Daily' ? mulberry32(seedFromDate(ptDate())) : Math.random;
      const field = new Set(placeMines(cols, total, firstIdx, rand, rows));
      setMines(field);
      setStatus('playing');
      return field;
    },
    [mines, mode, cols, rows, total],
  );

  const toggleFlag = useCallback(
    (idx: number) => {
      if (status !== 'playing' && status !== 'ready') return;
      if (open.has(idx)) return;
      setFlags((f) => {
        const n = new Set(f);
        if (n.has(idx)) n.delete(idx);
        else n.add(idx);
        return n;
      });
      try {
        navigator.vibrate?.(10);
      } catch {
        /* ignore */
      }
    },
    [status, open],
  );

  const tap = useCallback(
    (idx: number) => {
      if (status === 'won' || status === 'lost') return;
      // Chord: tapping an open, satisfied number reveals its neighbors.
      if (open.has(idx)) {
        const c = chord(open, mines, flags, idx, cols, rows);
        if (c === null) return;
        const hit = [...c].find((n) => mines.has(n) && !open.has(n)) ?? null;
        finishOpen(c, mines, hit);
        return;
      }
      if (flagMode) {
        toggleFlag(idx);
        return;
      }
      const field = ensureField(idx);
      if (flags.has(idx)) return;
      if (field.has(idx)) {
        finishOpen(open, field, idx);
        return;
      }
      finishOpen(reveal(open, field, flags, idx, cols, rows), field, null);
    },
    [flagMode, flags, mines, open, status, ensureField, finishOpen, toggleFlag, cols, rows],
  );

  const onPressStart = (idx: number) => {
    pressFired.current = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      pressFired.current = true;
      toggleFlag(idx);
    }, LONG_PRESS_MS);
  };

  const onPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const lostList = [...mines];
  const wide = cols > 9;

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={changeMode}
        stats={
          <>
            <StatChip label="Mines" value={String(total - flags.size)} />
            <StatChip label="Time" value={fmt(secs)} />
          </>
        }
        menu={<GameMenu gameName={META.name} onHowToPlay={() => setHowTo(true)} onResetStats={resetStats} />}
        board={
          <div className={wide ? 'w-full h-full overflow-auto' : 'w-full'}>
            <div
              className={`relative grid gap-1 ${status === 'lost' ? 'games-shake' : ''}`}
              style={
                wide
                  ? { gridTemplateColumns: `repeat(${cols}, 32px)`, width: 'max-content', margin: '0 auto' }
                  : {
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      // Square by construction: equal 1fr tracks both ways.
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                      aspectRatio: '1 / 1',
                    }
              }
              aria-label="Minesweeper board"
            >
              {status === 'ready' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <p
                    className="games-type-callout px-4 py-2 rounded-full"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
                  >
                    Tap any square to start
                  </p>
                </div>
              )}
              {Array.from({ length: cells }).map((_, i) => {
                const isOpen = open.has(i);
                const n = isOpen ? adjacency(i, mines, cols, rows) : 0;
                const flagged = flags.has(i);
                const minePos = lostList.indexOf(i);
                const showMine = status === 'lost' && minePos >= 0 && minePos < shownLost;
                const exploded = status === 'lost' && i === lostIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={flagged ? 'Flagged cell' : isOpen ? (n === 0 ? 'Empty cell' : `${n}`) : 'Covered cell'}
                    onClick={() => {
                      if (pressFired.current) {
                        pressFired.current = false;
                        return;
                      }
                      tap(i);
                    }}
                    onPointerDown={() => onPressStart(i)}
                    onPointerUp={onPressEnd}
                    onPointerCancel={onPressEnd}
                    onPointerLeave={onPressEnd}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleFlag(i);
                    }}
                    className="games-press inline-flex items-center justify-center games-type-callout font-bold rounded-md"
                    style={{
                      aspectRatio: wide ? '1 / 1' : undefined,
                      minWidth: wide ? 32 : 0,
                      minHeight: wide ? 32 : 0,
                      background: exploded ? 'var(--danger)' : isOpen ? 'var(--bg)' : 'var(--surface-2)',
                      color: n > 0 ? (NUM_COLORS[n - 1] as string) : 'var(--text-1)',
                      border: isOpen ? '1px solid var(--hairline)' : '1px solid var(--surface-3)',
                    }}
                  >
                    {flagged && !isOpen ? '⚑' : isOpen && n > 0 ? n : showMine ? '✸' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        }
        dock={
          <ControlDock>
            <DockButton
              label="Toggle flag mode"
              onClick={() => setFlagMode((f) => !f)}
              primary={flagMode}
            >
              ⚑ Flag {flagMode ? 'on' : 'off'}
            </DockButton>
            <DockButton label="New game" onClick={() => (status === 'playing' ? setConfirm(true) : reset())}>
              New game
            </DockButton>
          </ControlDock>
        }
        sidePanel={
          <>
            <div className="games-card p-5">
              <h2 className="games-type-headline">How to play</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Tap to reveal, flag the mines. Numbers count neighboring mines — tapping a satisfied
                number chords its neighbors.
              </p>
            </div>
            <div className="games-card p-5">
              <h2 className="games-type-headline">Why it works</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Every number is a constraint — chaining them together clears the board.
              </p>
            </div>
          </>
        }
        howToPlay={null}
      />
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Tap to reveal', body: 'The first click is always safe.' },
          { title: 'Flag the mines', body: 'Long-press, use the Flag toggle, or right-click on desktop.' },
          { title: 'Chord numbers', body: 'Tap a satisfied number to reveal its neighbors.' },
        ]}
        whyItWorks="Numbers are constraints — combining them leaves only one safe move."
      />
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={status === 'won' ? 'Solved' : 'Game over'}
        context={`${META.name} · ${mode}`}
        stats={[
          { label: 'time', value: fmt(secs) },
          { label: 'mines', value: `${total}` },
        ]}
        streak={streak}
        onShare={() => {
          const text = `Minesweeper ${mode} · ${fmt(secs)} ${status === 'won' ? '💣✅' : '💥'}\n${playUrl('minesweeper')}`;
          void shareText(text, say);
        }}
        onPlayAgain={reset}
        onClose={() => setResultOpen(false)}
      />
      <ConfirmDialog
        open={confirm}
        title="Start a new game?"
        body="Your current board will be lost."
        confirmLabel="New game"
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      />
      <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} />
    </>
  );
}
