'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { COLORS, MAX_TRIES, PEGS, feedbackPegs, randomCode, scoreCode } from '@/lib/games/code-breaker';
import {
  codeBreakerShareRows,
  gameState,
  loadStore,
  playUrl,
  recordResult,
  saveStore,
  shareText,
} from '@/lib/games/arcade';

const META = GAME_BY_SLUG['code-breaker'];
const SAVE_KEY = 'games:v1:code-breaker';
const HOWTO_KEY = 'games:v1:howto:code-breaker';
// Six colors, each with a shape (never color alone).
const SHAPES = ['●', '▲', '■', '★', '◆', '♥'];
const PEG_BG = ['#FF6FB5', '#64D2FF', '#30D158', '#FFD60A', '#BF5AF2', '#FF9F0A'];

export default function CodeBreakerPlay({ initialMode }: { initialMode: string }) {
  const [mode, setMode] = useState(initialMode);
  // Client-only (ssr:false): restore-on-mount via lazy initializers.
  // The secret code is saved alongside guesses — restoring guesses against a
  // fresh random code would score them (and the win check) wrongly.
  const [boot] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { guesses: number[][]; code: number[] };
        if (Array.isArray(s.guesses) && Array.isArray(s.code) && s.code.length === PEGS) {
          return { guesses: s.guesses, code: s.code };
        }
      }
    } catch {
      /* fresh start */
    }
    return { guesses: [] as number[][], code: randomCode() };
  });
  const [code, setCode] = useState<number[]>(boot.code);
  const [guesses, setGuesses] = useState<number[][]>(boot.guesses);
  const [current, setCurrent] = useState<number[]>([]);
  const [won, setWon] = useState(() =>
    boot.guesses.some((g) => scoreCode(code, g).black === PEGS),
  );
  const [howTo, setHowTo] = useState(() => {
    try {
      return !localStorage.getItem(HOWTO_KEY);
    } catch {
      return false;
    }
  });
  const [confirm, setConfirm] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [streak, setStreak] = useState<number>(() => gameState(loadStore(), 'code-breaker').streak);
  const [best, setBest] = useState<number | null>(() => gameState(loadStore(), 'code-breaker').best);
  const [toast, setToast] = useState<{ message: string | null; key: number }>({ message: null, key: 0 });
  const done = won || guesses.length >= MAX_TRIES;
  const scores = guesses.map((g) => scoreCode(code, g));

  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ guesses, code }));
    } catch {
      /* ignore */
    }
  }, [guesses, code]);

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const check = useCallback(() => {
    if (current.length !== PEGS || won || guesses.length >= MAX_TRIES) return;
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent([]);
    const score = scoreCode(code, current);
    const finishedWon = score.black === PEGS;
    if (finishedWon) setWon(true);
    if (finishedWon || next.length >= MAX_TRIES) {
      const store = loadStore();
      saveStore(recordResult(store, 'code-breaker', next.length, finishedWon));
      const fresh = gameState(loadStore(), 'code-breaker');
      setStreak(fresh.streak);
      setBest(fresh.best);
      try {
        navigator.vibrate?.(finishedWon ? [30, 60, 30, 60, 60] : [20, 40, 20]);
      } catch {
        /* ignore */
      }
      setTimeout(() => setResultOpen(true), 600);
    }
  }, [code, current, guesses, won]);

  const reset = useCallback(() => {
    setCode(randomCode());
    setGuesses([]);
    setCurrent([]);
    setWon(false);
    setResultOpen(false);
    setConfirm(false);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    say('New code generated');
  }, [say]);

  const resetStats = useCallback(() => {
    const store = loadStore();
    const next = { ...store };
    delete next['code-breaker'];
    saveStore(next);
    setStreak(0);
    setBest(null);
    say('Stats reset');
  }, [say]);

  const fill = (color: number) => {
    if (done || current.length >= PEGS) return;
    setCurrent((c) => [...c, color]);
  };

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={setMode}
        stats={
          <>
            <StatChip label="Try" value={`${Math.min(guesses.length + 1, MAX_TRIES)}/${MAX_TRIES}`} />
            <StatChip label="Best" value={best === null ? '—' : `${best}`} />
          </>
        }
        menu={<GameMenu gameName={META.name} onHowToPlay={() => setHowTo(true)} onResetStats={resetStats} />}
        board={
          <div className="flex flex-col items-center gap-2 overflow-y-auto py-2" aria-label="Guess board">
            {Array.from({ length: MAX_TRIES }).map((_, r) => {
              const guess = guesses[r] ?? (r === guesses.length ? current : null);
              const isActive = r === guesses.length && !done;
              const score = guesses[r] ? scoreCode(code, guesses[r] as number[]) : null;
              const dots = score ? feedbackPegs(score) : [];
              const opacity = guesses[r] ? 0.85 : isActive ? 1 : 0.45;
              return (
                <div
                  key={r}
                  className="flex items-center gap-3"
                  style={{
                    opacity,
                    outline: isActive ? '2px solid var(--code-breaker)' : 'none',
                    outlineOffset: 4,
                    borderRadius: 12,
                  }}
                  aria-label={guesses[r] ? `Try ${r + 1}` : r === guesses.length ? 'Active row' : `Future row ${r + 1}`}
                  onDragOver={isActive ? (e) => e.preventDefault() : undefined}
                  onDrop={
                    isActive
                      ? (e) => {
                          e.preventDefault();
                          const v = Number(e.dataTransfer.getData('text/plain'));
                          if (Number.isInteger(v) && v >= 0 && v < COLORS) fill(v);
                        }
                      : undefined
                  }
                >
                  <div className="flex gap-2">
                    {Array.from({ length: PEGS }).map((_, c) => {
                      const v = guess?.[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-label={v === undefined ? `Empty slot ${c + 1}` : `Slot ${c + 1}, clear it`}
                          onClick={() => {
                            if (r !== guesses.length) return;
                            setCurrent((prev) => prev.filter((_, i) => i !== c));
                          }}
                          className="games-press games-touch inline-flex items-center justify-center rounded-full"
                          style={{
                            width: 44,
                            height: 44,
                            background: v === undefined ? 'var(--surface-2)' : PEG_BG[v % PEG_BG.length],
                            color: '#000',
                            fontSize: 18,
                          }}
                        >
                          {v === undefined ? '' : SHAPES[v % SHAPES.length]}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-1" aria-hidden>
                    {[0, 1, 2, 3].map((i) => {
                      const d = dots[i];
                      return (
                        <span
                          key={`${r}-${i}`}
                          className="games-pop inline-block rounded-full"
                          style={{
                            width: 10,
                            height: 10,
                            background: d === 'black' ? '#fff' : 'transparent',
                            border: d === 'white' ? '2px solid #fff' : '2px solid var(--surface-3)',
                            animationDelay: `${i * 60}ms`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        }
        dock={
          <ControlDock>
            <DockButton label="Undo last peg" onClick={() => setCurrent((c) => c.slice(0, -1))}>
              Undo
            </DockButton>
            <DockButton label="Check guess" primary onClick={check} disabled={current.length !== PEGS}>
              Check
            </DockButton>
            <DockButton label="New game" onClick={() => (guesses.length > 0 && !done ? setConfirm(true) : reset())}>
              New game
            </DockButton>
          </ControlDock>
        }
        sidePanel={
          <>
            <div className="games-card p-5">
              <h2 className="games-type-headline">How to play</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Tap a color to fill the next slot, then Check. Filled dots match color and position;
                rings match color only. Knuth showed five guesses always suffice.
              </p>
            </div>
            <div className="games-card p-5">
              <h2 className="games-type-headline">Why it works</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Each guess is designed to split the remaining codes as evenly as possible.
              </p>
            </div>
          </>
        }
        howToPlay={null}
      />
      {/* Palette: 6 colors × shapes. Tap fills the next slot; drag onto the board works too. */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-6 flex justify-center gap-2" aria-label="Color palette">
        {Array.from({ length: COLORS }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Color ${i + 1}`}
            onClick={() => fill(i)}
            draggable={!done}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(i));
            }}
            className="games-press inline-flex items-center justify-center rounded-full w-11 h-11"
            style={{ background: PEG_BG[i % PEG_BG.length], color: '#000', fontSize: 20 }}
          >
            {SHAPES[i % SHAPES.length]}
          </button>
        ))}
      </div>
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Fill 4 slots', body: 'Tap palette colors; tap a filled slot to clear it.' },
          { title: 'Press Check', body: 'Dots pop in: filled = right color and spot, ring = right color.' },
          { title: 'Ten tries', body: 'Crack the 4-peg, 6-color code before row 10.' },
        ]}
        whyItWorks="Five guesses always suffice — the Knuth strategy splits possibilities evenly."
      />
      {won && (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-2 flex items-center justify-center gap-2" aria-label="Hidden code revealed">
          <span className="games-type-micro" style={{ color: 'var(--text-3)' }}>
            CODE
          </span>
          {code.map((v, i) => (
            <span
              key={i}
              className="games-pop inline-flex items-center justify-center rounded-full w-10 h-10"
              style={{
                background: PEG_BG[v % PEG_BG.length],
                color: '#000',
                fontSize: 18,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {SHAPES[v % SHAPES.length]}
            </span>
          ))}
        </div>
      )}
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={won ? 'Solved' : 'So close'}
        context={`${META.name} · ${mode}`}
        stats={[{ label: 'tries', value: `${guesses.length}/${MAX_TRIES}` }]}
        streak={streak}
        onShare={() => {
          const rows = codeBreakerShareRows(guesses, scores, SHAPES);
          const text = `Code Breaker ${guesses.length}/${MAX_TRIES}\n${rows}\n${playUrl('code-breaker')}`;
          void shareText(text, say);
        }}
        onPlayAgain={reset}
        onClose={() => setResultOpen(false)}
      />
      <ConfirmDialog
        open={confirm}
        title="Start a new game?"
        body="Your current tries will be lost."
        confirmLabel="New game"
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      />
      <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} />
    </>
  );
}
