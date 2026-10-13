'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import words from '@/data/five-letters.json';
import { MAX_GUESSES, WORD_LEN, dailyWord, keyAction, revealedAnswer, scoreGuess, type Mark } from '@/lib/games/five-letters';
import {
  EMPTY_FL_STATS,
  FIVE_LETTERS_KEY,
  readJSON,
  writeJSON,
  type FiveLettersStats,
} from '@/lib/games/records';
import { buildXUrl, encodeMarks } from '@/lib/games/share';
import HowToPlay from './HowToPlay';
import XShare from './XShare';

// Five Letters: guess the 5-letter word in 6 tries. Daily word (same for
// everyone, seeded by date) plus practice mode and an optional hard mode
// that enforces revealed hints. Own palette — teal for right spot, amber
// for wrong spot (plus a corner dot, so color is never the only signal).

const ANSWERS = words.answers as string[];
const ALLOWED = new Set(words.allowed as string[]);
const DAY_SAVE_KEY = 'five-letters:day:v1';
const AMBER = '#E0A33A';

interface Guess {
  word: string;
  marks: Mark[];
}

interface DaySave {
  key: string;
  guesses: Guess[];
  status: 'playing' | 'won' | 'lost';
}

// Module scope (not component scope): the purity lint forbids impure calls
// inside the component, so the clock and randomness enter through here.
function dealDaily(): { word: string; num: number; key: string } {
  return dailyWord(ANSWERS, new Date());
}

function drawPractice(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)] as string;
}

// Lazy state initializer: today's deal plus any restored in-progress
// board. Window access is guarded for the server render.
function loadDaily(): { answer: { word: string; num: number; key: string }; guesses: Guess[]; status: 'playing' | 'won' | 'lost' } {
  const dealt = dealDaily();
  const save = readJSON<DaySave | null>(DAY_SAVE_KEY, null);
  if (save && save.key === dealt.key && Array.isArray(save.guesses)) {
    return { answer: dealt, guesses: save.guesses, status: save.status };
  }
  return { answer: dealt, guesses: [], status: 'playing' };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The day key is already a Pacific date (YYYY-MM-DD): render "Oct 13".
function shortDate(key: string): string {
  const parts = key.split('-').map(Number);
  const m = MONTHS[(parts[1] ?? 1) - 1] ?? '';
  return `${m} ${parts[2] ?? ''}`;
}

const TILE: Record<Mark | 'empty' | 'edit', string> = {
  correct: 'bg-teal-600 border-teal-600 text-white shadow-[0_2px_10px_rgba(0,0,0,0.4)]',
  present: 'bg-[#E0A33A] border-[#E0A33A] text-black shadow-[0_2px_10px_rgba(0,0,0,0.4)]',
  absent: 'bg-[#2b3136] border-[#2b3136] text-white/60',
  empty: 'bg-white/[0.02] border-white/15 text-white',
  edit: 'bg-white/[0.04] border-white/45 text-white',
};

const MARK_LABEL: Record<Mark, string> = {
  correct: 'correct',
  present: 'wrong spot',
  absent: 'not in word',
};

const KEY_RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };

function rankKeys(guesses: Guess[]): Record<string, Mark> {
  const out: Record<string, Mark> = {};
  for (const g of guesses) {
    g.word.split('').forEach((ch, i) => {
      const m = g.marks[i] as Mark;
      if (KEY_RANK[m] > (KEY_RANK[out[ch] as Mark] ?? -1)) out[ch] = m;
    });
  }
  return out;
}

// Hard mode: greens must stay put, yellows must appear somewhere.
function hardModeError(guess: string, guesses: Guess[]): string | null {
  for (const g of guesses) {
    for (let i = 0; i < WORD_LEN; i += 1) {
      const m = g.marks[i];
      const ch = g.word[i] as string;
      if (m === 'correct' && guess[i] !== ch) return `Hard mode: slot ${i + 1} must be ${ch.toUpperCase()}.`;
    }
    for (let i = 0; i < WORD_LEN; i += 1) {
      if (g.marks[i] === 'present' && !guess.includes(g.word[i] as string)) {
        return `Hard mode: guess must contain ${(g.word[i] as string).toUpperCase()}.`;
      }
    }
  }
  return null;
}

const EMOJI: Record<Mark, string> = { correct: '🟩', present: '🟨', absent: '⬛' };

// Segmented-control button — same tokens as the chess notation trainer.
function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
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

// Bordered switch row — same tokens as the chess notation trainer.
function SwitchRow({
  label,
  on,
  onToggle,
  hint,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
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
          on ? 'bg-teal-600' : 'bg-white/15'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

export default function FiveLetters() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [initial] = useState(loadDaily);
  const [todayKey] = useState(initial.answer.key);
  const [answer, setAnswer] = useState(initial.answer);
  const [guesses, setGuesses] = useState<Guess[]>(initial.guesses);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>(initial.status);
  const [message, setMessage] = useState<string | null>(null);
  const [hard, setHard] = useState(false);
  const [stats, setStats] = useState<FiveLettersStats>(() => readJSON(FIVE_LETTERS_KEY, EMPTY_FL_STATS));
  const [copied, setCopied] = useState(false);
  const [reveal, setReveal] = useState<{ row: number; id: number } | null>(null);
  const [shake, setShake] = useState<{ row: number; id: number } | null>(null);
  const msgTimer = useRef<number | null>(null);
  const animId = useRef(0);

  const flash = useCallback((text: string) => {
    setMessage(text);
    if (msgTimer.current !== null) window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (msgTimer.current !== null) window.clearTimeout(msgTimer.current);
    };
  }, []);

  const startPractice = useCallback(() => {
    setMode('practice');
    setAnswer({ word: drawPractice(), num: 0, key: 'practice' });
    setGuesses([]);
    setCurrent('');
    setStatus('playing');
    setReveal(null);
    setShake(null);
  }, []);

  const startDaily = useCallback(() => {
    const dealt = dealDaily();
    setMode('daily');
    setAnswer(dealt);
    const save = readJSON<DaySave | null>(DAY_SAVE_KEY, null);
    if (save && save.key === dealt.key && Array.isArray(save.guesses)) {
      setGuesses(save.guesses);
      setStatus(save.status);
    } else {
      setGuesses([]);
      setStatus('playing');
    }
    setCurrent('');
    setReveal(null);
    setShake(null);
  }, []);

  const finish = useCallback((won: boolean, count: number) => {
    setStats((s) => {
      const next: FiveLettersStats = {
        played: s.played + 1,
        won: s.won + (won ? 1 : 0),
        streak: won ? s.streak + 1 : 0,
        best: won ? (s.best === null ? count : Math.min(s.best, count)) : s.best,
      };
      writeJSON(FIVE_LETTERS_KEY, next);
      return next;
    });
  }, []);

  const reject = useCallback(
    (text: string) => {
      flash(text);
      animId.current += 1;
      setShake({ row: guesses.length, id: animId.current });
      window.setTimeout(() => setShake(null), 350);
    },
    [flash, guesses.length],
  );

  const submit = useCallback(() => {
    if (status !== 'playing') return;
    const guess = current.toLowerCase();
    if (guess.length !== WORD_LEN) {
      flash('Not enough letters.');
      return;
    }
    if (!ALLOWED.has(guess)) {
      reject('Not in the word list.');
      return;
    }
    if (hard) {
      const err = hardModeError(guess, guesses);
      if (err) {
        reject(err);
        return;
      }
    }
    const marks = scoreGuess(guess, answer.word);
    const next = [...guesses, { word: guess, marks }];
    setGuesses(next);
    setCurrent('');
    animId.current += 1;
    setReveal({ row: next.length - 1, id: animId.current });
    const won = guess === answer.word;
    const lost = !won && next.length >= MAX_GUESSES;
    const endStatus = won ? 'won' : lost ? 'lost' : 'playing';
    setStatus(endStatus);
    if (mode === 'daily') writeJSON(DAY_SAVE_KEY, { key: answer.key, guesses: next, status: endStatus });
    if (won) {
      finish(true, next.length);
      flash(['Brilliant!', 'Sharp!', 'Got it!', 'Nicely solved!'][Math.min(next.length - 1, 3)] as string);
    } else if (lost) {
      finish(false, next.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish stable; guesses/current drive resubscribe
  }, [answer, current, guesses, hard, mode, reject, status]);

  const press = useCallback(
    (key: string) => {
      if (status !== 'playing') return;
      if (key === 'enter') {
        submit();
        return;
      }
      if (key === 'back') {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[a-z]$/.test(key) && current.length < WORD_LEN) setCurrent((c) => c + key);
    },
    [current, status, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const action = keyAction(e.key);
      if (!action) return;
      press(action.type === 'letter' ? action.letter : action.type);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const share = useCallback(async () => {
    if (status === 'playing') return;
    const head =
      mode === 'daily'
        ? `Five Letters #${answer.num} ${status === 'won' ? guesses.length : 'X'}/${MAX_GUESSES}`
        : `Five Letters (practice) ${status === 'won' ? guesses.length : 'X'}/${MAX_GUESSES}`;
    const grid = guesses.map((g) => g.marks.map((m) => EMOJI[m]).join('')).join('\n');
    const text = `${head}\n${grid}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dismissed share sheet: stay quiet.
    }
  }, [answer, guesses, mode, status]);

  const keys = rankKeys(guesses);
  const rows: (Guess | null)[] = [...guesses];
  while (rows.length < MAX_GUESSES) rows.push(null);
  const activeRow = status === 'playing' ? guesses.length : -1;

  const legend: { swatch: string; label: string; amber?: boolean }[] = [
    { swatch: 'bg-teal-600', label: 'Right spot' },
    { swatch: '', label: 'Wrong spot', amber: true },
    { swatch: 'bg-[#2b3136]', label: 'Not in word' },
  ];

  return (
    <div className="relative not-prose -mx-4 my-6 rounded-none border-y border-white/10 bg-[#1c1d20] px-4 pb-5 pt-2 font-sans shadow-[0_0_60px_rgba(10,238,60,0.07)] [-webkit-tap-highlight-color:transparent] [container:widget/inline-size] sm:mx-0 sm:rounded-xl sm:border sm:px-6 sm:pb-6 sm:pt-3 lg:-mx-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div
          className="rounded-md bg-black/60 px-3 py-1.5 font-mono text-2xl font-bold tabular-nums leading-none text-[#f3ecd9] shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]"
          aria-label={status === 'playing' ? `${MAX_GUESSES - guesses.length} guesses left` : status}
        >
          {status === 'playing' ? MAX_GUESSES - guesses.length : guesses.length}
          <span className="ml-1.5 align-middle font-sans text-[10px] font-bold uppercase tracking-widest text-white/40">
            {status === 'playing' ? 'left' : 'tries'}
          </span>
        </div>
        {stats.played > 0 ? (
          <dl className="flex gap-4 text-right sm:gap-6">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-white/40">Won</dt>
              <dd className="font-mono text-lg font-bold tabular-nums text-[#f3ecd9]">
                {stats.won}/{stats.played}
              </dd>
            </div>
            {stats.best !== null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">Best</dt>
                <dd className="font-mono text-lg font-bold tabular-nums text-amber-300">{stats.best}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>

      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#f3ecd9] transition-[width] duration-300"
          style={{ width: `${(guesses.length / MAX_GUESSES) * 100}%` }}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
            <div className="grid grid-cols-[auto_auto] rounded-xl bg-black/30 p-1" role="tablist" aria-label="Game mode">
              {(['daily', 'practice'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={m === 'daily' ? startDaily : startPractice}
                  className={`rounded-lg px-2 py-1.5 text-[13px] font-bold capitalize transition-all duration-150 active:scale-[0.97] ${
                    mode === m
                      ? 'bg-[#f3ecd9] text-black shadow-[0_2px_10px_rgba(0,0,0,0.45),0_0_12px_rgba(243,236,217,0.25)]'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {m === 'daily' ? `Daily · ${shortDate(todayKey)}` : 'Practice'}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hard}
              aria-label="Hard mode: guesses must honor revealed hints"
              onClick={() => setHard((h) => !h)}
              className="flex shrink-0 items-center gap-2"
            >
              <span className="text-[13px] font-bold text-white/60">Hard</span>
              <span
                className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-150 active:scale-95 motion-safe:transition-colors ${hard ? 'bg-teal-600' : 'bg-white/15'}`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow motion-safe:transition-all ${hard ? 'left-[22px]' : 'left-0.5'}`}
                />
              </span>
            </button>
          </div>

          <div className="mb-1 flex items-center justify-center gap-3 text-[11px] font-medium text-white/55 lg:hidden" aria-label="Color legend">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span
                  className={`relative inline-block h-3.5 w-3.5 rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${l.swatch}`}
                  style={l.amber ? { background: AMBER } : undefined}
                  aria-hidden
                >
                  {l.amber ? <span className="absolute right-[2px] top-[2px] h-1 w-1 rounded-full bg-black/60" /> : null}
                </span>
                {l.label}
              </span>
            ))}
          </div>

          <div aria-live="polite" className="flex h-6 items-center justify-center text-center text-sm font-bold text-[#f3ecd9] lg:h-7 lg:text-base">
            {message ?? ''}
          </div>

          <div className="mx-auto w-full max-w-[340px] rounded-xl border border-white/10 bg-black/30 p-2 shadow-[0_0_18px_rgba(10,238,60,0.12),0_0_60px_rgba(10,238,60,0.05)] sm:max-w-[430px] sm:p-2.5 lg:max-w-[540px]">
        <div
          className="grid w-full grid-cols-5 gap-1.5 sm:gap-2"
          role="group"
          aria-label="Guesses"
          suppressHydrationWarning
        >
          {rows.map((g, r) => {
            const letters = g
              ? g.word.split('')
              : r === activeRow
                ? current.padEnd(WORD_LEN, ' ').split('')
                : Array(WORD_LEN).fill(' ');
            return letters.map((ch: string, c: number) => {
              const mark = g ? (g.marks[c] as Mark) : null;
              const isLastTyped = !g && r === activeRow && current.length > 0 && c === current.length - 1;
              const isFlip = reveal !== null && reveal.row === r;
              const isShake = shake !== null && shake.row === r;
              return (
                <div
                  key={shake !== null && shake.row === r ? `${r}-${c}-s${shake.id}` : `${r}-${c}`}
                  role={mark ? 'img' : undefined}
                  aria-label={mark ? `${ch.toUpperCase()}, ${MARK_LABEL[mark]}` : undefined}
                  style={isFlip ? { animationDelay: `${c * 100}ms` } : undefined}
                  className={`relative flex aspect-square w-full items-center justify-center rounded-md border-2 font-mono text-[30px] font-bold uppercase sm:text-[36px] lg:text-[44px] ${
                    mark ? TILE[mark] : ch === ' ' ? TILE.empty : TILE.edit
                  }${isLastTyped ? ' animate-tile-pop' : ''}${isFlip ? ' animate-tile-flip' : ''}${isShake ? ' animate-row-shake' : ''}`}
                >
                  {ch === ' ' ? '' : ch}
                  {mark === 'present' ? (
                    <span aria-hidden className="absolute right-1 top-1 h-1 w-1 rounded-full bg-black/60" />
                  ) : null}
                </div>
              );
            });
          })}
          </div>
          </div>

      {status !== 'playing' ? (
        <div className="mx-auto mt-4 flex w-full max-w-[540px] flex-wrap gap-2">
          {revealedAnswer(status, answer.word) ? (
            <p aria-live="polite" className="w-full rounded-xl bg-[#f3ecd9] px-4 py-4 text-center text-black shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-black/60">The word was</span>
              <span className="mt-1 block font-mono text-3xl font-black uppercase leading-none tracking-[0.25em] lg:text-4xl">
                {revealedAnswer(status, answer.word)}
              </span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={share}
            className="flex-1 touch-manipulation select-none rounded-xl bg-[#f3ecd9] px-4 py-3 text-[15px] font-bold text-black transition-all duration-150 hover:brightness-105 active:scale-[0.97]"
          >
            {copied ? 'Copied ✓' : 'Share'}
          </button>
          <XShare
            className="flex-1"
            href={buildXUrl({
              game: 'five-letters',
              big: status === 'won' ? `${guesses.length}/6` : 'X/6',
              line: status === 'won' ? 'guesses to find the word' : 'the word got away',
              text:
                mode === 'daily'
                  ? `Five Letters #${answer.num} ${status === 'won' ? `${guesses.length}/6` : 'X/6'} — can you beat it?`
                  : `Five Letters (practice) ${status === 'won' ? `${guesses.length}/6` : 'X/6'} — can you beat it?`,
              stats: [
                ['Streak', String(stats.streak)],
                ...(stats.best !== null ? ([['Best', String(stats.best)]] as [string, string][]) : []),
                ['Won', `${stats.won}/${stats.played}`],
              ],
              grid: encodeMarks(guesses.map((g) => g.marks)),
            })}
          />
          <button
            type="button"
            onClick={startPractice}
            className="flex-1 touch-manipulation select-none rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
          >
            Practice word
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-4 hidden w-full max-w-[540px] flex-col items-center gap-1.5 [@media(pointer:coarse)]:flex lg:max-w-[620px] lg:gap-2">
          {['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((rowKeys, i) => (
            <div key={rowKeys} className="flex w-full gap-1.5 lg:gap-2">
              {i === 2 && (
                <button
                  type="button"
                  onClick={() => press('enter')}
                  aria-label="Submit guess"
                  className="flex h-[52px] flex-[1.5] touch-manipulation select-none items-center justify-center rounded-lg bg-white/[0.08] font-sans text-xs font-bold text-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-[filter,transform] duration-75 hover:brightness-[1.15] active:translate-y-px active:brightness-90 lg:h-16 lg:text-[13px]"
                >
                  ENTER
                </button>
              )}
              {rowKeys.split('').map((k) => {
                const st = keys[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => press(k)}
                    aria-label={`Letter ${k.toUpperCase()}${st ? `, ${MARK_LABEL[st]}` : ''}`}
                    className={`flex h-[52px] min-w-0 flex-1 touch-manipulation select-none items-center justify-center rounded-lg font-sans text-[15px] font-bold uppercase shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-[filter,transform] duration-75 hover:brightness-[1.12] active:translate-y-px active:brightness-90 lg:h-16 lg:text-[17px] ${
                      st === 'correct'
                        ? 'bg-teal-600 text-white'
                        : st === 'present'
                          ? 'text-black'
                          : st === 'absent'
                            ? 'bg-[#23282d] text-white/40 shadow-none hover:brightness-100 active:translate-y-0'
                            : 'bg-white/[0.08] text-white/85'
                    }`}
                    style={st === 'present' ? { background: AMBER } : undefined}
                  >
                    {k}
                  </button>
                );
              })}
              {i === 2 && (
                <button
                  type="button"
                  onClick={() => press('back')}
                  aria-label="Delete letter"
                  className="flex h-[52px] flex-[1.5] touch-manipulation select-none items-center justify-center rounded-lg bg-white/[0.08] font-sans text-base font-bold text-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-[filter,transform] duration-75 hover:brightness-[1.15] active:translate-y-px active:brightness-90 lg:h-16"
                >
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>
      )}
          <HowToPlay
            rows={[
              ['Type a guess', 'Type or tap letters to build a five-letter word, then press Enter.'],
              ['Daily / Practice', 'Daily is the same word for everyone; Practice deals endless words.'],
              ['Hard mode', 'Guesses must reuse what you have already learned.'],
            ]}
          />
        </div>

        <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">Mode</h4>
            <div className="grid grid-cols-2 rounded-xl bg-black/30 p-1" role="group" aria-label="Game mode">
              <SegBtn active={mode === 'daily'} onClick={startDaily}>
                Daily · {shortDate(todayKey)}
              </SegBtn>
              <SegBtn active={mode === 'practice'} onClick={startPractice}>
                Practice
              </SegBtn>
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <SwitchRow
              label="Hard mode"
              on={hard}
              onToggle={() => setHard((h) => !h)}
              hint="Guesses must honor revealed hints: greens stay put, yellows must appear"
            />
          </section>
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">Legend</h4>
            <div className="flex flex-col gap-2">
              {legend.map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#24262b] px-4 py-3"
                >
                  <span
                    className={`relative inline-block h-8 w-8 shrink-0 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${l.swatch}`}
                    style={l.amber ? { background: AMBER } : undefined}
                    aria-hidden
                  >
                    {l.amber ? <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-black/60" /> : null}
                  </span>
                  <span className="text-[15px] font-medium text-white/85">{l.label}</span>
                </div>
              ))}
            </div>
          </section>
          <button
            type="button"
            onClick={startPractice}
            className="flex touch-manipulation select-none items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Practice word
          </button>
        </aside>
      </div>
    </div>
  );
}
