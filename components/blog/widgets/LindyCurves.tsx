'use client';

import { useState } from 'react';

// The two opposing curves: drag one slider to age a human and a book side
// by side. The human's remaining years shrink; the book's grow. They cross
// at 40 — keep dragging. Slider-driven only, no looping motion.

const MAX_AGE = 100;
// Illustrative life-expectancy curve: ~80 at birth, ~70 left at 10,
// ~40 left at 40, a few left at 90.
const LIFE_EXPECTANCY = 80;
const FLOOR = 3;

function humanRemaining(age: number) {
  return Math.max(FLOOR, LIFE_EXPECTANCY - age);
}

export default function LindyCurves() {
  const [age, setAge] = useState(40);
  const human = humanRemaining(age);
  const book = age;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Drag the slider to age a human and a book. Watch what happens to their future life
        expectancy.
      </p>

      <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white/85 font-bold">The Human</span>
            <span className="text-orange-400 font-bold">~{human} more years</span>
          </div>
          <div className="h-3 rounded bg-white/10 overflow-hidden">
            <div
              className="h-full rounded bg-orange-400 motion-safe:transition-all motion-safe:duration-200"
              style={{ width: `${(human / LIFE_EXPECTANCY) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white/85 font-bold">The Book</span>
            <span className="text-green-400 font-bold">
              {book === 0 ? 'unproven — 0 more years' : `~${book} more years`}
            </span>
          </div>
          <div className="h-3 rounded bg-white/10 overflow-hidden">
            <div
              className="h-full rounded bg-green-400 motion-safe:transition-all motion-safe:duration-200"
              style={{ width: `${(book / MAX_AGE) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <label className="block text-white/70 text-sm mb-1" htmlFor="lindy-curves-age">
        Age: <strong className="text-white">{age}</strong>
        {age === 40 && <span> — they cross here. Keep dragging.</span>}
      </label>
      <input
        id="lindy-curves-age"
        type="range"
        min={0}
        max={MAX_AGE}
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
        className="w-full"
      />
      <p className="text-white/50 text-xs mt-3">
        One curve falls, the other rises. That is the whole effect in one picture.
      </p>
    </div>
  );
}
