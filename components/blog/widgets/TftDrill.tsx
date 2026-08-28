'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  COMPS,
  unitPosition,
  POSITION_META,
  POSITION_ORDER,
  type Comp,
  type Position,
  type Tier,
} from './tftCompData';

// Recall practice for the comp sheet. Recognising a board you are looking at
// is easy; producing one from memory is the thing that actually transfers to
// a game, so this asks you to build the board rather than pick it.
//
// A round runs the comp in game order: first the opener you hold in stage 2-3
// (the part that decides whether you bleed health), then the board you end on.
// Not every comp gets an opener step — see MIN_OPENER_UNITS.
//
// You can also lock the drill to one comp. Most players have a main, and the
// point of drilling a main is repetition, so the choice is remembered between
// visits rather than reset every time.
//
// The pool is deliberately NOT the full 66-champion roster. Finding a name in
// a list of 66 tests scrolling, not knowledge, and it does not fit on a phone.
// Instead each round offers the correct units plus decoys drawn from comps
// that share a unit — so the wrong answers are the ones you could plausibly
// confuse, and getting it right means you actually know this board.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

const GREEN = '#4ade80';
const RED = '#ff4655';
const AMBER = '#fbbf24';
const CARRY = '#ffc857';
const EARLY = '#38bdf8'; // sky, same as the "Early game" row on the comp cards

const BOARD_DECOYS = 8;
const OPENER_DECOYS = 6;

// A comp only gets an opener step if it lists at least two early units. Where
// a comp lists exactly one, that unit is usually named in the comp title
// ("Rengar Reroll", "Sprykin Teemo"), so asking for it would test reading
// rather than memory. Those comps drill the board only, and their opener is
// shown in the reveal instead of being asked for.
//
// 22 of the 27 comps clear the bar. The five that do not are the ones with no
// opener published anywhere I could check — see the note at the top of
// tftCompData.ts.
const MIN_OPENER_UNITS = 2;

const STORAGE_KEY = 'tft-drill-comp';

function readSavedComp(): string | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && COMPS.some((c) => c.name === saved) ? saved : null;
  } catch {
    return null; // private browsing, storage disabled — not worth failing over
  }
}

function saveComp(name: string | null) {
  try {
    if (name) window.localStorage.setItem(STORAGE_KEY, name);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// Placeholders like "5-cost AP flex" and the Elderwood plants are not units
// you buy, so they are never part of an answer.
function realUnits(list: string[]): string[] {
  return list.filter((u) => {
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

// Fills up to `count` decoys, preferring earlier sources — nearby units first,
// then anything, so a round never runs short of options.
function pickDecoys(count: number, answer: Set<string>, sources: string[][]): string[] {
  const decoys: string[] = [];
  for (const source of sources) {
    for (const u of shuffle(Array.from(new Set(source)))) {
      if (decoys.length >= count) return decoys;
      if (answer.has(u) || decoys.includes(u)) continue;
      decoys.push(u);
    }
  }
  return decoys;
}

type StageKey = 'opener' | 'board';

const STAGE_META: Record<StageKey, { heading: string; label: string; accent: string; reveal: string }> = {
  opener: {
    heading: 'Hold this opener',
    label: 'opener',
    accent: EARLY,
    reveal: 'The real opener',
  },
  board: {
    heading: 'Build this board',
    label: 'board',
    accent: GREEN,
    reveal: 'The real board',
  },
};

interface Stage {
  key: StageKey;
  answer: string[];
  pool: string[];
}

interface Round {
  comp: Comp;
  stages: Stage[];
}

function openerStage(comp: Comp): Stage | null {
  const answer = realUnits(comp.early);
  if (answer.length < MIN_OPENER_UNITS) return null;
  const answerSet = new Set(answer);

  // Decoys are other comps' openers: the units you might wrongly slam down in
  // stage 2. Comps that share an opener unit come first, then any opener, then
  // final-board units as a last resort.
  const related = COMPS.filter(
    (c) => c.name !== comp.name && realUnits(c.early).some((u) => answerSet.has(u))
  );
  const decoys = pickDecoys(OPENER_DECOYS, answerSet, [
    related.flatMap((c) => realUnits(c.early)),
    COMPS.flatMap((c) => realUnits(c.early)),
    COMPS.flatMap((c) => realUnits(c.final)),
  ]);

  return { key: 'opener', answer, pool: shuffle([...answer, ...decoys]) };
}

function boardStage(comp: Comp): Stage {
  const answer = realUnits(comp.final);
  const answerSet = new Set(answer);

  const related = COMPS.filter(
    (c) => c.name !== comp.name && realUnits(c.final).some((u) => answerSet.has(u))
  );
  const decoys = pickDecoys(BOARD_DECOYS, answerSet, [
    related.flatMap((c) => realUnits(c.final)),
    COMPS.flatMap((c) => realUnits(c.final)),
  ]);

  return { key: 'board', answer, pool: shuffle([...answer, ...decoys]) };
}

function makeRound(locked: string | null, avoid?: string): Round {
  let comp: Comp;
  if (locked) {
    comp = COMPS.find((c) => c.name === locked) ?? COMPS[0];
  } else {
    const candidates = COMPS.filter((c) => c.name !== avoid && realUnits(c.final).length >= 5);
    comp = candidates[Math.floor(Math.random() * candidates.length)];
  }

  const opener = openerStage(comp);
  return { comp, stages: opener ? [opener, boardStage(comp)] : [boardStage(comp)] };
}

const TIER_ORDER: Tier[] = ['S', 'A', 'B', 'C', 'X'];

export default function TftDrill({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [round, setRound] = useState<Round | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [clean, setClean] = useState(true); // every stage of this round exact so far
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const start = useCallback((lockedComp: string | null, avoid?: string) => {
    setRound(makeRound(lockedComp, avoid));
    setStageIdx(0);
    setPicked([]);
    setChecked(false);
    setClean(true);
  }, []);

  // Randomised after mount so the server and client markup agree, which is
  // also where the remembered comp gets picked up.
  useEffect(() => {
    const saved = readSavedComp();
    setLocked(saved);
    start(saved);
  }, [start]);

  if (!round) {
    return (
      <div className="not-prose font-sans rounded-xl p-6 my-6 border border-white/12 bg-[#17181b]">
        <div className="text-white/40 text-sm">Loading drill…</div>
      </div>
    );
  }

  const { comp, stages } = round;
  const stage = stages[stageIdx];
  const meta = STAGE_META[stage.key];
  const answer = stage.answer;
  const answerSet = new Set(answer);
  const lastStage = stageIdx === stages.length - 1;

  const correct = picked.filter((u) => answerSet.has(u));
  const wrong = picked.filter((u) => !answerSet.has(u));
  const missed = answer.filter((u) => !picked.includes(u));
  const exact = wrong.length === 0 && missed.length === 0;

  const chooseComp = (name: string | null) => {
    setLocked(name);
    saveComp(name);
    start(name);
  };

  const toggle = (u: string) => {
    if (checked) return;
    setPicked((p) => (p.includes(u) ? p.filter((x) => x !== u) : [...p, u]));
  };

  const check = () => {
    setChecked(true);
    if (!exact) setClean(false);
    if (lastStage) {
      const next = clean && exact ? streak + 1 : 0;
      setStreak(next);
      setBest((b) => Math.max(b, next));
    }
  };

  const advance = () => {
    if (lastStage) {
      start(locked, comp.name);
      return;
    }
    setStageIdx((i) => i + 1);
    setPicked([]);
    setChecked(false);
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

  // Openers the drill does not ask for are still worth seeing, so they ride
  // along with the board reveal.
  const shownOpener = stages.length === 1 ? realUnits(comp.early) : [];

  return (
    <div className="not-prose font-sans rounded-xl p-4 sm:p-6 my-6 border border-white/12 bg-[#17181b]">
      {eyebrow && (
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: GREEN }}>
          {eyebrow}
        </div>
      )}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[11px] uppercase tracking-wider text-white/35">Drilling</span>
        <select
          value={locked ?? ''}
          onChange={(e) => chooseComp(e.target.value || null)}
          className="text-[13px] rounded-lg bg-black/50 border border-white/15 px-2.5 py-1.5 text-white/90 outline-none focus:border-sky-400/60 max-w-full"
          style={{ colorScheme: 'dark' }}
        >
          <option value="">Every comp, shuffled</option>
          {TIER_ORDER.map((t) => {
            const inTier = COMPS.filter((c) => c.tier === t);
            if (!inTier.length) return null;
            return (
              <optgroup key={t} label={`${t} tier`}>
                {inTier.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        {locked && (
          <span className="text-[11px]" style={{ color: CARRY }}>
            &#9733; your comp &mdash; saved for next time
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider" style={{ color: meta.accent }}>
            {meta.heading}
            {stages.length > 1 && (
              <span className="text-white/30">
                {' '}
                &middot; step {stageIdx + 1} of {stages.length}
              </span>
            )}
          </div>
          <div className="text-[16px] font-bold text-white leading-tight">{comp.name}</div>
          <div className="text-[12px] mt-0.5" style={{ color: CARRY }}>
            &#9733; Carry: {comp.carry}
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

      <div className="rounded-lg px-3 py-2 mb-3" style={{ background: `${meta.accent}0f` }}>
        <div className="text-[11px] text-white/45">
          {stage.key === 'opener'
            ? 'Which units do you hold through stage 2 and 3, before the comp comes online?'
            : 'Which units does this comp end on?'}
        </div>
        <div className="text-[11px] text-white/40 mt-0.5">
          Pick <span className="text-white/70 font-bold">{answer.length}</span>
          {!checked && (
            <>
              {' '}
              &mdash; chosen <span className="text-white/70 font-bold">{picked.length}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {stage.pool.map((u) => (
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
          style={{ background: `${meta.accent}1f`, borderColor: `${meta.accent}66`, color: meta.accent }}
        >
          Check {meta.label}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-lg px-3 py-2.5 text-[13px]"
            style={{
              background: exact ? `${GREEN}14` : `${AMBER}14`,
              border: `1px solid ${exact ? GREEN : AMBER}44`,
              color: exact ? GREEN : AMBER,
            }}
          >
            {exact ? (
              <span className="font-bold">Perfect {meta.label}.</span>
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
            <div className="text-[11px] uppercase tracking-wider text-white/35 mb-1.5">{meta.reveal}</div>
            <div className="flex flex-col gap-1.5">
              {POSITION_ORDER.map((p) => {
                const units = answer.filter((u) => unitPosition(u) === p);
                if (!units.length) return null;
                const pos = POSITION_META[p as Position];
                return (
                  <div key={p} className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide w-[110px] shrink-0"
                      style={{ color: pos.color }}
                    >
                      {pos.icon} {pos.label}
                    </span>
                    {units.map((u) => (
                      <span
                        key={u}
                        className="text-[12px] px-2 py-0.5 rounded border"
                        style={{
                          background: u === comp.carry ? `${CARRY}1f` : `${pos.color}14`,
                          borderColor: u === comp.carry ? `${CARRY}66` : `${pos.color}3a`,
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

          {stage.key === 'board' && shownOpener.length > 0 && (
            <div className="text-[12px]" style={{ color: EARLY }}>
              <span className="text-[11px] uppercase tracking-wider opacity-70">Opener to hold: </span>
              {shownOpener.join(', ')}
            </div>
          )}

          <button
            onClick={advance}
            className="self-start text-[13px] font-bold px-4 py-2 rounded-lg border transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {lastStage ? (locked ? 'Run it again' : 'Next comp') : 'Now the full board'} &rarr;
          </button>
        </div>
      )}

      <div className="border-t border-white/10 mt-4 pt-3 text-[11px] text-white/30 leading-snug">
        Wrong answers are units from comps that share a unit with this one, so they are the ones worth being able to
        tell apart. Flex slots and Elderwood plants are left out. The streak only counts a comp you get exactly right,
        opener included; comps with fewer than two openers listed skip that step and show the opener instead.
      </div>
    </div>
  );
}
