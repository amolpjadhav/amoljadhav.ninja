'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BIRTHDAY_DAYS, dayLabel, matchChance, median, monthLengths, monthNames, pairCount } from '@/lib/birthday';

interface Kid {
  name: string;
  day: number;
}

const NAMES = [
  'Maya', 'Theo', 'Ava', 'Liam', 'Zoe', 'Kai', 'Nora', 'Ezra', 'Luna', 'Milo',
  'Ivy', 'Owen', 'Ruby', 'Felix', 'Clara', 'Hugo', 'Elif', 'Ravi', 'Sofia', 'Mateo',
  'Anya', 'Kenji', 'Priya', 'Omar', 'Lena', 'Diego', 'Freya', 'Arjun', 'Nina', 'Leo',
  'Tara', 'Yuki', 'Elena', 'Sam', 'Noor', 'Pablo', 'Wren', 'Kofi', 'Alba', 'Rex',
  'Mira', 'Otto', 'Sana', 'Finn', 'Dora', 'Emil', 'Aisha', 'Marco', 'Liv', 'Nico',
  'Opal', 'Ren', 'Suki', 'Tomas', 'Uma', 'Vera', 'Will', 'Xena', 'Yara', 'Zane',
];

const GUESSES = [10, 25, 50, 100, 180];
const SPEEDS = [
  { label: 'Slow', ms: 600 },
  { label: 'Normal', ms: 250 },
  { label: 'Fast', ms: 80 },
];

const ACCENT = '#6366f1';

function kidName(index: number): string {
  if (index < NAMES.length) return NAMES[index];
  return `Kid ${index + 1}`;
}

export default function BirthdayClassroom({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [guess, setGuess] = useState<number | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [running, setRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(SPEEDS[1].ms);
  const [rounds, setRounds] = useState<number[]>([]);
  const recordedRef = useRef(false);

  const byDay = useMemo(() => {
    const map = new Map<number, Kid[]>();
    for (const kid of kids) {
      const list = map.get(kid.day) ?? [];
      list.push(kid);
      map.set(kid.day, list);
    }
    return map;
  }, [kids]);

  let match: { day: number; a: string; b: string } | null = null;
  for (const [day, list] of byDay) {
    if (list.length >= 2) {
      match = { day, a: list[0].name, b: list[1].name };
      break;
    }
  }

  // Record the round (once) and stop as soon as a match appears.
  useEffect(() => {
    if (match && !recordedRef.current) {
      recordedRef.current = true;
      setRunning(false);
      setRounds((r) => [...r, kids.length]);
    }
  }, [match, kids.length]);

  useEffect(() => {
    if (!running || match) return;
    const id = setInterval(() => {
      setKids((prev) => {
        if (prev.length >= BIRTHDAY_DAYS) return prev;
        return [...prev, { name: kidName(prev.length), day: Math.floor(Math.random() * BIRTHDAY_DAYS) }];
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [running, match, speedMs]);

  const addKid = () => {
    if (match || kids.length >= BIRTHDAY_DAYS) return;
    setKids((prev) => [...prev, { name: kidName(prev.length), day: Math.floor(Math.random() * BIRTHDAY_DAYS) }]);
  };

  const newClass = () => {
    recordedRef.current = false;
    setRunning(false);
    setKids([]);
  };

  const n = kids.length;
  const chance = matchChance(n);
  const inTen = Math.round(chance * 10);
  const newestDay = n > 0 ? kids[n - 1].day : -1;
  const middle = rounds.length >= 3 ? median(rounds) : null;

  const guessLine = (() => {
    if (!match) return null;
    if (guess === null) return 'Make a guess next round to compare!';
    const diff = guess - n;
    if (Math.abs(diff) <= 2) return `Your guess of ${guess} was almost exactly right!`;
    if (diff > 0) return `You guessed ${guess} — it took fewer than you thought.`;
    return `You guessed ${guess} — it took more than you thought this time.`;
  })();

  const months = monthNames();
  const lengths = monthLengths();
  let dayCursor = 0;
  const columns = months.map((name, m) => {
    const cells = [];
    for (let d = 0; d < 31; d++) {
      if (d < lengths[m]) {
        const day = dayCursor++;
        const list = byDay.get(day) ?? [];
        const isMatch = match !== null && day === match.day;
        const isNewest = day === newestDay;
        cells.push(
          <div
            key={day}
            title={list.length > 0 ? `${dayLabel(day)}: ${list.map((k) => k.name).join(', ')}` : dayLabel(day)}
            className={`rounded-[3px] ${isMatch ? 'motion-safe:animate-pulse' : ''}`}
            style={{
              width: 13,
              height: 13,
              background:
                list.length === 0 ? 'rgba(255,255,255,0.07)' : isMatch ? '#3b82f6' : `${ACCENT}b3`,
              outline: isNewest ? '2px solid #fff' : 'none',
              outlineOffset: 1,
            }}
          />,
        );
      } else {
        cells.push(<div key={`pad-${m}-${d}`} style={{ width: 13, height: 13 }} />);
      }
    }
    return (
      <div key={name} className="flex flex-col items-center gap-[3px]">
        <div className="flex flex-col gap-[3px]">{cells}</div>
        <p className="text-[9px] text-white/35 mt-1">{name.slice(0, 3)}</p>
      </div>
    );
  });

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || 'Fill a classroom'}</p>
      {(caption || 'Guess first, then add kids one at a time — or let it run — until two birthdays collide. Watch the handshakes outrun the kids.') && (
        <p className="text-white/70 text-sm mb-4">{caption || 'Guess first, then add kids one at a time — or let it run — until two birthdays collide. Watch the handshakes outrun the kids.'}</p>
      )}

      <div className="mb-4">
        <p className="text-xs text-white/60 mb-2">First, guess: how many kids until two share a birthday?</p>
        <div className="flex flex-wrap gap-2">
          {GUESSES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGuess(g)}
              className="text-sm px-3 py-1.5 rounded-full border transition-colors"
              style={
                guess === g
                  ? { color: '#fff', borderColor: ACCENT, background: `${ACCENT}33` }
                  : { color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)' }
              }
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-black/30 rounded-lg py-2">
          <p className="text-lg font-bold text-white/90">{n}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">kids</p>
        </div>
        <div className="bg-black/30 rounded-lg py-2">
          <p className="text-lg font-bold text-white/90">{pairCount(n).toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">handshakes</p>
        </div>
        <div className="bg-black/30 rounded-lg py-2">
          <p className="text-lg font-bold text-white/90">{n < 2 ? 'No pairs yet' : `~${inTen} in 10`}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/40">
            {n < 2 ? 'add a couple of kids' : `chance · ${(chance * 100).toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3 mb-4 overflow-x-auto">
        <div className="flex gap-2 justify-between min-w-[430px]">{columns}</div>
      </div>

      {match && (
        <div className="rounded-lg px-4 py-3 mb-4" style={{ background: '#3b82f622', border: '1px solid #3b82f655' }} aria-live="polite">
          <p className="text-sm font-bold text-white/95">
            Match! {match.a} and {match.b} were both born on {dayLabel(match.day)}. It took {n} kids.
          </p>
          <p className="text-xs text-white/60 mt-1">{guessLine}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={addKid}
          disabled={match !== null}
          className="text-sm px-4 py-2 rounded-full font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Add a kid
        </button>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={match !== null}
          className="text-sm px-4 py-2 rounded-full border text-white/80 transition-opacity disabled:opacity-40"
          style={{ borderColor: 'rgba(255,255,255,0.2)' }}
        >
          {running ? 'Stop' : 'Keep adding until a match'}
        </button>
        <button
          type="button"
          onClick={newClass}
          className="text-sm px-4 py-2 rounded-full border text-white/60"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          New class
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[11px] text-white/40 mr-1">Speed</span>
          {SPEEDS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeedMs(s.ms)}
              className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
              style={
                speedMs === s.ms
                  ? { color: '#fff', borderColor: ACCENT, background: `${ACCENT}33` }
                  : { color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.15)' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {rounds.length > 0 && (
        <p className="text-xs text-white/50">
          Past rounds: {rounds.map((r) => `${r} kids`).join(' · ')}
          {middle !== null && (
            <span className="text-white/80 font-semibold">
              {' '}— middle result: {middle} kids. Most classrooms are about that big!
            </span>
          )}
        </p>
      )}
    </div>
  );
}
