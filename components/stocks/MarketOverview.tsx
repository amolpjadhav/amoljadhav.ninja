'use client';

import { useEffect, useState } from 'react';
import type { MarketQuote } from '@/lib/stocks';
import { formatCompact, formatPct, formatPrice } from '@/lib/stocks';
import { marketPhase, marketStatus } from '@/lib/market-hours';
import { newsAge, type NewsItem } from '@/lib/news';
import { nextEarningsFor as findNextEarnings, rankDay, visibleRows, beatVerdict, cleanTickers, earningsXIntentUrl, etTimeLabel, formatEps, formatMoneyShort, logoUrl, pickMove, previewShareText, quarterTip, reportTimingLabel, resultShareText, shortName, toggleInList, WATCHLIST_KEY, type EarningsCardType, type EnrichedEvent, type QuarterDetail } from '@/lib/earnings';
import { ChevronDown, Share2 } from 'lucide-react';

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

// The honest sub-line for a strip tile, shown in its tooltip. Six of the
// eight rows are ETF trackers, not the thing they track, so the proxy
// ticker and its price are always named ("via SPY · $778.01"); the one true
// index quote shows points. Bitcoin's 24/7 badge sits by its label instead.
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
export function Monogram({ symbol, size = 'sm' }: { symbol: string; size?: '2xs' | 'xs' | 'sm' | 'md' }) {
  const clean = symbol.replace(/[^A-Za-z]/g, '');
  const letter = (clean[0] ?? '?').toUpperCase();
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) % 997;
  const cls =
    size === 'md' ? 'w-11 h-11 text-lg' : size === 'xs' ? 'w-5 h-5 text-[9px]' : size === '2xs' ? 'w-4 h-4 text-[8px]' : 'w-6 h-6 text-[11px]';
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
    <div
      className="flex gap-2 overflow-hidden animate-pulse lg:grid lg:grid-cols-8 lg:overflow-visible"
      aria-hidden
      aria-label="Loading markets"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="w-[42vw] max-w-[200px] shrink-0 rounded-xl bg-white/[0.04] p-2 lg:w-auto lg:max-w-none">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-5 w-12 bg-white/10 rounded mt-1.5" />
          <div className="h-6 bg-white/[0.07] rounded mt-1.5" />
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
  // Tapped tile whose via/price line shows in the detail bar below the row.
  const [active, setActive] = useState<string | null>(null);
  if (loaded && (!data || data.strip.length === 0)) return null;
  const activeQuote = !loaded || !data ? null : (data.strip.find((x) => x.symbol === active) ?? null);
  const day = data ? new Date(data.asOf).toLocaleDateString([], { month: 'short', day: 'numeric' }) : null;
  // Open → delayed quote; closed → last session. Bitcoin is 24/7, so its
  // card carries its own "24/7" source line instead.
  const line = status ? (status.live ? `Delayed 15 min${day ? ` · ${day}` : ''}` : status.text) : null;
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-white/40">Markets today</h2>
        {line ? (
          <p className="text-[11px] text-white/30 truncate">
            {line} · dashed = prev close
          </p>
        ) : (
          <div className="h-3 w-40 bg-white/10 rounded animate-pulse" aria-hidden />
        )}
      </div>
      {!loaded || !data ? (
        <StripSkeleton />
      ) : (
      <>
      <div className="flex gap-2 overflow-x-auto snap-x pb-1 [mask-image:linear-gradient(to_right,#000_88%,transparent)] lg:grid lg:grid-cols-8 lg:overflow-visible lg:pb-0 lg:[mask-image:none]">
        {/* Eight compact tiles in one row: name, % and a 24px spark. The
            via/price line lives in the hover tooltip and the tap-to-open
            detail bar below, so nothing permanent competes with the number. */}
        {data.strip.map((q, i) => {
          const color = moveColor(q.changePct, q.change);
          const tip = `${q.label} · ${stripMeta(q)}`;
          const open = active === q.symbol;
          return (
            <div
              key={q.symbol}
              aria-label={tip}
              aria-expanded={open}
              tabIndex={0}
              onClick={() => setActive(open ? null : q.symbol)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive(open ? null : q.symbol);
                }
              }}
              className="group relative w-[42vw] max-w-[200px] shrink-0 cursor-pointer snap-start rounded-xl bg-white/[0.04] p-2 stagger-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 lg:w-auto lg:max-w-none"
              style={{ animationDelay: `${Math.min(i, 7) * 40}ms` }}
            >
              <p className="flex items-center gap-1 font-sans text-xs font-semibold text-white/55">
                <span className="truncate">{q.label}</span>
                {q.symbol === 'BTC' && (
                  <span className="shrink-0 rounded bg-white/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white/50">
                    24/7
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums font-mono paint-flash" style={{ color }}>
                {formatPct(q.changePct)}
              </p>
              <div className="mt-1">
                <SparkWithRef values={q.spark} reference={q.prevClose} color={color} height={24} times={q.sparkT} />
              </div>
              <span
                aria-hidden
                className={`pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded border border-white/15 bg-black/90 px-2 py-1 font-mono text-[11px] tabular-nums text-white/85 group-hover:block group-focus-within:block ${
                  i === 0
                    ? 'left-0'
                    : i === data.strip.length - 1
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2'
                }`}
              >
                {tip}
              </span>
            </div>
          );
        })}
      </div>
      {activeQuote && (
        <p className="mt-2 truncate rounded-lg bg-white/[0.04] px-3 py-1.5 font-mono text-xs tabular-nums text-white/70">
          {activeQuote.label} · {stripMeta(activeQuote)}
        </p>
      )}
      </>
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

export interface EarningsWeekData {
  events: EnrichedEvent[];
  fetchedAt: string;
}

const isEarningsWeek = (j: unknown): j is EarningsWeekData =>
  !!j && Array.isArray((j as EarningsWeekData).events);

export function useEarnings(): { data: EarningsWeekData | null; loaded: boolean } {
  return useMarkets('/api/stocks/earnings', isEarningsWeek);
}

function epsLabel(eps: number | null): string {
  if (eps === null) return 'EPS est —';
  return `EPS est ${eps < 0 ? '−' : ''}$${Math.abs(eps).toFixed(2)}`;
}

function fmtEarningsDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Company-page line: "Next earnings Oct 28 · AMC · EPS est $1.02". Timing
// and estimates appear only when Finnhub confirms them; otherwise the
// honest fallback — never an invented date.
export function NextEarningsLine({ ticker }: { ticker: string }) {
  const { data } = useEarnings();
  if (!data) return null;
  const next = findNextEarnings(data.events, ticker);
  if (!next) return <span className="text-white/40">No scheduled earnings date</span>;
  return (
    <span className="text-white/60">
      Next earnings <span className="font-mono font-semibold text-white/85 tabular-nums">{fmtEarningsDate(next.date)}</span>
      {next.hour === 'bmo' && ' · before open'}
      {next.hour === 'amc' && ' · after close'}
      {next.epsEstimate !== null && (
        <span className="font-mono tabular-nums"> · {epsLabel(next.epsEstimate)}</span>
      )}
    </span>
  );
}

// Company-page earnings card: pre-report estimates with beat history, or
// the post-report verdict with the honest move. Sharing lives here (and on
// the section headers) — never as icons on every list row.
function quarterShort(qd: QuarterDetail): string {
  return qd.year !== null ? `${qd.q}'${String(qd.year).slice(2)}` : qd.q;
}

function QuarterDots({ quarters }: { quarters: QuarterDetail[] }) {
  if (quarters.length === 0) return null;
  return (
    <span className="inline-flex items-start gap-1.5" aria-hidden>
      {quarters.map((qd, i) => (
        <span key={i} title={quarterTip(qd)} className="flex w-8 flex-col items-center gap-1">
          <span
            className={`h-2.5 w-2.5 rounded-full ${qd.beat === null ? 'bg-white/20' : qd.beat ? 'bg-green-400' : 'bg-red-400'}`}
          />
          <span className="font-sans text-[11px] leading-none tabular-nums text-white/40">{quarterShort(qd)}</span>
        </span>
      ))}
    </span>
  );
}

// One quiet share pill: always X, like the chess score cards. The native
// sheet (AirDrop/Messages/…) shares a bare link with no card preview, so it
// is never used here — the X intent carries the landing page whose meta
// renders the large card image.
function CardShareButton({ type, text, extra, label }: { type: EarningsCardType; text: string; extra: Record<string, string>; label: string }) {
  return (
    <button
      type="button"
      onClick={() => openCardShare(type, text, extra)}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.08] px-3 font-sans text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/[0.14] hover:text-white"
    >
      <Share2 size={13} aria-hidden /> {label}
    </button>
  );
}

export function EarningsCard({ ticker }: { ticker: string }) {
  const { data } = useEarnings();
  const [quarters, setQuarters] = useState<QuarterDetail[] | null>(null);
  const sym = ticker.trim().toUpperCase();
  const events = (data?.events ?? []).filter((e) => e.symbol === sym);
  const today = localToday();
  const recent =
    events.filter((e) => e.epsActual !== null && e.date <= today && e.date >= localDayShift(-2)).sort((a, b) => (a.date < b.date ? 1 : -1))[0] ?? null;
  const upcoming =
    events.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1))[0] ?? null;
  const target = recent ?? upcoming;
  useEffect(() => {
    if (!target || target.epsActual !== null) return;
    let cancelled = false;
    fetch(`/api/stocks/earnings/dots?ticker=${encodeURIComponent(sym)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j && Array.isArray(j.quarters)) {
          setQuarters(
            j.quarters.filter(
              (qd): qd is QuarterDetail =>
                !!qd && typeof qd === 'object' && typeof (qd as QuarterDetail).q === 'string',
            ),
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sym, target]);
  if (!target) return null;
  const name = shortName(target.companyName) ?? sym;
  const reported = target.epsActual !== null;
  const text = reported
    ? resultShareText({ symbol: sym, epsActual: target.epsActual, epsEstimate: target.epsEstimate, priceChangePct: target.priceChangePct, ahChangePct: target.ahChangePct })
    : previewShareText({ symbol: sym, date: target.date, hour: target.hour, epsEstimate: target.epsEstimate, revenueEstimate: target.revenueEstimate, beats: target.beats });
  const preEps = formatEps(target.epsEstimate);
  const preRev = formatMoneyShort(target.revenueEstimate);
  const preEstLine = !preEps && !preRev ? 'Estimates not announced yet' : `${preEps ? `EPS est ${preEps}` : ''}${preEps && preRev ? ' · ' : ''}${preRev ? `Rev est ${preRev}` : ''}`;
  const dayStamp = `${new Date(`${target.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })} ${fmtEarningsDate(target.date)}`;
  const scored = (quarters ?? []).filter((qd) => qd.beat !== null);
  return (
    <div className="mt-3 max-w-[640px] rounded-xl border border-white/10 bg-white/[0.04] p-4">
      {reported ? (
        <EarningsCardResult event={target} name={name} dataFetchedAt={data?.fetchedAt} text={text} />
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <p className="font-sans text-sm font-semibold text-white/90">
              {target.hour === 'bmo' ? '☀️' : target.hour === 'amc' ? '🌙' : ''} Reports {reportTimingLabel(target.date, target.hour)}
              <span className="font-normal text-white/45"> · {dayStamp}</span>
            </p>
            <CardShareButton type="preview" text={text} extra={{ ticker: sym }} label="Share preview" />
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="font-sans text-[13px] tabular-nums text-white/60">{preEstLine}</p>
            {quarters !== null && scored.length > 0 && (
              <div className="flex shrink-0 items-center gap-3">
                <QuarterDots quarters={quarters} />
                <span className="font-sans text-xs text-white/55">
                  Beat {scored.filter((qd) => qd.beat).length} of last {scored.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EarningsCardResult({ event, name, dataFetchedAt, text }: { event: EnrichedEvent; name: string; dataFetchedAt: string | undefined; text: string }) {
  const verdict = beatVerdict(event.epsActual, event.epsEstimate);
  const m = pickMove(event);
  const a = formatEps(event.epsActual);
  const est = formatEps(event.epsEstimate);
  const pct = event.epsActual !== null && event.epsEstimate ? ((event.epsActual - event.epsEstimate) / Math.abs(event.epsEstimate)) * 100 : null;
  const ra = event.revenueActual !== null ? formatMoneyShort(event.revenueActual) : null;
  const re = formatMoneyShort(event.revenueEstimate);
  const color = verdict === 'BEAT' ? 'text-green-300' : verdict === 'MISS' ? 'text-red-300' : 'text-white/70';
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p className={`font-sans text-[15px] font-bold ${color}`}>
          {verdict === 'BEAT' ? '✓ Beat' : verdict === 'MISS' ? '✗ Miss' : '≈ Inline'}
          <span className="font-normal text-white/45"> · {name}</span>
        </p>
        <CardShareButton type="result" text={text} extra={{ ticker: event.symbol }} label="Share result" />
      </div>
      <p className="mt-1 font-sans text-[13px] tabular-nums text-white/70">
        {a && est && verdict !== 'REPORTED'
          ? `EPS ${a} vs ${est} est (${pct !== null && pct >= 0 ? '+' : ''}${pct !== null ? pct.toFixed(0) : ''}%)`
          : a
            ? `EPS ${a} reported`
            : 'Results announced'}
        {ra && re ? ` · Revenue ${ra} vs ${re} est` : ra ? ` · Revenue ${ra}` : ''}
      </p>
      <p className="mt-1 font-sans text-xs tabular-nums text-white/45">
        {m ? `Stock ${m.v >= 0 ? '+' : ''}${(m.v * 100).toFixed(1)}% ${m.label}` : 'Stock move unavailable'}
        {dataFetchedAt ? ` · as of ${etTimeLabel(dataFetchedAt)}` : ''}
      </p>
    </div>
  );
}

// Upcoming earnings, ranked by popularity: a day strip, then the selected
// day split into before-open / after-close columns of compact rows.
// Estimates are always labeled est, never results; rows without an EPS
// estimate stay folded until the list expands; never any BMO/AMC jargon.
function localToday(): string {
  return localDayShift(0);
}

function localDayShift(deltaDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// One share path for every earnings surface: X intent carrying the
// cashtagged text plus the share landing page. A per-share `v` nonce keeps
// each share URL unique, so X always fetches a freshly rendered card
// instead of its first cached image (same reason chess cards are unique).
function openCardShare(type: EarningsCardType, text: string, extra?: Record<string, string>) {
  window.open(earningsXIntentUrl(type, text, { ...extra, v: Date.now().toString(36) }), '_blank', 'noopener,width=550,height=420');
}

function EarnLogo({ event, px = 32 }: { event: EnrichedEvent; px?: number }) {
  // Logos come straight from Finnhub's keyless logo endpoint (verified PNG,
  // no profile fetch needed); unknown tickers fall back to a monogram.
  const [failed, setFailed] = useState(false);
  if (failed) return <Monogram symbol={event.symbol} size={px <= 16 ? '2xs' : px <= 20 ? 'xs' : 'sm'} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl(event.symbol)}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setFailed(true)}
      width={px}
      height={px}
      style={{ width: px, height: px }}
      className="shrink-0 rounded-full bg-white/10 object-contain"
    />
  );
}

function BeatBadge({ beats }: { beats: EnrichedEvent['beats'] }) {
  if (!beats || beats.total === 0) return null;
  // One rule: perfect is green, one or fewer wins is amber, the middle is
  // neutral. A 1/4 that "feels wrong" is still what the provider's own
  // surprise data says (see the fetcher log).
  const cls =
    beats.wins === beats.total
      ? 'bg-green-400/15 text-green-300'
      : beats.wins <= 1
        ? 'bg-amber-400/15 text-amber-300'
        : 'bg-white/10 text-white/60';
  return (
    <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-sans text-[11px] font-bold tabular-nums ${cls}`}>
      Beat {beats.wins}/{beats.total}
    </span>
  );
}

// Starred tickers persist in localStorage; the earnings section pins
// matching reporters above the week strip.
function loadWatchlist(): string[] {
  try {
    return cleanTickers(JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function saveWatchlist(list: string[]) {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  } catch {
    /* private mode — stars just don't persist */
  }
}

export function WatchStar({ ticker }: { ticker: string }) {
  const [list, setList] = useState<string[]>(() => (typeof window === 'undefined' ? [] : loadWatchlist()));
  const active = list.includes(ticker.trim().toUpperCase());
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      title={active ? 'In your watchlist' : 'Add to watchlist'}
      onClick={() => {
        const next = toggleInList(list, ticker);
        saveWatchlist(next);
        setList(next);
      }}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base leading-none transition-colors ${
        active
          ? 'border-yellow-300/60 bg-yellow-300/10 text-yellow-300'
          : 'border-white/20 text-white/35 hover:border-white/40 hover:text-white/70'
      }`}
    >
      <span aria-hidden>{active ? '★' : '☆'}</span>
    </button>
  );
}

function EarnRow({ event, onSelect }: { event: EnrichedEvent; onSelect: (ticker: string) => void }) {
  const reported = event.epsActual !== null;
  const eps = formatEps(event.epsEstimate);
  const rev = event.revenueEstimate !== null ? formatMoneyShort(event.revenueEstimate) : null;
  const mcap = formatMoneyShort(event.marketCap);
  const move = event.priceChangePct;
  // Same dust threshold as formatPct: below half a basis point it's flat.
  const flat = move === null || Math.abs(move * 100) < 0.005;
  const verdict = reported ? beatVerdict(event.epsActual, event.epsEstimate) : 'REPORTED';
  const name = shortName(event.companyName) ?? event.symbol;
  const sharePreview = () =>
    openCardShare(
      'preview',
      previewShareText({ symbol: event.symbol, date: event.date, hour: event.hour, epsEstimate: event.epsEstimate, revenueEstimate: event.revenueEstimate, beats: event.beats }),
      { ticker: event.symbol },
    );
  const shareResult = () =>
    openCardShare(
      'result',
      resultShareText({ symbol: event.symbol, epsActual: event.epsActual, epsEstimate: event.epsEstimate, priceChangePct: event.priceChangePct, ahChangePct: event.ahChangePct }),
      { ticker: event.symbol },
    );
  return (
    <div className="group flex min-h-16 w-full items-center gap-1 border-b border-white/10 px-1 py-2 transition-colors hover:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => onSelect(event.symbol)}
        aria-label={`${name} (${event.symbol}) earnings`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <EarnLogo event={event} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-sans text-[15px] font-semibold text-white/90">
            {name}{' '}
            <span className="font-mono text-[13px] font-normal text-white/45">{event.symbol}</span>
          </span>
          {reported ? (
            eps === null ? (
              <span className="block truncate font-sans text-[13px] text-white/60 tabular-nums">
                EPS {formatEps(event.epsActual)} reported
              </span>
            ) : (
              <span
                className={`block truncate font-sans text-[13px] tabular-nums ${
                  verdict === 'BEAT' ? 'text-green-300' : verdict === 'MISS' ? 'text-red-300' : 'text-white/60'
                }`}
              >
                EPS {formatEps(event.epsActual)} vs {eps} est{' '}
                {verdict === 'BEAT' ? '✓ beat' : verdict === 'MISS' ? '✗ miss' : '≈ inline'}
              </span>
            )
          ) : (
            <span className="block truncate font-sans text-[13px] text-white/50 tabular-nums">
              {eps ? `EPS est ${eps}` : 'EPS est —'}
              {rev ? ` · Rev est ${rev}` : ''}
            </span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          {reported && move !== null ? (
            <span
              title="Today's session move"
              className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums ${
                flat ? 'bg-white/10 text-white/60' : move > 0 ? 'bg-green-400/15 text-green-300' : 'bg-red-400/15 text-red-300'
              }`}
            >
              {flat ? '•' : move > 0 ? '▲' : '▼'} {formatPct(move)}
            </span>
          ) : (
            mcap && <span className="font-sans text-[13px] text-white/50 tabular-nums">{mcap}</span>
          )}
          <BeatBadge beats={event.beats} />
          {reported && (
            <button
              type="button"
              onClick={shareResult}
              className="shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-white/55 transition-colors hover:border-white/35 hover:text-white"
            >
              Share result
            </button>
          )}
        </span>
      </button>
      {!reported && (
        <button
          type="button"
          onClick={sharePreview}
          aria-label={`Share ${event.symbol} earnings preview`}
          title="Share earnings preview"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/30 opacity-0 transition-all hover:bg-white/[0.08] hover:text-white/80 focus-visible:opacity-100 [@media(hover:hover)]:inline-flex [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100"
        >
          <Share2 size={14} aria-hidden />
        </button>
      )}
      <span aria-hidden className="shrink-0 text-white/25">›</span>
    </div>
  );
}

function ShareLineupButton({ date, events, half }: { date: string; events: EnrichedEvent[]; half: 'amc' | 'bmo' }) {
  const evening = half === 'amc';
  const openShare = () => {
    const heads = rankDay(events).slice(0, 6).map((e) => e.symbol);
    const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const text = evening
      ? `Reporting after the close (${dayName}): ${heads.join(', ')}${events.length > heads.length ? ` +${events.length - heads.length} more` : ''}.`
      : `Reporting before the open (${dayName}): ${heads.join(', ')}${events.length > heads.length ? ` +${events.length - heads.length} more` : ''}.`;
    openCardShare(evening ? 'tonight' : 'morning', text, { date });
  };
  return (
    <button
      type="button"
      onClick={openShare}
      className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-full border border-white/15 px-2.5 font-sans text-[13px] font-semibold text-white/55 transition-colors hover:border-white/35 hover:text-white"
    >
      <Share2 size={12} aria-hidden /> {evening ? "Share tonight's lineup" : "Share this morning's lineup"}
    </button>
  );
}

function EarnColumn({ title, events, onSelect, action }: { title: string; events: EnrichedEvent[]; onSelect: (ticker: string) => void; action?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  if (events.length === 0) return null;
  const ranked = rankDay(events);
  const base = visibleRows(ranked, '', false);
  const shown = open ? visibleRows(ranked, query, true) : base.slice(0, 6);
  const hidden = visibleRows(ranked, '', true).length - shown.length;
  return (
    <div>
      <div className="mb-1 flex min-h-12 items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">{title}</p>
        {action}
      </div>
      <div className="border-t border-white/10">
        {shown.map((e) => (
          <EarnRow key={`${e.date}-${e.symbol}`} event={e} onSelect={onSelect} />
        ))}
      </div>
      {hidden > 0 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 flex w-full items-center justify-center gap-1 py-1.5 text-center font-sans text-[15px] font-medium text-white/50 transition-colors hover:text-white"
        >
          + {hidden} more companies <ChevronDown size={14} aria-hidden />
        </button>
      )}
      {open && (
        <div className="mt-1">
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Filter ticker or name…"
            aria-label={`Filter ${title} companies`}
            className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 font-sans text-sm text-white/90 placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
          {shown.length === 0 && <p className="py-3 text-center font-sans text-sm text-white/40">No matches.</p>}
        </div>
      )}
    </div>
  );
}

export function EarningsWeek({ data, loaded, onSelect }: { data: EarningsWeekData | null; loaded: boolean; onSelect: (ticker: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => (typeof window === 'undefined' ? [] : loadWatchlist()));
  useEffect(() => {
    // Stars toggle on the company page; pick them up on return.
    const reload = () => setWatchlist(loadWatchlist());
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, []);
  if (!loaded) {
    return (
      <div className="mt-8" aria-label="Loading earnings">
        <div className="h-6 w-40 rounded bg-white/10 animate-pulse" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-white/10 bg-white/[0.06] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (!data || data.events.length === 0) return null;
  const byDay = new Map<string, EnrichedEvent[]>();
  for (const e of data.events) {
    const list = byDay.get(e.date) ?? [];
    list.push(e);
    byDay.set(e.date, list);
  }
  const dates = [...byDay.keys()].sort();
  const mine = watchlist.length > 0 ? rankDay(data.events.filter((e) => watchlist.includes(e.symbol))) : [];
  const day = (selected && byDay.has(selected) ? selected : dates.find((d) => d >= localToday()) ?? dates[0]) as string;
  const dayEvents = byDay.get(day) ?? [];
  const bmo = dayEvents.filter((e) => e.hour === 'bmo');
  const amc = dayEvents.filter((e) => e.hour === 'amc');
  const unknown = dayEvents.filter((e) => e.hour !== 'bmo' && e.hour !== 'amc');
  const label = new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white/95">Upcoming earnings</h2>
      {mine.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/40">Your watchlist reports this week</p>
          <div className="border-t border-white/10">
            {mine.map((e) => (
              <EarnRow key={`mine-${e.date}-${e.symbol}`} event={e} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Trading days">
        {dates.map((d) => {
          const list = byDay.get(d) ?? [];
          const active = d === day;
          const dt = new Date(`${d}T12:00:00`);
          const heads = rankDay(list).slice(0, 3);
          const dayLine = `${dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} ${dt.getDate()}`;
          return (
            <button
              key={d}
              type="button"
              aria-current={active ? 'date' : undefined}
              aria-label={`${dayLine}, ${list.length} reports`}
              onClick={() => setSelected(d)}
              className={`flex min-h-20 flex-col items-center justify-center rounded-xl border px-1 py-1.5 transition-colors ${
                active ? 'border-yellow-300/60 bg-yellow-300/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              <span className="font-sans text-[13px] font-bold tracking-wide text-white/85 tabular-nums">{dayLine}</span>
              <span className="font-sans text-[11px] text-white/45 tabular-nums">{list.length} reports</span>
              <span className="mt-1 flex -space-x-1" aria-hidden>
                {heads.map((e) => (
                  <EarnLogo key={e.symbol} event={e} px={16} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm font-semibold text-white/80">
        {label} <span className="font-normal text-white/45">· {dayEvents.length} companies</span>
      </p>
      <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
        <EarnColumn
          title="☀️ Before the open"
          events={bmo}
          onSelect={onSelect}
          action={bmo.length > 0 ? <ShareLineupButton date={day} events={bmo} half="bmo" /> : undefined}
        />
        <EarnColumn
          title="🌙 After the close"
          events={amc}
          onSelect={onSelect}
          action={amc.length > 0 ? <ShareLineupButton date={day} events={amc} half="amc" /> : undefined}
        />
      </div>
      {unknown.length > 0 && (
        <div className="mt-6">
          <EarnColumn title={`Time not announced (${unknown.length})`} events={unknown} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}
