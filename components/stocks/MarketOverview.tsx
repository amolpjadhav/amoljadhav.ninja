'use client';

import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/lib/stocks';
import { formatPct, formatPrice } from '@/lib/stocks';

const UP = '#4ade80';
const DOWN = '#e07856';

export interface StripData {
  strip: MarketQuote[];
  asOf: string;
}

export interface MoversData {
  gainers: MarketQuote[];
  losers: MarketQuote[];
  trending: MarketQuote[];
  mag7: MarketQuote[];
}

// Split fetches so the 7-symbol strip paints while the 40-stock movers
// fan-out still runs; each half skeletons independently below.
function useMarkets<T>(url: string, valid: (j: unknown) => j is T): { data: T | null; loaded: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!live) return;
        setData(valid(j) ? j : null);
        setLoaded(true);
      })
      .catch(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, [url, valid]);
  return { data, loaded };
}

const isStripData = (j: unknown): j is StripData => !!j && Array.isArray((j as StripData).strip);

const isMoversData = (j: unknown): j is MoversData =>
  !!j && Array.isArray((j as MoversData).gainers) && Array.isArray((j as MoversData).mag7);

export function useMarketStrip(): { data: StripData | null; loaded: boolean } {
  return useMarkets('/api/markets/strip', isStripData);
}

export function useMarketMovers(): { data: MoversData | null; loaded: boolean } {
  return useMarkets('/api/markets/movers', isMoversData);
}

function moveColor(changePct: number | null, change: number | null): string {
  const v = changePct ?? change ?? 0;
  if (v > 0) return UP;
  if (v < 0) return DOWN;
  return 'rgba(255,255,255,0.4)';
}

// Intraday spark with a dashed previous-close reference. Series and
// reference share one value domain so the line sits truthfully.
function SparkWithRef({
  values,
  reference,
  color,
  width = 136,
  height = 34,
}: {
  values: number[];
  reference: number | null;
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return <div style={{ width, height }} aria-hidden />;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (reference !== null && Number.isFinite(reference)) {
    min = Math.min(min, reference);
    max = Math.max(max, reference);
  }
  if (max === min) {
    min -= 1;
    max += 1;
  }
  const pad = 3;
  const x = (i: number) => pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  const pts =
    values.length === 1
      ? `${pad},${y(values[0])} ${width - pad},${y(values[0])}`
      : values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} aria-hidden>
      {reference !== null && Number.isFinite(reference) && (
        <line
          x1={0}
          x2={width}
          y1={y(reference)}
          y2={y(reference)}
          stroke={color}
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StripSkeleton() {
  return (
    <div
      className="flex overflow-hidden divide-x divide-white/10 bg-white/[0.03] rounded-xl animate-pulse"
      aria-hidden
      aria-label="Loading markets"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="shrink-0 w-[164px] p-3.5">
          <div className="h-3.5 w-20 bg-white/10 rounded" />
          <div className="h-[34px] w-[136px] bg-white/[0.07] rounded mt-2" />
          <div className="h-3 w-24 bg-white/10 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

export function MarketStrip({ data, loaded }: { data: StripData | null; loaded: boolean }) {
  if (loaded && (!data || data.strip.length === 0)) return null;
  const day = data ? new Date(data.asOf).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Markets today</h2>
        {day ? (
          <p className="text-[11px] text-white/30 truncate">
            <span className="sm:hidden">Delayed · {day}</span>
            <span className="hidden sm:inline">Delayed 15 min · {day} · dashed = prev close</span>
          </p>
        ) : (
          <div className="h-3 w-40 bg-white/10 rounded animate-pulse" aria-hidden />
        )}
      </div>
      {!loaded || !data ? (
        <StripSkeleton />
      ) : (
      <div className="flex overflow-x-auto divide-x divide-white/10 bg-white/[0.03] rounded-xl">
        {data.strip.map((q) => {
          const color = moveColor(q.changePct, q.change);
          return (
            <div key={q.symbol} className="shrink-0 w-[164px] p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-bold text-white/90 truncate">{q.label}</p>
                <p className="hidden sm:block text-xs font-bold tabular-nums shrink-0" style={{ color }}>
                  {formatPct(q.changePct)}
                </p>
              </div>
              <div className="mt-2">
                <SparkWithRef values={q.spark} reference={q.prevClose} color={color} />
              </div>
              {/* Mobile stacks label / spark / move; desktop adds the proxy + price line. */}
              <p className="sm:hidden text-xs font-bold tabular-nums mt-2" style={{ color }}>
                {formatPct(q.changePct)}
              </p>
              <p className="hidden sm:block text-[11px] text-white/40 tabular-nums mt-2 font-mono">
                {q.via ?? q.symbol} {formatPrice(q.price)}
              </p>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers', label: 'Losers' },
  { key: 'mag7', label: 'Mag 7' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// Mobile: two columns (company stack | price stack), no header or spark.
// sm+: the full 4-column table. The price/pill wrapper below dissolves via
// sm:contents so both layouts share one grid definition.
const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.4fr)_130px_auto_92px] gap-x-4 items-center';

function TabsSkeleton() {
  return (
    <div
      className="flex gap-1 bg-white/5 rounded-full p-1 w-fit max-w-full animate-pulse"
      aria-hidden
      aria-label="Loading movers"
    >
      {[64, 56, 48, 44].map((w, i) => (
        <div key={i} className="h-7 rounded-full bg-white/10" style={{ width: w }} />
      ))}
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/[0.07] rounded hidden sm:block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 bg-white/10 rounded" />
            <div className="h-6 w-16 bg-white/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MoverTiles({
  data,
  loaded,
  onSelect,
}: {
  data: MoversData | null;
  loaded: boolean;
  onSelect: (ticker: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>('trending');
  const rows: Record<TabKey, MarketQuote[]> = {
    trending: data?.trending ?? [],
    gainers: data?.gainers ?? [],
    losers: data?.losers ?? [],
    mag7: data?.mag7 ?? [],
  };
  const available = TABS.filter((t) => rows[t.key].length > 0);
  if (loaded && available.length === 0) return null;
  const active = available.some((t) => t.key === tab) ? tab : (available[0]?.key ?? 'trending');
  return (
    <div className="mt-10">
      {/* Breakpoint-driven, never flex-wrap: content-based wrapping made
          the tab bar jump when switching tabs near the breakpoint. */}
      <div className="flex flex-col gap-3 mb-1 md:flex-row md:items-end md:justify-between">
        <h2 className="font-serif text-3xl font-bold text-white/95">Today&apos;s movers</h2>
        {/* nowrap + shrink-0: "Mag 7" is the only label with a space and
            used to wrap under squeeze, resizing the whole bar per tab. */}
        {loaded ? (
        <div
          className="flex gap-1 bg-white/5 rounded-full p-1 max-w-full overflow-x-auto"
          role="tablist"
          aria-label="Movers"
        >
          {available.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === active}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                t.key === active ? 'bg-[#ece7db] text-black' : 'text-white/55 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        ) : (
          <TabsSkeleton />
        )}
      </div>
      {loaded ? (
      <>
      <div className={`hidden ${ROW_GRID} text-[11px] font-bold uppercase tracking-widest text-white/35 pt-3 pb-2 border-b border-white/10 sm:grid`}>
        <span>Company</span>
        <span className="hidden sm:block">Today</span>
        <span className="text-right">Price</span>
        <span className="text-right">Change</span>
      </div>
      <div>
        {rows[active].map((q) => {
          const color = moveColor(q.changePct, q.change);
          return (
            <button
              key={q.symbol}
              type="button"
              onClick={() => onSelect(q.symbol)}
              className={`${ROW_GRID} w-full text-left py-3 sm:py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors`}
            >
              <span className="flex flex-col gap-0.5 min-w-0 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="sm:w-16 shrink-0 text-sm font-bold text-white/95">{q.symbol}</span>
                <span className="text-sm text-white/45 truncate">{q.name ?? q.label}</span>
              </span>
              <span className="hidden sm:block">
                <SparkWithRef values={q.spark} reference={q.prevClose} color={color} width={130} height={30} />
              </span>
              <span className="flex flex-col items-end gap-1 sm:contents">
                <span className="text-sm font-semibold text-white/95 tabular-nums sm:text-right">
                  {formatPrice(q.price)}
                </span>
                <span
                  className="min-w-[64px] text-center text-xs font-bold tabular-nums px-2 py-1 rounded-md sm:justify-self-end"
                  style={{ color, background: `${color}26` }}
                >
                  {formatPct(q.changePct)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      </>
      ) : (
        <RowsSkeleton />
      )}
    </div>
  );
}
