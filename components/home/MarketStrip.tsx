'use client';

import { useEffect, useId, useState } from 'react';
import { formatChangePct, type ChangeTone, type StripItem } from '@/lib/homepage';
import { SESSION_START_LABEL, marketStatus, type MarketStatus } from '@/lib/market-hours';
import { FILL_ABOVE, FILL_BELOW, TONE_STROKE, TONE_TEXT } from './tone';

// Index rows + intraday chart for the Stock Lookup tool card. Client-side
// for two reasons: picking a row swaps the chart, and the market status line
// has to be read off the viewer's clock rather than baked into a cached
// server render that might be hours old.

const VIEW_W = 100;
const VIEW_H = 40;
const PAD = 3;

function IntradayChart({
  points,
  prevClose,
  tone,
}: {
  points: number[];
  prevClose: number | null;
  tone: ChangeTone;
}) {
  // Clip paths live in a global id namespace; useId keeps two charts on one
  // page from stealing each other's.
  const clipId = useId().replace(/:/g, '');
  if (points.length < 2) return null;
  // The baseline joins the domain so the dashed line can never fall outside
  // the box on a day that only moved one way.
  const hasBase = prevClose !== null && Number.isFinite(prevClose);
  const values = hasBase ? [...points, prevClose] : points;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * VIEW_W;
  const y = (v: number) => VIEW_H - PAD - ((v - min) / range) * (VIEW_H - PAD * 2);

  const line = points.map((p, i) => `${x(i).toFixed(2)},${y(p).toFixed(2)}`).join(' ');
  const baseY = hasBase ? y(prevClose) : null;
  // Closes the price line back along the previous close, so the shaded gap
  // reads as "how far from where the day started" at a glance. Drawn twice
  // and clipped at the baseline: the stretch of the day spent above the
  // previous close shades green even on a red day, which is the whole point
  // of having a reference line.
  const area =
    baseY === null
      ? null
      : `M 0,${baseY.toFixed(2)} L ${points
          .map((p, i) => `${x(i).toFixed(2)},${y(p).toFixed(2)}`)
          .join(' L ')} L ${VIEW_W},${baseY.toFixed(2)} Z`;

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      {area && baseY !== null && (
        <>
          <defs>
            <clipPath id={`${clipId}-above`}>
              <rect x={0} y={0} width={VIEW_W} height={baseY} />
            </clipPath>
            <clipPath id={`${clipId}-below`}>
              <rect x={0} y={baseY} width={VIEW_W} height={VIEW_H - baseY} />
            </clipPath>
          </defs>
          <path d={area} fill={FILL_ABOVE} stroke="none" clipPath={`url(#${clipId}-above)`} />
          <path d={area} fill={FILL_BELOW} stroke="none" clipPath={`url(#${clipId}-below)`} />
        </>
      )}
      {baseY !== null && (
        <line
          x1={0}
          x2={VIEW_W}
          y1={baseY}
          y2={baseY}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <polyline
        points={line}
        fill="none"
        stroke={TONE_STROKE[tone]}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function MarketStrip({ items }: { items: StripItem[] }) {
  const [selected, setSelected] = useState(() => {
    const i = items.findIndex((s) => s.label === 'S&P 500');
    return i === -1 ? 0 : i;
  });
  // Null until mount: the server has no business guessing whether the market
  // is open for the reader, and a mismatch here would be a hydration error.
  const [status, setStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(marketStatus(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const active = items[selected];
  if (!active) return null;
  const activeMove = formatChangePct(active.changePct);

  return (
    <div>
      <p className="mb-2 flex min-h-4 items-center gap-1.5 font-mono text-[11px] text-white/35">
        {status && (
          <>
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${status.live ? 'bg-[#0aee3c]/80' : 'bg-white/25'}`}
            />
            {status.text}
          </>
        )}
      </p>

      <div className="font-mono text-xs">
        {items.map((item, i) => {
          const move = formatChangePct(item.changePct);
          const isActive = i === selected;
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={isActive}
              aria-label={`${item.label}, ${move.text}. Show in chart.`}
              onClick={() => setSelected(i)}
              className={`-mx-1.5 flex w-full items-baseline justify-between gap-2 rounded px-1.5 py-0.5 text-left transition-colors ${
                isActive ? 'bg-[#0aee3c]/[0.08]' : 'hover:bg-white/[0.04]'
              }`}
            >
              <span className={isActive ? 'text-white/85' : 'text-white/50'}>{item.label}</span>
              <span className={TONE_TEXT[move.tone]}>{move.text}</span>
            </button>
          );
        })}
      </div>

      {active.spark.length >= 2 && (
        <div className="mt-2">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <p className="font-mono text-[11px] text-white/45">{active.label}</p>
            {active.prevClose !== null && (
              <p className="flex items-center gap-1 font-mono text-[10px] text-white/25">
                <span aria-hidden className="inline-block w-3 border-t border-dashed border-white/30" />
                prev close
              </p>
            )}
          </div>
          <IntradayChart points={active.spark} prevClose={active.prevClose} tone={activeMove.tone} />
          <div className="mt-0.5 flex justify-between font-mono text-[10px] text-white/25">
            <span>{SESSION_START_LABEL}</span>
            <span>{status?.endLabel ?? ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
