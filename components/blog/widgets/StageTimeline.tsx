'use client';

import { useState } from 'react';

interface Segment {
  stage: string;
  minutes: number;
}

// Generic "discrete states over time" chart, drawn as a stepped line —
// the standard way a sleep hypnogram is plotted, but reusable for any
// sequence of named states with durations. Pass data-stages (ordered
// top-to-bottom) and data-segments='[{"stage":...,"minutes":...}, ...]'.
const DEFAULT_STAGES = ['Awake', 'REM', 'N1', 'N2', 'N3 (deep)'];
const DEFAULT_SEGMENTS: Segment[] = [
  { stage: 'Awake', minutes: 5 },
  { stage: 'N1', minutes: 5 },
  { stage: 'N2', minutes: 25 },
  { stage: 'N3 (deep)', minutes: 40 },
  { stage: 'N2', minutes: 10 },
  { stage: 'REM', minutes: 5 },
];
const DEFAULT_EYEBROW = 'A typical night';
const DEFAULT_CAPTION = '';
const DEFAULT_HIGHLIGHT = 'REM';

const VIEW_W = 640;
const ROW_H = 30;
const PLOT_LEFT = 78;
const PLOT_RIGHT = 620;
const PLOT_TOP = 16;

export default function StageTimeline({
  stages,
  segments,
  eyebrow,
  caption,
  accentColor,
  highlightStage,
}: {
  stages?: string;
  segments?: string;
  eyebrow?: string;
  caption?: string;
  accentColor?: string;
  highlightStage?: string;
}) {
  const stageList: string[] = stages ? JSON.parse(stages) : DEFAULT_STAGES;
  const data: Segment[] = segments ? JSON.parse(segments) : DEFAULT_SEGMENTS;
  const accent = accentColor || '#5b9bf5';
  const highlight = highlightStage ?? DEFAULT_HIGHLIGHT;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const total = data.reduce((sum, s) => sum + s.minutes, 0);
  const plotH = stageList.length * ROW_H;
  const viewH = PLOT_TOP + plotH + 34;

  function rowY(stage: string) {
    const i = stageList.indexOf(stage);
    return PLOT_TOP + (i < 0 ? 0 : i) * ROW_H + ROW_H / 2;
  }
  function timeX(minutes: number) {
    return PLOT_LEFT + (minutes / total) * (PLOT_RIGHT - PLOT_LEFT);
  }

  // Walk the segments once, building both the stepped path and the
  // per-segment spans (kept for hover + REM highlighting).
  let elapsed = 0;
  const spans = data.map((seg) => {
    const start = elapsed;
    elapsed += seg.minutes;
    return { ...seg, start, end: elapsed, y: rowY(seg.stage) };
  });

  const pathParts: string[] = [];
  spans.forEach((s, i) => {
    if (i === 0) pathParts.push(`M ${timeX(s.start)} ${s.y}`);
    else pathParts.push(`L ${timeX(s.start)} ${s.y}`);
    pathParts.push(`L ${timeX(s.end)} ${s.y}`);
  });

  const hourTicks = Array.from({ length: Math.floor(total / 60) + 1 }, (_, i) => i);
  const active = hoverIdx !== null ? spans[hoverIdx] : null;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || DEFAULT_EYEBROW}</p>
      {(caption || DEFAULT_CAPTION) && (
        <p className="text-white/70 text-sm mb-4">{caption || DEFAULT_CAPTION}</p>
      )}

      <div className="bg-black/30 rounded-lg overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className="w-full h-auto" style={{ minWidth: 420 }}>
          {stageList.map((stage, i) => {
            const y = PLOT_TOP + i * ROW_H + ROW_H / 2;
            return (
              <g key={stage}>
                <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={PLOT_LEFT - 10} y={y} textAnchor="end" dominantBaseline="central" fontSize={10} fill="rgba(255,255,255,0.5)">
                  {stage}
                </text>
              </g>
            );
          })}

          {hourTicks.map((h) => (
            <text key={h} x={timeX(h * 60)} y={PLOT_TOP + plotH + 20} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">
              {h}h
            </text>
          ))}

          <path d={pathParts.join(' ')} fill="none" stroke={accent} strokeWidth={1.75} strokeLinejoin="round" />

          {spans.map((s, i) =>
            s.stage === highlight ? (
              <line
                key={`hl-${i}`}
                x1={timeX(s.start)}
                y1={s.y}
                x2={timeX(s.end)}
                y2={s.y}
                stroke="#c084fc"
                strokeWidth={4}
                strokeLinecap="round"
              />
            ) : null
          )}

          {spans.map((s, i) => (
            <rect
              key={`hit-${i}`}
              x={timeX(s.start)}
              y={PLOT_TOP}
              width={Math.max(1, timeX(s.end) - timeX(s.start))}
              height={plotH}
              fill={hoverIdx === i ? 'rgba(255,255,255,0.05)' : 'transparent'}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>
      </div>

      <div className="border-t border-white/10 mt-4 pt-3 flex items-center justify-between gap-4">
        <p className="text-[10px] text-white/40 flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full inline-block" style={{ background: '#c084fc' }} /> {highlight}
        </p>
        <p className="text-xs text-white/70">
          {active ? (
            <>
              <span className="font-semibold text-white/90">{active.stage}</span> &middot; {active.minutes} min, starting{' '}
              {Math.floor(active.start / 60)}h {active.start % 60}m in
            </>
          ) : (
            <span className="text-white/40">Hover a segment for detail</span>
          )}
        </p>
      </div>
    </div>
  );
}
