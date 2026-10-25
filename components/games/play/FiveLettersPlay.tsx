'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../GameShell';
import IconButton from '../IconButton';
import Sheet from '../Sheet';
import ControlDock from '../ControlDock';
import HowToPlaySheet from '../HowToPlaySheet';
import ResultSheet from '../ResultSheet';
import ConfirmDialog from '../ConfirmDialog';
import Toast from '../Toast';
import GameMenu from '../GameMenu';
import { GAME_BY_SLUG, nextGame } from '../registry';
import words from '@/data/five-letters.json';
import {
  MAX_GUESSES,
  WORD_LEN,
  dailyWord,
  formatCountdown,
  keyAction,
  msUntilPTMidnight,
  sanitizeGuessInput,
  scoreGuess,
  type Mark,
} from '@/lib/games/five-letters';
import {
  fiveLettersShareGrid,
  gameState,
  loadStore,
  playUrl,
  ptDayLabel,
  recordResult,
  saveStore,
  shareText,
} from '@/lib/games/arcade';

const META = GAME_BY_SLUG['five-letters'];
// Full answer + validity lists, shared with the article widget.
const ANSWERS = words.answers as string[];
const ALLOWED = new Set([...(words.answers as string[]), ...(words.allowed as string[])]);
const SAVE_KEY = 'games:v1:five-letters';
const HOWTO_KEY = 'games:v1:howto:five-letters';
const KB_KEY = 'games:v1:five-letters:keyboard';

function dealAnswer(mode: string): string {
  if (mode === 'Daily') return dailyWord(ANSWERS, new Date()).word.toUpperCase();
  return (ANSWERS[Math.floor(Math.random() * ANSWERS.length)] as string).toUpperCase();
}

const CB_KEY = 'games:v1:five-letters:colorblind';

// Hit colors always pair with near-black text (4.5:1+ on every bg);
// misses dim to half-white on charcoal so green/yellow carry the row.
function markPalette(colorBlind: boolean): Record<Mark, { bg: string; fg: string }> {
  return {
    correct: { bg: colorBlind ? '#F5793A' : '#2BA39A', fg: '#1A1A1A' },
    present: { bg: colorBlind ? '#85C0F9' : '#E4B43C', fg: '#1A1A1A' },
    absent: { bg: '#2A2B30', fg: 'rgba(255,255,255,0.55)' },
  };
}
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const TRACKER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type KeyboardMode = 'device' | 'onscreen';

function initialKeyboardMode(): KeyboardMode {
  try {
    const raw = localStorage.getItem(KB_KEY);
    if (raw === 'device' || raw === 'onscreen') return raw;
    if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) return 'device';
  } catch {
    /* default below */
  }
  return 'onscreen';
}

function DailyCountdown({ active }: { active: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (!active) return null;
  return <>Next word in {formatCountdown(msUntilPTMidnight(new Date(now)))}</>;
}

export default function FiveLettersPlay({ initialMode }: { initialMode: string }) {
  // Mount state restores from localStorage via lazy initializers (no
  // setState-in-effect): the component is client-only (ssr:false), so
  // storage reads here never run on the server.
  const [boot] = useState(() => {
    const fresh = dealAnswer(initialMode);
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { rows: string[]; marks: Mark[][]; answer: string; mode: string };
        if (Array.isArray(s.rows)) {
          return {
            rows: s.rows,
            marks: s.marks ?? [],
            answer: s.answer ?? fresh,
            mode: s.mode || initialMode,
          };
        }
      }
    } catch {
      /* fresh start */
    }
    return { rows: [] as string[], marks: [] as Mark[][], answer: fresh, mode: initialMode };
  });
  const [mode, setMode] = useState(boot.mode);
  const [answer, setAnswer] = useState(boot.answer);
  const [rows, setRows] = useState<string[]>(boot.rows);
  const [marks, setMarks] = useState<Mark[][]>(boot.marks);
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState(
    boot.rows.length >= MAX_GUESSES || boot.rows.includes(boot.answer),
  );
  const [kbMode, setKbMode] = useState<KeyboardMode>(initialKeyboardMode);
  const [colorBlind, setColorBlind] = useState(() => {
    try {
      return localStorage.getItem(CB_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [statsOpen, setStatsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [dailyNum] = useState(() => dailyWord(ANSWERS, new Date()).num);
  const [streak, setStreak] = useState<number>(() => gameState(loadStore(), 'five-letters').streak);
  const [toast, setToast] = useState<{ message: string | null; key: number }>({ message: null, key: 0 });
  const [howTo, setHowTo] = useState(() => {
    try {
      return !localStorage.getItem(HOWTO_KEY);
    } catch {
      return false;
    }
  });
  const [confirm, setConfirm] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeRowRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist the first-visit flag; writing storage is the sanctioned effect use.
  useEffect(() => {
    if (!howTo) return;
    try {
      localStorage.setItem(HOWTO_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [howTo]);

  useEffect(() => {
    if (!answer) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ rows, marks, answer, mode }));
    } catch {
      /* storage full — game continues in memory */
    }
  }, [rows, marks, answer, mode]);

  // Keyboard-open layout: track the visual viewport so tiles + tracker fit
  // above the device keyboard (pairs with resizes-content in layout).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const set = () => document.documentElement.style.setProperty('--vvh', `${vv.height}px`);
    set();
    vv.addEventListener('resize', set);
    return () => vv.removeEventListener('resize', set);
  }, []);

  useEffect(
    () => () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    },
    [],
  );

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
  }, []);

  const persistKbMode = useCallback((m: KeyboardMode) => {
    setKbMode(m);
    try {
      localStorage.setItem(KB_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const persistColorBlind = useCallback((v: boolean) => {
    setColorBlind(v);
    try {
      localStorage.setItem(CB_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const keyState = useMemo(() => {
    const m = new Map<string, Mark>();
    const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
    rows.forEach((row, r) => {
      row.split('').forEach((ch, c) => {
        const mk = marks[r]?.[c];
        if (mk && rank[mk] > (m.get(ch) !== undefined ? rank[m.get(ch) as Mark] : -1)) m.set(ch, mk);
      });
    });
    return m;
  }, [rows, marks]);

  const submit = useCallback(() => {
    if (done || current.length !== WORD_LEN) return;
    if (!ALLOWED.has(current.toLowerCase())) {
      say('Not in word list');
      setShaking(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShaking(false), 350);
      try {
        navigator.vibrate?.([20, 40, 20]);
      } catch {
        /* ignore */
      }
      return;
    }
    const m = scoreGuess(current.toLowerCase(), answer.toLowerCase());
    const next = [...rows, current];
    setRows(next);
    setMarks((prev) => [...prev, m]);
    setCurrent('');
    const won = current === answer;
    if (won || next.length >= MAX_GUESSES) {
      setDone(true);
      inputRef.current?.blur();
      const store = loadStore();
      saveStore(recordResult(store, 'five-letters', next.length, won));
      setStreak(gameState(loadStore(), 'five-letters').streak);
      try {
        navigator.vibrate?.(won ? [30, 60, 30, 60, 60] : 10);
      } catch {
        /* ignore */
      }
      setTimeout(() => setResultOpen(true), won ? 1200 : 400);
    }
  }, [current, done, rows, answer, say]);

  const press = useCallback(
    (key: string) => {
      if (done) return;
      if (key === 'ENTER') submit();
      else if (key === 'BACK') setCurrent((c) => c.slice(0, -1));
      else if (/^[A-Z]$/.test(key) && current.length < WORD_LEN) setCurrent((c) => c + key);
    },
    [current, done, submit],
  );

  const deal = useCallback(
    (m: string) => {
      setAnswer(dealAnswer(m));
      setRows([]);
      setMarks([]);
      setCurrent('');
      setDone(false);
      setResultOpen(false);
      setConfirm(false);
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const reset = useCallback(() => deal(mode), [deal, mode]);

  const changeMode = useCallback(
    (m: string) => {
      if (m === mode) return;
      setMode(m);
      deal(m);
    },
    [deal, mode],
  );

  const resetStats = useCallback(() => {
    const store = loadStore();
    const next = { ...store };
    delete next['five-letters'];
    saveStore(next);
    setStreak(0);
    say('Stats reset');
  }, [say]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
    activeRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  const onDeviceInput = useCallback((value: string) => {
    if (done) return;
    setCurrent(sanitizeGuessInput(value));
  }, [done]);

  // Physical keyboard: letters, Enter, Backspace. Skipped when the device
  // input owns focus — the input's own handlers drive state then (no doubles).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === 'INPUT') return;
      const action = keyAction(e.key);
      if (!action) return;
      if (action.type === 'enter') submit();
      else if (action.type === 'back') setCurrent((c) => c.slice(0, -1));
      else press(action.letter.toUpperCase());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [submit, press]);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const trackerRows = useMemo(() => [TRACKER.slice(0, 13), TRACKER.slice(13)], []);
  const ready = current.length === WORD_LEN && !done;
  const deviceMode = kbMode === 'device';
  const pal = useMemo(() => markPalette(colorBlind), [colorBlind]);
  // Stats sheet reads the store fresh on open (and on streak change).
  const statsSnap = useMemo(
    () => gameState(loadStore(), 'five-letters'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statsOpen, streak],
  );
  const guessNum = Math.min(rows.length + 1, MAX_GUESSES);
  const subtitle =
    mode === 'Daily'
      ? `Daily · ${new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short' })} ${ptDayLabel()} · #${dailyNum} · Guess ${guessNum} of ${MAX_GUESSES}`
      : `Practice · Guess ${guessNum} of ${MAX_GUESSES}`;

  const tracker = (
    <div className="flex flex-col gap-1" role="group" aria-label="Used letters">
      {trackerRows.map((row) => (
        <div key={row} className="grid grid-cols-13 gap-1">
          {row.split('').map((ch) => {
            const st = keyState.get(ch);
            const mc = st ? pal[st] : null;
            return (
              <span
                key={ch}
                aria-label={`${ch}, ${st ?? 'unused'}`}
                className="inline-flex items-center justify-center games-type-caption h-8 rounded-[8px]"
                style={
                  mc
                    ? st === 'absent'
                      ? {
                          background: mc.bg,
                          color: mc.fg,
                          textDecoration: 'line-through',
                        }
                      : { background: mc.bg, color: mc.fg }
                    : { background: 'var(--surface-2)', color: 'var(--text-2)' }
                }
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={changeMode}
        narrow
        stats={
          <>
            <span
              role="status"
              aria-label={`Streak ${streak}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-[10px] games-type-headline tabular-nums shrink-0"
              style={{ background: 'var(--surface-2)' }}
            >
              <span aria-hidden>🔥</span> {streak}
            </span>
            <IconButton label="Five Letters stats" onClick={() => setStatsOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="currentColor">
                <rect x="2" y="10" width="3" height="6" rx="1" />
                <rect x="7.5" y="6" width="3" height="10" rx="1" />
                <rect x="13" y="2" width="3" height="14" rx="1" />
              </svg>
            </IconButton>
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
                  aria-pressed={deviceMode}
                  onClick={() => persistKbMode(deviceMode ? 'onscreen' : 'device')}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Keyboard: {deviceMode ? 'Device' : 'On-screen'}
                </button>
                <button
                  type="button"
                  aria-pressed={colorBlind}
                  onClick={() => persistColorBlind(!colorBlind)}
                  className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                >
                  Color-blind mode: {colorBlind ? 'On' : 'Off'}
                </button>
                {mode !== 'Daily' && (
                  <button
                    type="button"
                    onClick={() => (rows.length > 0 && !done ? setConfirm(true) : reset())}
                    className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
                  >
                    New word
                  </button>
                )}
              </>
            }
          />
        }
        board={
          <div className="flex flex-col items-center gap-1.5 pt-6" aria-label="Guess grid" onClick={deviceMode && !done ? focusInput : undefined}>
            <p
              role="status"
              aria-label={subtitle}
              className="games-type-caption mb-1"
              style={{ color: 'var(--text-2)' }}
            >
              {subtitle}
            </p>
            {Array.from({ length: MAX_GUESSES }).map((_, r) => {
              const word = rows[r] ?? (r === rows.length ? current : '');
              const mk = marks[r];
              const active = r === rows.length && !done;
              return (
                <div
                  key={r}
                  ref={active ? activeRowRef : undefined}
                  className={`flex gap-1.5${active && shaking ? ' games-shake' : ''}`}
                  role="row"
                  aria-label={`Row ${r + 1}${active ? ', active' : ''}`}
                >
                  {Array.from({ length: WORD_LEN }).map((_, c) => {
                    const ch = word[c] ?? '';
                    const filled = mk?.[c];
                    const mc = filled ? pal[filled] : null;
                    const cursor = active && c === current.length && current.length < WORD_LEN;
                    return (
                      <div
                        key={c}
                        className="flex items-center justify-center games-type-title"
                        style={{
                          width: 'min(17vw, 62px, max(40px, calc((var(--vvh, 100dvh) - 400px) / 6)))',
                          height: 'min(17vw, 62px, max(40px, calc((var(--vvh, 100dvh) - 400px) / 6)))',
                          borderRadius: 'var(--r-sm)',
                          border: `2px solid ${
                            mc
                              ? mc.bg
                              : cursor
                                ? '#fff'
                                : active
                                  ? 'rgba(255,255,255,.35)'
                                  : 'rgba(255,255,255,.12)'
                          }`,
                          background: mc ? mc.bg : 'transparent',
                          color: mc ? mc.fg : 'var(--text-1)',
                        }}
                      >
                        <span key={ch || 'empty'} className={ch ? 'games-pop inline-block' : undefined}>
                          {ch}
                        </span>
                        {cursor && (
                          <span
                            aria-hidden
                            className="games-caret inline-block"
                            style={{ width: 1, height: '55%', background: '#fff', marginLeft: ch ? 1 : 0 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Reserved 32px message slot: toasts never cover the tiles. */}
            <div className="min-h-8 mt-1 flex items-center justify-center">
              <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} inline />
            </div>
            {deviceMode && !focused && !done && (
              <p
                className="games-type-caption rounded-full px-4 py-1.5"
                style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
              >
                Tap to type
              </p>
            )}
            {deviceMode && (
              <form
                className="mt-1 w-full max-w-[320px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                {/* Device keyboard bridge: 1px, opacity-0 (never display:none),
                    16px type defeats iOS zoom. State flows from input VALUE. */}
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  maxLength={WORD_LEN}
                  aria-label="Type your guess"
                  value={current}
                  onChange={(e) => onDeviceInput(e.target.value)}
                  onInput={(e) => onDeviceInput(e.currentTarget.value)}
                  onCompositionEnd={(e) => onDeviceInput(e.currentTarget.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    opacity: 0,
                    fontSize: 16,
                    pointerEvents: 'none',
                  }}
                />
              </form>
            )}
            {deviceMode && <div className="mt-3 w-full max-w-[420px]">{tracker}</div>}
          </div>
        }
        dock={
          <>
            <ControlDock>
              <button
                type="button"
                aria-label="Delete letter (long-press clears the row)"
                onClick={() => {
                  if (longPressFired.current) return;
                  setCurrent((c) => c.slice(0, -1));
                }}
                onPointerDown={() => {
                  longPressFired.current = false;
                  clearLongPress();
                  longPressTimer.current = setTimeout(() => {
                    longPressFired.current = true;
                    setCurrent('');
                  }, 500);
                }}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                onPointerCancel={clearLongPress}
                className="games-touch games-press games-type-callout rounded-[14px] px-5 inline-flex items-center justify-center gap-2"
                style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
              >
                <span aria-hidden>⌫</span>
              </button>
              <button
                type="button"
                aria-label="Submit guess"
                onClick={submit}
                disabled={!ready}
                className="games-touch games-press games-type-callout rounded-[14px] px-5 inline-flex items-center justify-center gap-2 disabled:opacity-100 flex-1"
                style={
                  ready
                    ? { background: 'var(--game-accent)', color: '#000' }
                    : { background: 'var(--surface-2)', color: 'var(--text-3)' }
                }
              >
                Enter
              </button>
            </ControlDock>
            <p className="games-type-caption text-center mt-3" style={{ color: 'var(--text-3)' }}>
              <button type="button" onClick={() => setHowTo(true)} className="underline underline-offset-2">
                ⓘ How to play
              </button>
              {' · '}
              <button type="button" onClick={() => setHowTo(true)} className="underline underline-offset-2">
                Why it works
              </button>
            </p>
          </>
        }
        sidePanel={<></>}
        howToPlay={null}
        tray={
          /* On-screen keyboard: the alternative; device keyboard uses the tracker above. */
          !deviceMode && (
            <div className="w-full flex flex-col gap-1.5" aria-label="Keyboard">
              {ROWS.map((row) => (
                <div key={row} className="flex gap-1.5 justify-center">
                  {row === 'ZXCVBNM' && (
                    <Key label="Enter" wide colorBlind={colorBlind} onPress={() => press('ENTER')} />
                  )}
                  {row.split('').map((ch) => (
                    <Key key={ch} label={ch} mark={keyState.get(ch)} colorBlind={colorBlind} onPress={() => press(ch)} />
                  ))}
                  {row === 'ZXCVBNM' && <Key label="⌫" wide colorBlind={colorBlind} onPress={() => press('BACK')} />}
                </div>
              ))}
            </div>
          )
        }
      />
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Type a five-letter word', body: 'Tap the board to use your keyboard, or switch to the on-screen one in ⋯.' },
          { title: 'Read the colors', body: 'A hit is placed right, a warn is in the word but misplaced, gray is out — the tracker strip keeps score.' },
          { title: 'Six tries', body: 'Split the possibilities with every guess.' },
        ]}
        examples={[
          {
            label: 'W is placed right · E is in the word',
            tiles: [
              { ch: 'W', ...pal.correct },
              { ch: 'E', ...pal.present },
              { ch: 'A', ...pal.absent },
              { ch: 'R', ...pal.absent },
              { ch: 'Y', ...pal.absent },
            ],
          },
          {
            label: 'Only one L is in the word',
            tiles: [
              { ch: 'P', ...pal.absent },
              { ch: 'I', ...pal.absent },
              { ch: 'L', ...pal.correct },
              { ch: 'L', ...pal.absent },
              { ch: 'S', ...pal.absent },
            ],
          },
        ]}
        whyItWorks="Every guess is an experiment that rules out hundreds of words at once."
      />
      <Sheet open={statsOpen} onClose={() => setStatsOpen(false)} label="Five Letters stats">
        <h2 className="games-type-title mb-4">Statistics</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Played', value: String(statsSnap.history.length) },
            { label: 'Best', value: statsSnap.best === null ? '—' : `${statsSnap.best}/6` },
            { label: 'Streak', value: String(statsSnap.streak) },
            { label: 'Max', value: String(statsSnap.maxStreak) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[14px] px-2 py-3"
              style={{ background: 'var(--surface-2)' }}
            >
              <p className="games-type-title tabular-nums">{s.value}</p>
              <p className="games-type-micro" style={{ color: 'var(--text-3)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStatsOpen(false)}
          className="games-touch games-press games-type-callout w-full mt-5 rounded-[14px] px-5"
          style={{ background: 'var(--game-accent)', color: '#000' }}
        >
          Play
        </button>
      </Sheet>
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={rows[rows.length - 1] === answer ? 'Solved' : 'So close'}
        context={`${META.name} · ${mode === 'Daily' ? `${ptDayLabel()} · #${dailyNum}` : mode}`}
        stats={[
          { label: 'tries', value: `${rows.length}/${MAX_GUESSES}` },
          { label: 'word', value: answer },
        ]}
        streak={streak}
        note={mode === 'Daily' ? <DailyCountdown active={resultOpen} /> : undefined}
        onShare={() => {
          const day = mode === 'Daily' ? ptDayLabel() : mode;
          const grid = fiveLettersShareGrid(marks);
          const text = `Five Letters ${rows.length}/${MAX_GUESSES} · ${day}\n${grid}\n${playUrl('five-letters')}`;
          void shareText(text, say);
        }}
        onPlayAgain={reset}
        onClose={() => setResultOpen(false)}
      />
      <ConfirmDialog
        open={confirm}
        title={mode === 'Daily' ? 'Start a new game?' : 'New word?'}
        body="Your current guesses will be lost."
        confirmLabel={mode === 'Daily' ? 'New game' : 'New word'}
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

function Key({
  label,
  mark,
  wide,
  colorBlind,
  onPress,
}: {
  label: string;
  mark?: Mark;
  wide?: boolean;
  colorBlind: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label === '⌫' ? 'Backspace' : label}
      onClick={onPress}
      className="games-press games-type-callout rounded-[10px] h-11 inline-flex items-center justify-center"
      style={{
        minWidth: wide ? 64 : 0,
        flex: wide ? '1.5' : '1',
        maxWidth: 56,
        background: mark ? markPalette(colorBlind)[mark].bg : 'var(--surface-2)',
        color: mark ? markPalette(colorBlind)[mark].fg : 'var(--text-1)',
      }}
    >
      {label}
    </button>
  );
}
