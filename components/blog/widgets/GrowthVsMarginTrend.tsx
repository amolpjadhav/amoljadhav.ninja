'use client';

import { useState } from 'react';

const DATA = [
  { label: "Q2'24", revenue: 39071, margin: 38 },
  { label: "Q3'24", revenue: 40589, margin: 43 },
  { label: "Q4'24", revenue: 48385, margin: 48 },
  { label: "Q1'25", revenue: 42314, margin: 41 },
  { label: "Q2'25", revenue: 47516, margin: 43 },
  { label: "Q3'25", revenue: 51242, margin: 40 },
  { label: "Q4'25", revenue: 59893, margin: 41 },
  { label: "Q1'26", revenue: 56311, margin: 41 },
  { label: "Q2'26", revenue: 60801, margin: 31 },
];

const VIEW_W = 600;
const VIEW_H = 260;
const PLOT_LEFT = 40;
const PLOT_RIGHT = 580;
const PLOT_TOP = 30;
const PLOT_BOTTOM = 210;
const MAX_REVENUE = 65000;
const MAX_MARGIN = 50;

const slotWidth = (PLOT_RIGHT - PLOT_LEFT) / DATA.length;
const barWidth = slotWidth * 0.55;

function barX(i: number) {
  return PLOT_LEFT + i * slotWidth + (slotWidth - barWidth) / 2;
}

function pointX(i: number) {
  return PLOT_LEFT + i * slotWidth + slotWidth / 2;
}

function revenueY(revenue: number) {
  return PLOT_BOTTOM - (revenue / MAX_REVENUE) * (PLOT_BOTTOM - PLOT_TOP);
}

function marginY(margin: number) {
  return PLOT_BOTTOM - (margin / MAX_MARGIN) * (PLOT_BOTTOM - PLOT_TOP);
}

const linePath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i)} ${marginY(d.margin)}`).join(' ');

export default function GrowthVsMarginTrend() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const active = hoverIdx !== null ? DATA[hoverIdx] : DATA[DATA.length - 1];

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Nine quarters</p>
      <p className="text-white/70 text-sm mb-4">
        Revenue (bars) has climbed almost every quarter. Operating margin (line) held in a steady 38&ndash;48% band
        for two years &mdash; until Q2 2026, when it dropped further in one quarter than in any other quarter shown
        here.
      </p>

      <div className="bg-black/30 rounded-lg mb-4 overflow-hidden">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
          {[0, 12.5, 25, 37.5, 50].map((tick) => (
            <line
              key={tick}
              x1={PLOT_LEFT}
              y1={marginY(tick)}
              x2={PLOT_RIGHT}
              y2={marginY(tick)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          {DATA.map((d, i) => {
            const isLast = i === DATA.length - 1;
            const isActive = hoverIdx === i;
            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={barX(i)}
                  y={revenueY(d.revenue)}
                  width={barWidth}
                  height={PLOT_BOTTOM - revenueY(d.revenue)}
                  fill={isActive ? '#5b9bf5' : 'rgba(91,155,245,0.5)'}
                  rx={2}
                />
                <text
                  x={pointX(i)}
                  y={PLOT_BOTTOM + 16}
                  fontSize={9}
                  fill="rgba(255,255,255,0.45)"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
                {isLast && (
                  <circle cx={pointX(i)} cy={marginY(d.margin)} r={5} fill="#ef4444" stroke="#1c1d20" strokeWidth={1.5} />
                )}
              </g>
            );
          })}

          <path d={linePath} fill="none" stroke="#facc15" strokeWidth={2} />
          {DATA.map((d, i) =>
            i === DATA.length - 1 ? null : (
              <circle key={d.label} cx={pointX(i)} cy={marginY(d.margin)} r={3} fill="#facc15" />
            )
          )}
        </svg>
      </div>

      <p className="text-[10px] text-white/40 mb-4 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#5b9bf5]/60 inline-block" /> revenue (bars, left scale)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-1 rounded-full bg-[#facc15] inline-block" /> operating margin (line, right scale, 0&ndash;50%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" /> Q2&rsquo;26 margin
        </span>
      </p>

      <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{active.label} revenue</p>
          <p className="text-white/90 text-lg font-semibold">${(active.revenue / 1000).toFixed(1)}B</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{active.label} operating margin</p>
          <p className="text-white/90 text-lg font-semibold">{active.margin}%</p>
        </div>
      </div>
    </div>
  );
}
