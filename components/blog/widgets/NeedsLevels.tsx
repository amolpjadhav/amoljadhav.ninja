'use client';

import { useState } from 'react';

// The five levels of Maslow's hierarchy, drawn as clickable steps.
//
// Deliberately drawn as STEPS rather than a smooth triangle: the earliest
// published diagram (Keith Davis, 1957) was a set of steps, and Maslow
// himself never drew a pyramid at all. The article makes that point, so the
// widget shouldn't quietly contradict it.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

interface Level {
  name: string;
  short: string;
  color: string;
  width: number;
  examples: string[];
  missing: string;
}

const LEVELS: Level[] = [
  {
    name: 'Becoming fully yourself',
    short: 'The grown-up name for this one is self-actualisation — becoming everything you are capable of being.',
    color: '#c084fc',
    width: 54,
    examples: [
      'Getting lost in something you love doing',
      'Making up your own stories, tunes or inventions',
      'Getting better at something because you want to, not because anyone asked',
    ],
    missing: 'You feel restless and a bit flat, like something is missing even though nothing is wrong.',
  },
  {
    name: 'Feeling good at something',
    short: 'Esteem — feeling respected by others, and feeling proud of yourself.',
    color: '#5b9bf5',
    width: 66,
    examples: [
      'Being good at something and knowing it',
      'Someone noticing you worked hard',
      'Being trusted with something important',
    ],
    missing: 'You feel small, ignored, or like nothing you do counts.',
  },
  {
    name: 'Belonging and being loved',
    short: 'The need to be part of a group and close to other people.',
    color: '#4ade80',
    width: 78,
    examples: ['Family', 'Friends who actually like you', 'Feeling part of a team or class'],
    missing: 'You feel lonely, left out, or like you do not fit anywhere.',
  },
  {
    name: 'Feeling safe',
    short: 'Knowing you are not in danger and that tomorrow will be okay.',
    color: '#f0a35e',
    width: 89,
    examples: ['A safe home', 'No one hurting or scaring you', 'Knowing what happens next'],
    missing: 'You feel jumpy and on edge, and it is hard to relax or think about anything else.',
  },
  {
    name: 'Staying alive',
    short: 'The stuff your body needs or it stops working.',
    color: '#e0533d',
    width: 100,
    examples: ['Food and water', 'Sleep', 'Air', 'Warmth'],
    missing: 'Nothing else gets a look in. Your whole brain is on this one thing.',
  },
];

export default function NeedsLevels({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [open, setOpen] = useState<number | null>(4);
  const active = open === null ? null : LEVELS[open];

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="bg-black/30 rounded-lg p-4">
        <div className="flex flex-col items-center gap-1.5">
          {LEVELS.map((l, i) => {
            const isOpen = open === i;
            return (
              <button
                key={l.name}
                onClick={() => setOpen(isOpen ? null : i)}
                className="rounded-md border transition-all duration-300 py-2.5 px-3 text-center"
                style={{
                  width: `${l.width}%`,
                  borderColor: isOpen ? `${l.color}cc` : `${l.color}44`,
                  background: isOpen ? `${l.color}26` : `${l.color}10`,
                  boxShadow: isOpen ? `0 0 18px -6px ${l.color}` : 'none',
                }}
              >
                <div
                  className="text-[11px] sm:text-xs font-bold leading-tight transition-colors duration-300"
                  style={{ color: isOpen ? l.color : `${l.color}cc` }}
                >
                  {l.name}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-white/30 text-center mt-2.5">
          most urgent at the bottom &middot; tap a level
        </div>
      </div>

      {active && (
        <div className="border-t border-white/10 mt-4 pt-3">
          <div className="text-[11px] font-bold mb-1.5" style={{ color: active.color }}>
            {active.name}
          </div>
          <div className="text-xs text-white/60 leading-snug mb-2">{active.short}</div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {active.examples.map((e) => (
              <span
                key={e}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `${active.color}18`, color: `${active.color}dd` }}
              >
                {e}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-white/45 leading-snug">
            <span className="text-white/60 font-semibold">When it&rsquo;s missing:</span> {active.missing}
          </div>
        </div>
      )}
    </div>
  );
}
