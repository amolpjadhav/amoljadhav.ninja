'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const LIGHT = '#eeeed2';
const DARK = '#769656';

// One glyph shape per piece type for both colors (matching ChessStepper) —
// fill + outline distinguishes sides since white/black codepoints render
// inconsistently across fonts.
const GLYPH: Record<string, string> = {
  K: '♚',
  Q: '♛',
  R: '♜',
  B: '♝',
  N: '♞',
  P: '♟',
};
const PIECE_NAME: Record<string, string> = {
  K: 'king',
  Q: 'queen',
  R: 'rook',
  B: 'bishop',
  N: 'knight',
  P: 'pawn',
};

// Solid fills with a firm edge and a soft drop shadow so pieces read as
// objects on either square color — thin outlines alone look hollow,
// especially white-on-cream.
const GLYPH_FONT = '"Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans",serif';
const pieceLook = (white: boolean): CSSProperties => ({
  color: white ? '#ffffff' : '#141414',
  WebkitTextStroke: white ? '1.5px #2b2b2b' : '1px rgba(255,255,255,0.55)',
  textShadow: '0 2px 3px rgba(0,0,0,0.45)',
  fontFamily: GLYPH_FONT,
});

const START = [
  'rnbqkbnr',
  'pppppppp',
  '........',
  '........',
  '........',
  '........',
  'PPPPPPPP',
  'RNBQKBNR',
];

interface Cell {
  f: number;
  r: number;
}
interface Target {
  from: Cell;
  to: Cell;
  piece: string;
  side: 'White' | 'Black';
}

const sqName = (c: Cell) => `${FILES[c.f]}${8 - c.r}`;
const squareColor = (f: number, r: number) => ((f + r) % 2 === 1 ? DARK : LIGHT);
const isWhite = (p: string) => p !== '.' && p === p.toUpperCase();
const inBoard = (f: number, r: number) => f >= 0 && f < 8 && r >= 0 && r < 8;

function pseudoMoves(board: string[], white: boolean): Target[] {
  const side: Target['side'] = white ? 'White' : 'Black';
  const moves: Target[] = [];
  const push = (f: number, r: number, tf: number, tr: number, piece: string) => {
    if (!inBoard(tf, tr)) return;
    const dest = board[tr][tf];
    if (dest !== '.' && isWhite(dest) === white) return;
    moves.push({
      from: { f, r },
      to: { f: tf, r: tr },
      piece: piece.toUpperCase(),
      side,
    });
  };
  const slide = (f: number, r: number, piece: string, dirs: number[][]) => {
    for (const [df, dr] of dirs) {
      let tf = f + df;
      let tr = r + dr;
      while (inBoard(tf, tr)) {
        const dest = board[tr][tf];
        if (dest === '.') push(f, r, tf, tr, piece);
        else {
          if (isWhite(dest) !== white) push(f, r, tf, tr, piece);
          break;
        }
        tf += df;
        tr += dr;
      }
    }
  };
  const DIAG = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const STRAIGHT = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const KNIGHT = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p === '.' || isWhite(p) !== white) continue;
      const kind = p.toUpperCase();
      if (kind === 'N') {
        for (const [df, dr] of KNIGHT) push(f, r, f + df, r + dr, p);
      } else if (kind === 'B') slide(f, r, p, DIAG);
      else if (kind === 'R') slide(f, r, p, STRAIGHT);
      else if (kind === 'Q') slide(f, r, p, [...DIAG, ...STRAIGHT]);
      else if (kind === 'K') {
        for (const [df, dr] of [...DIAG, ...STRAIGHT]) push(f, r, f + df, r + dr, p);
      } else if (kind === 'P') {
        const dir = white ? -1 : 1;
        const startRow = white ? 6 : 1;
        // Single push (never onto the last rank — no promotion UI in v1).
        if (inBoard(f, r + dir) && board[r + dir][f] === '.' && r + dir !== 0 && r + dir !== 7) {
          push(f, r, f, r + dir, p);
          if (r === startRow && board[r + 2 * dir][f] === '.') push(f, r, f, r + 2 * dir, p);
        }
        for (const df of [-1, 1]) {
          const tf = f + df;
          const tr = r + dir;
          if (!inBoard(tf, tr) || tr === 0 || tr === 7) continue;
          const dest = board[tr][tf];
          if (dest !== '.' && isWhite(dest) !== white) push(f, r, tf, tr, p);
        }
      }
    }
  }
  return moves;
}

function applyMove(board: string[], from: Cell, to: Cell): string[] {
  const next = board.map((row) => row.split(''));
  next[to.r][to.f] = next[from.r][from.f];
  next[from.r][from.f] = '.';
  return next.map((row) => row.join(''));
}

export default function MoveTrainer() {
  const [board, setBoard] = useState<string[]>(START);
  const [whiteToMove, setWhiteToMove] = useState(true);
  const [target, setTarget] = useState<Target | null>(null);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cheer, setCheer] = useState(false);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [flashSq, setFlashSq] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ from: Cell; x: number; y: number; started: number } | null>(
    null,
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<number | null>(null);

  const dealTarget = (b: string[], white: boolean) => {
    const moves = pseudoMoves(b, white);
    if (moves.length === 0) {
      // Degenerate position — start over rather than strand the player.
      const fresh = pseudoMoves(START, true);
      setBoard(START);
      setWhiteToMove(true);
      setTarget(fresh[Math.floor(Math.random() * fresh.length)]);
      return;
    }
    setTarget(moves[Math.floor(Math.random() * moves.length)]);
  };

  // First instruction deals after mount so server and client render the
  // same placeholder — no hydration mismatch from Math.random.
  const dealtRef = useRef(false);
  useEffect(() => {
    if (dealtRef.current) return;
    dealtRef.current = true;
    const moves = pseudoMoves(START, true);
    setTarget(moves[Math.floor(Math.random() * moves.length)]);
  }, []);

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const f = Math.floor(((x - rect.left) / rect.width) * 8);
    const r = Math.floor(((y - rect.top) / rect.height) * 8);
    return inBoard(f, r) ? { f, r } : null;
  };

  const attempt = (from: Cell, to: Cell) => {
    if (!target) return;
    if (from.f !== target.from.f || from.r !== target.from.r) {
      const grabbed = board[from.r][from.f];
      const name = grabbed === '.' ? 'empty square' : `the ${target.side.toLowerCase()} ${PIECE_NAME[grabbed.toUpperCase()]}`;
      setError(`That's ${name} — move the ${PIECE_NAME[target.piece].toLowerCase()} from ${sqName(target.from)}.`);
      setCheer(false);
      setStreak(0);
      return;
    }
    if (to.f !== target.to.f || to.r !== target.to.r) {
      setError(`Not ${sqName(to)} — the ${PIECE_NAME[target.piece].toLowerCase()} goes to ${sqName(target.to)}.`);
      setCheer(false);
      setStreak(0);
      return;
    }
    const next = applyMove(board, target.from, target.to);
    setBoard(next);
    const nextWhite = !whiteToMove;
    setWhiteToMove(nextWhite);
    setSolved((s) => s + 1);
    setStreak((s) => s + 1);
    setError(null);
    setCheer(true);
    setSelected(null);
    setFlashSq(sqName(target.to));
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    advanceRef.current = window.setTimeout(() => {
      setFlashSq(null);
      setCheer(false);
      dealTarget(next, nextWhite);
    }, 700);
  };

  const restart = () => {
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    setBoard(START);
    setWhiteToMove(true);
    setSolved(0);
    setStreak(0);
    setError(null);
    setCheer(false);
    setSelected(null);
    setFlashSq(null);
    setDrag(null);
    dealTarget(START, true);
  };

  const onPointerDown = (cell: Cell, hasPiece: boolean) => (e: React.PointerEvent) => {
    if (!hasPiece || !target) return;
    e.preventDefault();
    setDrag({ from: cell, x: e.clientX, y: e.clientY, started: Date.now() });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    e.preventDefault();
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const { from, x, y, started } = drag;
    setDrag(null);
    const moved = Math.hypot(e.clientX - x, e.clientY - y);
    const dest = cellFromPoint(e.clientX, e.clientY);
    if (!dest) return;
    const isTap = Date.now() - started < 300 && moved < 12;
    if (isTap && dest.f === from.f && dest.r === from.r) {
      // Tap-tap fallback for touch: first tap selects, second tap moves.
      if (selected && selected.f === from.f && selected.r === from.r) setSelected(null);
      else setSelected(from);
      return;
    }
    if (isTap && selected) {
      attempt(selected, dest);
      return;
    }
    if (dest.f === from.f && dest.r === from.r) return;
    attempt(from, dest);
  };

  const dragPiece = drag ? board[drag.from.r][drag.from.f] : '.';

  return (
    <div className="relative not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-xl px-4 pb-5 pt-3 sm:px-6 sm:pb-6 my-6 [-webkit-tap-highlight-color:transparent]">
      <div className="mx-auto mb-1 flex min-h-[40px] w-full max-w-[560px] flex-nowrap items-center justify-between gap-x-3">
        <p className="truncate text-sm text-white/70">
          {target ? (
            <>
              Move the {target.side.toLowerCase()}{' '}
              <strong className="text-white">{PIECE_NAME[target.piece].toLowerCase()}</strong>{' '}
              from <strong className="font-mono text-white">{sqName(target.from)}</strong> to{' '}
              <strong className="font-mono text-2xl font-bold text-white">{sqName(target.to)}</strong>
            </>
          ) : (
            'Setting up the board…'
          )}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Solved</div>
            <div className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">{solved}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Streak</div>
            <div className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">{streak}</div>
          </div>
        </div>
      </div>
      <p className="mx-auto mb-1 min-h-[1.25rem] w-full max-w-[560px] text-xs text-white/50" aria-live="polite">
        {error ? (
          <span className="text-amber-300">{error}</span>
        ) : cheer ? (
          <span className="font-bold text-green-400">Correct!</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </p>

      <div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        className="mx-auto grid w-full max-w-[560px] touch-none select-none grid-cols-8 overflow-hidden rounded-lg border border-white/10"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((r) =>
          [0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
            const p = board[r][f];
            const name = `${FILES[f]}${8 - r}`;
            const isFlash = flashSq === name;
            const isSelected = selected?.f === f && selected?.r === r;
            const isDragFrom = drag?.from.f === f && drag?.from.r === r;
            return (
              <div
                key={name}
                role="button"
                tabIndex={-1}
                aria-label={p === '.' ? `square ${name}` : `${p === p.toUpperCase() ? 'White' : 'Black'} ${PIECE_NAME[p.toUpperCase()]} on ${name}`}
                onPointerDown={p === '.' ? undefined : onPointerDown({ f, r }, true)}
                className={`flex aspect-square w-full items-center justify-center ${
                  isSelected ? 'ring-4 ring-inset ring-amber-300' : ''
                }`}
                style={{ background: isFlash ? '#0aee3c' : squareColor(f, r) }}
              >
                {p !== '.' && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none leading-none text-[2.25rem] sm:text-[3rem]"
                    style={{ opacity: isDragFrom ? 0.25 : 1, ...pieceLook(isWhite(p)) }}
                  >
                    {GLYPH[p.toUpperCase()]}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
      <div className="mx-auto mt-1 flex w-full max-w-[560px] items-center justify-between gap-3">
        <p className="text-[11px] leading-relaxed text-white/50">
          Tip: drag the piece to its square — or tap the piece, then tap the square.
        </p>
        <button
          type="button"
          onClick={restart}
          title="Back to the starting position"
          className="shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-white/85 transition-all duration-150 hover:bg-white/5 active:scale-[0.97]"
        >
          Restart
        </button>
      </div>

      {drag && dragPiece !== '.' && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-50 leading-none text-5xl"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) translate(-50%, -60%) scale(1.15)`,
            ...pieceLook(isWhite(dragPiece)),
          }}
        >
          {GLYPH[dragPiece.toUpperCase()]}
        </span>
      )}
    </div>
  );
}
