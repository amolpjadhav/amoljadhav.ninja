'use client';

interface Gate {
  question: string;
  failTitle: string;
  failDetail?: string;
}

// A linear flowchart: a spine of yes/no gates that must all pass, with each
// "no" branching off to the side as a named failure. Reusable anywhere an
// article walks through "all of these must be true, and here's what it
// looks like when each one isn't."
//
// Note on styling: articles are rendered inside `.article-content`, which
// sets a serif font and `p { margin: 0 0 1.6em }` via plain CSS (not the
// Tailwind typography plugin, so `not-prose` does NOT neutralize it). This
// widget therefore uses <div> rather than <p> for text, and pins font-sans
// on the root, so article styles can't inflate the layout.
const ARROW_DOWN = (
  <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden>
    <path d="M4.5 0 L4.5 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" />
    <path d="M1.5 9.5 L4.5 14 L7.5 9.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" />
  </svg>
);

export default function DecisionFlow({
  startTitle,
  gates,
  endTitle,
  endDetail,
  gateColor,
  failColor,
  endColor,
  eyebrow,
  caption,
}: {
  startTitle?: string;
  gates?: string;
  endTitle?: string;
  endDetail?: string;
  gateColor?: string;
  failColor?: string;
  endColor?: string;
  eyebrow?: string;
  caption?: string;
}) {
  const list: Gate[] = gates ? JSON.parse(gates) : [];
  const gColor = gateColor || '#5b9bf5';
  const fColor = failColor || '#f0a35e';
  const eColor = endColor || '#4ade80';

  const GRID = 'grid grid-cols-[minmax(0,1fr)_26px_minmax(0,0.8fr)]';

  return (
    <div className="not-prose font-sans bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      {eyebrow && <div className="text-xs uppercase tracking-wide text-white/40 mb-1 font-sans">{eyebrow}</div>}
      {caption && <div className="text-white/70 text-sm mb-4 font-sans leading-snug">{caption}</div>}

      <div className="bg-black/30 rounded-lg p-4 font-sans">
        {startTitle && (
          <div className={GRID}>
            <div className="flex flex-col items-center">
              <div className="rounded-full border border-white/15 bg-black/40 px-4 py-1">
                <div className="text-[11px] font-semibold text-white/70 whitespace-nowrap">{startTitle}</div>
              </div>
              <div className="py-1">{ARROW_DOWN}</div>
            </div>
            <div />
            <div />
          </div>
        )}

        {list.map((g, i) => (
          <div key={i} className={GRID}>
            {/* the gate itself, on the spine */}
            <div
              className="rounded-md border bg-black/40 px-3 py-2 flex items-center"
              style={{ borderColor: `${gColor}55` }}
            >
              <div className="text-[11px] sm:text-xs font-semibold text-white/85 leading-tight">{g.question}</div>
            </div>

            {/* horizontal NO arrow into the failure box */}
            <div className="relative flex items-center justify-center" aria-hidden>
              <svg width="26" height="9" viewBox="0 0 26 9">
                <path d="M0 4.5 L20 4.5" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" />
                <path d="M17.5 1.5 L22 4.5 L17.5 7.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" />
              </svg>
              <span className="absolute -top-2.5 text-[8px] font-bold tracking-wide" style={{ color: fColor }}>
                NO
              </span>
            </div>

            {/* the failure outcome, off the spine */}
            <div
              className="rounded-md border px-2.5 py-1.5 flex flex-col justify-center"
              style={{ borderColor: `${fColor}3d`, background: `${fColor}0d` }}
            >
              <div className="text-[10px] sm:text-[11px] font-semibold leading-tight" style={{ color: fColor }}>
                {g.failTitle}
              </div>
              {g.failDetail && (
                <div className="text-[9px] sm:text-[10px] text-white/40 leading-tight mt-0.5">{g.failDetail}</div>
              )}
            </div>

            {/* YES continues down the spine */}
            <div className="relative flex justify-center py-1.5">
              {ARROW_DOWN}
              <span className="absolute left-1/2 ml-2.5 top-2 text-[8px] font-bold tracking-wide text-white/35">
                YES
              </span>
            </div>
            <div />
            <div />
          </div>
        ))}

        {endTitle && (
          <div className={GRID}>
            <div
              className="rounded-md border px-3 py-2.5 text-center"
              style={{ borderColor: `${eColor}55`, background: `${eColor}12` }}
            >
              <div className="text-xs font-bold leading-tight" style={{ color: eColor }}>
                {endTitle}
              </div>
              {endDetail && <div className="text-[10px] text-white/50 leading-tight mt-1">{endDetail}</div>}
            </div>
            <div />
            <div />
          </div>
        )}
      </div>
    </div>
  );
}
