'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Move, Square } from 'chess.js';
import { Chessboard, defaultPieces } from 'react-chessboard';
import type { Arrow, PieceRenderObject } from 'react-chessboard';
import GameShell from '../GameShell';
import ControlDock from '../ControlDock';
import HowToPlaySheet from '../HowToPlaySheet';
import ResultSheet from '../ResultSheet';
import ConfirmDialog from '../ConfirmDialog';
import Toast from '../Toast';
import GameMenu from '../GameMenu';
import Sheet from '../Sheet';
import SegmentedControl from '../SegmentedControl';
import { GAME_BY_SLUG, nextGame } from '../registry';
import ChessPieceIcon, { LevelIcon } from './ChessPieceIcon';
import type { ChessPieceKind } from './ChessPieceIcon';
import { useChessEngine } from './useChessEngine';
import {
  CHESS_CASUAL_KEY,
  CHESS_HOWTO_KEY,
  CHESS_LEVELS,
  CHESS_OPENING_STATS_KEY,
  CHESS_SAVE_KEY,
  CHESS_STATS_KEY,
  chessShareText,
  deltaEvalText,
  evalWhiteShare,
  fmtEvalCp,
  recordOpeningGame,
  repertoireTop,
  reviewHeadline,
  clockFor,
  engineAcceptsDraw,
  gameOutcome,
  isEngineTurn,
  levelById,
  materialSummary,
  pairMoves,
  promotionChoices,
  randomLegalMove,
  recordChessResult,
  recordLabel,
  resolveColor,
  shouldPlayRandom,
  undoKeepCount,
} from '@/lib/games/chess';
import type {
  ChessColor,
  ChessColorChoice,
  ChessLevel,
  ChessStats,
  ChessTimeControl,
  CoachKind,
  OpeningStats,
} from '@/lib/games/chess';
import {
  gameState,
  loadStore,
  playUrl,
  recordResult,
  saveStore,
  shareText,
} from '@/lib/games/arcade';
import GuideArrows, { hoverUciAt, resolveGuideRings } from './GuideArrows';
import type { GuideArrowSpec } from './GuideArrows';
import {
  analyzeBook,
  bookChildStats,
  epdOf,
  headerOpeningName,
  labelChild,
  loadOpenings,
  loadOpeningStyles,
  lookupOpening,
  mergeExplorerKids,
  pickBookMove,
  rowDistinguishingName,
  styleFor,
} from '@/lib/games/openings';
import type {
  BookAnalysis,
  ExplorerMove,
  MergedKid,
  OpeningsData,
  OpeningStyle,
} from '@/lib/games/openings';
import { knightCorner } from '@/lib/games/guide-geometry';
import {
  NODES_KEY,
  decideUserMove,
  dueCount,
  dueNodeKeys,
  exitBanner,
  recordNodeCorrect,
  recordNodeMiss,
  recordNodeUngraded,
  stageOf,
} from '@/lib/games/trainer';
import type { AssistExit, NodeStore } from '@/lib/games/trainer';
import type { EvalTone } from '@/lib/games/chess';

const META = GAME_BY_SLUG['chess'];
const SETUP_KEY = 'games:v1:chess:setup';
const PGNS_KEY = 'games:v1:chess:pgns';
const SOUND_KEY = 'games:v1:chess:sound';
const THEME_KEY = 'games:v1:chess:theme';
const MAX_PGNS = 50;
const HINTS_PER_GAME = 3;
const EVAL_CACHE_KEY = 'games:v1:chess:evalcache';
const EVAL_CACHE_MAX = 300;

const CLASSIC_LIGHT = '#E8DCC4';
const CLASSIC_DARK = '#B58863';
const GRAPHITE_LIGHT = '#3A3D46';
const GRAPHITE_DARK = '#23252B';
const WALNUT_LIGHT = '#EAD9BC';
const WALNUT_DARK = '#B3875F';
const GREEN_LIGHT = '#EEEED2';
const GREEN_DARK = '#769656';

type BoardTheme = 'walnut' | 'classic' | 'graphite' | 'green';
const BOARD_THEMES: { id: BoardTheme; label: string }[] = [
  { id: 'walnut', label: 'Walnut' },
  { id: 'classic', label: 'Classic' },
  { id: 'graphite', label: 'Graphite' },
  { id: 'green', label: 'Green' },
];

// Walnut grain: one SVG noise field masked to the dark squares and one
// to the light squares (two filter passes total), multiply-blended so it
// reads as wood tooth on close inspection, not at a glance.
function WoodGrain({
  isDark,
  orientation,
}: {
  isDark: (sq: string) => boolean;
  orientation: 'white' | 'black';
}) {
  let dark = '';
  let light = '';
  for (let f = 0; f < 8; f += 1) {
    for (let r = 0; r < 8; r += 1) {
      const x = (orientation === 'white' ? f : 7 - f) * 100;
      const y = (orientation === 'white' ? 7 - r : r) * 100;
      const d = `M${x} ${y}h100v100h-100z`;
      if (isDark(`${'abcdefgh'[f]}${r + 1}`)) dark += d;
      else light += d;
    }
  }
  return (
    <svg
      viewBox="0 0 800 800"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }}
    >
      <defs>
        <filter id="wood-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.8 0.8 0.8 0 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path d={dark} fill="#000" opacity={0.05} filter="url(#wood-grain)" />
      <path d={light} fill="#000" opacity={0.03} filter="url(#wood-grain)" />
    </svg>
  );
}
const RING = 'inset 0 0 0 4px rgba(10,10,12,.45)';
// Alternative arrows render blue (green = main line); widths, heads, and
// labels live in the GuideArrows SVG overlay, not the board library.
const GUIDE_BLUE = '#0A84FF';
const PRACTICE_HINT_MS = 5000;
const REVIEW_STEP_MS = 300;
const BANNER_MS = 3000;

type Status = 'ready' | 'playing' | 'over';
type PlayerOutcome = 'win' | 'loss' | 'draw';

interface Setup {
  levelId: string | null;
  colorChoice: ChessColorChoice;
  time: ChessTimeControl;
  showLegal: boolean;
  hints: boolean;
  allowUndo: boolean;
  coach: CoachKind;
  bookMode: 'main' | 'varied';
  acceptAnyBook: boolean;
}

interface SaveShape {
  sans: string[];
  levelId: string;
  color: ChessColor;
  time: ChessTimeControl;
  clockW: number | null;
  clockB: number | null;
  hintsLeft: number;
  usedUndo: boolean;
}

const PROMO_PIECES: { id: 'q' | 'r' | 'b' | 'n'; name: string }[] = [
  { id: 'q', name: 'queen' },
  { id: 'r', name: 'rook' },
  { id: 'b', name: 'bishop' },
  { id: 'n', name: 'knight' },
];

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* best-effort */
  }
}

// Tiny WebAudio blips (move / capture / castle / check / end). No assets.
function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(
    (kind: 'move' | 'capture' | 'castle' | 'check' | 'end' | 'notify') => {
      void kind;
      if (!enabled) return;
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current ??= new Ctx();
        const ctx = ctxRef.current;
        if (ctx.state === 'suspended') void ctx.resume();
        const seq =
          kind === 'move'
            ? [[520, 0, 0.06]]
            : kind === 'capture'
              ? [[300, 0, 0.08]]
              : kind === 'castle'
                ? [[420, 0, 0.07], [630, 0.08, 0.09]]
                : kind === 'check'
                  ? [[700, 0, 0.07], [700, 0.09, 0.07]]
                  : kind === 'end'
                    ? [[523, 0, 0.09], [659, 0.1, 0.09], [784, 0.2, 0.14]]
                    : [[660, 0, 0.08]];
        for (const [freq, delay, dur] of seq) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = ctx.currentTime + delay;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.18, t + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.02);
        }
      } catch {
        /* audio unavailable */
      }
    },
    [enabled],
  );
}

// Eval bar: White's share fills from White's side (flips with the
// board); the numeric label sits at the winning side's end.
function EvalBar({
  cp,
  stale,
  orientation,
}: {
  cp: number | null;
  stale: boolean;
  orientation: 'white' | 'black';
}) {
  const whiteEndTop = orientation === 'black';
  const labelTop = cp !== null && (cp > 0 ? whiteEndTop : cp < 0 ? !whiteEndTop : false);
  const label = (
    <span
      className="games-type-micro tabular-nums min-h-[1em]"
      style={{ color: 'var(--text-2)', marginTop: labelTop ? 0 : 4, marginBottom: labelTop ? 4 : 0 }}
      role={cp !== null ? 'img' : undefined}
      aria-label={cp !== null ? `Evaluation ${fmtEvalCp(cp) ?? 'unknown'}` : undefined}
    >
      {cp !== null ? fmtEvalCp(cp) : ''}
    </span>
  );
  return (
    <div className="flex w-6 flex-col items-center py-1">
      {labelTop ? label : null}
      <div
        className="relative flex-1 w-[10px] rounded-full overflow-hidden"
        style={{ background: cp !== null ? '#141518' : 'transparent' }}
      >
        {cp !== null && (
          <div
            className={`absolute left-0 w-full bg-white ${whiteEndTop ? 'top-0' : 'bottom-0'}`}
            style={{
              height: `${evalWhiteShare(cp)}%`,
              opacity: stale ? 0.45 : 1,
            }}
          />
        )}
      </div>
      {labelTop ? null : label}
    </div>
  );
}

// Circular icon dock buttons (chess only — the shared DockButton pills
// stay as they are for the other games). Symbol + caption, 44px target.
function RoundDockButton({
  label,
  symbol,
  caption,
  onClick,
  disabled,
  gold,
}: {
  label: string;
  symbol: string;
  caption: string;
  onClick: () => void;
  disabled?: boolean;
  gold?: boolean;
}) {
  return (
    <span className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        disabled={disabled}
        className="games-press inline-flex items-center justify-center w-11 h-11 rounded-full games-type-callout"
        style={
          gold
            ? { background: 'var(--game-accent)', color: '#000' }
            : { background: 'var(--surface-2)', color: 'var(--text-1)', opacity: disabled ? 0.4 : 1 }
        }
      >
        <span aria-hidden style={{ fontSize: 18 }}>
          {symbol}
        </span>
      </button>
      <span aria-hidden className="games-type-micro" style={{ color: 'var(--text-3)' }}>
        {caption}
      </span>
    </span>
  );
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="games-press relative rounded-full shrink-0"
      style={{
        width: 51,
        height: 31,
        background: on ? '#E5C07B' : 'var(--surface-3)',
        transition: 'background 150ms',
      }}
    >
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 27,
          height: 27,
          top: 2,
          left: on ? 22 : 2,
          background: '#fff',
          transition: 'left 150ms',
          boxShadow: '0 1px 3px rgba(0,0,0,.4)',
        }}
      />
    </button>
  );
}

function AssistRow({
  title,
  caption,
  on,
  onToggle,
}: {
  title: string;
  caption?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
      style={{ background: 'var(--surface-2)' }}
    >
      <div className="min-w-0">
        <p className="games-type-callout">{title}</p>
        {caption && (
          <p className="games-type-caption" style={{ color: 'var(--text-2)' }}>
            {caption}
          </p>
        )}
      </div>
      <Switch on={on} onToggle={onToggle} label={title} />
    </div>
  );
}

function SetupSheet({
  open,
  setup,
  stats,
  onChange,
  onStart,
  onClose,
}: {
  open: boolean;
  setup: Setup;
  stats: ChessStats;
  onChange: (s: Setup) => void;
  onStart: () => void;
  onClose: () => void;
}) {
  const hasHistory = Object.values(stats).some((s) => s.wins + s.losses + s.draws > 0);
  const pick = (id: string) => onChange({ ...setup, levelId: setup.levelId === id ? null : id });
  const levelIds = CHESS_LEVELS.map((l) => l.id);
  const onGridKey = (e: React.KeyboardEvent) => {
    const cur = setup.levelId ? levelIds.indexOf(setup.levelId) : -1;
    let next = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (cur + 1 + levelIds.length) % levelIds.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (cur - 1 + levelIds.length) % levelIds.length;
    else return;
    e.preventDefault();
    const id = levelIds[next] as string;
    onChange({ ...setup, levelId: id });
    document.getElementById(`chess-level-${id}`)?.focus();
  };
  const canStart = setup.levelId !== null;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label="New chess game"
      footer={
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="games-press games-type-callout w-full rounded-[14px]"
          style={{
            height: 52,
            background: canStart ? '#E5C07B' : 'var(--surface-3)',
            color: canStart ? '#1A1A1A' : 'var(--text-3)',
            fontWeight: 600,
          }}
        >
          Start game
        </button>
      }
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="games-type-title">New chess game</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close new game sheet"
          className="games-touch games-press inline-flex items-center justify-center rounded-full w-11 h-11 shrink-0"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      <p className="games-type-micro mt-4 mb-2" style={{ color: 'var(--text-3)' }}>
        Opponent
      </p>
      <div
        role="radiogroup"
        aria-label="Opponent level"
        onKeyDown={onGridKey}
        className="grid grid-cols-2 gap-2"
      >
        {CHESS_LEVELS.map((l) => {
          const active = l.id === setup.levelId;
          const rec = recordLabel(stats[l.id]);
          return (
            <button
              key={l.id}
              id={`chess-level-${l.id}`}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(l.id)}
              className="games-touch games-press relative rounded-[14px] px-3 py-2.5 text-left"
              style={{
                background: active ? 'rgba(229,192,123,.12)' : 'var(--surface-2)',
                border: '1px solid var(--hairline)',
                boxShadow: active ? 'inset 0 0 0 1px #E5C07B' : undefined,
                color: 'var(--text-1)',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-3)';
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
              }}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inline-flex items-center justify-center rounded-full games-type-caption"
                  style={{
                    width: 20,
                    height: 20,
                    top: -8,
                    right: -8,
                    background: '#E5C07B',
                    color: '#1A1A1A',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
              <span className="games-type-headline flex items-center gap-2">
                <LevelIcon levelId={l.id} size={24} /> {l.name}
              </span>
              <span className="games-type-caption block mt-0.5" style={{ color: 'var(--text-2)' }}>
                {rec ? `${rec} vs ${l.name}` : l.blurb}
              </span>
              {l.id === 'knight' && !hasHistory && (
                <span
                  className="games-type-micro inline-block mt-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(229,192,123,.16)', color: '#E5C07B' }}
                >
                  Recommended
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="games-type-micro mt-4 mb-2" style={{ color: 'var(--text-3)' }}>
        Play as
      </p>
      <SegmentedControl
        fullWidth
        options={['White', 'Black', 'Random']}
        value={setup.colorChoice === 'white' ? 'White' : setup.colorChoice === 'black' ? 'Black' : 'Random'}
        onChange={(v) =>
          onChange({ ...setup, colorChoice: (v.toLowerCase() as ChessColorChoice) })
        }
        ariaLabel="Color"
      />
      <p className="games-type-micro mt-4 mb-2" style={{ color: 'var(--text-3)' }}>
        Opening coach
      </p>
      <SegmentedControl
        fullWidth
        options={['Off', 'Guided', 'Recall']}
        value={setup.coach === 'guided' ? 'Guided' : setup.coach === 'recall' ? 'Recall' : 'Off'}
        onChange={(v) =>
          onChange({ ...setup, coach: (v.toLowerCase() as CoachKind) })
        }
        ariaLabel="Opening coach"
      />
      <p className="games-type-caption mt-1" style={{ color: 'var(--text-3)' }}>
        Coached games are casual — no record, opening progress instead.
      </p>
      <p className="games-type-micro mt-4 mb-2" style={{ color: 'var(--text-3)' }}>
        Clock
      </p>
      <SegmentedControl
        fullWidth
        options={['No clock', '10+0', '5+3']}
        value={setup.time === 'none' ? 'No clock' : setup.time}
        onChange={(v) =>
          onChange({ ...setup, time: (v === 'No clock' ? 'none' : v) as ChessTimeControl })
        }
        ariaLabel="Time control"
      />
      <p className="games-type-micro mt-4 mb-2" style={{ color: 'var(--text-3)' }}>
        Assists
      </p>
      <div className="flex flex-col gap-2">
        <AssistRow
          title="Show legal moves"
          on={setup.showLegal}
          onToggle={() => onChange({ ...setup, showLegal: !setup.showLegal })}
        />
        <AssistRow
          title="Hints (3 per game)"
          on={setup.hints}
          onToggle={() => onChange({ ...setup, hints: !setup.hints })}
        />
        <AssistRow
          title="Allow undo"
          caption="Undo games don't count toward stats"
          on={setup.allowUndo}
          onToggle={() => onChange({ ...setup, allowUndo: !setup.allowUndo })}
        />
      </div>
    </Sheet>
  );
}

function loadSetup(): Setup {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SETUP_KEY);
  } catch {
    raw = null;
  }
  const s = readJSON<Partial<Setup>>(SETUP_KEY);
  const coach: CoachKind = s?.coach === 'guided' || s?.coach === 'recall' ? s.coach : 'off';
  return {
    // First visit defaults to Knight (friendliest real opponent);
    // afterwards the last choice is remembered.
    levelId: typeof s?.levelId === 'string' ? s.levelId : raw === null ? 'knight' : (s?.levelId ?? null),
    colorChoice: s?.colorChoice === 'black' || s?.colorChoice === 'white' ? s.colorChoice : 'random',
    time: s?.time === '10+0' || s?.time === '5+3' ? s.time : 'none',
    showLegal: s?.showLegal !== false,
    hints: s?.hints !== false,
    allowUndo: s?.allowUndo !== false,
    coach,
    bookMode: s?.bookMode === 'varied' ? 'varied' : 'main',
    acceptAnyBook: s?.acceptAnyBook === true,
  };
}

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface Boot {
  chess: Chess;
  resumed: boolean;
  level: ChessLevel;
  color: ChessColor;
  time: ChessTimeControl;
  clocks: { w: number; b: number } | null;
  hintsLeft: number;
  usedUndo: boolean;
  engineToMove: boolean;
}

function loadBoot(setup: Setup): Boot {
  const fresh = (): Boot => ({
    chess: new Chess(),
    resumed: false,
    level: levelById(setup.levelId ?? 'knight'),
    color: 'white',
    time: setup.time,
    clocks: null,
    hintsLeft: HINTS_PER_GAME,
    usedUndo: false,
    engineToMove: false,
  });
  const save = readJSON<SaveShape>(CHESS_SAVE_KEY);
  if (!save || !Array.isArray(save.sans) || save.sans.length === 0) return fresh();
  const chess = new Chess();
  for (const san of save.sans.slice(0, 400)) {
    try {
      chess.move(san);
    } catch {
      return fresh();
    }
  }
  if (gameOutcome(chess).over) return fresh();
  const color: ChessColor = save.color === 'black' ? 'black' : 'white';
  return {
    chess,
    resumed: true,
    level: levelById(save.levelId),
    color,
    time: save.time === '10+0' || save.time === '5+3' ? save.time : 'none',
    clocks:
      typeof save.clockW === 'number' && typeof save.clockB === 'number'
        ? { w: save.clockW, b: save.clockB }
        : null,
    hintsLeft: typeof save.hintsLeft === 'number' ? save.hintsLeft : HINTS_PER_GAME,
    usedUndo: save.usedUndo === true,
    engineToMove: (chess.turn() === 'w') !== (color === 'white'),
  };
}

export default function ChessPlay({ initialMode }: { initialMode: string }) {
  // All durable state restores through lazy initializers (never setState
  // in a mount effect): the board below mirrors one stable Chess instance.
  const [mode, setMode] = useState(initialMode === 'Play' ? initialMode : 'Play');
  const [pendingMode, setPendingMode] = useState<'Play' | null>(null);
  const [initialSetup] = useState<Setup>(loadSetup);
  const [boot] = useState<Boot>(() => loadBoot(initialSetup));
  const [chess] = useState<Chess>(() => boot.chess);

  const [setup, setSetup] = useState<Setup>(initialSetup);
  const [setupOpen, setSetupOpen] = useState(() => !boot.resumed);
  const [level, setLevel] = useState<ChessLevel>(() => boot.level);
  const [playerColor, setPlayerColor] = useState<ChessColor>(boot.color);
  const [time, setTime] = useState<ChessTimeControl>(boot.time);
  const [fen, setFen] = useState(() => boot.chess.fen());
  const [hist, setHist] = useState<Move[]>(() => boot.chess.history({ verbose: true }) as Move[]);
  const [status, setStatus] = useState<Status>(() => (boot.resumed ? 'playing' : 'ready'));
  const [endInfo, setEndInfo] = useState<{ outcome: PlayerOutcome; reason: string; review: string | null } | null>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromo, setPendingPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [viewPly, setViewPly] = useState<number | null>(null);
  const [clocks, setClocks] = useState<{ w: number; b: number } | null>(boot.clocks);
  const [hintsLeft, setHintsLeft] = useState(boot.hintsLeft);
  const [hint, setHint] = useState<{ from: string; to: string; stage: 1 | 2 } | null>(null);
  const [hintMode, setHintMode] = useState(false);
  const [engineScoreCp, setEngineScoreCp] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [usedUndo, setUsedUndo] = useState(boot.usedUndo);
  const [stats, setStats] = useState<ChessStats>(() => readJSON<ChessStats>(CHESS_STATS_KEY) ?? {});
  const [openStats, setOpenStats] = useState<OpeningStats>(() => readJSON<OpeningStats>(CHESS_OPENING_STATS_KEY) ?? {});
  const [streak, setStreak] = useState(() => gameState(loadStore(), 'chess').streak);
  const [howTo, setHowTo] = useState(() => {
    // First visit shows the setup sheet instead — never stack both.
    // How-to stays one ⋯-menu tap away.
    if (!boot.resumed) return false;
    try {
      return !localStorage.getItem(CHESS_HOWTO_KEY);
    } catch {
      return false;
    }
  });
  const [confirmResign, setConfirmResign] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [sound, setSound] = useState(() => readJSON<boolean>(SOUND_KEY) ?? false);
  const [theme, setTheme] = useState<BoardTheme>(() => readJSON<BoardTheme>(THEME_KEY) ?? 'walnut');
  const [sanInput, setSanInput] = useState('');
  const [shaking, setShaking] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [openings, setOpenings] = useState<OpeningsData | null>(null);
  const [styles, setStyles] = useState<Record<string, OpeningStyle> | null>(null);
  const [toast, setToast] = useState<{ message: string | null; key: number }>({ message: null, key: 0 });
  // Opening coach: coached games are casual (no W/L record, opening
  // progress instead). Mid-game Coach switch needs a casual confirm.
  const [coachOn, setCoachOn] = useState(() => initialSetup.coach !== 'off');
  const [coachKind, setCoachKind] = useState<'guided' | 'recall'>(() =>
    initialSetup.coach === 'recall' ? 'recall' : 'guided',
  );
  const [casual, setCasual] = useState(() => initialSetup.coach !== 'off');
  const [casualGames, setCasualGames] = useState(() => readJSON<number>(CHESS_CASUAL_KEY) ?? 0);
  const [exited, setExited] = useState(false);
  // Single glass panel tabs (desktop): Coach shows the opening guide,
  // Moves the list + SAN input. Leaving book flips to Moves.
  const [panelTab, setPanelTab] = useState<'coach' | 'moves'>('coach');
  const [banner, setBanner] = useState<{ text: string; key: number } | null>(null);
  const [nodes, setNodes] = useState<NodeStore>(() => readJSON<NodeStore>(NODES_KEY) ?? {});
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hotUci, setHotUci] = useState<string | null>(null);
  const [soloUci, setSoloUci] = useState<string | null>(null);
  const [hoverUci, setHoverUci] = useState<string | null>(null);
  const [confirmCoach, setConfirmCoach] = useState(false);
  // Record card starts collapsed mid-game (panel space is precious).
  const [recordForced, setRecordForced] = useState<boolean | null>(null);
  const [pendingReview, setPendingReview] = useState(false);
  const [review, setReview] = useState<{ queue: string[]; index: number; auto: boolean } | null>(null);
  const sanRef = useRef<HTMLInputElement | null>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const practiceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropGuard = useRef(0);
  const recorded = useRef(false);
  const engineNote = useRef(false);
  const kicked = useRef(false);
  const notify = useSound(sound);

  // Live snapshot for engine timeouts, which fire after render closures
  // go stale. Written in an effect, read in callbacks — never in render.
  const liveRef = useRef({ status, playerColor, usedUndo, stats, level, openStats, coachOn, coachKind, review, exited });
  useEffect(() => {
    liveRef.current = { status, playerColor, usedUndo, stats, level, openStats, coachOn, coachKind, review, exited };
  });
  const hintUsedRef = useRef(hintUsed);
  useEffect(() => {
    hintUsedRef.current = hintUsed;
  });
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  });
  const exitAssistRef = useRef<
    ((exit: AssistExit, mainSan: string | null, name: string | null, playedSan?: string | null) => void) | null
  >(null);
  const advanceReviewRef = useRef<(() => void) | null>(null);
  const resolveReviewMoveRef = useRef<
    ((verdict: 'correct' | 'branch' | 'offbook' | 'snapback', epd: string, fullPath: string[]) => boolean) | null
  >(null);
  const casualRef = useRef(casual);
  useEffect(() => {
    casualRef.current = casual;
  });
  const casualGamesRef = useRef(casualGames);
  useEffect(() => {
    casualGamesRef.current = casualGames;
  });
  const clocksRef = useRef(clocks);
  useEffect(() => {
    clocksRef.current = clocks;
  });
  const openingsRef = useRef<OpeningsData | null>(null);
  useEffect(() => {
    openingsRef.current = openings;
  });
  // Real popularity from the Lichess explorer (masters, lichess-DB
  // fallback), EPD-keyed. An empty array means "no stats" — rows and
  // arrows hide their % instead of inventing one.
  const [explorerCache, setExplorerCache] = useState<Record<string, ExplorerMove[]>>({});
  const explorerRef = useRef<Record<string, ExplorerMove[]>>({});
  useEffect(() => {
    if (!openings || !coachOn || status !== 'playing') return undefined;
    const epd = epdOf(fen);
    if (explorerRef.current[epd] !== undefined) return undefined;
    let cancelled = false;
    fetch(`/api/chess/explorer?fen=${encodeURIComponent(fen)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled) return;
        const moves: ExplorerMove[] = Array.isArray(body?.moves)
          ? body.moves
              .filter(
                (m: { uci?: unknown; games?: unknown }): m is { uci: string; games: number } =>
                  typeof m?.uci === 'string' && typeof m?.games === 'number' && m.games > 0,
              )
              .map((m) => ({ uci: m.uci, games: m.games }))
          : [];
        explorerRef.current[epd] = moves;
        setExplorerCache((prev) => (prev[epd] !== undefined ? prev : { ...prev, [epd]: moves }));
      })
      .catch(() => {
        if (cancelled) return;
        explorerRef.current[epd] = [];
        setExplorerCache((prev) => (prev[epd] !== undefined ? prev : { ...prev, [epd]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [coachOn, fen, openings, status]);

  // Opening book loads once with the route (~1.5MB, browser-cached after).
  useEffect(() => {
    let live = true;
    void loadOpenings().then((data) => {
      if (live) setOpenings(data);
    });
    void loadOpeningStyles().then((s) => {
      if (live) setStyles(s);
    });
    return () => {
      live = false;
    };
  }, []);

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);
  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const flashBanner = useCallback((text: string) => {
    setBanner((b) => ({ text, key: (b?.key ?? 0) + 1 }));
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), BANNER_MS);
  }, []);

  const exitAssist = useCallback(
    (exit: AssistExit, mainSan: string | null, entryName: string | null, playedSan: string | null = null) => {
      setExited(true);
      setPanelTab('moves');
        const moveNo = Math.floor(chess.history().length / 2) + 1;
      flashBanner(exitBanner(exit, entryName, moveNo, mainSan, playedSan));
    },
    [chess, flashBanner],
  );

  useEffect(() => {
    exitAssistRef.current = exitAssist;
  }, [exitAssist]);

  const resetTurnHints = useCallback(() => {
    setHintRevealed(false);
    setHintUsed(false);
    setHotUci(null);
    setSoloUci(null);
    setHoverUci(null);
  }, []);

  const recordNodes = useCallback((next: NodeStore) => {
    setNodes(next);
    writeJSON(NODES_KEY, next);
  }, []);

  const recordAttempt = useCallback(
    (key: string, path: string[], kind: 'correct' | 'miss' | 'ungraded', now: number = Date.now()) => {
      const next =
        kind === 'correct'
          ? recordNodeCorrect(nodesRef.current, key, path, now)
          : kind === 'miss'
            ? recordNodeMiss(nodesRef.current, key, path, now)
            : recordNodeUngraded(nodesRef.current, key, path, now);
      recordNodes(next);
    },
    [recordNodes],
  );

  const persistSetup = useCallback((s: Setup) => {
    setSetup(s);
    writeJSON(SETUP_KEY, s);
  }, []);

  // Fresh mirror after every mutation of the Chess instance.
  const sync = useCallback(() => {
    setFen(chess.fen());
    setHist(chess.history({ verbose: true }) as Move[]);
  }, [chess]);

  const saveGame = useCallback(() => {
    if (status !== 'playing') return;
    if (liveRef.current.review) return;
    const sans = chess.history();
    if (sans.length === 0) return;
    const save: SaveShape = {
      sans,
      levelId: level.id,
      color: playerColor,
      time,
      clockW: clocks?.w ?? null,
      clockB: clocks?.b ?? null,
      hintsLeft,
      usedUndo,
    };
    writeJSON(CHESS_SAVE_KEY, save);
  }, [chess, status, level, playerColor, time, clocks, hintsLeft, usedUndo]);

  useEffect(() => {
    saveGame();
  }, [saveGame]);

  const isPlayerTurnNow = useCallback(() => {
    if (status !== 'playing') return false;
    return (chess.turn() === 'w') === (playerColor === 'white');
  }, [chess, status, playerColor]);

  const finish = useCallback(
    (outcome: PlayerOutcome, reason: string) => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      thinkTimer.current = null;
      replyTimer.current = null;
      setThinking(false);
      setStatus('over');
      const sans = chess.history();
      const fullMoves = Math.ceil(sans.length / 2);
      const bookEnd = openingsRef.current ? analyzeBook(openingsRef.current, sans) : null;
      const review = bookEnd ? reviewHeadline({ name: bookEnd.name, outAtMove: bookEnd.outAtMove, fullMoves }) : null;
      setEndInfo({ outcome, reason, review });
      setViewPly(null);
      try {
        localStorage.removeItem(CHESS_SAVE_KEY);
      } catch {
        /* ignore */
      }
      notify('end');
      try {
        navigator.vibrate?.(30);
      } catch {
        /* ignore */
      }
      const live = liveRef.current;
      if (casualRef.current) {
        // Coached games stay out of the W/L record; opening progress still counts.
        const nextCasual = casualGamesRef.current + 1;
        setCasualGames(nextCasual);
        writeJSON(CHESS_CASUAL_KEY, nextCasual);
        if (bookEnd?.name && bookEnd.eco) {
          const depth = bookEnd.outAtMove ?? Math.ceil(chess.history().length / 2);
          const nextOpen = recordOpeningGame(live.openStats, bookEnd.eco, bookEnd.name, outcome, depth);
          setOpenStats(nextOpen);
          writeJSON(CHESS_OPENING_STATS_KEY, nextOpen);
        }
      } else if (!live.usedUndo && !recorded.current) {
        recorded.current = true;
        const nextStats = recordChessResult(live.stats, level.id, outcome);
        setStats(nextStats);
        writeJSON(CHESS_STATS_KEY, nextStats);
        const fullMoves = Math.ceil(chess.history().length / 2);
        const store = loadStore();
        saveStore(recordResult(store, 'chess', fullMoves, outcome === 'win'));
        setStreak(gameState(loadStore(), 'chess').streak);
        if (bookEnd?.name && bookEnd.eco) {
          const depth = bookEnd.outAtMove ?? fullMoves;
          const nextOpen = recordOpeningGame(live.openStats, bookEnd.eco, bookEnd.name, outcome, depth);
          setOpenStats(nextOpen);
          writeJSON(CHESS_OPENING_STATS_KEY, nextOpen);
        }
        // "Next level" nudge after 3 wins at a level.
        const idx = CHESS_LEVELS.findIndex((l) => l.id === level.id);
        const wins = nextStats[level.id]?.wins ?? 0;
        if (outcome === 'win' && wins === 3 && idx >= 0 && idx < CHESS_LEVELS.length - 1) {
          const up = CHESS_LEVELS[idx + 1] as ChessLevel;
          setTimeout(() => say(`${up.piece} ${up.name} unlocked — try the next level!`), 900);
        }
      }
      try {
        const pgn = chess.pgn();
        if (pgn) {
          const list = readJSON<string[]>(PGNS_KEY) ?? [];
          writeJSON(PGNS_KEY, [pgn, ...list].slice(0, MAX_PGNS));
        }
      } catch {
        /* ignore */
      }
      setTimeout(() => setResultOpen(true), 600);
    },
    [chess, level, notify, say],
  );

  const applyEngineMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      const live = liveRef.current;
      if (live.status !== 'playing') return;
      let mv: Move;
      try {
        mv = chess.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
      } catch {
        return;
      }
      const mover: ChessColor = mv.color === 'w' ? 'white' : 'black';
      setClocks((prev) => {
        if (!prev) return prev;
        const inc = clockFor(time)?.incMs ?? 0;
        return mover === 'white' ? { ...prev, w: prev.w + inc } : { ...prev, b: prev.b + inc };
      });
      notify(mv.flags.includes('k') || mv.flags.includes('q') ? 'castle' : mv.captured ? 'capture' : 'move');
      sync();
      resetTurnHints();
      if (chess.isCheck() && !gameOutcome(chess).over) notify('check');
      const out = gameOutcome(chess);
      if (out.over) {
        const winner = out.result === 'draw' ? null : (out.result as ChessColor);
        finish(
          winner === null ? 'draw' : winner === live.playerColor ? 'win' : 'loss',
          out.reason ?? 'draw',
        );
      }
    },
    [chess, finish, notify, resetTurnHints, sync, time],
  );

  const onEngineReply = useCallback(
    (reply: { move: { from: string; to: string; promotion?: string }; scoreCp: number | null }) => {
      if (hintMode) {
        setHintMode(false);
        setHint({ from: reply.move.from, to: reply.move.to, stage: 1 });
        setThinking(false);
        return;
      }
      setThinking(false);
      if (reply.scoreCp !== null) setEngineScoreCp(reply.scoreCp);
      // Human-feeling pause even when the engine answered instantly.
      // Tracked so undo / new game / finish can cancel it.
      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        replyTimer.current = null;
        applyEngineMove(reply.move.from, reply.move.to, reply.move.promotion);
      }, 250 + Math.random() * 350);
    },
    [applyEngineMove, hintMode],
  );

  // Stranded engine searches (dead boot, wedged worker) resolve locally
  // instead of stalling the game: same position and turn still pending.
  const onEngineStall = useCallback(
    (fen: string, turn: 'w' | 'b') => {
      const live = liveRef.current;
      if (live.status !== 'playing' || gameOutcome(chess).over) return;
      if (chess.turn() !== turn || chess.fen() !== fen) return;
      setThinking(false);
      const mv = randomLegalMove(chess);
      if (mv) applyEngineMove(mv.from, mv.to, mv.promotion);
    },
    [applyEngineMove, chess],
  );

  const {
    status: engineStatus,
    requestMove,
    stop: stopEngine,
    analyze,
    cancelAnalysis,
  } = useChessEngine(onEngineReply, onEngineStall);

  useEffect(() => {
    if (engineStatus === 'failed' && !engineNote.current) {
      engineNote.current = true;
      say('Engine failed to load — playing locally');
    }
  }, [engineStatus, say]);

  const scheduleEngine = useCallback(() => {
    // One pending search at a time (StrictMode double-kicks collapse here).
    if (thinkTimer.current) return;
    const live = liveRef.current;
    if (live.status !== 'playing' || gameOutcome(chess).over) return;
    if ((chess.turn() === 'w') === (live.playerColor === 'white')) return;
    setThinking(true);
    thinkTimer.current = setTimeout(() => {
      thinkTimer.current = null;
      const now = liveRef.current;
      if (now.status !== 'playing' || gameOutcome(chess).over) {
        setThinking(false);
        return;
      }
      if (shouldPlayRandom(now.level)) {
        setThinking(false);
        const mv = randomLegalMove(chess);
        if (mv) {
          if (replyTimer.current) clearTimeout(replyTimer.current);
          replyTimer.current = setTimeout(() => {
            replyTimer.current = null;
            applyEngineMove(mv.from, mv.to, mv.promotion);
          }, 250 + Math.random() * 350);
        }
        return;
      }
      // Coached games: the bot plays book replies (main line, or weighted
      // by popularity when Varied) until theory ends then Stockfish takes
      // over. Uncoached games go straight to the engine.
      const book = openingsRef.current;
      if (now.coachOn && !now.exited && book) {
        const botFen = chess.fen();
        const kids = mergeExplorerKids(
          bookChildStats(book, botFen).filter((k) => k.san),
          explorerRef.current[epdOf(botFen)] ?? null,
          botFen,
        );
        if (kids.length > 0) {
          const s = setupRef.current;
          const first = kids[0] as MergedKid;
          const uci =
            s.bookMode === 'varied'
              ? (pickBookMove(kids.map((k) => ({ uci: k.uci, weight: k.games ?? k.weight }))) ?? first.uci)
              : first.uci;
          setThinking(false);
          if (replyTimer.current) clearTimeout(replyTimer.current);
          replyTimer.current = setTimeout(() => {
            replyTimer.current = null;
            applyEngineMove(uci.slice(0, 2), uci.slice(2, 4), uci.slice(4) || undefined);
          }, 250 + Math.random() * 350);
          return;
        }
        // No book reply: the line ends here, engine takes over.
        const entry = lookupOpening(book, epdOf(chess.fen()));
        exitAssistRef.current?.(
          'line-ended',
          null,
          entry ? headerOpeningName(entry.name) : null,
          chess.history().at(-1) ?? null,
        );
      }
      const ok = requestMove(chess.fen(), chess.turn(), now.level);
      if (!ok) {
        setThinking(false);
        const mv = randomLegalMove(chess);
        if (mv) applyEngineMove(mv.from, mv.to, mv.promotion);
      }
    }, 250 + Math.random() * 350);
  }, [applyEngineMove, chess, requestMove]);

  const tryPlayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (status !== 'playing' || !isPlayerTurnNow()) return false;
      const live = liveRef.current;
      if (live.review?.auto) return false;
      const s = setupRef.current;
      const data = openingsRef.current;
      // Classify against the book before mutating (Test snapbacks undo).
      // Explorer-only continuations count as book too.
      const playerFen = chess.fen();
      const kids = data
        ? mergeExplorerKids(
            bookChildStats(data, playerFen).filter((k) => k.san),
            explorerRef.current[epdOf(playerFen)] ?? null,
            playerFen,
          )
        : [];
      const guided = live.coachOn && !live.exited && kids.length > 0;
      const epd = epdOf(chess.fen());
      const path = chess.history();
      let mv: Move;
      try {
        mv = chess.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
      } catch {
        return false;
      }
      const playedUci = `${mv.from}${mv.to}${mv.promotion ?? ''}`;
      const main = kids[0] as MergedKid | undefined;
      const fullPath = [...path, mv.san];
      if (live.review && main) {
        // Review is strict recall: only correct advances, the rest snaps back.
        const verdict = decideUserMove({
          bookUcis: kids.map((k) => k.uci),
          mainUci: main.uci,
          playedUci,
          acceptAnyBook: s.acceptAnyBook,
          stage: 'test',
        });
        const ok = resolveReviewMoveRef.current?.(verdict, epd, fullPath) ?? false;
        if (!ok) return false;
      } else if (guided && main) {
        const rec = nodesRef.current[epd];
        const stage = live.coachKind === 'recall' ? stageOf(rec?.streak ?? 0) : 'learn';
        const verdict = decideUserMove({
          bookUcis: kids.map((k) => k.uci),
          mainUci: main.uci,
          playedUci,
          acceptAnyBook: s.acceptAnyBook,
          stage,
        });
        if (verdict === 'snapback') {
          chess.undo();
          setShaking(true);
          setTimeout(() => setShaking(false), 350);
          say('Not book — try again, or press Show hint');
          return false;
        }
        if (verdict === 'offbook') {
          const entryNow = data ? lookupOpening(data, epd) : null;
          exitAssistRef.current?.(
            'user-left',
            main.san,
            entryNow ? headerOpeningName(entryNow.name) : null,
            mv.san,
          );
        } else if (verdict === 'correct') {
          recordAttempt(epd, fullPath, hintUsedRef.current ? 'ungraded' : 'correct');
        } else {
          recordAttempt(epd, fullPath, 'miss');
        }
      }
      resetTurnHints();
      setHint(null);
      setViewPly(null);
      setSelected(null);
      const mover: ChessColor = mv.color === 'w' ? 'white' : 'black';
      setClocks((prev) => {
        if (!prev) return prev;
        const inc = clockFor(time)?.incMs ?? 0;
        return mover === 'white' ? { ...prev, w: prev.w + inc } : { ...prev, b: prev.b + inc };
      });
      notify(mv.flags.includes('k') || mv.flags.includes('q') ? 'castle' : mv.captured ? 'capture' : 'move');
      sync();
      if (chess.isCheck() && !gameOutcome(chess).over) notify('check');
      try {
        navigator.vibrate?.(10);
      } catch {
        /* ignore */
      }
      const out = gameOutcome(chess);
      if (out.over) {
        const winner = out.result === 'draw' ? null : (out.result as ChessColor);
        finish(winner === null ? 'draw' : winner === playerColor ? 'win' : 'loss', out.reason ?? 'draw');
        return true;
      }
      scheduleEngine();
      return true;
    },
    [chess, finish, isPlayerTurnNow, notify, playerColor, recordAttempt, resetTurnHints, say, scheduleEngine, status, sync, time],
  );

  const startGame = useCallback(
    (s: Setup) => {
      if (!s.levelId) return;
      persistSetup(s);
      stopEngine();
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      thinkTimer.current = null;
      replyTimer.current = null;
      const lv = levelById(s.levelId);
      const color = resolveColor(s.colorChoice);
      chess.load(START_FEN);
      recorded.current = false;
      setLevel(lv);
      setPlayerColor(color);
      setTime(s.time);
      setStatus('playing');
      setEndInfo(null);
      setSelected(null);
      setPendingPromo(null);
      setViewPly(null);
      setHintsLeft(HINTS_PER_GAME);
      setHint(null);
      setHintMode(false);
      setEngineScoreCp(null);
      setThinking(false);
      setUsedUndo(false);
      setFlipped(false);
      setResultOpen(false);
      setConfirmNew(false);
      setConfirmResign(false);
      setSetupOpen(false);
      setSanInput('');
      setCoachOn(s.coach !== 'off');
      setCoachKind(s.coach === 'recall' ? 'recall' : 'guided');
      setCasual(s.coach !== 'off');
      setExited(false);
      setPanelTab('coach');
      setBanner(null);
      setReview(null);
      setShaking(false);
      resetTurnHints();
      const clk = clockFor(s.time);
      setClocks(clk ? { w: clk.startMs, b: clk.startMs } : null);
      sync();
      try {
        localStorage.removeItem(CHESS_SAVE_KEY);
      } catch {
        /* ignore */
      }
      if (color === 'black') {
        // Engine opens as White; defer past the sheet transition.
        setTimeout(() => scheduleEngine(), 400);
      }
    },
    [chess, persistSetup, resetTurnHints, scheduleEngine, stopEngine, sync],
  );

  // Resumed games where the engine is to move: kick it once. The call is
  // deferred past mount so no state flips happen inside the effect body.
  useEffect(() => {
    if (!boot.engineToMove || kicked.current) return;
    kicked.current = true;
    setTimeout(() => scheduleEngine(), 50);
  }, [boot, scheduleEngine]);

  const resetPlay = useCallback(() => {
    stopEngine();
    for (const t of [thinkTimer, replyTimer, practiceTimer, bannerTimer, reviewTimer, showTimer]) {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    }
    chess.load(START_FEN);
    recorded.current = false;
    setStatus('ready');
    setEndInfo(null);
    setSelected(null);
    setPendingPromo(null);
    setViewPly(null);
    setHintsLeft(HINTS_PER_GAME);
    setHint(null);
    setHintMode(false);
    setEngineScoreCp(null);
    setThinking(false);
    setUsedUndo(false);
    setResultOpen(false);
    setConfirmNew(false);
    setConfirmResign(false);
    setClocks(null);
    setExited(false);
    setPanelTab('coach');
    setBanner(null);
    setReview(null);
    setPendingReview(false);
    setShaking(false);
    resetTurnHints();
    sync();
    try {
      localStorage.removeItem(CHESS_SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, [chess, resetTurnHints, stopEngine, sync]);

  // ---- Recall review game: autoplay stored lines to each due node ----
  const completeReview = useCallback(
    (message: string) => {
      setReview(null);
      resetPlay();
      setSetupOpen(true);
      say(message);
    },
    [resetPlay, say],
  );

  const advanceReview = useCallback(() => {
    const r = liveRef.current.review;
    if (!r) return;
    const next = { queue: r.queue, index: r.index + 1, auto: true };
    if (next.index >= next.queue.length) {
      completeReview('Review complete — lines rescheduled');
      return;
    }
    setReview(next);
  }, [completeReview]);

  useEffect(() => {
    advanceReviewRef.current = advanceReview;
  }, [advanceReview]);

  const resolveReviewMove = useCallback(
    (verdict: 'correct' | 'branch' | 'offbook' | 'snapback', epd: string, fullPath: string[]): boolean => {
      // Strict recall: only correct advances, the rest snaps back for retry.
      if (verdict === 'correct') {
        if (hintUsedRef.current) recordAttempt(epd, fullPath, 'ungraded');
        else recordAttempt(epd, fullPath, 'correct');
        setHint(null);
        sync();
        advanceReview();
        return true;
      }
      if (verdict === 'branch') recordAttempt(epd, fullPath, 'miss');
      chess.undo();
      sync();
      setShaking(true);
      setTimeout(() => setShaking(false), 350);
      say('Not book — try again, or press Show');
      return false;
    },
    [advanceReview, chess, recordAttempt, say, sync],
  );

  useEffect(() => {
    resolveReviewMoveRef.current = resolveReviewMove;
  }, [resolveReviewMove]);

  const stepReview = useCallback(
    (r: { queue: string[]; index: number; auto: boolean }) => {
      const key = r.queue[r.index];
      const rec = key ? nodesRef.current[key] : undefined;
      if (!key || !rec || rec.path.length === 0) {
        completeReview('Review complete — lines rescheduled');
        return;
      }
      // Fresh autoplay from startpos (fen re-syncs on the first step).
      chess.load(START_FEN);
      let i = 0;
      const step = () => {
        if (liveRef.current.status !== 'playing') return;
        if (i >= rec.path.length) {
          const data = openingsRef.current;
          const kids = data ? bookChildStats(data, chess.fen()).filter((k) => k.san) : [];
          if (kids.length === 0) {
            advanceReviewRef.current?.();
            return;
          }
          setPlayerColor(chess.turn() === 'w' ? 'white' : 'black');
          setReview({ ...r, auto: false });
          resetTurnHints();
          sync();
          return;
        }
        try {
          chess.move(rec.path[i] as string);
        } catch {
          say('A review line broke — skipping');
          advanceReviewRef.current?.();
          return;
        }
        i += 1;
        sync();
        reviewTimer.current = setTimeout(step, REVIEW_STEP_MS);
      };
      reviewTimer.current = setTimeout(step, REVIEW_STEP_MS);
    },
    [chess, completeReview, resetTurnHints, say, sync],
  );

  useEffect(() => {
    if (!review?.auto || review.queue.length === 0) return;
    stepReview(review);
  }, [review, stepReview]);

  const startReview = useCallback(() => {
    const queue = dueNodeKeys(nodesRef.current);
    if (queue.length === 0) {
      say('Nothing due — play and misses will schedule reviews');
      return;
    }
    resetPlay();
    setLevel(levelById(setupRef.current.levelId ?? 'knight'));
    setPlayerColor('white');
    setCoachOn(true);
    setCoachKind('recall');
    setCasual(true);
    setFlipped(false);
    setStatus('playing');
    setSetupOpen(false);
    setConfirmNew(false);
    setPendingReview(false);
    setClocks(null);
    setReview({ queue, index: 0, auto: true });
  }, [resetPlay, say]);

  const revealHint = useCallback(() => {
    const live = liveRef.current;
    if (!live.coachOn || live.status !== 'playing' || live.review?.auto) return;
    const data = openingsRef.current;
    if (!data) return;
    const kids = bookChildStats(data, chess.fen()).filter((k) => k.san);
    if (kids.length === 0) return;
    setHintRevealed(true);
    setHintUsed(true);
  }, [chess]);

  const showAnswer = useCallback(() => {
    const live = liveRef.current;
    if (live.status !== 'playing' || live.review?.auto) return;
    const data = openingsRef.current;
    if (!data) return;
    const kids = bookChildStats(data, chess.fen()).filter((k) => k.san);
    const main = kids[0];
    if (!main) return;
    // Show marks the miss (Test: ladder resets) and draws the arrow briefly.
    recordAttempt(epdOf(chess.fen()), [...chess.history(), main.san ?? ''], 'miss');
    setHintUsed(true);
    setHint({ from: main.uci.slice(0, 2), to: main.uci.slice(2, 4), stage: 2 });
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => setHint(null), 2500);
  }, [chess, recordAttempt]);

  const playOut = useCallback(() => {
    const live = liveRef.current;
    if (!live.coachOn) return;
    const data = openingsRef.current;
    const entry = data ? lookupOpening(data, epdOf(chess.fen())) : null;
    exitAssistRef.current?.('playout', null, entry ? headerOpeningName(entry.name) : null);
  }, [chess]);

  const toggleCoach = useCallback(() => {
    const live = liveRef.current;
    if (live.coachOn) {
      setCoachOn(false);
        return;
    }
    // Turning coaching on mid-game makes a rated game casual.
    if (live.status === 'playing' && !casualRef.current) {
      setConfirmCoach(true);
      return;
    }
    setCoachKind(setupRef.current.coach === 'recall' ? 'recall' : 'guided');
    setCoachOn(true);
  }, []);

  const confirmCoachOn = useCallback(() => {
    setConfirmCoach(false);
    setCasual(true);
    setCoachKind(setupRef.current.coach === 'recall' ? 'recall' : 'guided');
    setCoachOn(true);
    say('Coaching on — this game is casual');
  }, [say]);

  const requestMode = useCallback(
    (next: string) => {
      if (next !== 'Play') return;
      if (next === mode) return;
      const dirty = status === 'playing' && hist.length > 0;
      if (dirty) {
        setPendingMode(next);
        return;
      }
      stopEngine();
      setMode(next);
      resetPlay();
      setSetupOpen(true);
    },
    [hist.length, mode, resetPlay, status, stopEngine],
  );

  const confirmModeSwitch = useCallback(() => {
    if (pendingMode === null) return;
    stopEngine();
    setMode(pendingMode);
    setPendingMode(null);
    resetPlay();
    setSetupOpen(true);
  }, [pendingMode, resetPlay, stopEngine]);

  // Clock ticks while a timed game is live. The updater stays pure; the
  // flag-finish happens in the async tick, never inside setState.
  const hasClock = clocks !== null;
  useEffect(() => {
    if (status !== 'playing' || !hasClock) return undefined;
    const t = setInterval(() => {
      if (gameOutcome(chess).over) return;
      const side = chess.turn() === 'w' ? 'w' : 'b';
      const prev = clocksRef.current;
      if (!prev) return;
      const left = prev[side] - 250;
      if (left <= 0) {
        clearInterval(t);
        setClocks({ ...prev, [side]: 0 });
        const flagged: ChessColor = side === 'w' ? 'white' : 'black';
        finish(flagged === liveRef.current.playerColor ? 'loss' : 'win', 'time');
        return;
      }
      setClocks({ ...prev, [side]: left });
    }, 250);
    return () => clearInterval(t);
  }, [status, hasClock, chess, finish]);

  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(CHESS_HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  useEffect(() => {
    writeJSON(SOUND_KEY, sound);
  }, [sound]);

  useEffect(() => {
    writeJSON(THEME_KEY, theme);
  }, [theme]);

  // "/" focuses the SAN field (power users); never hijacks real inputs or sheets.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (setupOpen || resultOpen || pendingPromo || confirmResign || confirmNew) return;
      e.preventDefault();
      sanRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setupOpen, resultOpen, pendingPromo, confirmResign, confirmNew]);

  // "H" reveals the guide arrows once. A hinted move counts as seen, never
  // as correct — the only keyboard shortcut the coach adds.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (setupOpen || resultOpen || pendingPromo || confirmResign || confirmNew || confirmCoach) return;
      e.preventDefault();
      revealHint();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmCoach, confirmNew, confirmResign, pendingPromo, resultOpen, revealHint, setupOpen]);

  // One player bar per side of the board: opponent above, you below.
  // The top of the screen always shows whoever's pieces sit on top.
  const renderBar = (color: ChessColor, isTop: boolean) => {
    const mine = color === playerColor;
    const caps = color === 'white' ? liveSummary.capturedByWhite : liveSummary.capturedByBlack;
    const ahead = color === 'white' ? liveSummary.balance : -liveSummary.balance;
    const ms = color === 'white' ? clocks?.w : clocks?.b;
    const toMove = status === 'playing' && viewPly === null && (chess.turn() === 'w') === (color === 'white');
    return (
      <div
        className="flex items-center gap-2 min-h-[44px] max-h-[44px] overflow-hidden whitespace-nowrap rounded-[10px] px-2"
        aria-live="polite"
        style={toMove ? { background: 'rgba(229,192,123,.08)' } : undefined}
      >
        {toMove && (
          <span
            aria-hidden
            title="To move"
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ background: 'var(--game-accent)' }}
          />
        )}
        {mine ? (
          <span className="flex items-baseline gap-1.5 min-w-0 shrink-0">
            <span className="games-type-callout font-semibold truncate">
              You · {color === 'white' ? 'White' : 'Black'}
            </span>
            {toMove && (
              <span className="games-type-caption shrink-0" style={{ color: '#E5C07B' }}>
                ● Your move
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 min-w-0 shrink-0">
            <LevelIcon levelId={level.id} size={20} />
            <span className="flex flex-col leading-tight min-w-0">
              <span className="games-type-callout font-semibold truncate">Stockfish · {level.name}</span>
              <span className="games-type-micro truncate" style={{ color: 'var(--text-3)' }}>
                {level.blurb}
              </span>
            </span>
          </span>
        )}
        {!mine && thinking && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="games-thinking inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--game-accent)' }}
            />
            <span className="games-type-caption" style={{ color: 'var(--text-2)' }}>
              thinking…
            </span>
          </span>
        )}
        <span
          className="flex items-center gap-0.5 overflow-hidden shrink"
          aria-label={mine ? 'Pieces you captured' : 'Pieces Stockfish captured'}
        >
          {caps.map((t, i) => (
            <ChessPieceIcon key={i} color={color === 'white' ? 'b' : 'w'} piece={t as ChessPieceKind} size={16} />
          ))}
        </span>
        {ahead > 0 && (
          <span className="games-type-caption tabular-nums" style={{ color: 'var(--text-2)' }}>
            +{ahead}
          </span>
        )}
        <span className="flex-1" />
        {ms !== undefined && <span className="games-type-callout tabular-nums">{fmtClock(ms)}</span>}
        {isTop && viewPly !== null && (
          <button
            type="button"
            onClick={() => setViewPly(null)}
            className="games-press games-type-callout rounded-full px-4 py-1.5 shrink-0"
            style={{ background: 'var(--game-accent)', color: '#000' }}
          >
            ● Live
          </button>
        )}
      </div>
    );
  };

  const resetStats = useCallback(() => {
    writeJSON(CHESS_STATS_KEY, {});
    setStats({});
    writeJSON(CHESS_OPENING_STATS_KEY, {});
    setOpenStats({});
    writeJSON(CHESS_CASUAL_KEY, 0);
    setCasualGames(0);
    writeJSON(NODES_KEY, {});
    setNodes({});
    const store = loadStore();
    const next = { ...store };
    delete next['chess'];
    saveStore(next);
    setStreak(0);
    say('Stats reset');
  }, [say]);

  const undo = useCallback(() => {
    if (status !== 'playing' || hist.length === 0) return;
    const live = liveRef.current;
    if (live.review) {
      // Recall autoplay owns the move sequence; undo would desync its queue.
      say('Pause the review to take back moves');
      return;
    }
    stopEngine();
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    thinkTimer.current = null;
    replyTimer.current = null;
    setThinking(false);
    setHintMode(false);
    const turnIsPlayer = (chess.turn() === 'w') === (playerColor === 'white');
    const pops = undoKeepCount(hist.length, turnIsPlayer);
    if (pops <= 0) return;
    // Pop the stack (history preserved): chess.load() would wipe the move
    // history and empty the list while the board stays mid-game.
    // Repeated presses walk the whole game back to the start.
    for (let i = 0; i < pops; i += 1) {
      if (!chess.undo()) break;
    }
    setUsedUndo(true);
    setHint(null);
    setViewPly(null);
    setSelected(null);
    setPendingPromo(null);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = null;
    setBanner(null);
    sync();
    // Undoing back into theory re-engages the coach where it left off.
    const book = openingsRef.current;
    if (live.coachOn && book) {
      const fenNow = chess.fen();
      const kids = mergeExplorerKids(
        bookChildStats(book, fenNow).filter((k) => k.san),
        explorerRef.current[epdOf(fenNow)] ?? null,
        fenNow,
      );
      if (kids.length > 0) {
        setExited(false);
        setPanelTab('coach');
      }
    }
    if (isEngineTurn(chess.fen(), playerColor)) {
      // Landed on the engine's turn (e.g. Black taking back White's move):
      // kick it to reply instead of stalling the game.
      say('Move taken back — engine to move');
      scheduleEngine();
    } else {
      say('Move taken back — this game is unrated');
    }
  }, [chess, hist, playerColor, say, scheduleEngine, status, stopEngine, sync]);

  const requestHint = useCallback(() => {
    if (status !== 'playing' || !isPlayerTurnNow()) return;
    if (hint) {
      if (hint.stage === 1) setHint({ ...hint, stage: 2 });
      return;
    }
    // Coach mode is for learning: hints never run out. Rated games keep
    // the 3-hint limit so the lifeline means something.
    if (!liveRef.current.coachOn) {
      if (hintsLeft <= 0) {
        say('No hints left this game');
        return;
      }
      setHintsLeft((n) => n - 1);
    }
    setHintMode(true);
    setThinking(true);
    const ok = requestMove(chess.fen(), chess.turn(), level);
    if (!ok) {
      setHintMode(false);
      setThinking(false);
      const local = randomLegalMove(chess);
      if (local) setHint({ from: local.from, to: local.to, stage: 1 });
    }
  }, [chess, hint, hintsLeft, isPlayerTurnNow, level, requestMove, say, status]);

  const offerDraw = useCallback(() => {
    if (status !== 'playing') return;
    const fullMoves = Math.ceil(hist.length / 2);
    if (engineAcceptsDraw(engineScoreCp, fullMoves)) {
      finish('draw', 'agreement');
    } else {
      say(`${level.piece} ${level.name} declines the draw`);
    }
  }, [engineScoreCp, finish, hist.length, level, say, status]);

  const copyPgn = useCallback(() => {
    const pgn = hist.length > 0 ? chess.pgn() : '';
    if (!pgn) {
      say('No moves yet');
      return;
    }
    try {
      void navigator.clipboard
        .writeText(pgn)
        .then(() => say('PGN copied'))
        .catch(() => say('Copy failed'));
    } catch {
      say('Copy failed');
    }
  }, [chess, hist.length, say]);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare || sourceSquare === targetSquare) return false;
      // Only real drags arm the guard: a same-square press is a tap, and the
      // follow-up tap within 300ms must still reach onSquareClick.
      dropGuard.current = Date.now();
      if (!isPlayerTurnNow()) return false;
      if (viewPly !== null) return false;
      const promos = promotionChoices(chess, sourceSquare as Square, targetSquare as Square);
      if (promos.length > 0) {
        setSelected(null);
        setPendingPromo({ from: sourceSquare as Square, to: targetSquare as Square });
        return false;
      }
      return tryPlayerMove(sourceSquare, targetSquare);
    },
    [chess, isPlayerTurnNow, tryPlayerMove, viewPly],
  );

  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (Date.now() - dropGuard.current < 300) return;
      if (status !== 'playing' || !isPlayerTurnNow() || viewPly !== null || thinking) return;
      if (selected && square !== selected) {
        const targets = new Set(
          (chess.moves({ square: selected, verbose: true }) as Move[]).map((m) => m.to),
        );
        if (targets.has(square as Square)) {
          const promos = promotionChoices(chess, selected, square as Square);
          if (promos.length > 0) {
            setPendingPromo({ from: selected, to: square as Square });
            setSelected(null);
          } else {
            tryPlayerMove(selected, square as Square);
          }
          return;
        }
      }
      if (square === selected) {
        setSelected(null);
        return;
      }
      const found = chess.get(square as Square);
      if (found && (found.color === 'w') === (playerColor === 'white')) {
        setSelected(square as Square);
      } else {
        setSelected(null);
      }
    },
    [chess, isPlayerTurnNow, playerColor, selected, status, thinking, tryPlayerMove, viewPly],
  );

  const submitSan = useCallback(() => {
    const san = sanInput.trim();
    if (!san) return;
    if (status !== 'playing' || !isPlayerTurnNow()) {
      say('Not your move right now');
      return;
    }
    try {
      const mv = chess.move(san);
      // The preview applied it; roll back and go through the shared path once.
      chess.undo();
      setSanInput('');
      const promos = promotionChoices(chess, mv.from as Square, mv.to as Square);
      if (promos.length > 0 && !mv.promotion) {
        setPendingPromo({ from: mv.from as Square, to: mv.to as Square });
        return;
      }
      tryPlayerMove(mv.from, mv.to, mv.promotion);
    } catch {
      say('Illegal move — try SAN like Nf3');
    }
  }, [chess, isPlayerTurnNow, sanInput, say, status, tryPlayerMove]);

  // ---- Derived view state ----
  const sans = useMemo(() => hist.map((h) => h.san), [hist]);
  const shownPly = viewPly ?? hist.length;
  const viewFen = useMemo(() => {
    if (viewPly === null) return fen;
    const c = new Chess();
    for (const m of hist.slice(0, viewPly)) {
      try {
        c.move(m.san);
      } catch {
        break;
      }
    }
    return c.fen();
  }, [fen, hist, viewPly]);
  // 64-square scan, microseconds — no memo needed.
  const liveSummary = materialSummary(new Chess(fen));
  const pairs = useMemo(() => pairMoves(sans), [sans]);
  const fullMoves = Math.ceil(sans.length / 2);
  const book: BookAnalysis = useMemo(
    () =>
      openings
        ? analyzeBook(openings, sans)
        : { flags: [], name: null, eco: null, outAtMove: null, expectedSan: null },
    [openings, sans],
  );

  const engineColor: ChessColor = playerColor === 'white' ? 'black' : 'white';
  const orientation = (flipped
    ? playerColor === 'white'
      ? 'black'
      : 'white'
    : playerColor) as 'white' | 'black';
  // The side whose pieces sit at the top of the screen.
  const topColor: ChessColor = flipped ? playerColor : engineColor;

  const lightSq =
    theme === 'walnut' ? WALNUT_LIGHT : theme === 'green' ? GREEN_LIGHT : theme === 'classic' ? CLASSIC_LIGHT : GRAPHITE_LIGHT;
  const darkSq =
    theme === 'walnut' ? WALNUT_DARK : theme === 'green' ? GREEN_DARK : theme === 'classic' ? CLASSIC_DARK : GRAPHITE_DARK;

  // Square base color: a1 is dark, so odd file+rank sums are dark.
  const baseFor = useCallback(
    (sq: string) => {
      const f = 'abcdefgh'.indexOf(sq[0] as string);
      const r = Number(sq.slice(1));
      return (f + r) % 2 === 0 ? lightSq : darkSq;
    },
    [lightSq, darkSq],
  );

  // Board pieces at ~82% of the square (custom `pieces` renderers keep the
  // library's drag wrappers untouched, so dragging still measures right).
  const pieces = useMemo(() => {
    const out: PieceRenderObject = {};
    for (const [key, P] of Object.entries(defaultPieces)) {
      out[key] = (props) => (
        <span
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: '82%', height: '82%' }}>
            <P {...props} svgStyle={{ ...(props?.svgStyle ?? {}), width: '100%', height: '100%' }} />
          </span>
        </span>
      );
    }
    return out;
  }, []);

  // Coordinates take the opposite square color at 85% (Classic). The
  // graphite squares sit too close together for the literal rule, so it
  // uses near-white / near-black at 85% — readable on both.
  const coordOnDark =
    theme === 'walnut'
      ? 'rgba(234,217,188,.85)'
      : theme === 'green'
        ? 'rgba(238,238,210,.85)'
        : theme === 'classic'
          ? 'rgba(232,220,196,.85)'
          : 'rgba(235,235,245,.85)';
  const coordOnLight =
    theme === 'walnut'
      ? 'rgba(179,135,95,.85)'
      : theme === 'green'
        ? 'rgba(118,150,86,.85)'
        : theme === 'classic'
          ? 'rgba(181,136,99,.85)'
          : 'rgba(15,16,20,.85)';
  const darkNotationProps = { fontSize: 11, fontWeight: 600, color: coordOnDark };
  const lightNotationProps = { fontSize: 11, fontWeight: 600, color: coordOnLight };
  // FEN side-to-move flag, parsed without touching instance state in render.
  const turnIsPlayer = (fen.split(' ')[1] === 'w') === (playerColor === 'white');
  const canAct = status === 'playing' && turnIsPlayer && viewPly === null && !pendingPromo;

  const checkSquare = useMemo(() => {
    const c = new Chess(viewFen);
    if (!c.isCheck()) return null;
    const turn = c.turn();
    for (let f = 0; f < 8; f += 1) {
      for (let r = 0; r < 8; r += 1) {
        const sq = (`abcdefgh`[f] as string) + String(r + 1);
        const p = c.get(sq as Square);
        if (p && p.type === 'k' && p.color === turn) return sq;
      }
    }
    return null;
  }, [viewFen]);

  const legalTargets = useMemo(() => {
    if (!selected || !setup.showLegal || viewPly !== null || status !== 'playing') return new Map<string, boolean>();
    const c = new Chess(fen);
    const out = new Map<string, boolean>();
    for (const m of c.moves({ square: selected, verbose: true }) as Move[]) {
      out.set(m.to, Boolean(m.captured) || m.flags.includes('e'));
    }
    return out;
  }, [fen, selected, setup.showLegal, status, viewPly]);

  // Overlays layer ABOVE the square base color: setting `background` to a
  // bare tint would replace the square paint and swallow the highlight.
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const tint = (sq: string) =>
      `linear-gradient(rgba(255,190,90,.40), rgba(255,190,90,.40)), ${baseFor(sq)}`;
    const dot = (sq: string) =>
      `radial-gradient(circle, rgba(10,10,12,.38) 21%, transparent 23%), ${baseFor(sq)}`;
    const shown = hist.slice(0, shownPly);
    const last = shown[shown.length - 1];
    if (last) {
      styles[last.from] = { background: tint(last.from) };
      styles[last.to] = { background: tint(last.to) };
    }
    if (checkSquare) {
      styles[checkSquare] = {
        background: `radial-gradient(circle, rgba(255,69,58,.9) 20%, rgba(255,69,58,.12) 72%, transparent 73%), ${baseFor(checkSquare)}`,
      };
    }
    if (selected) {
      styles[selected] = { ...styles[selected], boxShadow: 'inset 0 0 0 3px var(--game-accent)' };
    }
    for (const [sq, isCapture] of legalTargets) {
      styles[sq] = {
        ...styles[sq],
        background: isCapture ? styles[sq]?.background : dot(sq),
        boxShadow: isCapture ? RING : styles[sq]?.boxShadow,
      };
    }
    if (hint) {
      styles[hint.from] = { ...styles[hint.from], boxShadow: 'inset 0 0 0 3px var(--game-accent)' };
      if (hint.stage === 2) {
        styles[hint.to] = { ...styles[hint.to], boxShadow: 'inset 0 0 0 3px var(--game-accent)' };
      }
    }
    return styles;
  }, [baseFor, checkSquare, hint, hist, legalTargets, selected, shownPly]);

  const arrows = useMemo<Arrow[]>(
    () => (hint && hint.stage === 2 ? [{ startSquare: hint.from, endSquare: hint.to, color: '#E5C07B' }] : []),
    [hint],
  );

  // Guide arrows key off book CHILDREN, never the opening name — the root
  // and unnamed theory positions guide exactly like named ones. Options are
  // the dataset tree ∪ explorer moves; % shows only with real counts.
  const coachNode = useMemo(() => {
    if (!openings || !coachOn || exited || status !== 'playing' || review) return null;
    const epd = epdOf(fen);
    const exp = explorerCache[epd];
    const kids = mergeExplorerKids(
      bookChildStats(openings, fen).filter((k) => k.san),
      exp ?? null,
      fen,
    ).map((k) => ({ ...k, pct: exp && exp.length > 0 ? k.pct : null }));
    if (kids.length === 0) return null;
    return { epd, kids, rec: nodes[epd], entry: lookupOpening(openings, epd) };
  }, [exited, explorerCache, fen, coachOn, nodes, openings, review, status]);

  // Squares occupied in the current position — knight arrows pick the L
  // corner that crosses fewer pieces.
  const occupiedSquares = useMemo(() => {
    const set = new Set<string>();
    try {
      new Chess(fen)
        .board()
        .forEach((row, ri) =>
          row.forEach((sq, fi) => {
            if (sq) set.add(`${'abcdefgh'[fi]}${8 - ri}`);
          }),
        );
    } catch {
      /* illegal fen — empty set */
    }
    return set;
  }, [fen]);

  // Side to move in the current position (delta evals read from its view).
  const sideToMove = useMemo(() => {
    try {
      return new Chess(fen).turn();
    } catch {
      return 'w' as const;
    }
  }, [fen]);

  const coachStage = coachNode
    ? coachKind === 'recall'
      ? stageOf(coachNode.rec?.streak ?? 0)
      : 'learn'
    : 'learn';

  // Guide-arrow descriptors for the SVG overlay (which owns widths, heads,
  // labels, and hover). The library keeps only the gold hint arrow.
  const guideSpecs = useMemo<GuideArrowSpec[]>(() => {
    if (!coachNode || !openings || !turnIsPlayer || viewPly !== null) return [];
    if (!(coachStage === 'learn' || hintRevealed)) return [];
    const specFor = (k: MergedKid, main: boolean): GuideArrowSpec | null => {
      if (k.uci.length < 4 || !k.san) return null;
      const from = k.uci.slice(0, 2);
      const to = k.uci.slice(2, 4);
      const knight =
        Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) * Math.abs(Number(from[1]) - Number(to[1])) === 2;
      const label = labelChild(openings, fen, k.uci);
      return {
        uci: k.uci,
        from,
        to,
        color: main ? '#30D158' : GUIDE_BLUE,
        main,
        pct: k.pct,
        name: label ? (label.usually ? `usually ${label.name}` : label.name) : 'Book move',
        via: knight ? knightCorner(from, to, occupiedSquares) : undefined,
      };
    };
    const out: GuideArrowSpec[] = [];
    const [main, ...alts] = coachNode.kids;
    if (main) {
      const spec = specFor(main, true);
      if (spec) out.push(spec);
    }
    for (const alt of alts.slice(0, 3)) {
      const spec = specFor(alt, false);
      if (spec) out.push(spec);
    }
    // Collinear overlaps demote to target rings (most popular keeps the
    // arrow) so every listed option owns a board mark. Solo taps isolate
    // after resolution, so a tapped ring stays a ring.
    const resolved = resolveGuideRings(out);
    if (soloUci) return resolved.filter((s) => s.uci === soloUci);
    return resolved;
  }, [coachNode, coachStage, fen, hintRevealed, occupiedSquares, openings, soloUci, turnIsPlayer, viewPly]);

  // Cached option evals (White perspective, EPD-keyed). Shallow
  // background analysis fills them while the engine idles on the player's
  // turn — never during a real search. Render reads state; the analysis
  // effect consults the ref mirror (refs stay out of render).
  const [evalMap, setEvalMap] = useState<Record<string, number>>(() => readJSON(EVAL_CACHE_KEY) ?? {});
  const evalCache = useRef<Map<string, number> | null>(null);
  if (evalCache.current === null) {
    evalCache.current = new Map(Object.entries(readJSON<Record<string, number>>(EVAL_CACHE_KEY) ?? {}));
  }
  const rememberEval = useCallback((epd: string, cp: number | null) => {
    if (cp === null || !Number.isFinite(cp)) return;
    const cache = evalCache.current as Map<string, number>;
    if (cache.get(epd) === cp) return;
    cache.set(epd, cp);
    while (cache.size > EVAL_CACHE_MAX) {
      const oldest = cache.keys().next();
      if (oldest.done) break;
      cache.delete(oldest.value);
    }
    setEvalMap(Object.fromEntries(cache));
  }, []);
  // Persist separately so the updater stays pure.
  useEffect(() => {
    writeJSON(EVAL_CACHE_KEY, evalMap);
  }, [evalMap]);

  useEffect(() => {
    // The current position is always analyzed (the eval bar stays live
    // all game); book children join in while the coach shows options.
    if (
      !coachOn ||
      engineStatus !== 'ready' ||
      thinking ||
      status !== 'playing' ||
      review ||
      viewPly !== null
    ) {
      return undefined;
    }
    const seen = new Set<string>();
    const targets: { epd: string; pos: string }[] = [];
    const push = (posFen: string) => {
      const epd = epdOf(posFen);
      if (seen.has(epd) || evalCache.current?.has(epd)) return;
      seen.add(epd);
      targets.push({ epd, pos: posFen });
    };
    push(fen);
    if (coachNode && turnIsPlayer) {
      for (const k of coachNode.kids.slice(0, 4)) {
        try {
          const d = new Chess(fen);
          d.move({
            from: k.uci.slice(0, 2),
            to: k.uci.slice(2, 4),
            promotion: (k.uci.slice(4) as 'q' | 'r' | 'b' | 'n' | undefined) || undefined,
          });
          push(d.fen());
        } catch {
          /* illegal child — skip */
        }
      }
    }
    if (targets.length === 0) return undefined;
    let cancelled = false;
    (async () => {
      for (const t of targets) {
        if (cancelled) return;
        let started = false;
        const cp = await new Promise<number | null>((resolve) => {
          started = analyze(t.pos, new Chess(t.pos).turn(), resolve);
          if (!started) resolve(null);
        });
        if (cancelled || !started) return; // engine busy — back off
        if (cp !== null) rememberEval(t.epd, cp);
        // A timed-out read simply stays uncached; siblings still run.
      }
    })();
    return () => {
      cancelled = true;
      cancelAnalysis();
    };
  }, [
    coachNode,
    coachOn,
    engineStatus,
    thinking,
    turnIsPlayer,
    status,
    review,
    viewPly,
    fen,
    analyze,
    cancelAnalysis,
    rememberEval,
  ]);

  // Recall Practice stage: arrows surface after 5 idle seconds (or H).
  useEffect(() => {
    if (practiceTimer.current) clearTimeout(practiceTimer.current);
    if (
      !coachNode ||
      coachKind !== 'recall' ||
      stageOf(coachNode.rec?.streak ?? 0) !== 'practice' ||
      !turnIsPlayer ||
      viewPly !== null
    ) {
      return undefined;
    }
    practiceTimer.current = setTimeout(() => {
      setHintRevealed(true);
      setHintUsed(true);
    }, PRACTICE_HINT_MS);
    return () => {
      if (practiceTimer.current) clearTimeout(practiceTimer.current);
    };
  }, [coachKind, coachNode, turnIsPlayer, viewPly]);

  const levelStats = stats[level.id];

  const firstOutPly = book.flags.findIndex((f) => !f);
  const outRow = firstOutPly >= 0 ? Math.floor(firstOutPly / 2) : -1;
  const lastPly = sans.length;
  const moveListRef = useRef<HTMLOListElement | null>(null);
  // The list follows the game: latest move visible + highlighted.
  useEffect(() => {
    moveListRef.current?.scrollTo({ top: moveListRef.current.scrollHeight });
  }, [sans.length]);
  const moveList = (
    <ol ref={moveListRef} className="flex flex-col gap-0.5 max-h-64 lg:max-h-none lg:h-full overflow-y-auto" aria-label="Move list">
      {pairs.map(([w, b], i) => (
        <li key={i}>
          <span className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-1">
            <span className="games-type-caption" style={{ color: 'var(--text-3)' }}>
              {i + 1}.
            </span>
            {(
              [
                { san: w, ply: i * 2 + 1 },
                { san: b, ply: i * 2 + 2 },
              ] as const
            ).map(({ san, ply }) =>
              san ? (
                <button
                  key={ply}
                  type="button"
                  onClick={() => setViewPly(shownPly === ply ? null : ply)}
                  aria-label={book.flags[ply - 1] ? `${san}, book move` : san}
                  title={book.flags[ply - 1] ? 'Book move' : undefined}
                  className="games-press games-type-callout text-left rounded-md px-2 py-0.5 tabular-nums"
                  style={{
                    background:
                      shownPly === ply
                        ? 'var(--surface-3)'
                        : ply === lastPly && viewPly === null
                          ? 'var(--surface-2)'
                          : 'transparent',
                    color: 'var(--text-1)',
                    boxShadow: book.flags[ply - 1] ? 'inset 2px 0 0 0 #E5C07B' : undefined,
                  }}
                >
                  {san}
                </button>
              ) : (
                <span key={ply} />
              ),
            )}
          </span>
          {i === outRow && (
            <p className="games-type-micro mt-0.5 mb-1 pl-10" style={{ color: 'var(--text-3)' }}>
              ↳ out of book
              {book.expectedSan ? ` — main line was ${book.expectedSan}` : ''}
            </p>
          )}
        </li>
      ))}
      {pairs.length === 0 && (
        <li className="games-type-caption" style={{ color: 'var(--text-2)' }}>
          White to move — make your first move.
        </li>
      )}
    </ol>
  );

  const currentEvalCp = evalMap[epdOf(fen)] ?? null;
  // The bar holds its last reading while the new position analyzes.
  // Render-phase adjust (no effect cascade): adopt fresh evals as they
  // land; the fill dims while the shown number is one move old.
  const [displayEvalCp, setDisplayEvalCp] = useState<number | null>(null);
  if (currentEvalCp !== null && currentEvalCp !== displayEvalCp) {
    setDisplayEvalCp(currentEvalCp);
  }
  const evalStale = displayEvalCp !== null && currentEvalCp === null;

  const outcomeTitle = !endInfo
    ? 'Game over'
    : endInfo.outcome === 'win'
      ? 'You win!'
      : endInfo.outcome === 'loss'
        ? `${level.name} wins`
        : 'Draw';

  // Shared by the desktop Opening card and the mobile details: names every
  // book option (SAN · distinguishing name · delta-vs-best · style · real
  // popularity), row tap isolates its arrow. Rows stay in popularity order.
  const DELTA_TONE_COLOR: Record<EvalTone, string> = {
    best: '#30D158',
    even: 'var(--text-2)',
    loose: '#E5B43C',
    bad: '#FF7A7A',
  };
  const headerFull = coachNode?.entry ? headerOpeningName(coachNode.entry.name) : '';
  const optionRows = (coachNode?.kids ?? []).slice(0, 4).map((k) => {
    const label = openings ? labelChild(openings, fen, k.uci) : null;
    const full = label ? (label.usually ? `usually ${label.name}` : label.name) : 'Book move';
    const name = label
      ? rowDistinguishingName(label.name, headerFull, label.eco, k.uci === coachNode?.kids[0]?.uci)
      : 'Book move';
    const style = label ? styleFor(styles, label.eco, label.name) : null;
    let childEval: number | null = null;
    try {
      const d = new Chess(fen);
      d.move({
        from: k.uci.slice(0, 2),
        to: k.uci.slice(2, 4),
        promotion: (k.uci.slice(4) as 'q' | 'r' | 'b' | 'n' | undefined) || undefined,
      });
      childEval = evalMap[epdOf(d.fen())] ?? null;
    } catch {
      /* illegal child — no eval */
    }
    return { k, full, name, style, childEval };
  });
  const knownEvals = optionRows.map((r) => r.childEval).filter((cp): cp is number => cp !== null);
  const bestCp =
    knownEvals.length === 0
      ? null
      : sideToMove === 'w'
        ? Math.max(...knownEvals)
        : Math.min(...knownEvals);
  const bestIdx = bestCp === null ? -1 : optionRows.findIndex((r) => r.childEval === bestCp);
  // One shared style tag moves to the section header; mixed tags stay per row.
  const rowTags = optionRows.map((r) => r.style);
  const sharedTag = rowTags[0] && rowTags.every((t) => t === rowTags[0]) ? (rowTags[0] as string) : null;
  const optionsList =
    coachNode && optionRows.length > 0 ? (
      <div className="mt-3">
        <p className="games-type-micro mb-1.5" style={{ color: 'var(--text-3)' }}>
          Your options{sharedTag ? ` · ${sharedTag} lines` : ''}
        </p>
        <ul className="flex flex-col gap-1.5">
          {optionRows.map(({ k, full, name, style, childEval }, i) => {
            const isBest = i === bestIdx;
            const delta = deltaEvalText(childEval, bestCp, sideToMove, isBest);
            const solo = soloUci === k.uci;
            const dot = i === 0 ? '#30D158' : GUIDE_BLUE;
            return (
              <li key={k.uci}>
                <button
                  type="button"
                  onClick={() => {
                    setSoloUci((s) => (s === k.uci ? null : k.uci));
                  }}
                  onMouseEnter={() => setHotUci(k.uci)}
                  onMouseLeave={() => setHotUci(null)}
                  aria-pressed={solo}
                  aria-label={
                    k.pct !== null ? `Option ${k.san}, ${full}, ${k.pct} percent` : `Option ${k.san}, ${full}`
                  }
                  title={
                    k.pct !== null
                      ? childEval !== null
                        ? `Engine ${fmtEvalCp(childEval)}`
                        : undefined
                      : 'No stats'
                  }
                  className="games-press w-full flex flex-col gap-1 rounded-[10px] px-2.5 py-2 text-left"
                  style={{
                    background: solo ? 'rgba(229,192,123,.14)' : 'var(--surface-2)',
                    border: '1px solid var(--hairline)',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
                    <span className="tabular-nums shrink-0" style={{ fontSize: 17, fontWeight: 700 }}>
                      {k.san}
                    </span>
                    <span className="flex-1" />
                    {style && !sharedTag && (
                      <span
                        className="games-type-micro px-1.5 py-0.5 rounded-full shrink-0 uppercase"
                        style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}
                      >
                        {style}
                      </span>
                    )}
                    {delta && (
                      <span
                        className="games-type-caption tabular-nums shrink-0 text-right"
                        style={{ color: DELTA_TONE_COLOR[delta.tone], minWidth: 44 }}
                      >
                        {delta.text}
                      </span>
                    )}
                    {k.pct !== null && (
                      <span
                        className="games-type-caption tabular-nums shrink-0"
                        style={{ color: 'var(--text-2)', minWidth: 36, textAlign: 'right' }}
                      >
                        {k.pct}%
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 pl-[18px]">
                    <span className="games-type-caption min-w-0" style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500 }}>
                      {name}
                    </span>
                    {k.pct !== null && (
                      <span
                        aria-hidden
                        className="h-1 flex-1 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface-3)', minWidth: 24 }}
                      >
                        <span className="block h-full rounded-full" style={{ width: `${k.pct}%`, background: dot }} />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  // Shared by the desktop Moves tab and the mobile details: the move
  // list with the SAN field pinned beneath it.
  const movesPane = (
    <>
      <div className="mt-2 min-h-0 lg:flex-1 lg:overflow-y-auto">{moveList}</div>
      <form
        className="flex gap-2 mt-3 shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          submitSan();
        }}
      >
        <input
          ref={sanRef}
          value={sanInput}
          onChange={(e) => setSanInput(e.target.value)}
          placeholder="Type a move  /"
          aria-label="Move in SAN notation"
          autoComplete="off"
          spellCheck={false}
          className="games-type-callout min-w-0 flex-1 rounded-[10px] px-3 py-2"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--hairline)' }}
        />
        <button
          type="submit"
          aria-label="Play SAN move"
          className="games-press games-type-callout rounded-[10px] px-4"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
        >
          Go
        </button>
      </form>
    </>
  );

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={requestMode}
        wide
        squareBoard={false}
        stats={
          <>
            {dueCount(nodes) > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (status === 'playing') {
                    setPendingReview(true);
                    setConfirmNew(true);
                    return;
                  }
                  startReview();
                }}
                aria-label={`${dueCount(nodes)} opening positions due. Start review`}
                className="games-press games-review-chip inline-flex flex-col items-center px-3 py-1 rounded-[10px] shrink-0"
                style={{ background: 'var(--surface-2)', color: '#E5C07B' }}
              >
                <span className="games-type-micro">📖 {dueCount(nodes)} due</span>
              </button>
            )}
            <span
              role="status"
              aria-label={`Level ${level.name}${casual ? ', casual' : ''}`}
              className="games-type-callout px-3 py-2 rounded-[10px] shrink-0 tabular-nums"
              style={{ background: 'var(--surface-2)' }}
            >
              {level.name}
              {casual && <span style={{ color: '#E5C07B' }}> · Casual</span>}
            </span>
          </>
        }
        menu={
          <GameMenu
            gameName={META.name}
            onHowToPlay={() => setHowTo(true)}
            onResetStats={resetStats}
            extra={
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (status === 'playing') setConfirmNew(true);
                    else setSetupOpen(true);
                  }}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  New game
                </button>
                <button
                  type="button"
                  onClick={copyPgn}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Copy PGN
                </button>
                <button
                  type="button"
                  onClick={() => setSound((s) => !s)}
                  aria-pressed={sound}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Sound: {sound ? 'on' : 'off'}
                </button>
                <div role="group" aria-label="Board theme">
                  <p className="games-type-micro px-4 pt-1" style={{ color: 'var(--text-3)' }}>
                    Board theme
                  </p>
                  <div className="grid grid-cols-2 gap-2 px-4 pb-1">
                    {BOARD_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={theme === t.id}
                        onClick={() => setTheme(t.id)}
                        className="games-press games-type-callout rounded-[10px] px-3 py-2"
                        style={
                          theme === t.id
                            ? { background: 'var(--surface-3)', color: 'var(--text-1)', border: '1px solid #E5C07B' }
                            : { background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid transparent' }
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => persistSetup({ ...setup, bookMode: setup.bookMode === 'main' ? 'varied' : 'main' })}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Opponent book: {setup.bookMode === 'main' ? 'Main line' : 'Varied'}
                </button>
                <button
                  type="button"
                  aria-pressed={setup.acceptAnyBook}
                  onClick={() => persistSetup({ ...setup, acceptAnyBook: !setup.acceptAnyBook })}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Book answers: {setup.acceptAnyBook ? 'Any book move' : 'Main line only'}
                </button>
              </>
            }
          />
        }
        board={
          <div className="w-full chess-board-fit">
            {renderBar(topColor, true)}
            {engineStatus === 'loading' && (
              <p className="games-type-caption mb-2" style={{ color: 'var(--text-2)' }} aria-live="polite">
                Warming up the engine…
              </p>
            )}
            {banner && (
              <div className="flex items-center gap-2 mb-2" role="status">
                <p className="games-type-callout flex-1">{banner.text}</p>
                <button
                  type="button"
                  onClick={() => setBanner(null)}
                  aria-label="Dismiss announcement"
                  className="games-press games-type-callout rounded-full px-3 py-1 shrink-0"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-stretch gap-2 my-1">
              {coachOn && coachKind === 'guided' && (
                <EvalBar
                  cp={displayEvalCp}
                  stale={evalStale}
                  orientation={orientation}
                />
              )}
            <div
              className={`relative flex-1 games-board-lock${shaking ? ' games-shake' : ''}`}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,220,170,.12)',
              }}
              aria-label="Chess board"
              data-guide-arrows={guideSpecs.filter((s) => !s.ring).length}
              data-guide-rings={guideSpecs.filter((s) => s.ring).length}
              onMouseMove={(e) => {
                if (guideSpecs.length === 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 800;
                const y = ((e.clientY - rect.top) / rect.height) * 800;
                const hit = hoverUciAt(guideSpecs, orientation, x, y);
                setHoverUci((h) => (h === hit ? h : hit));
              }}
              onMouseLeave={() => setHoverUci(null)}
            >
              <Chessboard
                options={{
                  position: viewFen,
                  boardOrientation: orientation,
                  allowDragging: canAct,
                  animationDurationInMs: 150,
                  showNotation: true,
                  darkSquareStyle: { backgroundColor: darkSq },
                  lightSquareStyle: { backgroundColor: lightSq },
                  darkSquareNotationStyle: darkNotationProps,
                  lightSquareNotationStyle: lightNotationProps,
                  squareStyles,
                  arrows,
                  pieces,
                  onPieceDrop: onDrop,
                  onSquareClick,
                }}
              />
              {theme === 'walnut' && (
                <WoodGrain
                  isDark={(sq) => {
                    const f = 'abcdefgh'.indexOf(sq[0] as string);
                    return (f + Number(sq.slice(1))) % 2 === 1;
                  }}
                  orientation={orientation}
                />
              )}
              {guideSpecs.length > 0 && (
                <GuideArrows
                  orientation={orientation}
                  arrows={guideSpecs}
                  highlightUci={hotUci ?? hoverUci}
                  soloUci={soloUci}
                  hoverUci={hoverUci}
                />
              )}
            </div>
            </div>
            {renderBar(flipped ? engineColor : playerColor, false)}
            <details className="lg:hidden mt-3 games-card p-4">
              <summary className="games-type-callout cursor-pointer">Moves · {fullMoves}</summary>
              {book.name && (
                <p className="games-type-caption mt-1" style={{ color: 'var(--text-2)' }}>
                  <span aria-hidden>📖 </span>
                  {book.eco} · {headerOpeningName(book.name)}
                  {book.outAtMove ? ` · out at move ${book.outAtMove}` : ''}
                </p>
              )}
              {optionsList}
              {movesPane}
            </details>
          </div>
        }
        footer={
          <p className="games-type-caption text-center" style={{ color: 'var(--text-3)' }}>
            <a
              href="https://github.com/nmrugg/stockfish.js"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Stockfish
            </a>{' '}
            (
            <a href="/vendor/stockfish/Copying.txt" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              GPL-3
            </a>
            ) · Opening names: Lichess (CC0)
          </p>
        }
        dock={
          <ControlDock>
            {status === 'playing' ? (
              <div className="flex flex-wrap items-start justify-center gap-3">
                {setup.hints && (
                  <RoundDockButton
                    label={coachOn ? 'Hint (unlimited)' : `Hint (${hintsLeft} left)`}
                    symbol="?"
                    caption={coachOn ? 'Hint · ∞' : `Hint · ${hintsLeft}`}
                    onClick={requestHint}
                    disabled={!canAct}
                  />
                )}
                {setup.allowUndo && (
                  <RoundDockButton label="Undo" symbol="↩" caption="Undo" onClick={undo} disabled={hist.length === 0} />
                )}
                <RoundDockButton label="Offer draw" symbol="½" caption="Draw" onClick={offerDraw} />
                <RoundDockButton label="Flip board" symbol="⇅" caption="Flip" onClick={() => setFlipped((f) => !f)} />
                <RoundDockButton label="Resign" symbol="⚑" caption="Resign" onClick={() => setConfirmResign(true)} />
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-center gap-3">
                <RoundDockButton label="Flip board" symbol="⇅" caption="Flip" onClick={() => setFlipped((f) => !f)} />
                <RoundDockButton label="New game" symbol="+" caption="New" onClick={() => setSetupOpen(true)} gold />
              </div>
            )}
          </ControlDock>
        }
        sidePanel={
          <div className="flex min-h-0 flex-col gap-4 lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)] lg:overflow-hidden lg:pb-1">
            <div className="games-card p-5 flex flex-col min-h-0 lg:flex-1" aria-live="polite">
              <div role="tablist" aria-label="Coach or moves" className="flex gap-1 rounded-[12px] p-1 shrink-0" style={{ background: 'var(--surface-2)' }}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panelTab === 'coach'}
                  onClick={() => setPanelTab('coach')}
                  className="games-press games-type-callout flex-1 rounded-[8px] px-3 py-1.5"
                  style={
                    panelTab === 'coach'
                      ? { background: 'var(--surface-3)', color: 'var(--text-1)' }
                      : { background: 'transparent', color: 'var(--text-3)' }
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {coachNode && (
                      <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#E5C07B' }} />
                    )}
                    Coach
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panelTab === 'moves'}
                  onClick={() => setPanelTab('moves')}
                  className="games-press games-type-callout flex-1 rounded-[8px] px-3 py-1.5 tabular-nums"
                  style={
                    panelTab === 'moves'
                      ? { background: 'var(--surface-3)', color: 'var(--text-1)' }
                      : { background: 'transparent', color: 'var(--text-3)' }
                  }
                >
                  Moves · {fullMoves}
                </button>
              </div>
              {panelTab === 'coach' ? (
              <div role="tabpanel" aria-label="Coach" className="mt-1 min-h-0 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <h2 className="games-type-headline">Opening</h2>
                <span className="flex items-center gap-1.5">
                  {book.name && book.outAtMove === null && (
                    <span
                      className="games-type-micro px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(229,192,123,.16)', color: '#E5C07B' }}
                    >
                      Book
                    </span>
                  )}
                  {coachOn && coachKind === 'recall' && (
                    <span
                      className="games-type-micro px-2 py-0.5 rounded-full tabular-nums"
                      style={
                        coachStage === 'test'
                          ? { background: 'rgba(229,192,123,.16)', color: '#E5C07B' }
                          : coachStage === 'practice'
                            ? { background: 'rgba(76,141,255,.16)', color: '#7AA8FF' }
                            : { background: 'var(--surface-3)', color: 'var(--text-2)' }
                      }
                    >
                      {coachStage === 'test' ? 'TEST' : coachStage === 'practice' ? 'PRACTICE' : 'LEARN'}
                    </span>
                  )}
                </span>
              </div>
              {coachNode && coachNode.kids[0]?.san ? (
                <>
                  <p className="games-type-body mt-1">
                    {coachNode.entry
                      ? `${coachNode.entry.eco} · ${headerOpeningName(coachNode.entry.name)}`
                      : 'Starting position'}
                  </p>
                  {optionsList}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {coachKind === 'recall' && (coachStage === 'practice' || coachStage === 'test') && (
                      <button
                        type="button"
                        onClick={coachStage === 'practice' ? revealHint : showAnswer}
                        disabled={!turnIsPlayer}
                        className="games-press games-type-callout rounded-[10px] px-4 py-2"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                      >
                        Show hint (H)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={playOut}
                      className="games-press games-type-callout rounded-[10px] px-4 py-2"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                    >
                      Play it out
                    </button>
                  </div>
                </>
              ) : book.name ? (
                <>
                  <p className="games-type-body mt-1">
                    <span aria-hidden>📖 </span>
                    {book.eco} · {headerOpeningName(book.name)}
                  </p>
                  {book.outAtMove !== null ? (
                    <p className="games-type-caption mt-1" style={{ color: 'var(--text-2)' }}>
                      Out of book · move {book.outAtMove}
                      {book.expectedSan ? ` — main line was ${book.expectedSan}` : ''}
                    </p>
                  ) : (
                    <p className="games-type-caption mt-1" style={{ color: 'var(--text-2)' }}>
                      Move {Math.max(1, fullMoves)} · in book
                    </p>
                  )}
                </>
              ) : (
                <p className="games-type-body mt-1" style={{ color: 'var(--text-2)' }}>
                  {sans.length === 0
                    ? 'Your line will be named here once you move.'
                    : 'Off book — no named line matches this position.'}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-3">
                <span className="games-type-caption" style={{ color: 'var(--text-2)' }}>
                  Coach {coachOn ? `on (${coachKind})` : 'off'}
                  {casual && status === 'playing' ? ' · casual' : ''}
                </span>
                <Switch on={coachOn} onToggle={toggleCoach} label="Opening coach" />
              </div>
              </div>
              ) : (
              <div role="tabpanel" aria-label="Moves" className="mt-1 min-h-0 flex-1 flex flex-col overflow-y-auto">
                {movesPane}
              </div>
              )}
            </div>
            <div className="games-card p-5 shrink-0">
              <button
                type="button"
                onClick={() => setRecordForced((v) => !(v ?? status !== 'playing'))}
                aria-expanded={recordForced ?? status !== 'playing'}
                className="games-press w-full flex items-center justify-between gap-2 text-left"
              >
                <h2 className="games-type-headline">Record vs {level.name}</h2>
                <span aria-hidden className="games-type-callout" style={{ color: 'var(--text-3)' }}>
                  {(recordForced ?? status !== 'playing') ? '▾' : '▸'}
                </span>
              </button>
              {(recordForced ?? status !== 'playing') && (
                <>
                  <p className="games-type-body mt-1 tabular-nums" style={{ color: 'var(--text-2)' }}>
                    {levelStats ? `${levelStats.wins}W · ${levelStats.losses}L · ${levelStats.draws}D` : 'No games yet'}
                    {usedUndo && ' · unrated (undo used)'}
                  </p>
                  {casualGames > 0 && (
                    <p className="games-type-caption mt-1 tabular-nums" style={{ color: 'var(--text-3)' }}>
                      Casual games: {casualGames} (coached — rated record untouched)
                    </p>
                  )}
                  {repertoireTop(openStats).length > 0 && (
                    <>
                      <h3 className="games-type-micro mt-4 mb-1" style={{ color: 'var(--text-3)' }}>
                        Your repertoire
                      </h3>
                      <ul className="flex flex-col gap-1">
                        {repertoireTop(openStats).map((r) => (
                          <li
                            key={r.eco}
                            className="games-type-caption tabular-nums"
                            style={{ color: 'var(--text-2)' }}
                          >
                            {r.eco} · {r.name} — {r.games} {r.games === 1 ? 'game' : 'games'} · {r.winPct}% · book to {r.avgDepth}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        }
        howToPlay={null}
      />
      <SetupSheet
        open={setupOpen}
        setup={setup}
        stats={stats}
        onChange={persistSetup}
        onStart={() => {
          if (setup.levelId) startGame(setup);
        }}
        onClose={() => setSetupOpen(false)}
      />
      <Sheet open={pendingPromo !== null} onClose={() => setPendingPromo(null)} label="Promote to">
        <h2 className="games-type-headline mb-3">Promote to</h2>
        <div className="grid grid-cols-4 gap-2">
          {PROMO_PIECES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const pr = pendingPromo;
                setPendingPromo(null);
                if (pr) tryPlayerMove(pr.from, pr.to, p.id);
              }}
              aria-label={`Promote to ${p.name}`}
              className="games-touch games-press rounded-[14px] inline-flex items-center justify-center p-2"
              style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
            >
              <ChessPieceIcon color={playerColor === 'white' ? 'w' : 'b'} piece={p.id} size={36} />
            </button>
          ))}
        </div>
      </Sheet>
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Pick your opponent', body: 'Six levels from ♟ Pawn (total beginner) to ♚ King (full strength).' },
          { title: 'Tap or drag to move', body: 'Tap a piece to see its legal moves as dots — captures show as rings. Type SAN like Nf3 if you prefer.' },
          { title: 'Use your lifelines', body: 'Three hints per game. Undo is always allowed but makes the game unrated.' },
        ]}
        whyItWorks="Every move is a trade: control the center, develop with threats, and always ask what the reply wins."
      />
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={outcomeTitle}
        context={`${endInfo?.review ?? META.name} · ${fullMoves} moves${endInfo ? ` · ${endInfo.reason}` : ''}`}
        stats={[
          { label: 'moves', value: `${fullMoves}` },
          { label: 'level', value: `${level.piece} ${level.name}` },
        ]}
        streak={streak}
        onShare={() => {
          const text = chessShareText({
            outcome: endInfo?.outcome ?? 'draw',
            level,
            moves: fullMoves,
            url: playUrl('chess'),
          });
          void shareText(text, say);
        }}
        onPlayAgain={() => {
          setResultOpen(false);
          setSetupOpen(true);
        }}
        onClose={() => setResultOpen(false)}
        note={
          dueCount(nodes) > 0 ? (
            <button
              type="button"
              onClick={() => {
                setResultOpen(false);
                startReview();
              }}
              className="games-press underline underline-offset-2"
              style={{ color: '#E5C07B' }}
            >
              📖 Review {dueCount(nodes)} due
            </button>
          ) : undefined
        }
      />
      <ConfirmDialog
        open={confirmResign}
        title={review ? 'Stop this review?' : 'Resign this game?'}
        body={review ? 'Your review queue will be kept.' : `${level.piece} ${level.name} takes the win.`}
        confirmLabel={review ? 'Stop' : 'Resign'}
        onConfirm={() => {
          setConfirmResign(false);
          if (review) completeReview('Review stopped');
          else finish('loss', 'resignation');
        }}
        onCancel={() => setConfirmResign(false)}
      />
      <ConfirmDialog
        open={confirmNew}
        title={pendingReview ? 'Start review?' : 'Start a new game?'}
        body="Your current board will be lost."
        confirmLabel={pendingReview ? 'Review' : 'New game'}
        onConfirm={() => {
          setConfirmNew(false);
          if (pendingReview) {
            setPendingReview(false);
            startReview();
          } else setSetupOpen(true);
        }}
        onCancel={() => {
          setConfirmNew(false);
          setPendingReview(false);
        }}
      />
      <ConfirmDialog
        open={confirmCoach}
        title="Turn coaching on?"
        body="This makes the game casual — it will not count toward your record."
        confirmLabel="Coach me"
        onConfirm={confirmCoachOn}
        onCancel={() => setConfirmCoach(false)}
      />
      <ConfirmDialog
        open={pendingMode !== null}
        title="Switch to Play?"
        body="Your current game will be lost."
        confirmLabel="Switch"
        onConfirm={confirmModeSwitch}
        onCancel={() => setPendingMode(null)}
      />
      <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} />
    </>
  );
}

