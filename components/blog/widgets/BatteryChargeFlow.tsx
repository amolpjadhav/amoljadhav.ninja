'use client';

import { useEffect, useRef, useState } from 'react';

// End-to-end charging, inside one battery cell. The charger pushes little
// dots (ions) across the liquid in the middle (the electrolyte), and each
// one parks between the layers of the graphite wall on the right (that's
// really where they go — it even has a name, inter-something, but parking
// is all a 10-year-old needs). The Push slider is the voltage: drag it to
// max and watch full feel different from gentle.
//
// Ions travel on a CSS keyframe (see FLOW_CSS, same pattern as the
// electromagnet widget); when one's swim finishes it parks in the next free
// slot. Initial render is deterministic (empty, unplugged) so there's no
// server/client hydration mismatch — everything moves only after a click.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so this widget uses <div> for text and pins
// font-sans, same as the other interactive widgets.

const SLOTS = 12;
const LANES = 4;

const FLOW_CSS = `
@keyframes ionSwim { from { left: 0; } to { left: calc(100% - 12px); } }
@media (prefers-reduced-motion: reduce) { .ion-dot { animation: none; } }
`;

function voltageFor(push: number) {
  return 3.2 + (push / 100) * 1.0; // 3.2V gentle … 4.2V max squeeze
}

function travelMsFor(push: number) {
  return Math.round(2800 - (push / 100) * 2000); // 2.8s … 0.8s
}

function spawnMsFor(push: number) {
  return Math.round(1000 - (push / 100) * 680); // 1000ms … 320ms
}

function pushWord(push: number) {
  if (push < 35) return 'gentle push';
  if (push < 75) return 'strong push';
  return 'max squeeze';
}

interface Swimmer {
  id: number;
  lane: number;
  durationMs: number;
}

export default function BatteryChargeFlow({
  eyebrow,
  caption,
  highlightColor,
}: {
  eyebrow?: string;
  caption?: string;
  highlightColor?: string;
}) {
  const accent = highlightColor ?? '#0aee3c';
  const [parked, setParked] = useState(0);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [charging, setCharging] = useState(false);
  const [push, setPush] = useState(55);
  const nextId = useRef(0);
  // Mirror of `parked` for event handlers: several ions can land in the same
  // tick, and each handler must see the latest count, not its own closure's.
  const parkedRef = useRef(0);
  // Read once at mount (portalled in client-side after mount, never SSR'd).
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const full = parked >= SLOTS;
  const voltage = voltageFor(push);

  // Parks one ion and stops the pump at full. Called from event/timeout
  // callbacks only — never from an effect body.
  function parkOne() {
    parkedRef.current = Math.min(parkedRef.current + 1, SLOTS);
    setParked(parkedRef.current);
    if (parkedRef.current >= SLOTS) setCharging(false);
  }

  function land(id: number) {
    setSwimmers((s) => s.filter((w) => w.id !== id));
    parkOne();
  }

  function reset() {
    setCharging(false);
    setSwimmers([]);
    parkedRef.current = 0;
    setParked(0);
  }

  // The pump: while plugged in, a new ion dives in every spawn interval.
  useEffect(() => {
    if (!charging || full) return;
    const t = setTimeout(() => {
      if (reducedMotion) {
        // No swim animation: park straight into the next slot.
        parkOne();
        return;
      }
      setSwimmers((s) => {
        if (s.length >= 3 || parked + s.length >= SLOTS) return s;
        const id = nextId.current++;
        return [...s, { id, lane: (id * 37 + 11) % 100, durationMs: travelMsFor(push) }];
      });
    }, spawnMsFor(push));
    return () => clearTimeout(t);
  }, [charging, full, parked, swimmers, push, reducedMotion]);

  const pct = Math.round((parked / SLOTS) * 100);

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <style>{FLOW_CSS}</style>
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/35">Parked</div>
          <div className="text-2xl font-bold text-white/95 tabular-nums">{pct}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/35">Push (voltage)</div>
          <div className="text-sm font-semibold text-white/80 tabular-nums">{voltage.toFixed(1)} V</div>
          <div className="text-[11px]" style={{ color: push >= 75 ? '#fbbf24' : 'rgba(255,255,255,0.45)' }}>
            {pushWord(push)}
          </div>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${charging ? 'motion-safe:animate-pulse' : ''}`}
            style={{ background: charging ? accent : 'rgba(255,255,255,0.2)' }}
          />
          <span className="text-[11px] text-white/50">{charging ? 'power flowing' : full ? 'fully squeezed' : 'unplugged'}</span>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3">
        <div className="flex gap-2">
          {/* charger */}
          <div className="w-14 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] py-3">
            <div className="flex gap-1">
              <div className="w-1 h-3 rounded-sm bg-white/50" />
              <div className="w-1 h-3 rounded-sm bg-white/50" />
            </div>
            <div className="w-7 h-9 rounded-sm border-2 border-white/30" style={charging ? { borderColor: `${accent}88` } : undefined} />
            <div className="text-[9px] uppercase tracking-wide text-white/40 text-center leading-tight">char<br />ger</div>
          </div>

          {/* electrolyte lane */}
          <div className="relative flex-1 rounded-md border border-white/10 overflow-hidden" style={{ height: 148, background: 'rgba(91,155,245,0.05)' }}>
            {!reducedMotion &&
              swimmers.map((w) => (
                <div
                  key={w.id}
                  onAnimationEnd={() => land(w.id)}
                  className="ion-dot absolute rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    top: `${8 + (w.lane / 100) * 78}%`,
                    background: accent,
                    boxShadow: `0 0 8px ${accent}88`,
                    animation: `ionSwim ${w.durationMs}ms linear forwards`,
                  }}
                />
              ))}
            <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] uppercase tracking-wide text-white/30 pointer-events-none">
              liquid inside (electrolyte)
            </div>
          </div>

          {/* graphite wall */}
          <div
            className="w-20 shrink-0 flex flex-col justify-around rounded-md border border-white/10 bg-white/[0.03] py-2 px-1.5"
            style={full ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined}
          >
            {Array.from({ length: LANES }, (_, gap) => (
              <div key={gap}>
                <div className="h-px bg-white/25" />
                <div className="grid grid-cols-3 gap-1 py-1">
                  {Array.from({ length: SLOTS / LANES }, (_, k) => {
                    const slot = gap * (SLOTS / LANES) + k;
                    const isFilled = slot < parked;
                    return (
                      <div
                        key={k}
                        className="aspect-square rounded-full motion-safe:transition-all motion-safe:duration-300"
                        style={
                          isFilled
                            ? { background: full ? '#f87171' : accent, boxShadow: `0 0 6px ${full ? '#f8717188' : `${accent}88`}` }
                            : { border: '1.5px solid rgba(255,255,255,0.22)' }
                        }
                      />
                    );
                  })}
                </div>
                {gap === LANES - 1 && <div className="h-px bg-white/25" />}
              </div>
            ))}
            <div className="text-[9px] uppercase tracking-wide text-white/40 text-center leading-tight mt-1">wall<br />(parking)</div>
          </div>
        </div>
      </div>

      {full && (
        <div className="border border-[rgba(248,113,113,0.4)] rounded-lg mt-4 p-3.5" style={{ background: 'rgba(248,113,113,0.07)' }}>
          <div className="text-xs font-bold text-[rgba(248,113,113,0.95)] mb-1">Fully squeezed.</div>
          <div className="text-xs text-white/60 leading-snug">
            Every gap between the layers is packed. Nothing else can get in — and the push never lets up. This is the
            state a battery hates sitting in. Try it again with the push on gentle and watch it fill the easy way.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        {!charging && !full && (
          <button
            onClick={() => setCharging(true)}
            className="text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
            style={{ background: `${accent}22`, color: accent, borderColor: `${accent}66` }}
          >
            {parked === 0 && swimmers.length === 0 ? 'Plug in' : 'Keep charging'}
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-white/35">Push</span>
          <input
            type="range"
            min={0}
            max={100}
            value={push}
            onChange={(e) => setPush(Number(e.target.value))}
            className="w-28 accent-white/70"
            aria-label="charging push (voltage)"
          />
        </div>
        {(parked > 0 || swimmers.length > 0) && (
          <button
            onClick={reset}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 transition-colors"
          >
            Empty it
          </button>
        )}
      </div>
    </div>
  );
}
