'use client';

import { useState } from 'react';

// The Elementarmagnete model from the Bayern Gymnasium 7 syllabus: a piece
// of iron holds countless tiny magnets that can rotate in place. Jumbled =
// not a magnet. All lined up = a magnet. Stroking aligns them; heat and
// shock scramble them again.
//
// Colours follow the German textbook convention: north = red, south = green.
//
// Styling note: articles render inside `.article-content`, which sets a
// serif font and `p { margin: 0 0 1.6em }` in plain CSS (not the Tailwind
// typography plugin — `not-prose` does NOT neutralize it). So this widget
// uses <div> for text and pins font-sans.

const COLS = 9;
const ROWS = 4;
const N_RED = '#e0533d';
const S_GREEN = '#3fa86a';

// Fixed "jumbled" angles rather than Math.random(), so the widget renders
// identically every time and can't cause a hydration mismatch.
const JUMBLED = [
  17, 143, 291, 62, 214, 355, 98, 176, 249, 31, 320, 128, 205, 74, 267, 12, 189, 341,
  55, 231, 109, 297, 160, 22, 278, 86, 199, 313, 44, 152, 236, 91, 5, 264, 130, 348,
];

type Status = 'jumbled' | 'aligned';

export default function ElementaryMagnets({
  eyebrow,
  caption,
}: {
  eyebrow?: string;
  caption?: string;
}) {
  const [status, setStatus] = useState<Status>('jumbled');
  const [lastAction, setLastAction] = useState<string>(
    'This iron is jumbled up inside — right now it is NOT a magnet.'
  );

  const aligned = status === 'aligned';
  const total = COLS * ROWS;

  function stroke() {
    setStatus('aligned');
    setLastAction('You stroked it with a magnet. All the tiny magnets swung around to point the same way — now the whole bar is a magnet.');
  }
  function heat() {
    if (!aligned) {
      setLastAction('It was already jumbled, so heating it changes nothing. Magnetise it first, then try again.');
      return;
    }
    setStatus('jumbled');
    setLastAction('Heat makes the tiny magnets jiggle so hard they lose their line-up. The bar stops being a magnet.');
  }
  function hammer() {
    if (!aligned) {
      setLastAction('It was already jumbled, so hitting it changes nothing. Magnetise it first, then try again.');
      return;
    }
    setStatus('jumbled');
    setLastAction('A hard knock shakes the tiny magnets out of line. The bar stops being a magnet.');
  }

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 leading-snug">{caption}</div>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={stroke}
          className="text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors"
          style={{
            background: aligned ? 'rgba(255,255,255,0.05)' : `${N_RED}22`,
            color: aligned ? 'rgba(255,255,255,0.5)' : N_RED,
            borderColor: aligned ? 'transparent' : `${N_RED}66`,
          }}
        >
          Stroke it with a magnet
        </button>
        <button
          onClick={heat}
          className="text-[11px] font-semibold px-2.5 py-1 rounded border border-transparent bg-white/5 text-white/50 transition-colors hover:text-white/80"
        >
          Heat it up
        </button>
        <button
          onClick={hammer}
          className="text-[11px] font-semibold px-2.5 py-1 rounded border border-transparent bg-white/5 text-white/50 transition-colors hover:text-white/80"
        >
          Hit it with a hammer
        </button>
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        {/* the iron bar, with its poles showing only when aligned */}
        <div className="flex items-center gap-2">
          <div
            className="text-sm font-bold w-5 text-center transition-all duration-500"
            style={{ color: aligned ? S_GREEN : 'transparent' }}
          >
            S
          </div>

          <div
            className="flex-1 rounded-md border-2 p-2 transition-all duration-500"
            style={{
              borderColor: aligned ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.03)',
              boxShadow: aligned ? '0 0 22px -6px rgba(224,83,61,0.55)' : 'none',
            }}
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center justify-center" style={{ aspectRatio: '2 / 1' }}>
                  <div
                    className="w-full h-2.5 rounded-full flex overflow-hidden transition-transform duration-700 ease-out"
                    style={{
                      transform: `rotate(${aligned ? 0 : JUMBLED[i % JUMBLED.length]}deg)`,
                    }}
                  >
                    <div className="w-1/2 h-full" style={{ background: S_GREEN }} />
                    <div className="w-1/2 h-full" style={{ background: N_RED }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="text-sm font-bold w-5 text-center transition-all duration-500"
            style={{ color: aligned ? N_RED : 'transparent' }}
          >
            N
          </div>
        </div>

        {/* paperclip test */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.07]">
          <div className="text-[10px] uppercase tracking-wide text-white/35">Paperclip test</div>
          <div
            className="text-[11px] font-semibold transition-colors duration-500"
            style={{ color: aligned ? N_RED : 'rgba(255,255,255,0.4)' }}
          >
            {aligned ? 'Paperclips stick to the ends' : 'Paperclips just fall off'}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3">
        <div className="text-[11px] font-bold mb-1" style={{ color: aligned ? N_RED : 'rgba(255,255,255,0.55)' }}>
          {aligned ? 'It IS a magnet' : 'NOT a magnet'}
        </div>
        <div className="text-xs text-white/55 leading-snug">{lastAction}</div>
      </div>
    </div>
  );
}
