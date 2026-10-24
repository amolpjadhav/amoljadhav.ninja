'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import words from '@/data/five-letters.json';
import { MAX_GUESSES, WORD_LEN, dailyWord, keyAction, scoreGuess, type Mark } from '@/lib/games/five-letters';
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

function dealAnswer(mode: string): string {
  if (mode === 'Daily') return dailyWord(ANSWERS, new Date()).word.toUpperCase();
  return (ANSWERS[Math.floor(Math.random() * ANSWERS.length)] as string).toUpperCase();
}

const MARK_BG: Record<Mark, string> = {
  correct: '#2BA39A',
  present: '#E4B43C',
  absent: '#3A3A3C',
};
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

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

  const say = useCallback((message: string) => {
    setToast((t) => ({ message, key: t.key + 1 }));
  }, []);

  const clearToast = useCallback(() => {
    setToast((t) => ({ message: null, key: t.key }));
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

  // Physical keyboard: letters, Enter, Backspace (spec §7).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const action = keyAction(e.key);
      if (!action) return;
      if (action.type === 'enter') submit();
      else if (action.type === 'back') setCurrent((c) => c.slice(0, -1));
      else press(action.letter.toUpperCase());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [submit, press]);

  return (
    <>
      <GameShell
        game={META}
        mode={mode}
        onModeChange={changeMode}
        stats={
          <>
            <StatChip label="Tries" value={`${Math.min(rows.length + 1, MAX_GUESSES)}/${MAX_GUESSES}`} />
            <StatChip label="Mode" value={mode} />
          </>
        }
        menu={<GameMenu gameName={META.name} onHowToPlay={() => setHowTo(true)} onResetStats={resetStats} />}
        board={
          <div className="flex flex-col items-center gap-1.5" aria-label="Guess grid">
            {Array.from({ length: MAX_GUESSES }).map((_, r) => {
              const word = rows[r] ?? (r === rows.length ? current : '');
              const mk = marks[r];
              return (
                <div key={r} className="flex gap-1.5" role="row" aria-label={`Row ${r + 1}`}>
                  {Array.from({ length: WORD_LEN }).map((_, c) => {
                    const ch = word[c] ?? '';
                    const filled = mk?.[c];
                    return (
                      <div
                        key={c}
                        className="flex items-center justify-center games-type-title"
                        style={{
                          width: 'min(17vw, 62px)',
                          height: 'min(17vw, 62px)',
                          borderRadius: 'var(--r-sm)',
                          border: `2px solid ${filled ? MARK_BG[filled] : ch ? 'var(--text-3)' : 'var(--surface-3)'}`,
                          background: filled ? MARK_BG[filled] : 'transparent',
                        }}
                      >
                        {ch}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        }
        dock={
          <ControlDock>
            <DockButton label="Clear guess" onClick={() => setCurrent('')}>
              Clear
            </DockButton>
            <DockButton label="Submit guess" primary onClick={submit} disabled={current.length !== WORD_LEN}>
              Enter
            </DockButton>
            <DockButton label="New game" onClick={() => (rows.length > 0 && !done ? setConfirm(true) : reset())}>
              New game
            </DockButton>
          </ControlDock>
        }
        sidePanel={
          <>
            <div className="games-card p-5">
              <h2 className="games-type-headline">How to play</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Guess the five-letter word in six tries. Green means the letter is correct, yellow means
                it is in the word but misplaced.
              </p>
            </div>
            <div className="games-card p-5">
              <h2 className="games-type-headline">Why it works</h2>
              <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
                Every guess splits the possibilities — good openers eliminate the most words at once.
              </p>
            </div>
          </>
        }
        howToPlay={null}
      />
      {/* On-screen keyboard (required for mobile play). */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-6 flex flex-col gap-1.5" aria-label="Keyboard">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-1.5 justify-center">
            {row === 'ZXCVBNM' && (
              <Key label="Enter" wide onPress={() => press('ENTER')} />
            )}
            {row.split('').map((ch) => (
              <Key key={ch} label={ch} mark={keyState.get(ch)} onPress={() => press(ch)} />
            ))}
            {row === 'ZXCVBNM' && <Key label="⌫" wide onPress={() => press('BACK')} />}
          </div>
        ))}
      </div>
      <HowToPlaySheet
        open={howTo}
        onClose={() => setHowTo(false)}
        gameName={META.name}
        steps={[
          { title: 'Type a five-letter word', body: 'Use the keyboard below the board.' },
          { title: 'Read the colors', body: 'Green is correct, yellow is misplaced, gray is absent.' },
          { title: 'Six tries', body: 'Split the possibilities with every guess.' },
        ]}
        whyItWorks="Every guess is an experiment that rules out hundreds of words at once."
      />
      <ResultSheet
        open={resultOpen}
        game={META}
        next={nextGame(META.slug)}
        outcome={rows[rows.length - 1] === answer ? 'Solved' : 'So close'}
        context={`${META.name} · ${mode === 'Daily' ? ptDayLabel() : mode}`}
        stats={[
          { label: 'tries', value: `${rows.length}/${MAX_GUESSES}` },
          { label: 'word', value: answer },
        ]}
        streak={streak}
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
        title="Start a new game?"
        body="Your current guesses will be lost."
        confirmLabel="New game"
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      />
      <Toast message={toast.message} toastKey={toast.key} onDone={clearToast} />
    </>
  );
}

function Key({
  label,
  mark,
  wide,
  onPress,
}: {
  label: string;
  mark?: Mark;
  wide?: boolean;
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
        background: mark ? MARK_BG[mark] : 'var(--surface-2)',
        color: 'var(--text-1)',
      }}
    >
      {label}
    </button>
  );
}
