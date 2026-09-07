'use client';

import { COUNTRIES, FLAG_FAMILIES, flagUrl } from './countryFlagData';

// A row of flags dropped straight into the prose, so a sentence like "one idea,
// six flags" is followed by the six flags rather than asking the reader to take
// it on trust. Deliberately lighter than the browser and the quiz: no card, no
// eyebrow, no controls. It is an illustration, not a widget.
//
// Takes either a family id or an explicit list of ISO codes, which lets the
// same component show the Nordic crosses and the Chad/Romania pair.
//
// Styling notes:
//  - `.article-content img` is display:none outside Travel posts, so each flag
//    carries `widget-img` to opt out.
//  - The placeholder should carry data-inline, which excludes it from the
//    full-bleed treatment the big widgets get on mobile.

export default function FlagRow({
  family,
  codes,
  note,
}: {
  family?: string;
  codes?: string;
  note?: string;
}) {
  const wanted = codes
    ? codes
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
    : (FLAG_FAMILIES.find((f) => f.id === family)?.codes ?? []);

  const shown = wanted
    .map((code) => COUNTRIES.find((c) => c.code === code))
    .filter((c): c is (typeof COUNTRIES)[number] => Boolean(c));

  if (!shown.length) return null;

  return (
    <div className="not-prose font-sans my-4 rounded-lg px-3 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex flex-wrap gap-x-3 gap-y-2.5">
        {shown.map((c) => (
          <div key={c.code} className="flex flex-col items-center" style={{ width: 62 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagUrl(c.code, 160)}
              alt={`Flag of ${c.name}`}
              loading="lazy"
              className="widget-img rounded border border-white/15"
              style={{ width: 62, aspectRatio: '4 / 3', objectFit: 'cover', background: 'rgba(255,255,255,0.04)' }}
            />
            <span className="text-[10px] text-white/55 leading-tight text-center mt-1">{c.name}</span>
          </div>
        ))}
      </div>
      {note && <div className="text-[11px] text-white/40 leading-snug mt-2.5">{note}</div>}
    </div>
  );
}
