'use client';

import { useState } from 'react';

// The correction to the pyramid picture: real people are PARTLY satisfied at
// every level at once, all the time — not "finished" with one before starting
// the next. Maslow said this himself in the 1943 paper, and even gave rough
// illustrative percentages (85/70/50/40/10), which is the default scenario.
//
// The "loudest" readout weights how unmet a need is by how basic it is, which
// is Maslow's idea of prepotency: a hungry person stops caring about esteem.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

interface Row {
  name: string;
  color: string;
  weight: number; // how loudly this shouts when unmet; basic needs shout loudest
}

const ROWS: Row[] = [
  { name: 'Becoming fully yourself', color: '#c084fc', weight: 1 },
  { name: 'Feeling good at something', color: '#5b9bf5', weight: 2 },
  { name: 'Belonging and being loved', color: '#4ade80', weight: 3 },
  { name: 'Feeling safe', color: '#f0a35e', weight: 4 },
  { name: 'Staying alive', color: '#e0533d', weight: 5 },
];

// Values are ordered top row -> bottom row, matching ROWS.
interface Scenario {
  label: string;
  values: number[];
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: 'An ordinary person',
    values: [10, 40, 50, 70, 85],
    note: 'These are the rough numbers Maslow himself used as an example in 1943. Notice that not one of them is at zero, and not one is at 100.',
  },
  {
    label: 'You skipped lunch',
    values: [10, 40, 50, 70, 25],
    note: 'Everything else is exactly where it was. But one bar dropped, and suddenly your whole brain is on it. This is why you cannot concentrate in the last lesson before lunch.',
  },
  {
    label: 'First day at a new school',
    values: [15, 25, 20, 55, 85],
    note: 'You are fed and safe. But you know nobody, so belonging drops — and feeling good at things drops with it, because nobody here knows what you are good at yet.',
  },
  {
    label: 'A really good day',
    values: [55, 80, 85, 90, 95],
    note: 'Everything is reasonably full, so the quiet needs at the top finally get some of your attention. This is when people make things, explore, and get curious.',
  },
];

export default function NeedsBalance({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [values, setValues] = useState<number[]>(SCENARIOS[0].values);
  const [scenario, setScenario] = useState(0);
  const [custom, setCustom] = useState(false);

  function pick(i: number) {
    setScenario(i);
    setCustom(false);
    setValues(SCENARIOS[i].values);
  }

  function setOne(i: number, v: number) {
    const next = [...values];
    next[i] = v;
    setValues(next);
    setCustom(true);
  }

  // Prepotency: how loudly each unmet need shouts. Basic needs shout louder.
  const urgencies = ROWS.map((r, i) => (100 - values[i]) * r.weight);
  const loudest = urgencies.indexOf(Math.max(...urgencies));

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => pick(i)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors"
            style={{
              background: !custom && scenario === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
              color: !custom && scenario === i ? '#fff' : 'rgba(255,255,255,0.5)',
              borderColor: !custom && scenario === i ? 'rgba(255,255,255,0.25)' : 'transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        {ROWS.map((r, i) => {
          const isLoud = i === loudest;
          return (
            <div key={r.name} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between mb-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-[11px] font-semibold truncate transition-colors duration-300"
                    style={{ color: isLoud ? r.color : 'rgba(255,255,255,0.6)' }}
                  >
                    {r.name}
                  </span>
                  {isLoud && (
                    <span
                      className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: `${r.color}26`, color: r.color }}
                    >
                      loudest
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/45 shrink-0">{values[i]}% full</span>
              </div>
              <div className="relative h-3 rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${values[i]}%`,
                    background: r.color,
                    opacity: isLoud ? 1 : 0.55,
                    boxShadow: isLoud ? `0 0 10px ${r.color}` : 'none',
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={values[i]}
                onChange={(e) => setOne(i, Number(e.target.value))}
                className="w-full mt-1 accent-white/60 h-1"
                aria-label={`how full: ${r.name}`}
              />
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 mt-4 pt-3">
        <div className="text-[11px] font-bold mb-1" style={{ color: ROWS[loudest].color }}>
          Right now, the loudest need is: {ROWS[loudest].name.toLowerCase()}
        </div>
        <div className="text-xs text-white/55 leading-snug">
          {custom
            ? 'Drag the sliders and watch which need takes over. An empty basic need shouts louder than an empty one near the top — that is the whole idea.'
            : SCENARIOS[scenario].note}
        </div>
      </div>
    </div>
  );
}
