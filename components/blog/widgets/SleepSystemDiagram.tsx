'use client';

import { useEffect, useState } from 'react';

// Interactive system diagram of sleep regulation, drawn like a high-level
// architecture diagram: components as nodes, signals as typed edges.
//
// Two edge types, matching the neuroscience convention:
//   →  promotes / excites   (arrowhead)
//   ⊣  suppresses / inhibits (bar head)
//
// The mutual-inhibition pair between Alertness and VLPO is the flip-flop
// itself — whichever side is winning shows a live inhibitory edge into the
// other, and they swap when the switch flips.
//
// Styling note: articles render inside `.article-content`, which sets a
// serif font and `p { margin: 0 0 1.6em }` in plain CSS (not the Tailwind
// typography plugin — `not-prose` does not neutralize it). So this widget
// uses <div> for all text and pins font-sans.

interface Scene {
  label: string;
  title: string;
  light: boolean;
  melatonin: boolean;
  adenosine: number;
  winner: 'wake' | 'sleep';
  note: string;
}

const SCENES: Scene[] = [
  {
    label: '7am',
    title: 'Morning',
    light: true,
    melatonin: false,
    adenosine: 10,
    winner: 'wake',
    note: 'Light floods in. The SCN reads "daytime" and keeps melatonin switched off. Adenosine has just reset to near zero.',
  },
  {
    label: '3pm',
    title: 'Afternoon',
    light: true,
    melatonin: false,
    adenosine: 55,
    winner: 'wake',
    note: 'Adenosine has been climbing for eight hours. But the clock still says "day," so the alertness system holds the switch.',
  },
  {
    label: '9pm',
    title: 'Evening',
    light: false,
    melatonin: true,
    adenosine: 82,
    winner: 'wake',
    note: 'Light fades, the SCN notices, melatonin starts. Pressure is high — yet you are still awake, because the alertness system has not stood down.',
  },
  {
    label: '12am',
    title: 'Bedtime',
    light: false,
    melatonin: true,
    adenosine: 97,
    winner: 'sleep',
    note: 'Both inputs finally agree. The VLPO overpowers the alertness system, the inhibition reverses direction, and the switch slams over.',
  },
  {
    label: '4am',
    title: 'Deep night',
    light: false,
    melatonin: true,
    adenosine: 45,
    winner: 'sleep',
    note: 'Asleep — and sleep is draining adenosine back down, which is what will eventually let the switch flip the other way.',
  },
];

const ON = '#5b9bf5';
const CLOCK = '#facc15';
const SLEEP = '#4ade80';
const OFF = 'rgba(255,255,255,0.16)';
const DASH_PERIOD = 8;

const FLOW_CSS = `
@keyframes sleepFlowFwd { to { stroke-dashoffset: -${DASH_PERIOD}; } }
@keyframes sleepFlowRev { to { stroke-dashoffset: ${DASH_PERIOD}; } }
.sleep-dots-fwd { animation: sleepFlowFwd var(--dot-speed, 0.85s) linear infinite; }
.sleep-dots-rev { animation: sleepFlowRev var(--dot-speed, 0.85s) linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .sleep-dots-fwd, .sleep-dots-rev { animation: none; }
}
`;

/** Excitatory edge: arrowhead at the target end. */
function FlowLine({
  vertical = false,
  color,
  active,
  length = 30,
  speed = 0.85,
}: {
  vertical?: boolean;
  color: string;
  active: boolean;
  length?: number;
  speed?: number;
}) {
  const w = vertical ? 14 : length;
  const h = vertical ? length : 14;
  const d = vertical ? `M7 0 L7 ${length - 5}` : `M0 7 L${length - 5} 7`;
  const head = vertical
    ? `M4 ${length - 6} L7 ${length - 1} L10 ${length - 6}`
    : `M${length - 6} 4 L${length - 1} 7 L${length - 6} 10`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 self-center" aria-hidden>
      <path d={d} stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" fill="none" />
      <path d={head} fill="none" stroke={active ? color : 'rgba(255,255,255,0.15)'} strokeWidth="1.4" />
      {active && (
        <path
          d={d}
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray="1 7"
          fill="none"
          className="sleep-dots-fwd"
          style={{ ['--dot-speed' as string]: `${speed}s`, filter: `drop-shadow(0 0 3px ${color})` }}
        />
      )}
    </svg>
  );
}

/** Inhibitory edge: bar head (⊣) at the target end instead of an arrow. */
function InhibitLine({
  dir,
  color,
  active,
  length = 34,
}: {
  dir: 'right' | 'left';
  color: string;
  active: boolean;
  length?: number;
}) {
  const stroke = active ? color : 'rgba(255,255,255,0.13)';
  const d = dir === 'right' ? `M0 7 L${length - 4} 7` : `M${length} 7 L4 7`;
  const barX = dir === 'right' ? length - 3 : 3;
  return (
    <svg width={length} height={14} viewBox={`0 0 ${length} 14`} className="shrink-0" aria-hidden>
      <path d={d} stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" fill="none" />
      <path d={`M${barX} 2.5 L${barX} 11.5`} stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      {active && (
        <path
          d={d}
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="1 7"
          fill="none"
          className={dir === 'right' ? 'sleep-dots-fwd' : 'sleep-dots-rev'}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      )}
    </svg>
  );
}

function Node({ title, sub, active, color }: { title: string; sub: string; active: boolean; color: string }) {
  return (
    <div
      className="rounded-md border px-2.5 py-2 text-center transition-all duration-500 flex-1"
      style={{
        borderColor: active ? `${color}80` : OFF,
        background: active ? `${color}14` : 'rgba(0,0,0,0.3)',
        boxShadow: active ? `0 0 14px -4px ${color}` : 'none',
      }}
    >
      <div
        className="text-[11px] font-bold leading-tight transition-colors duration-500"
        style={{ color: active ? color : 'rgba(255,255,255,0.35)' }}
      >
        {title}
      </div>
      <div className="text-[9px] leading-tight mt-0.5 text-white/40">{sub}</div>
    </div>
  );
}

export default function SleepSystemDiagram({ eyebrow, caption }: { eyebrow?: string; caption?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const s = SCENES[i];
  const asleep = s.winner === 'sleep';
  const outColor = asleep ? SLEEP : ON;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((p) => (p + 1) % SCENES.length), 2200);
    return () => clearInterval(t);
  }, [playing]);

  // Heavier sleep pressure = faster, denser signal into the switch.
  const pressureSpeed = 1.5 - (s.adenosine / 100) * 1.05;

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <style>{FLOW_CSS}</style>

      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors"
          style={{
            background: playing ? `${SLEEP}1f` : 'rgba(255,255,255,0.05)',
            color: playing ? SLEEP : 'rgba(255,255,255,0.6)',
            borderColor: playing ? `${SLEEP}66` : 'transparent',
          }}
        >
          {playing ? '❙❙ Pause' : '▶ Play day'}
        </button>
        <span className="w-px h-4 bg-white/10 mx-0.5" />
        {SCENES.map((sc, idx) => (
          <button
            key={sc.label}
            onClick={() => {
              setPlaying(false);
              setI(idx);
            }}
            className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors"
            style={{
              background: idx === i ? 'rgba(91,155,245,0.18)' : 'rgba(255,255,255,0.05)',
              color: idx === i ? ON : 'rgba(255,255,255,0.5)',
              borderColor: idx === i ? `${ON}66` : 'transparent',
            }}
          >
            {sc.label}
          </button>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        {/* light -> SCN -> pineal/melatonin */}
        <div className="flex items-stretch gap-0.5">
          <Node title={s.light ? '☀ Light' : '☾ Low light'} sub="sensed by your retina" active color={s.light ? CLOCK : ON} />
          <FlowLine color={s.light ? CLOCK : ON} active length={30} />
          <Node title="SCN" sub={s.light ? 'reads: daytime' : 'reads: night'} active color={CLOCK} />
          <FlowLine color={CLOCK} active={s.melatonin} length={30} />
          <Node
            title="Melatonin"
            sub={s.melatonin ? 'pineal gland: releasing' : 'pineal gland: held off'}
            active={s.melatonin}
            color={CLOCK}
          />
        </div>

        <div className="flex justify-center py-0.5">
          <FlowLine vertical color={CLOCK} active length={22} />
        </div>

        {/* pressure + the switch */}
        <div className="flex items-stretch gap-0.5">
          <div
            className="rounded-md border bg-black/30 px-2.5 py-2 flex-1 flex flex-col justify-center transition-all duration-500"
            style={{ borderColor: `${ON}45`, boxShadow: `0 0 14px -6px ${ON}` }}
          >
            <div className="flex items-baseline justify-between">
              <div className="text-[11px] font-bold leading-tight" style={{ color: ON }}>
                Adenosine
              </div>
              {asleep && <div className="text-[8px] font-semibold" style={{ color: SLEEP }}>▼ draining</div>}
            </div>
            <div className="text-[9px] text-white/40 leading-tight mt-0.5 mb-1.5">sleep pressure</div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.adenosine}%`, background: ON, boxShadow: `0 0 8px ${ON}` }}
              />
            </div>
            <div className="text-[9px] text-white/50 mt-1">{s.adenosine}%</div>
          </div>

          <FlowLine color={ON} active length={30} speed={pressureSpeed} />

          <div className="rounded-md border border-white/10 bg-black/40 p-2 flex-[1.7]">
            <div className="text-[9px] uppercase tracking-wide text-white/35 mb-1.5 text-center">
              The switch &mdash; mutual inhibition
            </div>

            <div className="flex items-stretch gap-1">
              <div
                className="flex-1 rounded px-2 py-1.5 text-center transition-all duration-500"
                style={{
                  background: asleep ? 'rgba(255,255,255,0.04)' : `${ON}1f`,
                  border: `1px solid ${asleep ? OFF : `${ON}80`}`,
                  boxShadow: asleep ? 'none' : `0 0 12px -4px ${ON}`,
                }}
              >
                <div
                  className="text-[10px] font-bold leading-tight transition-colors duration-500"
                  style={{ color: asleep ? 'rgba(255,255,255,0.3)' : ON }}
                >
                  Alertness
                </div>
                <div className="text-[8px] text-white/35 leading-tight">keeps you up</div>
              </div>

              {/* the flip-flop itself: whichever side wins suppresses the other */}
              <div className="flex flex-col justify-center gap-1 shrink-0">
                <InhibitLine dir="right" color={ON} active={!asleep} />
                <InhibitLine dir="left" color={SLEEP} active={asleep} />
              </div>

              <div
                className="flex-1 rounded px-2 py-1.5 text-center transition-all duration-500"
                style={{
                  background: asleep ? `${SLEEP}1f` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${asleep ? `${SLEEP}80` : OFF}`,
                  boxShadow: asleep ? `0 0 12px -4px ${SLEEP}` : 'none',
                }}
              >
                <div
                  className="text-[10px] font-bold leading-tight transition-colors duration-500"
                  style={{ color: asleep ? SLEEP : 'rgba(255,255,255,0.3)' }}
                >
                  VLPO
                </div>
                <div className="text-[8px] text-white/35 leading-tight">starts sleep</div>
              </div>
            </div>

            <div
              className="mt-1.5 rounded px-2 py-1 text-center transition-all duration-500"
              style={{
                background: asleep ? 'rgba(255,255,255,0.03)' : `${ON}14`,
                border: `1px dashed ${asleep ? OFF : `${ON}66`}`,
              }}
            >
              <div
                className="text-[9px] font-semibold leading-tight transition-colors duration-500"
                style={{ color: asleep ? 'rgba(255,255,255,0.3)' : ON }}
              >
                {asleep ? 'Orexin quiet' : 'Orexin holding the wake side steady'}
              </div>
              <div className="text-[8px] text-white/30 leading-tight">stops the switch flickering</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-0.5">
          <FlowLine vertical color={outColor} active length={22} />
        </div>

        <div className="flex justify-center">
          <div
            className="rounded-full px-5 py-1.5 border transition-all duration-500"
            style={{
              borderColor: `${outColor}80`,
              background: `${outColor}14`,
              boxShadow: `0 0 18px -4px ${outColor}`,
            }}
          >
            <div className="text-xs font-bold tracking-wide transition-colors duration-500" style={{ color: outColor }}>
              {asleep ? 'ASLEEP' : 'AWAKE'}
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 pt-2.5 border-t border-white/[0.07]">
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden>
              <path d="M0 4 L14 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" />
              <path d="M12 1.5 L16 4 L12 6.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" />
            </svg>
            promotes
          </span>
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden>
              <path d="M0 4 L14 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" />
              <path d="M15 1 L15 7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            suppresses
          </span>
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <span className="w-2 h-2 rounded-full" style={{ background: CLOCK }} /> clock path
          </span>
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <span className="w-2 h-2 rounded-full" style={{ background: ON }} /> wake / pressure
          </span>
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <span className="w-2 h-2 rounded-full" style={{ background: SLEEP }} /> sleep
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3">
        <div className="text-[11px] font-bold text-white/70 mb-1">
          {s.label} &middot; {s.title}
        </div>
        <div className="text-xs text-white/55 leading-snug">{s.note}</div>
      </div>
    </div>
  );
}
