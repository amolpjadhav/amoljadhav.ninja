'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useStockfish, type EngineLine } from './useStockfish';

const RANK_LABEL_W = 18;
const FILES_WHITE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS_WHITE = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Standard win% conversion from centipawns (same curve Lichess/chess.com
// use), so the eval bar's fill isn't just a raw linear pawn count.
function cpToWhiteWinPercent(scoreCp: number | null, scoreMate: number | null): number {
  if (scoreMate !== null) return scoreMate > 0 ? 100 : 0;
  if (scoreCp === null) return 50;
  const win = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * scoreCp)) - 1);
  return Math.max(1, Math.min(99, win));
}

function formatScore(scoreCp: number | null, scoreMate: number | null): string {
  if (scoreMate !== null) return `M${Math.abs(scoreMate)}`;
  if (scoreCp === null) return '—';
  const pawns = scoreCp / 100;
  return `${pawns >= 0 ? '+' : ''}${pawns.toFixed(2)}`;
}

function LineRow({ line, formatMoveNumber }: { line: EngineLine; formatMoveNumber: (i: number) => string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-white/5 last:border-0">
      <span
        className="shrink-0 text-xs font-mono font-bold px-2 py-1 rounded w-14 text-center h-fit"
        style={{
          background: (line.scoreCp ?? 0) >= 0 || line.scoreMate ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)',
          color: (line.scoreCp ?? 0) >= 0 || (line.scoreMate ?? 0) > 0 ? '#111' : '#f5f5f5',
        }}
      >
        {formatScore(line.scoreCp, line.scoreMate)}
      </span>
      <p className="text-xs text-white/70 leading-relaxed font-mono">
        {line.pvSan.map((san, i) => (
          <span key={i}>
            {i === 0 || san.length ? formatMoveNumber(i) : ''}
            {san}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

function moveLabel(san: string, index: number): string {
  const moveNumber = Math.floor(index / 2) + 1;
  return index % 2 === 0 ? `${moveNumber}. ${san}` : san;
}

function ChevronIcon({ double, flip }: { double?: boolean; flip?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path d="M9 3L4 8L9 13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {double && (
        <path d="M13 3L8 8L13 13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center justify-center py-2.5 rounded-lg bg-white/[0.06] text-white/70 border border-white/10 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#5b9bf5]/15 hover:border-[#5b9bf5]/40 hover:text-white active:scale-95 transition-all duration-150"
    >
      {children}
    </button>
  );
}

export default function AnalysisBoard({
  moves,
  captions,
  defaultEngineOn,
  eyebrow,
  description,
}: {
  moves?: string;
  captions?: string;
  defaultEngineOn?: string;
  eyebrow?: string;
  description?: string;
}) {
  const initialMoves = useMemo(() => (moves ? moves.trim().split(/\s+/) : []), [moves]);
  const captionList: string[] = useMemo(() => (captions ? JSON.parse(captions) : []), [captions]);
  // Preset walkthroughs default the engine off (a page can have several of
  // these; nobody wants 4 engines spinning up unasked). The free-sandbox
  // board (no preset moves) defaults it on.
  const engineDefault = defaultEngineOn ? defaultEngineOn === 'true' : initialMoves.length === 0;

  // `history` is every move ever played; `cursor` is how many of those
  // moves are currently applied (0 = start, history.length = latest).
  // The board position is always derived by replaying history[0..cursor)
  // from scratch — no separate mutable game object to fall out of sync.
  const boardId = useId();
  const [history, setHistory] = useState<string[]>(initialMoves);
  const [cursor, setCursor] = useState(initialMoves.length);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [enabled, setEnabled] = useState(engineDefault);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(320);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoEnabledRef = useRef(engineDefault);

  const fen = useMemo(() => {
    const g = new Chess();
    for (const san of history.slice(0, cursor)) g.move(san);
    return g.fen();
  }, [history, cursor]);

  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setBoardSize(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Turn the engine on automatically the first time this board scrolls into
  // view, so a reader doesn't have to remember to click the checkbox. Only
  // fires once per board — if they manually turn it back off afterward,
  // scrolling away and back won't re-enable it out from under them.
  useEffect(() => {
    if (hasAutoEnabledRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAutoEnabledRef.current) {
          hasAutoEnabledRef.current = true;
          setEnabled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { lines, depth, searching, ready } = useStockfish({ fen, enabled, multiPv: 3, depth: 18 });

  const sideToMove = fen.split(' ')[1] === 'b' ? 'black' : 'white';
  const topLine = lines[0];
  const whiteWinPercent = topLine ? cpToWhiteWinPercent(topLine.scoreCp, topLine.scoreMate) : 50;

  const files = orientation === 'white' ? FILES_WHITE : [...FILES_WHITE].reverse();
  const ranks = orientation === 'white' ? RANKS_WHITE : [...RANKS_WHITE].reverse();

  function makeMoveFormatter(startFen: string) {
    const startMoveNumber = Number(startFen.split(' ')[5] || '1');
    const startIsBlack = startFen.split(' ')[1] === 'b';
    return (i: number) => {
      const moveNumber = startMoveNumber + Math.floor((i + (startIsBlack ? 1 : 0)) / 2);
      const isWhiteMove = startIsBlack ? i % 2 === 1 : i % 2 === 0;
      if (isWhiteMove) return `${moveNumber}. `;
      return i === 0 ? `${moveNumber}... ` : '';
    };
  }
  const formatMoveNumber = useMemo(() => makeMoveFormatter(fen), [fen]);

  function handleDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) {
    if (!targetSquare) return false;
    try {
      const next = new Chess(fen);
      const move = next.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) return false;
      // Playing a move while cursor is behind the end (i.e. exploring after
      // stepping back) branches off, discarding whatever used to come next —
      // same behavior as Lichess's analysis board.
      const branched = [...history.slice(0, cursor), move.san];
      setHistory(branched);
      setCursor(branched.length);
      return true;
    } catch {
      return false;
    }
  }

  function reset() {
    setHistory(initialMoves);
    setCursor(initialMoves.length);
  }

  const goToStart = () => setCursor(0);
  const goToPrev = () => setCursor((c) => Math.max(0, c - 1));
  const goToNext = () => setCursor((c) => Math.min(history.length, c + 1));
  const goToEnd = () => setCursor(history.length);

  const caption = captionList[cursor];
  const movesSoFar = history.slice(0, cursor);

  const statusLabel = !enabled ? 'Engine off' : searching ? 'Thinking' : ready ? 'Idle' : 'Loading engine';
  const statusDotColor = !enabled ? '#666' : searching ? '#4ade80' : ready ? '#5b9bf5' : '#facc15';

  return (
    <div
      ref={containerRef}
      className="not-prose bg-gradient-to-b from-[#1f2023] to-[#1a1b1e] border border-white/10 rounded-xl p-6 my-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] overflow-x-hidden"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-wide text-white/40">{eyebrow || 'Analysis board'}</p>
        <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer select-none hover:text-white/70 transition-colors">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-[#5b9bf5] w-3.5 h-3.5" />
          Engine on
        </label>
      </div>
      <p className="text-white/70 text-sm mb-3">
        {description || 'Move any piece to set up any position you like — the engine analyzes live, right in your browser.'}
      </p>

      {(movesSoFar.length > 0 || caption) && (
        <div
          className="rounded-lg px-3.5 py-2.5 mb-4 border border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          style={{ background: 'linear-gradient(180deg, #5f5f5a, #545450)' }}
        >
          {movesSoFar.length > 0 && (
            <p className="text-sm font-mono leading-relaxed mb-1">
              {movesSoFar.map((san, i) => (
                <span
                  key={i}
                  style={{
                    color: i % 2 === 0 ? '#fbfbf8' : '#111111',
                    opacity: i === movesSoFar.length - 1 ? 1 : 0.7,
                    fontWeight: i === movesSoFar.length - 1 ? 700 : 400,
                  }}
                >
                  {moveLabel(san, i)}{' '}
                </span>
              ))}
            </p>
          )}
          {caption && <p className="text-white/80 text-sm">{caption}</p>}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 min-w-0">
        <div className="flex gap-2.5 lg:gap-3 min-w-0 lg:w-auto" style={{ maxWidth: 360 + 14 + RANK_LABEL_W + 24 }}>
          <div className="relative rounded-full overflow-hidden bg-[#141414] shrink-0 self-start border border-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]" style={{ width: 14, height: boardSize }}>
            <div
              className="w-full absolute bottom-0 left-0 bg-gradient-to-b from-[#fdfdfb] to-[#e8e8e3]"
              style={{ height: `${whiteWinPercent}%`, transition: 'height 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
            {topLine &&
              // Label sits just inside the fill it's labeling: on the white
              // fill when there's enough room for it, otherwise dropped just
              // below the boundary onto the dark fill instead.
              (whiteWinPercent > 12 ? (
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold whitespace-nowrap"
                  style={{ bottom: `${Math.max(0, whiteWinPercent - 8)}%`, color: '#1a1a1a' }}
                >
                  {formatScore(topLine.scoreCp, topLine.scoreMate)}
                </span>
              ) : (
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold whitespace-nowrap"
                  style={{ bottom: `calc(${whiteWinPercent}% + 3px)`, color: '#eee' }}
                >
                  {formatScore(topLine.scoreCp, topLine.scoreMate)}
                </span>
              ))}
          </div>

          <div className="flex flex-col shrink-0 justify-around" style={{ width: RANK_LABEL_W, height: boardSize }}>
            {ranks.map((r) => (
              <span key={r} className="text-[10px] text-white/40 text-center font-medium">
                {r}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1" style={{ maxWidth: 360 }}>
            <div
              ref={boardWrapRef}
              className="rounded-md overflow-hidden border-[3px]"
              style={{
                borderColor: '#3a3a3a',
                boxShadow: '0 10px 30px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              <Chessboard
                options={{
                  position: fen,
                  onPieceDrop: handleDrop,
                  boardOrientation: orientation,
                  showNotation: false,
                  darkSquareStyle: { backgroundColor: '#769656' },
                  lightSquareStyle: { backgroundColor: '#eeeed2' },
                  id: boardId,
                }}
              />
            </div>
            <div className="flex mt-1.5">
              {files.map((f) => (
                <div key={f} className="flex-1 text-center text-[10px] text-white/40 font-medium">
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-white/40">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${searching ? 'animate-pulse' : ''}`}
                style={{
                  background: statusDotColor,
                  boxShadow: searching ? `0 0 6px ${statusDotColor}` : undefined,
                }}
              />
              {statusLabel} {depth > 0 && `· depth ${depth}`}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-white/40">{sideToMove} to move</p>
          </div>

          <div className="bg-black/30 rounded-lg px-3 min-h-[140px] border border-white/[0.04]">
            {lines.length === 0 ? (
              <p className="text-white/40 text-xs py-4 text-center">
                {enabled ? 'Waiting for the first lines…' : 'Engine is off.'}
              </p>
            ) : (
              lines.map((line) => <LineRow key={line.multipv} line={line} formatMoveNumber={formatMoveNumber} />)
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <NavButton onClick={goToStart} disabled={cursor === 0} label="Jump to start">
              <ChevronIcon double />
            </NavButton>
            <NavButton onClick={goToPrev} disabled={cursor === 0} label="Previous move">
              <ChevronIcon />
            </NavButton>
            <NavButton onClick={goToNext} disabled={cursor === history.length} label="Next move">
              <ChevronIcon flip />
            </NavButton>
            <NavButton onClick={goToEnd} disabled={cursor === history.length} label="Jump to latest move">
              <ChevronIcon double flip />
            </NavButton>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Move {cursor} of {history.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:border-white/20 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:border-white/20 transition-colors"
              >
                Flip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
