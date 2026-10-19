'use client';

import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/lib/stocks';
import { formatCompact, formatPct, formatPrice } from '@/lib/stocks';
import { marketPhase, marketStatus } from '@/lib/market-hours';
import { newsAge, type NewsItem } from '@/lib/news';

// Same red as the homepage and profile tables: a down day is red
// everywhere, never orange here and red there.
const UP = '#4ade80';
const DOWN = '#f87171';

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
  // Dust either way reads as flat gray, matching formatPct's 0.00%.
  if (Math.abs(v) * 100 < 0.005) return 'rgba(255,255,255,0.4)';
  if (v > 0) return UP;
  if (v < 0) return DOWN;
  return 'rgba(255,255,255,0.4)';
}

// Index points are not dollars: NDX prints "30,569.48 pts", never $.
function formatPoints(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// The honest sub-line for a strip card. Five of the seven rows are ETF
// trackers, not the thing they track, so the proxy ticker and its price
// are always named ("via SPY · $778.01"); the one true index quote shows
// points. Bitcoin's 24/7 badge sits by its label instead, keeping this
// line to one row on every card.
function stripMeta(q: MarketQuote): string {
  // One row on a 128px card means ≤17 characters: ETFs keep "via",
  // the index shows points (label already says Nasdaq 100), and Bitcoin
  // rounds to whole dollars (sub-dollar precision is noise at $83k).
  if (q.symbol === 'BTC') {
    const whole = q.price !== null && q.price !== undefined && Number.isFinite(q.price)
      ? `$${Math.round(q.price).toLocaleString('en-US')}`
      : '—';
    return `${q.via ?? 'Coinbase'} ${whole}`;
  }
  if (q.via) return `via ${q.via} · ${formatPrice(q.price)}`;
  return `${formatPoints(q.price)} pts`;
}

// Monogram avatar until logo-API terms + a key are sorted: deterministic
// hue per symbol, first letter. Stands in wherever a logo would go.
const MONO_HUES = [152, 210, 268, 18, 330, 45, 190, 100, 290, 0];
export function Monogram({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'md' }) {
  const clean = symbol.replace(/[^A-Za-z]/g, '');
  const letter = (clean[0] ?? '?').toUpperCase();
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) % 997;
  const cls = size === 'md' ? 'w-11 h-11 text-lg' : 'w-6 h-6 text-[11px]';
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold font-sans text-white/90 ${cls}`}
      style={{ background: `hsl(${MONO_HUES[h % MONO_HUES.length]} 45% 30%)` }}
    >
      {letter}
    </span>
  );
}

// Intraday spark with a dashed previous-close reference. Series and
// reference share one value domain so the line sits truthfully. The line
// draws in on paint (.spark-draw, motion-safe); hovering shows a crosshair
// with time + price when timestamps ride along.
function formatSparkTime(t: number | undefined): string | null {
  if (t === undefined || !Number.isFinite(t)) return null;
  const ms = t > 1e12 ? t : t > 1e9 ? t * 1000 : NaN;
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function SparkWithRef({
  values,
  reference,
  color,
  width = 136,
  height = 34,
  times,
}: {
  values: number[];
  reference: number | null;
  color: string;
  width?: number;
  height?: number;
  times?: number[];
}) {
  const [hover, setHover] = useState<number | null>(null);
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
  const n = values.length;
  const x = (i: number) => pad + (i / Math.max(n - 1, 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  const pts =
    n === 1
      ? `${pad},${y(values[0])} ${width - pad},${y(values[0])}`
      : values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const hov = hover !== null && times?.length === n ? hover : null;
  const hovTime = hov !== null ? formatSparkTime(times?.[hov]) : null;
  return (
    <span
      className="relative block"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const frac = n <= 1 ? 0 : (e.clientX - rect.left) / rect.width;
        setHover(Math.min(n - 1, Math.max(0, Math.round(frac * (n - 1)))));
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden
        className="w-full h-auto block"
      >
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
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="spark-draw"
        />
        {hov !== null && (
          <>
            <line x1={x(hov)} x2={x(hov)} y1={0} y2={height} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
            <circle cx={x(hov)} cy={y(values[hov])} r={3} fill={color} />
          </>
        )}
      </svg>
      {hov !== null && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded border border-white/15 bg-black/85 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white/85"
          style={{ left: `${(x(hov) / width) * 100}%`, transform: 'translate(-50%, -100%)' }}
        >
          {hovTime ? `${hovTime} · ` : ''}
          {formatPrice(values[hov])}
        </span>
      )}
    </span>
  );
}

// Thin full-width ticker tape: indexes + movers, one line, continuous
// scroll. The second copy is aria-hidden so readers hear it once. Motion
// (and only motion) is gated in CSS: reduced-motion gets a static row.
export function TickerTape({ items }: { items: MarketQuote[] }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((q) => {
        const v = q.changePct ?? q.change ?? 0;
        const color = moveColor(q.changePct, q.change);
        return (
          <span key={q.symbol} className="flex items-center gap-1.5 px-4 font-mono text-xs tabular-nums">
            <span className="font-bold text-white/80">{q.symbol}</span>
            <span style={{ color }}>
              {v > 0 ? '▲' : v < 0 ? '▼' : '•'} {formatPct(q.changePct)}
            </span>
          </span>
        );
      })}
    </div>
  );
  return (
    <div className="tape overflow-hidden border-y border-white/10 bg-black/60" role="marquee" aria-label="Market snapshot">
      <div className="tape-track flex h-8 items-center">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

function StripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 animate-pulse" aria-hidden aria-label="Loading markets">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.06] p-2">
          <div className="h-3.5 w-16 bg-white/10 rounded" />
          <div className="h-6 w-14 bg-white/10 rounded mt-1.5" />
          <div className="h-[34px] bg-white/[0.07] rounded mt-1.5" />
          <div className="h-3 w-20 bg-white/10 rounded mt-1.5" />
        </div>
      ))}
    </div>
  );
}

export function MarketStrip({ data, loaded }: { data: StripData | null; loaded: boolean }) {
  // Client clock like the homepage strip: the server must not guess the
  // market phase, and open/closed flips the status line.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const stamp = () => setNow(Date.now());
    stamp();
  }, []);
  const status = now !== null ? marketStatus(new Date(now)) : null;
  if (loaded && (!data || data.strip.length === 0)) return null;
  const day = data ? new Date(data.asOf).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;
  // Open → delayed quote; closed → last session. Bitcoin is 24/7, so its
  // card carries its own "24/7" source line instead.
  const line = status ? (status.live ? `Delayed 15 min${day ? ` · ${day}` : ''}` : status.text) : null;
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Markets today</h2>
        {line ? (
          <p className="text-[11px] text-white/30 truncate">
            {line}
            <span className="hidden sm:inline"> · dashed = prev close</span>
          </p>
        ) : (
          <div className="h-3 w-40 bg-white/10 rounded animate-pulse" aria-hidden />
        )}
      </div>
      {!loaded || !data ? (
        <StripSkeleton />
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Eight cards in a 4×2 grid: every slot filled, no empty eighth,
            no scroll. (Eight across would need ~1100px of article width.) */}
        {data.strip.map((q, i) => {
          const color = moveColor(q.changePct, q.change);
          return (
            <div
              key={q.symbol}
              className="min-w-0 rounded-xl border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl stagger-in"
              style={{ animationDelay: `${Math.min(i, 7) * 40}ms` }}
            >
              <p className="flex items-center gap-1 text-xs font-bold text-white/90 font-sans">
                <span className="truncate" title={q.label}>
                  {q.label}
                </span>
                {q.symbol === 'BTC' && (
                  <span className="shrink-0 rounded bg-white/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white/50">
                    24/7
                  </span>
                )}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums font-mono paint-flash" style={{ color }}>
                {formatPct(q.changePct)}
              </p>
              <div className="mt-1.5">
                <SparkWithRef values={q.spark} reference={q.prevClose} color={color} times={q.sparkT} />
              </div>
              <p className="text-[9px] text-white/40 tabular-nums mt-1.5 font-mono whitespace-nowrap">{stripMeta(q)}</p>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

const TABS = [
  // Ranked by today's dollar volume. Relative volume (vs 30-day average)
  // is the better signal but no keyless feed carries average volume, so
  // the tab says what it is instead of pretending to trend-spot.
  { key: 'trending', label: 'Most traded' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers', label: 'Losers' },
  { key: 'mag7', label: 'Mag 7' },
] as const;

type TabKey = (typeof TABS)[number]['key'] | 'afterhours';

// Mobile: company stack | price stack | chevron. sm+: company, spark,
// volume, price, change, chevron. The price/pill wrapper below dissolves
// via sm:contents so both layouts share one grid definition.
const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto_16px] sm:grid-cols-[minmax(0,1.4fr)_130px_90px_auto_92px_16px] gap-x-4 items-center';

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
  // "Why it's moving": latest ≤24h headline per mover, fetched once per
  // movers payload. Silence when a name has nothing fresh — never an
  // invented reason.
  const [reasons, setReasons] = useState<Record<string, NewsItem | null>>({});
  useEffect(() => {
    if (!loaded || !data) return;
    const symbols = [...data.trending, ...data.gainers, ...data.losers, ...data.mag7].map((q) => q.symbol);
    if (symbols.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/news?reasons=${encodeURIComponent(symbols.join(','))}`);
        const json = res.ok ? await res.json() : null;
        if (!cancelled && json?.reasons) setReasons(json.reasons);
      } catch {
        /* reasons are garnish; the table stands without them */
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, loaded]);

  const [tab, setTab] = useState<TabKey>('trending');
  // After-hours tab appears only once the session is done (viewer clock,
  // mounted like the strip status) and only when ranked rows actually
  // printed after the close.
  const [phase, setPhase] = useState<string | null>(null);
  useEffect(() => {
    const stamp = () => setPhase(marketPhase(new Date()));
    stamp();
  }, []);
  const ahUniverse = [...(data?.trending ?? []), ...(data?.gainers ?? []), ...(data?.losers ?? []), ...(data?.mag7 ?? [])];
  const afterhours = [...new Map(ahUniverse.map((q) => [q.symbol, q])).values()]
    .filter((q) => q.ahChangePct !== null && q.ahChangePct !== undefined && Math.abs(q.ahChangePct) >= 0.0005)
    .sort((a, b) => Math.abs(b.ahChangePct!) - Math.abs(a.ahChangePct!))
    .slice(0, 5);
  const showAh = phase !== null && phase !== 'open' && afterhours.length > 0;
  const rows: Record<TabKey, MarketQuote[]> = {
    trending: data?.trending ?? [],
    gainers: data?.gainers ?? [],
    losers: data?.losers ?? [],
    mag7: data?.mag7 ?? [],
    afterhours,
  };
  const allTabs: { key: TabKey; label: string }[] = [
    ...TABS,
    ...(showAh ? [{ key: 'afterhours' as const, label: 'After hours' }] : []),
  ];
  const available = allTabs.filter((t) => rows[t.key].length > 0);
  if (loaded && available.length === 0) return null;
  const active = available.some((t) => t.key === tab) ? tab : (available[0]?.key ?? 'trending');
  // Group move for the Mag 7 header: equal-weight mean of the day's moves.
  const mag7Moves = rows.mag7.map((q) => q.changePct).filter((v): v is number => v !== null);
  const mag7Move = mag7Moves.length > 0 ? mag7Moves.reduce((a, b) => a + b, 0) / mag7Moves.length : null;
  return (
    <div className="mt-10">
      {/* Breakpoint-driven, never flex-wrap: content-based wrapping made
          the tab bar jump when switching tabs near the breakpoint. */}
      <div className="flex flex-col gap-3 mb-1 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl font-bold text-white/95">Today&apos;s movers</h2>
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
      {active === 'mag7' && mag7Move !== null && (
        <p className="font-mono text-xs text-white/50 pt-1">
          Mag 7 <span className="font-bold tabular-nums" style={{ color: moveColor(mag7Move, null) }}>{formatPct(mag7Move)}</span> today
        </p>
      )}
      <div className={`hidden ${ROW_GRID} text-[11px] font-bold uppercase tracking-widest text-white/35 pt-3 pb-2 border-b border-white/10 sm:grid`}>
        <span>Company</span>
        <span className="hidden sm:block">Today</span>
        <span className="hidden sm:block">Volume</span>
        <span className="text-right">Price</span>
        <span className="text-right">{active === 'afterhours' ? 'After hrs' : 'Change'}</span>
        <span />
      </div>
      <div>
        {rows[active].map((q) => {
          // After-hours rows quote the extended session: pill is the move
          // vs the close, price is the last post-close print.
          const isAh = active === 'afterhours';
          const shownPct = isAh ? (q.ahChangePct ?? q.changePct) : q.changePct;
          const shownPrice = isAh && q.spark.length > 0 ? q.spark[q.spark.length - 1] : q.price;
          const color = moveColor(shownPct, null);
          return (
            <button
              key={q.symbol}
              type="button"
              onClick={() => onSelect(q.symbol)}
              aria-label={`${q.symbol}, ${formatPrice(shownPrice)}, ${formatPct(shownPct)}${isAh ? ' after hours' : ''}. Look up.`}
              className={`${ROW_GRID} w-full text-left py-3 sm:py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors`}
            >
              <span className="flex items-start gap-2 min-w-0">
                <Monogram symbol={q.symbol} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="sm:w-16 shrink-0 font-mono text-sm font-bold text-white/95">{q.symbol}</span>
                    <span className="text-sm text-white/45 truncate">{q.name ?? q.label}</span>
                  </span>
                  {reasons[q.symbol] && (
                    <span
                      className="truncate text-[11px] text-white/35"
                      title={`${reasons[q.symbol]!.headline} · ${reasons[q.symbol]!.source}`}
                    >
                      ↳ {reasons[q.symbol]!.headline.slice(0, 80)}
                      {reasons[q.symbol]!.headline.length > 80 ? '…' : ''} · {reasons[q.symbol]!.source} ·{' '}
                      {newsAge(reasons[q.symbol]!.datetime)}
                    </span>
                  )}
                </span>
              </span>
              <span className="hidden sm:block">
                <SparkWithRef values={q.spark} reference={q.prevClose} color={color} width={130} height={30} times={q.sparkT} />
              </span>
              <span className="hidden sm:block font-mono text-sm text-white/50 tabular-nums">
                {q.volume !== null && q.volume !== undefined ? formatCompact(q.volume) : '—'}
              </span>
              <span className="flex flex-col items-end gap-1 sm:contents">
                <span className="text-sm font-semibold text-white/95 tabular-nums font-mono sm:text-right">
                  {formatPrice(shownPrice)}
                </span>
                <span
                  className="w-[76px] shrink-0 text-right font-mono text-xs font-bold tabular-nums px-2 py-1 rounded-md sm:justify-self-end paint-flash"
                  style={{ color, background: `${color}26` }}
                >
                  {formatPct(shownPct)}
                </span>
              </span>
              <span aria-hidden className="text-white/25 justify-self-end">›</span>
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
