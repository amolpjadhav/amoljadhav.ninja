'use client';

import { useCallback, useEffect, useState } from 'react';
import { COMPS, unitPosition, POSITION_META, POSITION_ORDER, type Comp, type Position } from './tftCompData';

// Recall practice for the comp sheet. Recognising a board you are looking at
// is easy; producing one from memory is the thing that actually transfers to
// a game, so this asks you to build the board rather than pick it.
//
// The pool is deliberately NOT the full 66-champion roster. Finding a name in
// a list of 66 tests scrolling, not knowledge, and it does not fit on a phone.
// Instead each round offers the correct units plus decoys drawn from comps
// that share a trait — so the wrong answers are the ones you could plausibly
// confuse, and getting it right means you actually know this board.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const GREEN = '#4ade80';
const RED = '#ff4655';
const AMBER = '#fbbf24';
const CARRY = '#ffc857';

const DECOY_COUNT = 8;

// Placeholders like "5-cost AP flex" and the Elderwood plants are not units
// you buy, so they are never part of an answer.
function boardAnswer(comp: Comp): string[] {
  return comp.final.filter((u) => {
    const p = unitPosition(u);
    return p !== 'flex' && p !== 'plant';
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  comp: Comp;
  answer: string[];
  pool: string[];
}

function makeRound(avoid?: string): Round {
  const candidates = COMPS.filter((c) => c.name !== avoid && boardAnswer(c).length >= 5);
  const comp = candidates[Math.floor(Math.random() * candidates.length)];
  const answer = boardAnswer(comp);
  const answerSet = new Set(answer);

  // Decoys come first from comps that overlap this one, then from anywhere.
  const related = COMPS.filter(
    (c) => c.name !== comp.name && boardAnswer(c).some((u) => answerSet.has(u))
  );
  const nearby = shuffle(
    Array.from(new Set(related.flatMap(boardAnswer).filter((u) => !answerSet.has(u))))
  );
  const anywhere = shuffle(
    Array.from(new Set(COMPS.flatMap(boardAnswer).filter((u) => !answerSet.has(u))))
  );

  const decoys: string[] = [];
  for (const u of [...nearby, ...anywhere]) {
    if (decoys.length >= DECOY_COUNT) break;
    if (!decoys.includes(u)) decoys.push(u);
  }

  return { comp, answer, pool: shuffle([...answer, ...decoys]) };
}

export default function TftDrill({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [round, setRound] = useState<Round | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  // Randomised after mount so the server and client markup agree.
  useEffect(() => setRound(makeRound()), []);

  const next = useCallback(() => {
    setRound((r) => makeRound(r?.comp.name));
    setPicked([]);
    setChecked(false);
  }, []);

  if (!round) {
    return (
      <div className="not-prose font-sans rounded-xl p-6 my-6 border border-white/12 bg-[#17181b]">
        <div className="text-white/40 text-sm">Loading drill…</div>
      </div>
    );
  }

  const { comp, answer, pool } = round;
  const answerSet = new Set(answer);
  const correct = picked.filter((u) => answerSet.has(u));
  const wrong = picked.filter((u) => !answerSet.has(u));
  const missed = answer.filter((u) => !picked.includes(u));
  const perfect = checked && wrong.length === 0 && missed.length === 0;

  const toggle = (u: string) => {
    if (checked) return;
    setPicked((p) => (p.includes(u) ? p.filter((x) => x !== u) : [...p, u]));
  };

  const check = () => {
    setChecked(true);
    const ok = picked.filter((u) => answerSet.has(u)).length === answer.length && picked.length === answer.length;
    setStreak((s) => {
      const nextStreak = ok ? s + 1 : 0;
      setBest((b) => Math.max(b, nextStreak));
      return nextStreak;
    });
  };

  const chipStyle = (u: string) => {
    if (!checked) {
      const on = picked.includes(u);
      return {
        background: on ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        borderColor: on ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
        color: on ? '#fff' : 'rgba(255,255,255,0.7)',
      };
    }
    const inAnswer = answerSet.has(u);
    const wasPicked = picked.includes(u);
    if (wasPicked && inAnswer) return { background: `${GREEN}1f`, borderColor: `${GREEN}77`, color: GREEN };
    if (wasPicked && !inAnswer) return { background: `${RED}1f`, borderColor: `${RED}77`, color: RED };
    if (!wasPicked && inAnswer) return { background: `${AMBER}1f`, borderColor: `${AMBER}77`, color: AMBER };
    return { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' };
  };

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: GREEN }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-white/35">Build this board</div>
          <div className="text-[16px] font-bold text-white leading-tight">{comp.name}</div>
          <div className="text-[12px] mt-0.5" style={{ color: CARRY }}>
            ★ Carry: {comp.carry}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-white/35">Streak</div>
          <div className="text-[20px] font-black" style={{ color: streak > 0 ? GREEN : 'rgba(255,255,255,0.3)' }}>
            {streak}
          </div>
          {best > 0 && <div className="text-[10px] text-white/30">best {best}</div>}
        </div>
      </div>

      <div className="rounded-lg px-3 py-2 mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="text-[11px] text-white/40">
          Pick <span className="text-white/70 font-bold">{answer.length}</span> units
          {!checked && (
            <>
              {' '}
              &mdash; chosen <span className="text-white/70 font-bold">{picked.length}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {pool.map((u) => (
          <button
            key={u}
            onClick={() => toggle(u)}
            disabled={checked}
            className="text-[13px] px-2.5 py-1.5 rounded-md border transition-all"
            style={chipStyle(u)}
          >
            {u}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={check}
          disabled={picked.length === 0}
          className="text-[13px] font-bold px-4 py-2 rounded-lg border transition-all disabled:opacity-40"
          style={{ background: `${GREEN}1f`, borderColor: `${GREEN}66`, color: GREEN }}
        >
          Check board
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-lg px-3 py-2.5 text-[13px]"
            style={{
              background: perfect ? `${GREEN}14` : `${AMBER}14`,
              border: `1px solid ${perfect ? GREEN : AMBER}44`,
              color: perfect ? GREEN : AMBER,
            }}
          >
            {perfect ? (
              <span className="font-bold">Perfect board.</span>
            ) : (
              <span>
                <span className="font-bold">
                  {correct.length} of {answer.length} right
                </span>
                {wrong.length > 0 && <> &middot; {wrong.length} that don&rsquo;t belong</>}
                {missed.length > 0 && <> &middot; missed {missed.join(', ')}</>}
              </span>
            )}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/35 mb-1.5">The real board</div>
            <div className="flex flex-col gap-1.5">
              {POSITION_ORDER.map((p) => {
                const units = answer.filter((u) => unitPosition(u) === p);
                if (!units.length) return null;
                const meta = POSITION_META[p as Position];
                return (
                  <div key={p} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide w-[110px] shrink-0" style={{ color: meta.color }}>
                      {meta.icon} {meta.label}
                    </span>
                    {units.map((u) => (
                      <span
                        key={u}
                        className="text-[12px] px-2 py-0.5 rounded border"
                        style={{
                          background: u === comp.carry ? `${CARRY}1f` : `${meta.color}14`,
                          borderColor: u === comp.carry ? `${CARRY}66` : `${meta.color}3a`,
                          color: u === comp.carry ? CARRY : 'rgba(255,255,255,0.8)',
                          fontWeight: u === comp.carry ? 700 : 400,
                        }}
                      >
                        {u === comp.carry && '★ '}
                        {u}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={next}
            className="self-start text-[13px] font-bold px-4 py-2 rounded-lg border transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            Next board &rarr;
          </button>
        </div>
      )}

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Wrong answers are units from comps that share a trait with this one, so they are the ones worth being able
        to tell apart. Flex slots and Elderwood plants are left out.
      </div>
    </div>
  );
}
