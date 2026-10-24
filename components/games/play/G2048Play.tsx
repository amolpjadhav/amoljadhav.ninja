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
import { SIZE, canMove, maxTile, moveBoard, spawnTile, type Dir } from '@/lib/games/g2048';
import {
  gameState,
  loadStore,
  playUrl,
  recordResult,
  saveStore,
  shareText,
} from '@/lib/games/arcade';

const META = GAME_BY_SLUG['2048'];
const SAVE_KEY = 'games:v1:2048';
const HOWTO_KEY = 'games:v1:howto:2048';
const UNDO_LIMIT = 3;

const TILE_BG: Record<number, string> = {
  // Empty cells stay dimmer than the lowest tile (#2A2B30) so the 4×4 grid
  // always reads, even on a fresh board with two tiles.
  0: 'rgba(255,255,255,0.055)',
  2: '#2A2B30',
  4: '#34353B',
  8: '#1F5F3A',
  16: '#227A45',
  32: '#279150',
  64: '#2EAB5E',
  128: '#3BC46C',
  256: '#5AD17F',
  512: '#7EDC97',
  1024: '#FFD60A',
  2048: '#FF9F0A',
};

function freshBoard(): number[] {
  return spawnTile(spawnTile(new Array(SIZE * SIZE).fill(0)));
}

function tileFont(v: number) {
  if (v >= 16384) return 20;
  if (v >= 1024) return 24;
  if (v >= 128) return 30;
  return 34;
}

export default function G2048Play({ initialMode }: { initialMode: string }) {
  const [mode, setMode] = useState(initialMode);
  // Client-only (ssr:false): restore-on-mount via lazy initializers.
  const [boot] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { board: number[]; score: number; best: number };
        if (Array.isArray(s.board) && s.board.length === SIZE * SIZE) {
          return { board: s.board, score: s.score ?? 0, best: s.best ?? 0 };
        }
      }
    } catch {
      /* fresh board below */
    }
    return { board: freshBoard(), score: 0, best: 0 };
  });
  const [board, setBoard] = useState<number[]>(boot.board);
  const [score, setScore] = useState(boot.score);
  const [best, setBest] = useState(boot.best);
  const [streak, setStreak] = useState<number>(() => gameState(loadStore(), '2048').streak);
  const [undos, setUndos] = useState(0);
  const [prev, setPrev] = useState<{ board: number[]; score: number } | null>(null);
  const [over, setOver] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
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

  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  useEffect(() => {
    if (board.length === 0) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ board, score, best }));
    } catch {
      /* ignore */
    }
  }, [board, score, best]);

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const reset = useCallback(() => {
    setBoard(freshBoard());
    setScore(0);
    setUndos(0);
    setPrev(null);
    setOver(false);
    setCelebrated(false);
    setResultOpen(false);
    setConfirm(false);
  }, []);

  const slide = useCallback(
    (dir: Dir) => {
      if (over || board.length === 0) return;
      const { board: next, gained, moved } = moveBoard(board, dir);
      if (!moved) return;
      setPrev({ board, score });
      const spawned = spawnTile(next);
      setBoard(spawned);
      const s = score + gained;
      setScore(s);
      if (s > best) setBest(s);
      if (maxTile(spawned) >= 2048 && !celebrated) {
        setCelebrated(true);
        say('You made 2048!');
      }
      if (!canMove(spawned)) {
        setOver(true);
        // Higher score wins: record with lowerIsBetter=false.
        const store = loadStore();
        saveStore(recordResult(store, '2048', s, true, false));
        setStreak(gameState(loadStore(), '2048').streak);
        try {
          navigator.vibrate?.([20, 40, 20]);
        } catch {
          /* ignore */
        }
        setTimeout(() => setResultOpen(true), 600);
      }
    },
    [board, score, best, over, celebrated, say],
  );

  const resetStats = useCallback(() => {
    const store = loadStore();
    const next = { ...store };
    delete next['2048'];
    saveStore(next);
    setStreak(0);
    say('Stats reset');
  }, [say]);

  // Keyboard: arrows/WASD.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const dir: Dir | null =
        e.key === 'ArrowUp' || k === 'w'
          ? 'up'
          : e.key === 'ArrowDown' || k === 's'
            ? 'down'
            : e.key === 'ArrowLeft' || k === 'a'
              ? 'left'
              : e.key === 'ArrowRight' || k === 'd'
                ? 'right'
                : null;
      if (dir) {
        e.preventDefault();
        slide(dir);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [slide]);

  const undo = useCallback(() => {
    if (!prev || undos >= UNDO_LIMIT) return;
    setBoard(prev.board);
    setScore(prev.score);
    setUndos((u) => u + 1);
    setPrev(null);
    setOver(false);
  }, [prev, undos]);

  // Swipe: 24px threshold, locked axis.
  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={setMode}
        stats={
          <>
            <StatChip label="Score" value={score.toLocaleString()} />
            <StatChip label="Best" value={best.toLocaleString()} />
          </>
        }
        menu={<GameMenu gameName={META.name} onHowToPlay={() => setHowTo(true)} onResetStats={resetStats} />}
        board={
          <div
            className="grid w-full gap-2.5 p-2.5"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              // Square by construction: equal 1fr tracks both ways, so tiles
              // can never stretch or drift no matter the slot height.
              gridTemplateRows: `repeat(${SIZE}, 1fr)`,
              aspectRatio: '1 / 1',
              background: 'var(--surface-1)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--hairline)',
              touchAction: 'none',
            }}
            role="grid"
            aria-label="2048 board"
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) touch.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touch.current;
              const t = e.changedTouches[0];
              touch.current = null;
              if (!start || !t) return;
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
              slide(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
            }}
          >
            {board.map((v, i) => (
              <div
                key={i}
                role="gridcell"
                aria-label={v === 0 ? 'Empty' : `${v}`}
                className="flex items-center justify-center font-bold tabular-nums"
                style={{
                  minHeight: 0,
                  borderRadius: 'var(--r-md)',
                  background: TILE_BG[v] ?? '#FF9F0A',
                  color: v >= 1024 ? '#000' : '#fff',
                  fontSize: tileFont(v),
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  boxShadow: v >= 128 ? `0 0 24px ${TILE_BG[v]}55` : 'none',
                }}
              >
                {v === 0 ? '' : v}
              </div>
            ))}
          </div>
        }
        dock={
          // Dock buttons live in the shell grid — they cannot clip at mid widths.
          <ControlDock>
            <DockButton label={`Undo move, ${UNDO_LIMIT - undos} left`} onClick={undo} disabled={!prev || undos >= UNDO_LIMIT}>
              Undo · {UNDO_LIMIT - undos}
            </DockButton>
            <DockButton
              label="New game"
              primary
              onClick={() => (score > 0 && !over ? setConfirm(true) : reset())}
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
                Slide with arrows, WASD or swipe. Equal tiles merge — plan ahead so the board never fills.
              </p>
            </div>
            <div className="games-card p-5">
              <h2 className="games-type-headline">Best tile</h2>
              <p className="games-type-display tabular-nums" style={{ color: 'var(--g2048)' }}>
                {maxTile(board.length ? board : [0])}
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
          { title: 'Slide the board', body: 'Arrows, WASD or swipe — every move spawns a tile.' },
          { title: 'Merge equals', body: '2+2 becomes 4, and so on up to 2048.' },
          { title: '3 undos per game', body: 'Spend them when a slide goes wrong.' },
        ]}
        whyItWorks="Corners and planning ahead beat random sliding — keep the big tile parked."
      />
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={maxTile(board.length ? board : [0]) >= 2048 ? 'You made 2048!' : 'Game over'}
        context={`${META.name} · ${mode}`}
        stats={[
          { label: 'score', value: score.toLocaleString() },
          { label: 'best tile', value: String(maxTile(board.length ? board : [0])) },
        ]}
        streak={streak}
        onShare={() => {
          const text = `2048 · score ${score.toLocaleString()} · best tile ${maxTile(board.length ? board : [0])}\n${playUrl('2048')}`;
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
