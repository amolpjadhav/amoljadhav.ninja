'use client';

import { useEffect, useState } from 'react';

// A battery as a parking lot. Each spot is a place inside the battery where
// a bit of charge can park. Plug in and watch: empty spots fill fast, then
// the last few take forever as newcomers circle for the remaining corners.
// Charging auto-pauses at 80% (16 of 20 spots) — the reader has to choose to
// squeeze in the rest, which is the article's whole point in one interaction.
//
// The initial render is deterministic (empty lot, not charging) so there's
// no server/client hydration mismatch. Timeouts only ever run after a click.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so this widget uses <div> for text and pins
// font-sans, same as the other interactive widgets.

const TOTAL = 20;
const STOP_AT = 16; // 80%

function delayFor(filled: number) {
  // Gentle at first, brutal at the top: the last spots take ~10x longer.
  return Math.round(350 * (1 + 14 * Math.pow(filled / TOTAL, 6)));
}

function speedLabel(delay: number) {
  if (delay < 600) return 'fast — empty spots everywhere';
  if (delay < 1600) return 'slowing — circling for a spot';
  return 'crawling — squeezing into corners';
}

export default function BatteryParkingLot({
  eyebrow,
  caption,
  highlightColor,
}: {
  eyebrow?: string;
  caption?: string;
  highlightColor?: string;
}) {
  const accent = highlightColor ?? '#0aee3c';
  const [filled, setFilled] = useState(0);
  const [charging, setCharging] = useState(false);
  const [pausedAt80, setPausedAt80] = useState(false);
  const [continued, setContinued] = useState(false);
  // Read once at mount (this widget only ever renders client-side, portalled
  // in after mount — never SSR'd), so no effect and no hydration mismatch.
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!charging) return;
    // All state updates happen inside the timeout callback (never directly
    // in the effect body), so each tick lands exactly one new parked dot and
    // the 80% pause / 100% stop fire as part of that same tick.
    const t = setTimeout(() => {
      const next = Math.min(filled + 1, TOTAL);
      setFilled(next);
      if (next >= TOTAL) {
        setCharging(false);
      } else if (next === STOP_AT && !continued) {
        setCharging(false);
        setPausedAt80(true);
      }
    }, delayFor(filled));
    return () => clearTimeout(t);
  }, [charging, filled, continued]);

  function plugIn() {
    if (filled >= TOTAL) return;
    if (reducedMotion) {
      // No animation: jump straight to the pause point (or full).
      if (filled < STOP_AT) {
        setFilled(STOP_AT);
        setPausedAt80(true);
      } else {
        setContinued(true);
        setFilled(TOTAL);
      }
      return;
    }
    setPausedAt80(false);
    setCharging(true);
  }

  function keepGoing() {
    setContinued(true);
    setPausedAt80(false);
    if (reducedMotion) {
      setFilled(TOTAL);
      return;
    }
    setCharging(true);
  }

  function reset() {
    setCharging(false);
    setFilled(0);
    setPausedAt80(false);
    setContinued(false);
  }

  const pct = Math.round((filled / TOTAL) * 100);
  const full = filled >= TOTAL;
  const delay = delayFor(Math.min(filled, TOTAL - 1));
  const spotsPer10s = (10000 / delay).toFixed(1);

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/35">Battery</div>
          <div className="text-2xl font-bold text-white/95 tabular-nums">{pct}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/35">Parking speed</div>
          <div className="text-sm font-semibold text-white/80 tabular-nums">
            {full ? '—' : `${spotsPer10s} spots / 10 sec`}
          </div>
          <div className="text-[11px] text-white/45">{full ? 'lot is full' : speedLabel(delay)}</div>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${charging ? 'motion-safe:animate-pulse' : ''}`}
            style={{ background: charging ? accent : 'rgba(255,255,255,0.2)' }}
          />
          <span className="text-[11px] text-white/50">{charging ? 'power flowing' : 'unplugged'}</span>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2.5 max-w-xs mx-auto" role="img" aria-label={`${filled} of ${TOTAL} battery spots filled`}>
          {Array.from({ length: TOTAL }, (_, i) => {
            const isFilled = i < filled;
            const isSqueezeZone = i >= STOP_AT;
            return (
              <div
                key={i}
                className="aspect-square rounded-full motion-safe:transition-all motion-safe:duration-300"
                style={
                  isFilled
                    ? {
                        background: isSqueezeZone ? '#f87171' : accent,
                        boxShadow: `0 0 8px ${isSqueezeZone ? '#f8717188' : `${accent}88`}`,
                      }
                    : {
                        border: `2px solid ${isSqueezeZone ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.2)'}`,
                      }
                }
              />
            );
          })}
        </div>

        <div className="max-w-xs mx-auto mt-4">
          <div className="relative h-1.5 rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-all motion-safe:duration-300"
              style={{ width: `${pct}%`, background: full ? '#f87171' : accent }}
            />
            <div className="absolute inset-y-[-3px] w-px bg-white/50" style={{ left: '80%' }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-white/35">
            <span>empty</span>
            <span>cars stop here · 80%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/45">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: accent }} /> parked comfortably
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full border-2 border-[rgba(251,191,36,0.5)]" /> tight corners
          </span>
        </div>
      </div>

      {pausedAt80 && (
        <div className="border border-[rgba(251,191,36,0.4)] rounded-lg mt-4 p-3.5" style={{ background: 'rgba(251,191,36,0.07)' }}>
          <div className="text-xs font-bold text-[rgba(251,191,36,0.95)] mb-1">Paused at 80% — this is where most cars stop.</div>
          <div className="text-xs text-white/60 leading-snug mb-2.5">
            16 spots filled fast. The last 4 take about as long as all 16 before them — and they are the spots that
            wear the battery out. Want them anyway?
          </div>
          <button
            onClick={keepGoing}
            className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' }}
          >
            Squeeze in the last spots
          </button>
        </div>
      )}

      {full && (
        <div className="border border-[rgba(248,113,113,0.4)] rounded-lg mt-4 p-3.5" style={{ background: 'rgba(248,113,113,0.07)' }}>
          <div className="text-xs font-bold text-[rgba(248,113,113,0.95)] mb-1">Packed tight — 100%.</div>
          <div className="text-xs text-white/60 leading-snug">
            Every spot squeezed, doors barely opening. A battery can sit like this — but this is the state that ages
            it fastest. Fine before a long drive; rough as a daily habit.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        {!charging && !full && !(pausedAt80 && filled === STOP_AT) && (
          <button
            onClick={plugIn}
            className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
            style={{ background: `${accent}22`, color: accent, borderColor: `${accent}66` }}
          >
            {filled === 0 ? 'Plug in' : 'Keep charging'}
          </button>
        )}
        {charging && (
          <button
            onClick={() => setCharging(false)}
            className="text-[11px] font-bold px-3 py-1.5 rounded border border-white/15 bg-white/5 text-white/70 hover:text-white/90 transition-colors"
          >
            Unplug
          </button>
        )}
        {filled > 0 && (
          <button
            onClick={reset}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 transition-colors"
          >
            Empty the lot
          </button>
        )}
      </div>
    </div>
  );
}
