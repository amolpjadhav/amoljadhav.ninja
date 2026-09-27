'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

// Name-that-square, game edition. Three modes — Practice (calm, endless),
// Blitz (30 seconds, points), Survival (3 lives, wrong taps cost one) — plus
// a reverse "Name it" variant where the square lights up and you name it by
// tapping a choice or typing it. Practice can drill a file/rank subset.
// Best scores persist per timed mode in localStorage. Sound is a tiny
// WebAudio blip with a mute switch; no audio assets. All motion is
// click-driven — no loops to gate.

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const LIGHT = '#eeeed2';
const DARK = '#769656';
// Squares stay flat — depth lives in the card shadow, not bevels.
const BLITZ_SECONDS = 30;
// v3: bests are plain correct-counts (one point per correct answer) —
// v2 keys held bonus-inflated point values from the scoring era.
const BEST_BLITZ_KEY = 'square-trainer-best-blitz-v3';
const BEST_SURVIVAL_KEY = 'square-trainer-best-survival-v3';
const MISS_HIST_KEY = 'square-trainer-miss-history-v2';
const MAX_HIST_ROUNDS = 10;
const MAX_DRILL_SQUARES = 8;

type MissRound = Record<string, number>;

function loadMissHist(): MissRound[] {
  try {
    const raw = window.localStorage.getItem(MISS_HIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is MissRound =>
        typeof r === 'object' &&
        r !== null &&
        Object.entries(r).every(([k, v]) => /^[a-h][1-8]$/.test(k) && typeof v === 'number')
    );
  } catch {
    // server render or private mode — history just starts empty
    return [];
  }
}

function saveMissHist(hist: MissRound[]) {
  try {
    window.localStorage.setItem(MISS_HIST_KEY, JSON.stringify(hist));
  } catch {
    // private mode — history just doesn't persist
  }
}

function aggregateMisses(hist: MissRound[]): MissRound {
  const out: MissRound = {};
  for (const round of hist) {
    for (const [sq, n] of Object.entries(round)) out[sq] = (out[sq] ?? 0) + n;
  }
  return out;
}

function heatBucket(count: number): number {
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

// Heat cells, darkest-last: index matches heatBucket.
const HEAT_CELL = [
  '',
  'bg-[#f3ddba] text-[#4a3419]',
  'bg-[#eead6d] text-[#4a2c12]',
  'bg-[#dd7f33] text-white',
  'bg-[#b25a1d] text-white',
];
const HEAT_LABEL = ['1', '2', '3–4', '5+'];

type Mode = 'practice' | 'blitz' | 'survival';
type Phase = 'idle' | 'playing' | 'over';
type Orientation = 'white' | 'black' | 'random';

function pickFrom<T>(pool: T[], except?: T): T {
  let item = except;
  while (item === except || item === undefined) {
    item = pool[Math.floor(Math.random() * pool.length)];
  }
  return item;
}

// Module scope (not component scope): the purity lint forbids impure calls
// inside the component, but a guessing game needs randomness somewhere.
function coinFlip(): boolean {
  return Math.random() < 0.5;
}

// Same boundary for the wall clock — round timing must never read Date.now
// from a function the lint can reach from render or an updater.
function now(): number {
  return Date.now();
}

function allSquares(files: string[], ranks: number[]): string[] {
  const out: string[] = [];
  for (const f of files) for (const r of ranks) out.push(`${f}${r}`);
  return out;
}

// Three distractors: one neighbour (one step away) plus two from the pool —
// near-misses teach more than far ones.
function makeChoices(target: string, pool: string[]): string[] {
  const f = FILES.indexOf(target[0]);
  const r = Number(target.slice(1));
  const neighbours: string[] = [];
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = f + df;
      const nr = r + dr;
      if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) {
        const sq = `${FILES[nf]}${nr}`;
        if (pool.includes(sq)) neighbours.push(sq);
      }
    }
  }
  const set = new Set<string>([target]);
  if (neighbours.length > 0) set.add(pickFrom(neighbours));
  const rest = pool.filter((s) => !set.has(s));
  while (set.size < 4 && rest.length > 0) {
    const i = Math.floor(Math.random() * rest.length);
    set.add(rest.splice(i, 1)[0]);
  }
  const head = [target];
  const tail = [...set].filter((s) => s !== target);
  while (tail.length > 0) head.push(tail.splice(Math.floor(Math.random() * tail.length), 1)[0]);
  return head;
}

function squareColor(sq: string) {
  const f = FILES.indexOf(sq[0]);
  const r = Number(sq.slice(1));
  return (f + r) % 2 === 1 ? DARK : LIGHT;
}

function loadBest(key: string): number {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    // server render or private mode — best just starts at zero
    return 0;
  }
}

function SegBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg px-2 py-1.5 text-[13px] font-bold transition-all duration-150 active:scale-[0.97] ${
        active
          ? 'bg-[#f3ecd9] text-black shadow-[0_2px_10px_rgba(0,0,0,0.45),0_0_12px_rgba(243,236,217,0.25)]'
          : 'text-white/55 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function SwitchRow({
  label,
  on,
  onToggle,
  blue,
  hint,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  blue?: boolean;
  hint?: string;
}) {
  return (
    <div
      title={hint}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#24262b] px-4 py-3"
    >
      <span className="text-[15px] font-medium text-white/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-150 active:scale-95 ${
          on ? (blue ? 'bg-blue-500' : 'bg-green-500') : 'bg-white/15'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

const MODE_OPTIONS: [Mode, string][] = [
  ['blitz', 'Blitz'],
  ['survival', 'Survival'],
  ['practice', 'Practice'],
];
const SIDE_OPTIONS: [Orientation, string][] = [
  ['white', 'White'],
  ['black', 'Black'],
  ['random', 'Random'],
];

export default function SquareTrainer() {
  const [mode, setMode] = useState<Mode>('blitz');
  const [phase, setPhase] = useState<Phase>('idle');
  const [reverse, setReverse] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('white');
  const [flipped, setFlipped] = useState(false);
  const [filesSel, setFilesSel] = useState<'all' | 'abcd' | 'efgh'>('all');
  const [ranksSel, setRanksSel] = useState<'all' | '14' | '58'>('all');
  const [target, setTarget] = useState(() => pickFrom(allSquares(FILES, [1, 2, 3, 4, 5, 6, 7, 8])));
  const [choices, setChoices] = useState<string[]>(() => []);
  const [flash, setFlash] = useState<{ sq: string; ok: boolean } | null>(null);
  const [choiceFlash, setChoiceFlash] = useState<{ name: string; ok: boolean } | null>(null);
  const [reveal, setReveal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBest(BEST_BLITZ_KEY));
  const [prevBest, setPrevBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastMiss, setLastMiss] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [hard, setHard] = useState(true);
  const [muted, setMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BLITZ_SECONDS);
  const [cursor, setCursor] = useState<{ di: number; ri: number } | null>(null);
  const [drillSet, setDrillSet] = useState<string[] | null>(null);
  const [avgPer, setAvgPer] = useState<number | null>(null);
  const [missHist, setMissHist] = useState<MissRound[]>(() => loadMissHist());
  const [shaking, setShaking] = useState(false);
  const [shownScore, setShownScore] = useState(0);
  const [burst, setBurst] = useState<{ dx: number; dy: number; c: string }[] | null>(null);
  const shakeTimer = useRef<number | null>(null);
  const burstTimer = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const leftRef = useRef(BLITZ_SECONDS);
  const audioRef = useRef<AudioContext | null>(null);
  const advanceRef = useRef<number | null>(null);
  const correctRef = useRef(0);
  const tallyRef = useRef<MissRound>({});
  const roundStartRef = useRef(0);
  const endedRef = useRef(false);
  const elapsedRef = useRef(0);

  // Labels stay off unless you're practicing — the axes skip the skill.
  // (Default mode is Blitz, so they start off.)
  const displayRanks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const accuracy = attempts === 0 ? null : Math.round((correct / attempts) * 100);
  const timed = mode === 'blitz';
  const scored = mode !== 'practice';
  const over = phase === 'over';
  const slipAgg = aggregateMisses(missHist);
  const slipTop = missTallyEntries(slipAgg).slice(0, MAX_DRILL_SQUARES);
  const sideLabel =
    orientation === 'random'
      ? flipped
        ? 'Black'
        : 'White'
      : orientation === 'white'
        ? 'White'
        : 'Black';
  const modeLabel = mode === 'blitz' ? 'Blitz' : mode === 'survival' ? 'Survival' : 'Practice';

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    };
  }, []);

  function pool(): string[] {
    if (mode === 'practice' && drillSet && drillSet.length > 0) return drillSet;
    const files =
      mode === 'practice'
        ? filesSel === 'abcd'
          ? FILES.slice(0, 4)
          : filesSel === 'efgh'
            ? FILES.slice(4)
            : FILES
        : FILES;
    const ranks =
      mode === 'practice'
        ? ranksSel === '14'
          ? [1, 2, 3, 4]
          : ranksSel === '58'
            ? [5, 6, 7, 8]
            : [1, 2, 3, 4, 5, 6, 7, 8]
        : [1, 2, 3, 4, 5, 6, 7, 8];
    return allSquares(files, ranks);
  }

  function deal() {
    dealFrom(pool());
  }

  function dealFrom(p: string[]) {
    // Computed outside updaters so StrictMode double-invocation can never
    // desync the target from its choices or the flip.
    const t = pickFrom(p, p.includes(target) ? target : undefined);
    setTarget(t);
    setChoices(makeChoices(t, p));
    setReveal(false);
    if (orientation === 'random') setFlipped(coinFlip());
  }

  function stopClock() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function beep(ok: boolean) {
    if (muted) return;
    try {
      if (!audioRef.current) {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        audioRef.current = new AC();
      }
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = ok ? 740 : 196;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // no audio — the game plays on silently
    }
  }

  function queueAdvance() {
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    advanceRef.current = window.setTimeout(() => {
      advanceRef.current = null;
      dealRef.current();
      setFlash(null);
      setChoiceFlash(null);
      setReveal(false);
    }, 450);
  }

  // dealRef lets the delayed advance always use fresh state.
  const dealRef = useRef(deal);
  useEffect(() => {
    dealRef.current = deal;
  });

  // Round-over score counts up from zero; under reduced motion the dialog
  // renders the final score directly, keeping setState out of the effect body.
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  useEffect(() => {
    if (!over || reduceMotion) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      setShownScore(Math.round(score * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [over, reduceMotion, score]);

  function endRun(finalScore: number, key: string) {
    // Guarded: endRun fires from inside state updaters, which StrictMode
    // may invoke twice — the round must only be recorded once.
    if (endedRef.current) return;
    endedRef.current = true;
    stopClock();
    if (timed) setTimeLeft(0);
    const hits = correctRef.current;
    setAvgPer(hits > 0 ? elapsedRef.current / hits : null);
    const tally = tallyRef.current;
    setMissHist((h) => {
      const next = [...h, tally].slice(-MAX_HIST_ROUNDS);
      saveMissHist(next);
      return next;
    });
    setPhase('over');
    setScore(finalScore);
    // Best hasn't been updated for this round yet, so the closure value
    // is the previous best — the pill shows the margin over it.
    setPrevBest(best);
    // New-best celebration: sixteen bits burst from the score and are gone
    // in about half a second. Guarded to fire once with the round record.
    if (finalScore > best && finalScore > 0 && !reduceMotion) {
      const palette = ['#0aee3c', '#f3ecd9', '#fbbf24', '#4ade80'];
      setBurst(
        Array.from({ length: 16 }, () => {
          const a = Math.random() * Math.PI * 2;
          const d = 40 + Math.random() * 70;
          return {
            dx: Math.cos(a) * d,
            dy: Math.sin(a) * d - 24,
            c: palette[Math.floor(Math.random() * palette.length)],
          };
        }),
      );
      if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
      burstTimer.current = window.setTimeout(() => setBurst(null), 650);
    }
    setBest((prev) => {
      if (finalScore > prev) {
        try {
          window.localStorage.setItem(key, String(finalScore));
        } catch {
          // private mode — best just doesn't persist
        }
        return finalScore;
      }
      return prev;
    });
  }

  function beginClock() {
    leftRef.current = BLITZ_SECONDS;
    roundStartRef.current = now();
    endedRef.current = false;
    elapsedRef.current = 0;
    setTimeLeft(BLITZ_SECONDS);
    setPhase('playing');
    timerRef.current = window.setInterval(() => {
      leftRef.current = Math.max(0, Math.round((leftRef.current - 0.2) * 10) / 10);
      setTimeLeft(leftRef.current);
      if (leftRef.current <= 0) {
        setScore((s) => {
          endRun(s, BEST_BLITZ_KEY);
          return s;
        });
      }
    }, 200);
  }

  function startRun() {
    stopClock();
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    endedRef.current = false;
    correctRef.current = 0;
    tallyRef.current = {};
    roundStartRef.current = now();
    elapsedRef.current = 0;
    setAvgPer(null);
    deal();
    setFlash(null);
    setChoiceFlash(null);
    setReveal(false);
    setStreak(0);
    setScore(0);
    setCorrect(0);
    setAttempts(0);
    setLastMiss(null);
    setInputError(null);
    setNameInput('');
    setCursor(null);
    setShaking(false);
    if (mode === 'survival') {
      setLives(3);
      setPhase('playing');
    } else if (timed) {
      beginClock();
    }
  }

  function switchMode(m: Mode) {
    stopClock();
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    setMode(m);
    setPhase('idle');
    endedRef.current = false;
    correctRef.current = 0;
    tallyRef.current = {};
    setAvgPer(null);
    elapsedRef.current = 0;
    setHard(m !== 'practice');
    setFlash(null);
    setChoiceFlash(null);
    setReveal(false);
    setStreak(0);
    setScore(0);
    setCorrect(0);
    setAttempts(0);
    setLastMiss(null);
    setInputError(null);
    setNameInput('');
    setCursor(null);
    setShaking(false);
    setTimeLeft(BLITZ_SECONDS);
    if (orientation === 'random') setFlipped(coinFlip());
    else setFlipped(orientation === 'black');
    if (m === 'survival') {
      setLives(3);
      // No clock to start on first tap here, so the round begins at once —
      // otherwise the board sits dead until Restart is pressed.
      setPhase('playing');
      setBest(loadBest(BEST_SURVIVAL_KEY));
      setPrevBest(loadBest(BEST_SURVIVAL_KEY));
    } else if (m === 'blitz') {
      setBest(loadBest(BEST_BLITZ_KEY));
      setPrevBest(loadBest(BEST_BLITZ_KEY));
    }
  }

  function registerHit() {
    // One point per correct answer in every scored mode — no bonus math,
    // so the score always equals the solved count.
    correctRef.current += 1;
    setCorrect((c) => c + 1);
    if (scored) setScore((s) => s + 1);
    setStreak((s) => {
      const nextStreak = s + 1;
      setBestStreak((b) => Math.max(b, nextStreak));
      return nextStreak;
    });
    setLastMiss(null);
    setInputError(null);
    queueAdvance();
  }

  function registerMiss(picked: string) {
    beep(false);
    if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
    setShaking(true);
    shakeTimer.current = window.setTimeout(() => setShaking(false), 200);
    setStreak(0);
    setLastMiss(picked);
    setInputError(null);
    setReveal(true);
    tallyRef.current = { ...tallyRef.current, [target]: (tallyRef.current[target] ?? 0) + 1 };
    if (mode === 'survival') {
      setLives((l) => {
        const left = l - 1;
        if (left <= 0) {
          setScore((s) => {
            endRun(s, BEST_SURVIVAL_KEY);
            return s;
          });
        }
        return Math.max(0, left);
      });
    }
  }

  function guess(sq: string) {
    // In reverse mode the board is display-only — answers come from the
    // choices or the keyboard. Blitz has no start gate otherwise.
    if (reverse) return;
    if (timed && phase === 'idle') beginClock();
    if (roundStartRef.current > 0) {
      elapsedRef.current = Math.max(0.5, (now() - roundStartRef.current) / 1000);
    }
    const active = mode === 'practice' || phase === 'playing' || (timed && phase === 'idle');
    if (!active || flash?.ok || over) return;
    setAttempts((a) => a + 1);
    if (sq === target) {
      beep(true);
      setFlash({ sq, ok: true });
      registerHit();
    } else {
      setFlash({ sq, ok: false });
      registerMiss(sq);
    }
  }

  function answerChoice(name: string) {
    if (timed && phase === 'idle') beginClock();
    if (roundStartRef.current > 0) {
      elapsedRef.current = Math.max(0.5, (now() - roundStartRef.current) / 1000);
    }
    const active = mode === 'practice' || phase === 'playing' || (timed && phase === 'idle');
    if (!active || choiceFlash?.ok || over) return;
    setAttempts((a) => a + 1);
    if (name === target) {
      beep(true);
      setChoiceFlash({ name, ok: true });
      registerHit();
    } else {
      setChoiceFlash({ name, ok: false });
      registerMiss(name);
    }
  }

  function submitName(e: React.FormEvent) {
    e.preventDefault();
    const clean = nameInput.trim().toLowerCase();
    if (!/^[a-h][1-8]$/.test(clean)) {
      setInputError('Type a square like e4.');
      return;
    }
    setInputError(null);
    setNameInput('');
    answerChoice(clean);
  }

  function drillSlips() {
    if (slipTop.length === 0) return;
    setDrillSet(slipTop);
    setReverse(false);
    switchMode('practice');
    // Practice defaults to labels on; a slip drill should train blind.
    setHard(true);
    dealFrom(slipTop);
  }

  const shareText =
    accuracy === null
      ? `${score} squares · Can you beat it?`
      : timed
        ? `${score} squares in 30s · ${accuracy}% · Can you beat it?`
        : `${score} squares · ${accuracy}% · Can you beat it?`;

  // Same X intent convention as ShareButtons: prefilled text plus a share
  // link that carries the score, so the X post embeds a personalized
  // score-card snapshot (never the preview URL).
  const isNewBest = score > 0 && score > prevBest;
  const cardParams = new URLSearchParams({
    score: String(score),
    total: String(attempts > 0 ? attempts : score),
    ...(accuracy === null ? {} : { acc: String(accuracy) }),
    ...(avgPer === null ? {} : { avg: avgPer.toFixed(1) }),
    ...(best > 0 ? { pb: String(best) } : {}),
    ...(timed ? { secs: String(BLITZ_SECONDS) } : {}),
    ...(isNewBest ? { best: '1' } : {}),
  });
  const shareUrl = `https://amoljadhav.ai/share/chess-notation?${cardParams.toString()}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareUrl)}`;

  function dismiss() {
    stopClock();
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    endedRef.current = false;
    correctRef.current = 0;
    tallyRef.current = {};
    setAvgPer(null);
    elapsedRef.current = 0;
    // Survival has no first-tap clock start, so idle would be a dead board —
    // drop straight into a fresh round instead.
    setPhase(mode === 'survival' ? 'playing' : 'idle');
    setTimeLeft(BLITZ_SECONDS);
    setLives(3);
    setFlash(null);
    setChoiceFlash(null);
    setReveal(false);
    setStreak(0);
    setScore(0);
    setCorrect(0);
    setAttempts(0);
    setLastMiss(null);
    setInputError(null);
    setNameInput('');
    setCursor(null);
    setShaking(false);
    if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
    setBurst(null);
    deal();
  }

  function cycleSide() {
    const next: Orientation =
      orientation === 'white' ? 'black' : orientation === 'black' ? 'random' : 'white';
    setOrientation(next);
    if (next === 'random') setFlipped(coinFlip());
    else setFlipped(next === 'black');
  }

  function onBoardKey(e: React.KeyboardEvent) {
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = move[e.key];
    if (delta) {
      e.preventDefault();
      setCursor((c) => {
        const di = Math.min(7, Math.max(0, (c?.di ?? 3) + delta[0]));
        const ri = Math.min(7, Math.max(0, (c?.ri ?? 3) + delta[1]));
        return { di, ri };
      });
      return;
    }
    if (e.key === 'Enter' && cursor) {
      e.preventDefault();
      const sq = `${displayFiles[cursor.di]}${displayRanks[cursor.ri]}`;
      if (reverse) answerChoice(sq);
      else guess(sq);
    }
  }

  const secs = Math.ceil(timeLeft);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const modeBlurb =
    mode === 'blitz'
      ? '30 seconds. Score as many as you can.'
      : mode === 'survival'
        ? 'Three lives. Each miss costs one.'
        : 'No clock. Slice the board and drill.';

  return (
    <div className="relative not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-xl px-4 pb-5 pt-2 sm:px-6 sm:pb-6 sm:pt-3 my-6 shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] [container:widget/inline-size]">
      <div inert={over}>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 lg:hidden">
        <button
          type="button"
          onClick={() =>
            document
              .getElementById('st-controls')
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/85"
        >
          {modeLabel} · {sideLabel}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M3 4.5 6 7.5 9 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        {mode === 'survival' ? (
          <div
            className="flex h-[30px] items-center gap-1.5"
            aria-label={`${lives} lives left`}
          >
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className={i < lives ? 'text-red-400' : 'text-white/15'}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-md bg-black/60 px-3 py-1.5 font-mono text-2xl font-bold tabular-nums leading-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)] ${
              timed && phase === 'playing' && timeLeft <= 5
                ? 'text-orange-500'
                : timed && phase === 'playing' && timeLeft <= 10
                  ? 'text-amber-300'
                  : timed && phase === 'idle'
                    ? 'text-[#f3ecd9]'
                    : 'text-[#0aee3c]'
            } ${timed && phase === 'playing' && timeLeft <= 5 ? 'timer-pulse' : ''}`}
            style={{
              textShadow:
                timed && phase === 'playing' && timeLeft <= 5
                  ? '0 0 10px rgba(249,115,22,0.9)'
                  : timed && phase === 'playing' && timeLeft <= 10
                    ? '0 0 10px rgba(252,211,77,0.9)'
                    : timed && phase === 'idle'
                      ? 'none'
                      : '0 0 10px rgba(10,238,60,0.9)',
            }}
          >
            {timed ? clock : streak}
          </div>
        )}
        <dl className="flex gap-4 sm:gap-6 text-right">
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">
              {scored ? 'Score' : 'Solved'}
            </dt>
            <dd key={scored ? score : correct} className="score-tick font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
              {scored ? score : correct}
            </dd>
          </div>
          {mode !== 'survival' && (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">Streak</dt>
              <dd className={`font-mono text-lg font-bold tabular-nums text-[#f3ecd9] ${streak === 5 || streak === 10 ? '[text-shadow:0_0_10px_rgba(10,238,60,0.8)]' : ''}`}>{streak}</dd>
            </div>
          )}
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-white/40">Accuracy</dt>
            <dd className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
              {accuracy === null ? '—' : `${accuracy}%`}
            </dd>
          </div>
          {mode !== 'practice' && (
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">Best</dt>
              <dd className="font-mono text-lg font-bold tabular-nums text-amber-300">
                {best > 0 ? best : '—'}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {mode !== 'practice' && (
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              timed && phase === 'playing' && timeLeft <= 5
                ? 'bg-red-400'
                : timed && phase === 'playing' && timeLeft <= 10
                  ? 'bg-amber-300'
                  : 'bg-[#f3ecd9]'
            }`}
            style={{
              width: `${timed ? (timeLeft / BLITZ_SECONDS) * 100 : (lives / 3) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          <div className="mb-1 flex min-h-[40px] flex-nowrap items-center justify-between gap-x-3">
            <p className="truncate text-sm text-white/70">
              {reverse ? (
                <>
                  What square is lit?{' '}
                  {streak >= 3 && (
                    <span className="ml-1 text-xs font-bold uppercase tracking-wide text-amber-300">
                      Combo ×{streak}
                    </span>
                  )}
                </>
              ) : (
                <>
                  Tap <strong key={target} className="target-in text-4xl font-bold text-white">{target}</strong>
                  {streak >= 3 && (
                    <span className="ml-2 text-xs font-bold uppercase tracking-wide text-amber-300">
                      Combo ×{streak}
                    </span>
                  )}
                </>
              )}
            </p>
            <p className="shrink-0 text-xs text-white/50" aria-live="polite">
              {flash?.ok || choiceFlash?.ok ? (
                <span className="font-bold text-green-400">Correct!</span>
              ) : inputError ? (
                <span className="text-amber-300">{inputError}</span>
              ) : lastMiss ? (
                <span>
                  That’s <strong className="text-white/80">{lastMiss}</strong> — try again.
                </span>
              ) : (
                <span>&nbsp;</span>
              )}
            </p>
          </div>
          {mode === 'survival' && phase !== 'idle' && lives <= 1 && (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">
              Last life — every tap counts
            </p>
          )}

        <div className={`grid w-full grid-cols-[26px_1fr_26px] ${shaking ? 'board-shake' : ''}`}>
          <div className="grid grid-rows-[repeat(8,1fr)]">
            {displayRanks.map((rank) => (
              <div key={rank} className="flex items-center justify-center">
                <span className={`text-sm font-bold text-white/70 ${hard ? 'invisible' : ''}`}>
                  {rank}
                </span>
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-8 overflow-hidden rounded-lg border border-white/10 shadow-[0_0_18px_rgba(10,238,60,0.35),0_0_60px_rgba(10,238,60,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            tabIndex={0}
            onKeyDown={onBoardKey}
          >
            {displayRanks.map((rank, ri) =>
              displayFiles.map((file, di) => {
                const sq = `${file}${rank}`;
                const isFlash = !reverse && flash?.sq === sq;
                const lit = reverse && sq === target;
                const revealed = reveal && sq === target;
                const cursored = cursor?.di === di && cursor?.ri === ri;
                return (
                  <button
                    key={sq}
                    type="button"
                    tabIndex={-1}
                    onClick={() => guess(sq)}
                    aria-label={`square ${sq}`}
                    className={`aspect-square w-full touch-manipulation cursor-pointer select-none transition-[filter,transform] duration-75 hover:brightness-[1.04] active:translate-y-px active:brightness-90 ${isFlash && flash.ok ? 'sq-hit' : ''} ${lit ? 'ring-4 ring-inset ring-amber-300' : ''} ${
                      revealed ? 'ring-4 ring-inset ring-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]' : ''
                    } ${cursored ? 'outline outline-2 outline-dashed outline-offset-[-6px] outline-white/90' : ''}`}
                    style={{
                      background: isFlash ? (flash.ok ? '#0aee3c' : '#f87171') : squareColor(sq),
                    }}
                  />
                );
              })
            )}
          </div>
          {/* Gutters are permanent symmetric space — the coordinates toggle
              flips visibility only, so the board never moves or resizes. */}
          <div aria-hidden="true" />
          <div aria-hidden="true" />
          <div className="grid grid-cols-8">
            {displayFiles.map((file) => (
              <div key={file} className="flex items-center justify-center pt-1">
                <span className={`text-sm font-bold text-white/70 ${hard ? 'invisible' : ''}`}>
                  {file}
                </span>
              </div>
            ))}
          </div>
          <div aria-hidden="true" />
        </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/50">
            Tip: click the board, then move with the arrow keys — Enter taps the square.
          </p>
        </div>
        <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
              Task
            </h4>
            <div className="grid grid-cols-2 rounded-xl bg-black/30 p-1">
              <SegBtn active={!reverse} onClick={() => setReverse(false)}>
                Find square
              </SegBtn>
              <SegBtn
                active={reverse}
                onClick={() => setReverse(true)}
                title="Lit square — pick or type its name instead"
              >
                Name square
              </SegBtn>
            </div>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
              Mode
            </h4>
            <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
              {MODE_OPTIONS.map(([m, label]) => (
                <SegBtn key={m} active={mode === m} onClick={() => switchMode(m)}>
                  {label}
                </SegBtn>
              ))}
            </div>
            <p className="mt-0.5 truncate text-xs text-white/45">{modeBlurb}</p>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
              Play as
            </h4>
            <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
              {SIDE_OPTIONS.map(([o, label]) => (
                <SegBtn
                  key={o}
                  active={orientation === o}
                  onClick={() => {
                    setOrientation(o);
                    if (o === 'random') setFlipped(coinFlip());
                    else setFlipped(o === 'black');
                  }}
                  title={
                    o === 'random'
                      ? 'Board flips to a random side every square — the best trainer'
                      : `Play from ${o}’s side of the board`
                  }
                >
                  {label}
                </SegBtn>
              ))}
            </div>
          </section>
          {mode === 'practice' && (
            <section>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
                Drill
              </h4>
              {drillSet && drillSet.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrillSet(null)}
                  title="Back to the full board"
                  className="mb-1.5 flex w-full items-center justify-between rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200"
                >
                  <span>
                    Drilling {drillSet.length} slip square{drillSet.length === 1 ? '' : 's'}
                  </span>
                  <span aria-hidden="true">×</span>
                </button>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
                  {(['all', 'abcd', 'efgh'] as const).map((f) => (
                    <SegBtn
                      key={f}
                      active={filesSel === f}
                      onClick={() => {
                        setFilesSel(f);
                        setDrillSet(null);
                      }}
                    >
                      {f === 'all' ? 'A–H' : f === 'abcd' ? 'A–D' : 'E–H'}
                    </SegBtn>
                  ))}
                </div>
                <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
                  {(['all', '14', '58'] as const).map((r) => (
                    <SegBtn
                      key={r}
                      active={ranksSel === r}
                      onClick={() => {
                        setRanksSel(r);
                        setDrillSet(null);
                      }}
                    >
                      {r === 'all' ? '1–8' : r === '14' ? '1–4' : '5–8'}
                    </SegBtn>
                  ))}
                </div>
              </div>
            </section>
          )}
          <section className="flex flex-col gap-2">
            <SwitchRow
              label="Coordinates"
              on={!hard}
              onToggle={() => setHard((h) => !h)}
              hint="Show coordinate labels around the board"
            />
            <SwitchRow label="Sound" on={!muted} onToggle={() => setMuted((m) => !m)} blue />
          </section>
          <button
            type="button"
            onClick={startRun}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Restart round
          </button>
        </aside>
      </div>

      {reverse && !over && (
        <form onSubmit={submitName} className="mb-3 flex gap-2">
          <input
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setInputError(null);
            }}
            placeholder="Or type it, e.g. e4"
            aria-label="Type the square name"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={2}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
          >
            Go
          </button>
        </form>
      )}

      {reverse && !over && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {choices.map((name) => {
            const picked = choiceFlash?.name === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => answerChoice(name)}
                className={`rounded-lg border px-3 py-2.5 font-mono text-base font-bold touch-manipulation select-none transition-all duration-150 active:scale-[0.97] ${
                  picked
                    ? choiceFlash.ok
                      ? 'border-green-400 bg-green-400/15 text-green-300'
                      : 'border-red-400 bg-red-400/15 text-red-300'
                    : 'border-white/10 bg-black/30 text-white/85 hover:bg-black/50'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      <div id="st-controls" className="mt-4 flex scroll-mt-4 flex-col gap-2.5 lg:hidden">
        <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
          {MODE_OPTIONS.map(([m, label]) => (
            <SegBtn key={m} active={mode === m} onClick={() => switchMode(m)}>
              {label}
            </SegBtn>
          ))}
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-black/30 p-1">
          <SegBtn active={!reverse} onClick={() => setReverse(false)}>
            Find square
          </SegBtn>
          <SegBtn
            active={reverse}
            onClick={() => setReverse(true)}
            title="Lit square — pick or type its name instead"
          >
            Name square
          </SegBtn>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHard((h) => !h)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-150 active:scale-95"
          >
            Coordinates: {hard ? 'Off' : 'On'}
          </button>
          <button
            type="button"
            onClick={cycleSide}
            title="Cycle White → Black → Random"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-150 active:scale-95"
          >
            Play as: {sideLabel}
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-150 active:scale-95"
          >
            Sound: {muted ? 'Off' : 'On'}
          </button>
        </div>
        {mode === 'practice' && (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
              {(['all', 'abcd', 'efgh'] as const).map((f) => (
                <SegBtn
                  key={f}
                  active={filesSel === f}
                  onClick={() => {
                    setFilesSel(f);
                    setDrillSet(null);
                  }}
                >
                  {f === 'all' ? 'A–H' : f === 'abcd' ? 'A–D' : 'E–H'}
                </SegBtn>
              ))}
            </div>
            <div className="grid grid-cols-3 rounded-xl bg-black/30 p-1">
              {(['all', '14', '58'] as const).map((r) => (
                <SegBtn
                  key={r}
                  active={ranksSel === r}
                  onClick={() => {
                    setRanksSel(r);
                    setDrillSet(null);
                  }}
                >
                  {r === 'all' ? '1–8' : r === '14' ? '1–4' : '5–8'}
                </SegBtn>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={startRun}
          className="w-full rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
        >
          Restart round
        </button>
      </div>

      </div>
      {over && (
        <div className="absolute inset-0 z-10 overflow-y-auto rounded-xl bg-black/90 backdrop-blur-[2px]">
          <div className="st-results">
            <div className="st-results-head">
              <h3 className="text-xl font-bold text-[#f3ecd9]">
                {timed ? 'Round complete' : 'Out of lives'}
              </h3>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close results"
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="st-summary">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-white/40">
                {modeLabel.toUpperCase()} · {timed ? '30 SEC' : '3 LIVES'} · {sideLabel.toUpperCase()}
              </p>
              <p className="text-center font-mono text-7xl font-bold tabular-nums leading-none text-[#f3ecd9]">{reduceMotion ? score : shownScore}</p>
              {score > prevBest && score > 0 ? (
                <p className="text-center">
                  <span className="inline-block rounded-full bg-amber-300 px-4 py-1 text-sm font-bold text-black">
                    New best · +{score - prevBest}
                  </span>
                </p>
              ) : (
                <p className="text-center text-sm text-white/50">
                  Best {best > 0 ? best : '—'}
                </p>
              )}
              {burst && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center"
                >
                  {burst.map((b, i) => (
                    <span
                      key={i}
                      className="confetti-bit absolute h-1.5 w-1.5 rounded-full"
                      style={
                        {
                          background: b.c,
                          '--dx': `${b.dx}px`,
                          '--dy': `${b.dy}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Accuracy
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-white">
                    {accuracy === null ? '—' : `${accuracy}%`}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Per square
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-white">
                    {avgPer === null ? '—' : `${avgPer.toFixed(1)}s`}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.05] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Best streak
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-white">{bestStreak}</p>
                </div>
              </div>
            </div>
            <div className="st-heat">
              <h4 className="text-base font-bold text-white">Where you slip</h4>
              <p className="text-xs text-white/45">{missHist.length <= 1 ? 'Misses this round' : 'Misses over your last 10 rounds'}</p>
              {slipTop.length > 0 ? (
                <>
                  <div className="mx-auto mt-2 w-full max-w-[360px] rounded-xl bg-black/30 p-2">
                    <div className="flex flex-col">
                      {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
                        <div key={rank} className="flex items-stretch">
                          <span className="flex w-[14px] shrink-0 items-center justify-center text-[10px] font-bold text-white/35">
                            {rank}
                          </span>
                          {FILES.map((file) => {
                            const sq = `${file}${rank}`;
                            const misses = slipAgg[sq] ?? 0;
                            const b = heatBucket(misses);
                            return (
                              <span
                                key={sq}
                                title={misses > 0 ? `${sq} · ${misses} misses` : sq}
                                className={`flex aspect-square flex-1 items-center justify-center text-[10px] font-bold ${
                                  b === 0
                                    ? (FILES.indexOf(file) + rank) % 2 === 1
                                      ? 'bg-white/[0.05]'
                                      : 'bg-white/[0.02]'
                                    : HEAT_CELL[b]
                                }`}
                              >
                                {misses > 0 ? sq : ''}
                              </span>
                            );
                          })}
                        </div>
                      ))}
                      <div className="flex">
                        <span className="w-[14px] shrink-0" aria-hidden="true" />
                        {FILES.map((file) => (
                          <span
                            key={file}
                            className="flex-1 text-center text-[10px] font-bold text-white/35"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-3 text-xs text-white/50">
                    {[1, 2, 3, 4].map((b) => (
                      <span key={b} className="flex items-center gap-1">
                        <span
                          className={`h-3 w-3 rounded ${HEAT_CELL[b].split(' ')[0]}`}
                          aria-hidden="true"
                        />
                        {HEAT_LABEL[b - 1]}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-2 rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white/60">
                  Clean round — no misses to drill.
                </p>
              )}
            </div>
            <div className="st-actions">
              {slipTop.length > 0 && (
                <button
                  type="button"
                  onClick={drillSlips}
                  className="w-full rounded-xl bg-[#f3ecd9] px-4 py-2 text-sm font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
                >
                  {slipTop.length === 1
                    ? 'Drill your weakest square'
                    : `Drill your ${slipTop.length} weakest squares`}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={startRun}
                className="flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
              >
                Play again
              </button>
              <a
                href={xHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share your score on X"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share
              </a>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function missTallyEntries(tally: Record<string, number>): string[] {
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([sq]) => sq);
}
