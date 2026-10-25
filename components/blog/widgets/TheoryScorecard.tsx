'use client';

import { useState } from 'react';

// Pick a known fact, see how each competing theory copes with it. Built for
// the dreams article, where the honest situation is "four decent theories,
// no winner" — so the useful thing to teach isn't an answer, it's how you
// weigh explanations against evidence.
//
// Deliberately does NOT keep score. Tallying verdicts would imply the
// theory with the most green wins, which is not how any of this works —
// and one of the observations is included precisely because it fits every
// theory and therefore settles nothing.
//
// Styling note: `.article-content` sets a serif font and p-margins in plain
// CSS (not Tailwind typography), so `not-prose` does not neutralize it —
// this widget uses <div> for text and pins font-sans.

type Verdict = 'strong' | 'mixed' | 'weak';

const VERDICT_STYLE: Record<Verdict, { color: string; label: string }> = {
  strong: { color: '#4ade80', label: 'explains it well' },
  mixed: { color: '#f0a35e', label: 'partly' },
  weak: { color: '#e0533d', label: 'struggles' },
};

const THEORIES = [
  { key: 'noise', name: 'Random noise', sub: 'Dreams are meaningless static your brain tries to make a story out of' },
  { key: 'memory', name: 'Memory sorting', sub: 'Dreams are your brain filing the day away' },
  { key: 'threat', name: 'Threat rehearsal', sub: 'Dreams are a safe practice ground for danger' },
  { key: 'overfit', name: 'Anti-overfitting', sub: 'Dreams are deliberately weird to stop you over-learning your routine' },
] as const;

type TheoryKey = (typeof THEORIES)[number]['key'];

interface Observation {
  fact: string;
  verdicts: Record<TheoryKey, { v: Verdict; why: string }>;
  note?: string;
}

const OBSERVATIONS: Observation[] = [
  {
    fact: 'Dreams are bizarre and make no sense',
    verdicts: {
      noise: { v: 'strong', why: 'If it is random static, of course it is nonsense. This is its best evidence.' },
      memory: { v: 'weak', why: 'If you were filing real memories, dreams should look like real life. Mostly they do not.' },
      threat: { v: 'weak', why: 'A useful fire drill is realistic. Being chased by a talking sofa trains you for nothing.' },
      overfit: { v: 'strong', why: 'The weirdness is the entire point — corrupted data on purpose.' },
    },
  },
  {
    fact: 'You forget almost every dream',
    verdicts: {
      noise: { v: 'strong', why: 'Nothing worth keeping, so nothing gets kept.' },
      memory: { v: 'weak', why: 'Strange for a memory process to leave behind no memory of itself.' },
      threat: { v: 'mixed', why: 'You would expect practice to stick — though it might still work unremembered.' },
      overfit: { v: 'strong', why: 'You keep what you learned, not the training examples. Same as an AI.' },
    },
  },
  {
    fact: 'Dreams are full of emotion, especially fear',
    verdicts: {
      noise: { v: 'weak', why: 'Random firing should be emotionally flat. It very much is not.' },
      memory: { v: 'strong', why: 'Emotional memories get priority for processing. Fits neatly.' },
      threat: { v: 'strong', why: 'Fear is exactly what this theory predicts you should find.' },
      overfit: { v: 'mixed', why: 'Makes no particular prediction about emotion either way.' },
    },
  },
  {
    fact: 'Being chased is a common dream all over the world',
    verdicts: {
      noise: { v: 'weak', why: 'Why would random noise keep landing on the same theme across cultures?' },
      memory: { v: 'weak', why: 'Most people are not chased during the day, so there is nothing to file.' },
      threat: { v: 'strong', why: 'Its central prediction, and it holds up.' },
      overfit: { v: 'mixed', why: 'No reason to expect one theme over another.' },
    },
  },
  {
    fact: 'Rats replay their maze runs while asleep',
    verdicts: {
      noise: { v: 'weak', why: 'Replaying a route in the correct order is the opposite of random.' },
      memory: { v: 'strong', why: 'The single strongest piece of hard evidence any of these theories has.' },
      threat: { v: 'mixed', why: 'Consistent with it, but running a maze is not rehearsing a threat.' },
      overfit: { v: 'mixed', why: 'Consistent, but the replay is faithful rather than distorted.' },
    },
  },
  {
    fact: 'People blind from birth dream too, in sound, touch and smell',
    verdicts: {
      noise: { v: 'strong', why: 'Fine — random activity in whatever brain areas you happen to have.' },
      memory: { v: 'strong', why: 'Fine — it files whatever senses you actually use.' },
      threat: { v: 'strong', why: 'Fine — threats are not only visual.' },
      overfit: { v: 'strong', why: 'Fine — it generalises whatever data comes in.' },
    },
    note: 'Notice this one fits all four. A fact that agrees with every theory cannot help you choose between them — good evidence has to be able to rule something out.',
  },
];

export default function TheoryScorecard({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [i, setI] = useState(0);
  const obs = OBSERVATIONS[i];

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {OBSERVATIONS.map((o, idx) => (
          <button
            key={o.fact}
            onClick={() => setI(idx)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors text-left"
            style={{
              background: idx === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
              color: idx === i ? '#fff' : 'rgba(255,255,255,0.5)',
              borderColor: idx === i ? 'rgba(255,255,255,0.25)' : 'transparent',
            }}
          >
            {o.fact}
          </button>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <div className="text-[10px] uppercase tracking-wide text-white/35 mb-2.5">
          How each theory handles it
        </div>
        <div className="flex flex-col gap-2">
          {THEORIES.map((t) => {
            const { v, why } = obs.verdicts[t.key];
            const style = VERDICT_STYLE[v];
            return (
              <div
                key={t.key}
                className="rounded-md border px-3 py-2 transition-all duration-300"
                style={{ borderColor: `${style.color}44`, background: `${style.color}0d` }}
              >
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-white/85">{t.name}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide shrink-0"
                    style={{ color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
                <div className="text-[10px] text-white/45 leading-snug">{why}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3">
        {obs.note ? (
          <div className="text-xs leading-snug" style={{ color: '#f0a35e' }}>
            {obs.note}
          </div>
        ) : (
          <div className="text-[11px] text-white/40 leading-snug">
            No theory wins every row &mdash; which is exactly why this is still an open question. Try another fact.
          </div>
        )}
      </div>
    </div>
  );
}
