'use client';

import { useState } from 'react';

interface Point {
  label: string;
  value: number;
}

// Generic line-trend widget — reusable wherever an article needs to show
// one or two values moving over time together (a price, an index,
// purchasing power, or two quantities being compared, e.g. money supply
// vs. real output). Pass data-points='[{"label":...,"value":...}, ...]'
// as JSON, and optionally data-points-b for a second line.
const DEFAULT_DATA: Point[] = [
  { label: '1960', value: 35 },
  { label: '1965', value: 35 },
  { label: '1970', value: 36 },
  { label: '1971', value: 41 },
  { label: '1972', value: 58 },
  { label: '1973', value: 98 },
  { label: '1974', value: 159 },
  { label: '1976', value: 128 },
  { label: '1978', value: 197 },
  { label: '1979', value: 313 },
  { label: '1980', value: 626 },
];
const DEFAULT_EYEBROW = 'Price of gold, 1960–1980';
const DEFAULT_CAPTION =
  'Pegged at $35/oz for over a decade — then free to move once the U.S. left the gold standard in 1971. By 1980, it was worth almost 18 times as much.';
const DEFAULT_MARK_INDEX = 3;
const DEFAULT_MARK_LABEL = 'Nixon ends the gold standard';

const VIEW_W = 600;
const VIEW_H = 240;
const PLOT_LEFT = 44;
const PLOT_RIGHT = 580;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 190;

export default function LineTrend({
  points,
  pointsB,
  seriesALabel,
  seriesBLabel,
  eyebrow,
  caption,
  highlightColor,
  colorB,
  valuePrefix,
  valueSuffix,
  markIndex,
  markLabel,
  shadeFrom,
  shadeTo,
  shadeLabel,
}: {
  points?: string;
  pointsB?: string;
  seriesALabel?: string;
  seriesBLabel?: string;
  eyebrow?: string;
  caption?: string;
  highlightColor?: string;
  colorB?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  markIndex?: string;
  markLabel?: string;
  shadeFrom?: string;
  shadeTo?: string;
  shadeLabel?: string;
}) {
  const data: Point[] = points ? JSON.parse(points) : DEFAULT_DATA;
  const dataB: Point[] | null = pointsB ? JSON.parse(pointsB) : null;
  const prefix = valuePrefix ?? '$';
  const suffix = valueSuffix ?? '';
  const mark = markIndex !== undefined ? Number(markIndex) : dataB ? -1 : DEFAULT_MARK_INDEX;
  const markText = markLabel ?? (markIndex === undefined && !dataB ? DEFAULT_MARK_LABEL : undefined);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const active = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];
  const activeB = dataB ? (hoverIdx !== null ? dataB[hoverIdx] : dataB[dataB.length - 1]) : null;
  const accent = highlightColor || '#5b9bf5';
  const accentB = colorB || '#4ade80';

  const allValues = dataB ? [...data.map((d) => d.value), ...dataB.map((d) => d.value)] : data.map((d) => d.value);
  const maxValue = Math.max(...allValues) * 1.1;
  const slotWidth = (PLOT_RIGHT - PLOT_LEFT) / (data.length - 1);

  function pointX(i: number) {
    return PLOT_LEFT + i * slotWidth;
  }
  function valueY(value: number) {
    return PLOT_BOTTOM - (value / maxValue) * (PLOT_BOTTOM - PLOT_TOP);
  }
  function linePathFor(series: Point[]) {
    return series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i)} ${valueY(d.value)}`).join(' ');
  }

  const linePath = linePathFor(data);
  const areaPath = `${linePath} L ${pointX(data.length - 1)} ${PLOT_BOTTOM} L ${pointX(0)} ${PLOT_BOTTOM} Z`;
  const linePathB = dataB ? linePathFor(dataB) : null;
  const gridTicks = Array.from({ length: 5 }, (_, i) => (maxValue / 4) * i);

  // Optional shaded band over a range of x-indices, for calling out a
  // period rather than a single moment (e.g. the hours spent asleep).
  const shadeStart = shadeFrom !== undefined ? Number(shadeFrom) : null;
  const shadeEnd = shadeTo !== undefined ? Number(shadeTo) : null;
  const hasShade =
    shadeStart !== null &&
    shadeEnd !== null &&
    Number.isFinite(shadeStart) &&
    Number.isFinite(shadeEnd) &&
    shadeEnd > shadeStart;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || DEFAULT_EYEBROW}</p>
      <p className="text-white/70 text-sm mb-4">{caption || DEFAULT_CAPTION}</p>

      <div className="bg-black/30 rounded-lg mb-4 overflow-hidden">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
          {gridTicks.map((tick) => (
            <line
              key={tick}
              x1={PLOT_LEFT}
              y1={valueY(tick)}
              x2={PLOT_RIGHT}
              y2={valueY(tick)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          {hasShade && (
            <>
              <rect
                x={pointX(shadeStart!)}
                y={PLOT_TOP}
                width={pointX(shadeEnd!) - pointX(shadeStart!)}
                height={PLOT_BOTTOM - PLOT_TOP}
                fill="rgba(148,163,255,0.10)"
              />
              <line
                x1={pointX(shadeStart!)}
                y1={PLOT_TOP}
                x2={pointX(shadeStart!)}
                y2={PLOT_BOTTOM}
                stroke="rgba(148,163,255,0.35)"
                strokeWidth={1}
              />
              {shadeLabel && (
                <text
                  x={(pointX(shadeStart!) + pointX(shadeEnd!)) / 2}
                  y={PLOT_TOP + 12}
                  fontSize={10}
                  fill="rgba(148,163,255,0.8)"
                  textAnchor="middle"
                >
                  {shadeLabel}
                </text>
              )}
            </>
          )}

          {Number.isInteger(mark) && mark >= 0 && mark < data.length && (
            <>
              <line
                x1={pointX(mark)}
                y1={PLOT_TOP}
                x2={pointX(mark)}
                y2={PLOT_BOTTOM}
                stroke="#facc15"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              {markText && (
                <text x={pointX(mark) + 6} y={PLOT_TOP + 10} fontSize={9} fill="#facc15">
                  {markText}
                </text>
              )}
            </>
          )}

          {!dataB && <path d={areaPath} fill={accent} opacity={0.08} />}
          <path d={linePath} fill="none" stroke={accent} strokeWidth={2} />
          {linePathB && <path d={linePathB} fill="none" stroke={accentB} strokeWidth={2} strokeDasharray="5,3" />}

          {data.map((d, i) => {
            const isLast = i === data.length - 1;
            const isActive = hoverIdx === i;
            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pointX(i)}
                  cy={valueY(d.value)}
                  r={isLast || isActive ? 5 : 3}
                  fill={accent}
                  stroke="#1c1d20"
                  strokeWidth={1.5}
                />
                {dataB && (
                  <circle
                    cx={pointX(i)}
                    cy={valueY(dataB[i].value)}
                    r={isLast || isActive ? 5 : 3}
                    fill={accentB}
                    stroke="#1c1d20"
                    strokeWidth={1.5}
                  />
                )}
                <rect x={pointX(i) - slotWidth / 2} y={PLOT_TOP} width={slotWidth} height={PLOT_BOTTOM - PLOT_TOP} fill="transparent" />
                <text x={pointX(i)} y={PLOT_BOTTOM + 16} fontSize={9} fill="rgba(255,255,255,0.45)" textAnchor="middle">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {dataB && (
        <p className="text-[10px] text-white/40 mb-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1 rounded-full inline-block" style={{ background: accent }} /> {seriesALabel || 'Series A'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1 rounded-full inline-block" style={{ background: accentB }} /> {seriesBLabel || 'Series B'}
          </span>
        </p>
      )}

      <div className={`border-t border-white/10 pt-4 grid ${dataB ? 'grid-cols-2' : ''} gap-4`}>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
            {active.label}
            {dataB ? ` · ${seriesALabel || 'Series A'}` : ''}
          </p>
          <p className="text-white/90 text-lg font-semibold">
            {prefix}
            {active.value.toLocaleString()}
            {suffix}
          </p>
        </div>
        {dataB && activeB && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">
              {activeB.label} &middot; {seriesBLabel || 'Series B'}
            </p>
            <p className="text-white/90 text-lg font-semibold">
              {prefix}
              {activeB.value.toLocaleString()}
              {suffix}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
