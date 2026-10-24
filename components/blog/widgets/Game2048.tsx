'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { canMove, maxTile, moveBoard, spawnTile, type Dir } from '@/lib/games/g2048';
import { G2048_KEY, readJSON, writeJSON } from '@/lib/games/records';
import { buildXUrl } from '@/lib/games/share';
import HowToPlay from './HowToPlay';
import XShare from './XShare';
import WidgetShareBar from './WidgetShareBar';

// 2048: slide and merge to 2048. Arrows/WASD plus swipe, one undo per
// game, best score in localStorage. Instant moves, no animation —
// reduced-motion safe by construction.
// Original game by Gabriele Cirulli (MIT).

// Module scope (not component scope): the purity lint forbids impure calls
// inside the component, so randomness enters through here.
function dealBoard(): number[] {
  return spawnTile(spawnTile(new Array(16).fill(0)));
}

const TILE_TEXT: Record<number, string> = {
  0: 'bg-white/5 text-transparent',
  2: 'bg-[#3b3f45] text-white',
  4: 'bg-[#4a4f55] text-white',
  8: 'bg-[#b46a28] text-white',
  16: 'bg-[#c07a2e] text-white',
  32: 'bg-[#d18a35] text-white',
  64: 'bg-[#e09a3c] text-white',
  128: 'bg-[#8fb339] text-black',
  256: 'bg-[#7fa832] text-black',
  512: 'bg-[#6f9c2c] text-black',
  1024: 'bg-[#0aee3c] text-black',
  2048: 'bg-[#0aee3c] text-black',
};

function tileClass(v: number): string {
  if (v === 0) return TILE_TEXT[0] as string;
  return TILE_TEXT[v] ?? 'bg-[#0aee3c] text-black';
}

export default function Game2048() {
  const [board, setBoard] = useState<number[]>(dealBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readJSON<number>(G2048_KEY, 0));
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [undo, setUndo] = useState<{ board: number[]; score: number } | null>(null);
  const [undoUsed, setUndoUsed] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const restart = useCallback(() => {
    setBoard(dealBoard());
    setScore(0);
    setOver(false);
    setWon(false);
    setUndo(null);
    setUndoUsed(false);
  }, []);

  const step = useCallback(
    (dir: Dir) => {
      // Read from closure, never from inside an updater — StrictMode may
      // invoke updaters twice, and moves have side effects (score, best).
      if (over) return;
      const { board: next, gained, moved } = moveBoard(board, dir);
      if (!moved) return;
      const grown = spawnTile(next);
      const total = score + gained;
      setBoard(grown);
      setScore(total);
      setUndo({ board, score });
      if (total > best) {
        setBest(total);
        writeJSON(G2048_KEY, total);
      }
      if (!won && maxTile(grown) >= 2048) setWon(true);
      if (!canMove(grown)) setOver(true);
    },
    [board, best, over, score, won],
  );

  const takeUndo = useCallback(() => {
    if (!undo || undoUsed || over) return;
    setBoard(undo.board);
    setScore(undo.score);
    setUndoUsed(true);
  }, [over, undo, undoUsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const dir = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (dir) {
        e.preventDefault();
        step(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    const t = e.changedTouches[0];
    touch.current = null;
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    step(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  const biggest = maxTile(board);
  const undoBtn =
    'flex-1 touch-manipulation select-none rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97] disabled:opacity-40 disabled:hover:shadow-none';
  const newBtn =
    'flex-1 touch-manipulation select-none rounded-xl bg-[#f3ecd9] px-4 py-3 text-[15px] font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]';

  return (
    <div className="relative not-prose -mx-4 my-6 rounded-none border-y border-white/10 bg-[#1c1d20] px-4 pb-5 pt-2 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] [container:widget/inline-size] sm:mx-0 sm:rounded-xl sm:border sm:px-6 sm:pb-6 sm:pt-3 lg:-mx-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div
          className="rounded-md bg-black/60 px-3 py-1.5 font-mono text-2xl font-bold tabular-nums leading-none text-[#f3ecd9] shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]"
          aria-label={`Score ${score}`}
        >
          {score.toLocaleString()}
          <span className="ml-1.5 align-middle font-sans text-[10px] font-bold uppercase tracking-widest text-white/40">score</span>
        </div>
        {over || won ? (
          <dl className="flex gap-4 text-right sm:gap-6">
            {best > 0 ? (
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">Best</dt>
                <dd className="font-mono text-lg font-bold tabular-nums text-amber-300">{best.toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>

      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#f3ecd9] transition-[width] duration-300"
          style={{ width: `${biggest > 0 ? Math.min(100, (Math.log2(biggest) / 11) * 100) : 0}%` }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          <div className="mb-2 flex gap-2 lg:hidden">
            <button type="button" onClick={takeUndo} disabled={!undo || undoUsed || over} title="One undo per game" className={undoBtn}>
              Undo
            </button>
            <button type="button" onClick={restart} className={newBtn}>
              New game
            </button>
          </div>

          <div className="mx-auto w-full max-w-[340px] rounded-xl border border-white/10 bg-black/30 p-2 shadow-[0_0_18px_rgba(10,238,60,0.12),0_0_60px_rgba(10,238,60,0.05)] sm:max-w-[430px] sm:p-2.5 lg:max-w-[540px]">
            <div
              className="grid grid-cols-4 gap-1.5 [touch-action:none] sm:gap-2"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              role="group"
              aria-label={`2048 board, score ${score}${over ? ', game over' : ''}`}
              suppressHydrationWarning
            >
              {board.map((v, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-lg font-mono text-2xl font-bold tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-3xl lg:text-4xl ${tileClass(v)} ${v >= 1000 ? 'text-lg sm:text-xl lg:text-2xl' : ''}`}
                >
                  {v === 0 ? '' : v.toLocaleString()}
                </div>
              ))}
            </div>
          </div>

          <p aria-live="polite" className="mt-3 flex min-h-6 items-center justify-center text-center text-sm font-bold text-[#f3ecd9] lg:text-base">
            {over ? `Game over — ${score} points.` : won ? 'You made 2048! Keep going.' : ''}
          </p>
          {(over || won) && (
            <div className="mx-auto mt-2 flex w-full max-w-[540px] gap-2">
              <XShare
                className="flex-1"
                href={buildXUrl({
                  game: 'game-2048',
                  big: score.toLocaleString(),
                  line: won ? 'made the 2048 tile' : 'points on the board',
                  text: `I scored ${score.toLocaleString()} in 2048 (biggest tile ${biggest.toLocaleString()}) — can you beat it?`,
                  stats: [
                    ['Best', best.toLocaleString()],
                    ['Biggest tile', biggest.toLocaleString()],
                    ['Goal', '2048'],
                  ],
                })}
              />
              <button type="button" onClick={restart} className={newBtn}>
                Play again
              </button>
            </div>
          )}
          <WidgetShareBar game="game-2048" />
          <HowToPlay
            rows={[
              ['Arrow keys / WASD', 'Slide every tile.'],
              ['Swipe', 'Slide on touch screens.'],
              ['Same numbers meet', 'They merge into one bigger tile.'],
              ['Undo', 'You get exactly one undo per game.'],
            ]}
          />
          <p className="mt-2 text-center text-[11px] text-white/40">Original by Gabriele Cirulli (MIT)</p>
        </div>

        <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
          <div className="flex gap-2">
            <button type="button" onClick={takeUndo} disabled={!undo || undoUsed || over} title="One undo per game" className={undoBtn}>
              Undo
            </button>
            <button type="button" onClick={restart} className={newBtn}>
              New game
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
