'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Link as LinkIcon, Check } from 'lucide-react';
import type { FinancialSeries, PricePoint, SegmentSeries, StockResponse } from '@/lib/stocks';
import { FILING_LABELS, cagr, cagrDetails, displayCompanyName, edgarCompanyUrl, fiscalYearEndMonth, fiscalYearSpan, formatCompact, formatEps, formatFilingDate, formatHeadquarters, formatInt, formatLastTrade, formatMoney, formatPct, formatPrice, formatQuoteChange, isMarketOpen, isOtherSegment, latestValue, marginLine, normalizeTicker, peHistoryNote, periodReturn, pickLede, positionInRangeLabel, revenueLine, stockShareLinks, stockShareText, tableYears, yoyGrowth } from '@/lib/stocks';
import { SECTION_ACCENTS, categoryColor } from '@/lib/blog-content';

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

const ACCENT = categoryColor('Investing');
const RECENT_KEY = 'stocks-recent';
const EXAMPLES = ['META', 'NVDA', 'AAPL', 'TSLA', 'AMZN'];
const TREND_ARROW = { up: '↑', down: '↓', flat: '→' } as const;
const TREND_COLOR = { up: 'text-green-400', down: 'text-orange-400', flat: 'text-white/40' } as const;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((t): t is string => typeof t === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  // Matches article h3: bold, category accent, 1.1rem.
  return (
    <h3 className="text-lg font-bold mb-3" style={{ color: ACCENT }}>
      {children}
    </h3>
  );
}

function StatRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  // Key-metric tile: grouping via fill, never a border — borders mean
  // clickable. Plain facts use FactGrid instead.
  return (
    <div className="rounded-lg bg-white/[0.04] px-3 py-2">
      <div className="text-xs text-white/45">{label}</div>
      <div className="text-sm font-semibold text-white/90 tabular-nums mt-0.5">{value}</div>
      {sub !== undefined && <div className="text-xs text-white/50 mt-0.5">{sub}</div>}
    </div>
  );
}

// Plain facts (Founded, CEO, …): no boxes — one hairline over a label/value
// grid, two columns on mobile. Missing facts hide instead of showing dashes.
function FactGrid({ facts }: { facts: { label: string; value: React.ReactNode }[] }) {
  const shown = facts.filter((f) => f.value !== null && f.value !== undefined);
  if (shown.length === 0) return null;
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-8 gap-y-4 pt-5 mt-5 border-t border-white/10">
      {shown.map((f) => (
        <div key={f.label}>
          <dt className="text-[13px] text-white/40 tracking-wide">{f.label}</dt>
          <dd className="mt-1 text-[17px] text-white/90">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-[#8ab4f8] underline decoration-[#8ab4f8]/40 underline-offset-[3px] hover:text-white hover:decoration-white transition-colors"
    >
      {children}
    </a>
  );
}

function PartHead({ n, title, lede }: { n: number; title: string; lede: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold" style={{ color: ACCENT }}>
        Part {n} · {title}
      </h2>
      <p className="text-sm text-white/50 mt-1">{lede}</p>
    </div>
  );
}

function ProfileSection({
  n,
  title,
  question,
  note,
  children,
}: {
  n: number;
  title: string;
  question?: string;
  note: React.ReactNode;
  children: React.ReactNode;
}) {
  // Small caps label over the question-as-heading; the accent tints the
  // panel only (blue headings read as links).
  const accent = SECTION_ACCENTS[(n - 1) % SECTION_ACCENTS.length];
  return (
    <section className="article-section" style={{ '--accent': accent, borderLeft: 0, borderRadius: 10 } as React.CSSProperties}>
      <p className="text-xs font-semibold uppercase tracking-widest text-white/35">{n} · {title}</p>
      {question && <h3 className="text-xl font-bold text-white/90 mt-1 mb-3">{question}</h3>}
      {children}
      <p className="text-xs text-white/55 mt-3 leading-relaxed">
        <strong className="text-white/75">How to read this:</strong> {note}
      </p>
    </section>
  );
}

const SEGMENT_COLORS = [
  'bg-sky-400',
  'bg-emerald-400',
  'bg-amber-300',
  'bg-violet-400',
  'bg-rose-400',
  'bg-orange-300',
];
const SEGMENT_BUCKET = 'bg-white/25';

function segmentPalette(members: string[]): string[] {
  let n = 0;
  return members.map((m) => (isOtherSegment(m) ? SEGMENT_BUCKET : SEGMENT_COLORS[(n++) % SEGMENT_COLORS.length]));
}

function segMoney(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `${v < 0 ? '-' : ''}$${formatCompact(Math.abs(v))}`;
}

function segShare(v: number | null | undefined, total: number | null): string {
  if (v === null || v === undefined || !total) return '—';
  const pct = (v / total) * 100;
  if (pct < 0) return '—';
  if (pct > 0 && pct < 0.5) return '<1%';
  return `${Math.round(pct)}%`;
}

function ChartSubhead({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[13px] font-semibold text-white/70 mb-2">{children}</h4>;
}

function SegmentMixBar({ series, shortName }: { series: SegmentSeries; shortName: string }) {
  const latest = series.years.length - 1;
  const total = series.totals[latest] ?? series.values.reduce((a, col) => a + (col[latest] ?? 0), 0);
  const colors = segmentPalette(series.members);
  const shares = series.values.map((col) => {
    const v = col[latest] ?? 0;
    return total > 0 ? v / total : 0;
  });
  const top = shares.indexOf(Math.max(...shares));
  return (
    <div>
      <div
        className="flex h-3 rounded-full overflow-hidden bg-white/[0.06]"
        role="img"
        aria-label={`Revenue split FY${series.years[latest]}: ${series.members.map((m, i) => `${m} ${segShare(series.values[i][latest], total)}`).join(', ')}`}
      >
        {series.members.map((m, i) => {
          const w = Math.max(0, shares[i] * 100);
          return w > 0 ? <div key={m} className={`${colors[i]} h-full`} style={{ width: `${w}%` }} /> : null;
        })}
      </div>
      <ul className="mt-2 space-y-1">
        {series.members.map((m, i) => (
          <li key={m} className="grid grid-cols-[minmax(0,1fr)_auto_4.5rem] items-baseline gap-x-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className={`inline-block w-2 h-2 rounded-sm shrink-0 ${colors[i]}`} />
              <span className="text-white/85 truncate">{m}</span>
            </span>
            <span className="text-white/50 tabular-nums">{segShare(series.values[i][latest], total)}</span>
            <span className="text-white/85 tabular-nums text-right">{segMoney(series.values[i][latest])}</span>
          </li>
        ))}
      </ul>
      {top >= 0 && shares[top] >= 0.7 && (
        <p className="mt-2 text-sm text-white/75 leading-relaxed">
          → {series.members[top]} is {Math.round(shares[top] * 100)}% of revenue, so {shortName}&rsquo;s
          results mostly track that one business.
        </p>
      )}
    </div>
  );
}

function SegmentMixHistory({ series }: { series: SegmentSeries }) {
  const colors = segmentPalette(series.members);
  const order = series.years.map((_, i) => i).reverse();
  return (
    <ul className="space-y-1.5">
      {order.map((yi) => {
        const total = series.totals[yi] ?? series.values.reduce((a, col) => a + (col[yi] ?? 0), 0);
        return (
          <li key={series.years[yi]} className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem] items-center gap-x-3">
            <span className="text-xs text-white/45 tabular-nums">{series.years[yi]}</span>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.06]">
              {series.members.map((m, i) => {
                const v = series.values[i][yi] ?? 0;
                const w = total > 0 ? Math.max(0, (v / total) * 100) : 0;
                return w > 0 ? <div key={m} className={`${colors[i]} h-full`} style={{ width: `${w}%` }} /> : null;
              })}
            </div>
            <span className="text-xs text-white/60 tabular-nums text-right">{segMoney(total)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function SegmentProfitBars({ series }: { series: SegmentSeries }) {
  const latest = series.years.length - 1;
  const vals = series.members.map((_, i) => series.values[i][latest] ?? null);
  const maxAbs = Math.max(0, ...vals.map((v) => Math.abs(v ?? 0)));
  return (
    <ul className="space-y-1.5">
      {series.members.map((m, i) => {
        const v = vals[i];
        const half = v === null || maxAbs <= 0 ? 0 : (Math.abs(v) / maxAbs) * 50;
        const left = v !== null && v < 0 ? 50 - half : 50;
        const bar = v === null || v === 0 ? null : v > 0 ? 'bg-green-400' : 'bg-orange-400';
        const text = v === null ? 'text-white/40' : v > 0 ? 'text-green-400' : v < 0 ? 'text-orange-400' : 'text-white/60';
        return (
          <li key={m} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_4.75rem] items-center gap-x-3">
            <span className="text-[13px] text-white/85 truncate" title={m}>{m}</span>
            <span className="relative block h-5 rounded bg-white/[0.06]">
              <span className="absolute left-1/2 top-0 bottom-0 w-px bg-white/25" />
              {bar && (
                <span
                  className={`absolute top-[3px] bottom-[3px] rounded-sm ${bar}`}
                  style={{ left: `${left}%`, width: `${half}%` }}
                />
              )}
            </span>
            <span className={`text-[13px] tabular-nums text-right ${text}`}>{segMoney(v)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ratioOrNull(num: number | null | undefined, den: number | null | undefined): number | null {
  if (num === null || num === undefined || !den) return null;
  return num / Math.abs(den);
}

function isAnnualForm(form: string): boolean {
  return form === '10-K' || form === '20-F' || form === '40-F';
}

function PriceChart({ history }: { history: PricePoint[] }) {
  if (history.length < 2) return null;
  const closes = history.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const up = closes[closes.length - 1] >= closes[0];
  const W = 600;
  const H = 150;
  const x = (i: number) => 2 + (i / (history.length - 1)) * (W - 4);
  const y = (v: number) => H - 4 - ((v - min) / (max - min || 1)) * (H - 8);
  const pts = history.map((p, i) => `${x(i).toFixed(1)},${y(p.close).toFixed(1)}`).join(' ');
  const stroke = up ? '#4ade80' : '#f87171';
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" role="img" aria-label="Weekly closing prices">
        <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx={x(history.length - 1)} cy={y(closes[closes.length - 1])} r="3.5" fill={stroke} />
      </svg>
      <figcaption className="flex justify-between text-xs text-white/35 tabular-nums">
        <span>{history[0].date.slice(0, 4)}</span>
        <span>
          {formatPrice(min)} – {formatPrice(max)}
        </span>
        <span>{history[history.length - 1].date.slice(0, 7)}</span>
      </figcaption>
    </figure>
  );
}

const MISSING_ROW_TIP = 'Not available as a single company-wide figure — banks never report it, multi-class filers report it per share class.';

function FinancialsTable({ series, missing, years, peHistory, psHistory, ttm, pe, ps }: { series: FinancialSeries[]; missing: string[]; years: string[]; peHistory: { year: string; value: number | null }[] | null; psHistory: { year: string; value: number | null }[] | null; ttm: Record<string, number> | null; pe: number | null; ps: number | null }) {
  const peByYear = new Map((peHistory ?? []).map((p) => [p.year, p.value]));
  const psByYear = new Map((psHistory ?? []).map((p) => [p.year, p.value]));
  const valueFor = (key: string, y: string): number | undefined =>
    y === 'TTM' ? ttm?.[key] : byKey.get(key)?.get(y);
  const byKey = new Map(series.map((s) => [s.key, new Map(s.points.map((p) => [p.year, p.value]))]));
  const yearSet = new Set(years);
  // Rows whose history doesn't overlap the shown years (a tag the filer
  // abandoned a decade ago) read as missing, not as a row of broken dashes.
  const visible = series.filter((s) => s.points.some((p) => yearSet.has(p.year)));
  const stale = series.filter((s) => !s.points.some((p) => yearSet.has(p.year))).map((s) => s.label);
  const revenue = series.find((s) => s.key === 'revenue');
  const net = series.find((s) => s.key === 'netIncome');
  const growth = revenue ? new Map(revenue.points.map((p, i) => [p.year, yoyGrowth(revenue.points)[i]])) : null;

  const cell = 'border border-white/10 px-3 py-2 text-right text-white/85';
  const headCell = 'border border-white/10 px-3 py-2 text-right font-bold text-white bg-white/5';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular-nums border-collapse">
        <thead>
          <tr>
            <th scope="col" className="border border-white/10 px-3 py-2 text-left font-bold text-white bg-white/5">
              FY ended
            </th>
            {years.map((y) => (
              <th
                key={y}
                scope="col"
                className={headCell}
                title={y === 'TTM' ? 'Trailing 12 months for profit rows; latest quarter for cash, debt, shares, assets, equity.' : undefined}
              >
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((s) => (
            <tr key={s.key}>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/60">
                {s.label}
              </th>
              {years.map((y) => {
                const v = valueFor(s.key, y);
                return (
                  <td key={y} className={cell}>
                    {v === undefined ? <span className="text-white/25">—</span> : s.unit === 'USD/shares' ? formatEps(v) : s.unit === 'shares' ? formatCompact(v) : formatMoney(v)}
                  </td>
                );
              })}
            </tr>
          ))}
          {[...missing, ...stale].map((label) => (
            <tr key={label}>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/35" title={MISSING_ROW_TIP}>
                <span className="cursor-help underline decoration-dotted decoration-white/30 underline-offset-4">{label}</span>
              </th>
              {years.map((y) => (
                <td key={y} className={cell} title={MISSING_ROW_TIP}>
                  <span className="text-white/25">—</span>
                </td>
              ))}
            </tr>
          ))}
          {growth && (
            <tr>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/60">
                Revenue growth (YoY)
              </th>
              {years.map((y) => {
                const g = y === 'TTM' ? null : growth.get(y);
                return (
                  <td key={y} className={`${cell} ${g === undefined || g === null ? '' : g < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {g === undefined || g === null ? <span className="text-white/25">—</span> : formatPct(g)}
                  </td>
                );
              })}
            </tr>
          )}
          {peHistory && (
            <tr>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/60" title="Share price at each fiscal year-end ÷ that year's diluted EPS.">
                P/E ratio
              </th>
              {years.map((y) => {
                const v = y === 'TTM' ? pe : peByYear.get(y);
                return (
                  <td key={y} className={cell}>
                    {v === undefined || v === null ? <span className="text-white/25">n/a</span> : v.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          )}
          {psHistory && (
            <tr>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/60" title="Share price at each fiscal year-end ÷ that year's revenue per share.">
                P/S ratio
              </th>
              {years.map((y) => {
                const v = y === 'TTM' ? ps : psByYear.get(y);
                return (
                  <td key={y} className={cell}>
                    {v === undefined || v === null ? <span className="text-white/25">n/a</span> : v.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          )}
          {revenue && net && (
            <tr>
              <th scope="row" className="border border-white/10 px-3 py-2 text-left font-normal text-white/60">
                Net margin
              </th>
              {years.map((y) => {
                const r = valueFor('revenue', y);
                const n = valueFor('netIncome', y);
                const m = r && n !== undefined ? n / Math.abs(r) : null;
                return (
                  <td key={y} className={`${cell} ${m === null ? '' : m < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {m === null ? <span className="text-white/25">—</span> : formatPct(m)}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function StocksLookup({ initialTicker }: { initialTicker: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(initialTicker);
  const [data, setData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => (typeof window === 'undefined' ? [] : loadRecent()));
  const [copied, setCopied] = useState(false);
  const mounted = useRef(false);

  async function lookup(raw: string) {
    const ticker = normalizeTicker(raw);
    if (!ticker) {
      setError('Enter a valid ticker — 1-10 letters, e.g. META.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setCopied(false);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Lookup failed.');
      setData(json as StockResponse);
      setRecent((prev) => {
        const next = [ticker, ...prev.filter((t) => t !== ticker)].slice(0, 5);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* private mode */
        }
        return next;
      });
      router.replace(`${pathname}?ticker=${ticker}`, { scroll: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Search-first landing: the page opens empty and only a shared ?ticker=
    // link auto-runs, so a lookup result stays shareable.
    const start = normalizeTicker(initialTicker) || normalizeTicker(searchParams.get('ticker') ?? '');
    if (!start) return;
    // Deferred so the first render commits before the lookup's setStates run.
    const id = setTimeout(() => {
      if (mounted.current) return;
      mounted.current = true;
      setInput(start);
      lookup(start);
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = data?.quote;
  const up = (q?.change ?? 0) >= 0;
  // Nothing looked up yet: the search block centers like a search homepage.
  const idle = !data && !loading && !error;
  const finYears = data?.financials ? tableYears(data.financials) : [];
  const years = data?.ttm ? [...finYears, 'TTM'] : finYears;
  // P/E anchors to trailing-twelve-month EPS (current picture), falling back
  // to the latest fiscal year when there is no quarterly history.
  const ttmEps = data?.ttm?.eps;
  const trailingEps = ttmEps !== undefined ? ttmEps : latestValue(data?.financials?.find((s) => s.key === 'eps'));
  const pe = q?.price != null && trailingEps !== null && trailingEps > 0 ? q.price / trailingEps : null;
  const fyeMonth = fiscalYearEndMonth(data?.profile?.fiscalYearEnd);
  const pinnedAnnual = data?.filings.find((f) => isAnnualForm(f.form));
  const otherFilings = (data?.filings ?? []).filter((f) => f !== pinnedAnnual);
  // Annual-form-aware labels: 20-F filers describe the business in Item 4,
  // not Item 1.
  const annualForm = data?.filingInsights?.form ?? pinnedAnnual?.form ?? '10-K';
  const annualUrl = pinnedAnnual?.url ?? data?.filingInsights?.sourceUrl;
  const bizItem = annualForm === '10-K' ? 'Item 1' : 'Item 4';
  const riskItem = annualForm === '10-K' ? 'Item 1A' : 'risk factors';
  const eightKs = (data?.filings ?? []).filter((f) => f.form === '8-K');

  // Section data: one read per profile question, all derived from the same
  // annual series, TTM column, and price history.
  const seriesOf = (key: string) => data?.financials?.find((s) => s.key === key);
  const fyVal = (key: string): number | null => latestValue(seriesOf(key));
  const ttmVal = (key: string): number | null => data?.ttm?.[key] ?? null;
  const revPts = seriesOf('revenue')?.points ?? [];
  const revCagr = revPts.length > 0 ? cagr(revPts) : null;
  const epsCagr = seriesOf('eps') ? cagr(seriesOf('eps')!.points) : null;
  const revYoy = yoyGrowth(revPts);
  const latestRevYoy = revYoy.length > 0 ? revYoy[revYoy.length - 1] : null;
  const netMarginTtm = ratioOrNull(ttmVal('netIncome'), ttmVal('revenue'));
  const netMarginFy = ratioOrNull(fyVal('netIncome'), fyVal('revenue'));
  const grossMarginFy = ratioOrNull(fyVal('grossProfit'), fyVal('revenue'));
  const opMarginFy = ratioOrNull(fyVal('operatingIncome'), fyVal('revenue'));
  const roe = ratioOrNull(ttmVal('netIncome') ?? fyVal('netIncome'), ttmVal('equity') ?? fyVal('equity'));
  const debtToEquity = ratioOrNull(ttmVal('debt') ?? fyVal('debt'), ttmVal('equity') ?? fyVal('equity'));
  const payout = data?.stats.dpsTtm != null && trailingEps !== null && trailingEps > 0 ? data.stats.dpsTtm / trailingEps : null;
  const sharePts = seriesOf('shares')?.points ?? [];
  const shareChange = sharePts.length >= 2 ? ratioOrNull(sharePts[sharePts.length - 1].value - sharePts[0].value, sharePts[0].value) : null;
  const ps = q?.price != null && ttmVal('revenue') !== null && ttmVal('shares') ? q.price / (ttmVal('revenue')! / ttmVal('shares')!) : null;
  const rangeOf = (hist: { value: number | null }[] | null): [number, number] | null => {
    const vals = (hist ?? []).map((p) => p.value).filter((v): v is number => v !== null);
    return vals.length > 0 ? [Math.min(...vals), Math.max(...vals)] : null;
  };
  const peRange = rangeOf(data?.peHistory ?? null);
  const psRange = rangeOf(data?.psHistory ?? null);
  const ret1 = data?.priceHistory ? periodReturn(data.priceHistory, 1) : null;
  const ret5 = data?.priceHistory ? periodReturn(data.priceHistory, 5) : null;
  const histFirst = data?.priceHistory?.[0]?.date;
  const histLast = data?.priceHistory?.[data.priceHistory.length - 1]?.date;
  const histSpanYears = histFirst && histLast ? (Date.parse(histLast) - Date.parse(histFirst)) / (365.25 * 86400000) : 0;
  const pos52 =
    q?.price != null && data?.stats.week52High != null && data?.stats.week52Low != null
      ? ratioOrNull(q.price - data.stats.week52Low, data.stats.week52High - data.stats.week52Low)
      : null;
  const week52 =
    data?.stats.week52Low != null && data?.stats.week52High != null
      ? { lo: data.stats.week52Low, hi: data.stats.week52High }
      : null;
  const cap = data?.stats.marketCap;
  const capSize = cap == null ? null : cap >= 2e11 ? 'Mega-cap' : cap >= 1e10 ? 'Large-cap' : cap >= 2e9 ? 'Mid-cap' : cap >= 3e8 ? 'Small-cap' : 'Micro-cap';
  const oneLiner = data ? pickLede(data.description?.extract, data.filingInsights?.businessModel) || null : null;
  const shortName = data ? displayCompanyName(data.companyName) : '';
  const filingDateText = formatFilingDate(data?.filingInsights?.filingDate);
  const revLine = revenueLine(cagrDetails(revPts));
  // Margin trend compares the current margin against the earliest fiscal year
  // with both legs; skipped when that year IS the comparison (single-year
  // history with no TTM), where it would read "flat vs itself".
  const netByYear = new Map((seriesOf('netIncome')?.points ?? []).map((p) => [p.year, p.value]));
  const basePt = revPts
    .map((r) => ({ year: r.year, margin: ratioOrNull(netByYear.get(r.year) ?? null, r.value) }))
    .find((x) => x.margin !== null) ?? null;
  const latestRevYear = revPts.length > 0 ? revPts[revPts.length - 1].year : null;
  const marginBase = basePt && !(netMarginTtm == null && basePt.year === latestRevYear) ? basePt : null;
  const margin = marginLine(netMarginTtm ?? netMarginFy, marginBase?.margin ?? null, marginBase?.year ?? null);
  const form4Url = data?.profile ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${Number(data.profile.cik)}&type=4&owner=include` : null;
  const shareUrl =
    data && typeof window !== 'undefined' ? `${window.location.origin}${pathname}?ticker=${data.ticker}` : '';
  const shareText = data ? stockShareText(data.ticker, data.companyName, data.quote) : '';
  const shareLinks = stockShareLinks(shareUrl, shareText);
  const shareButtonClass =
    'flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-colors';

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    // Static text trips browser spellcheck on tickers (dotted underlines);
    // nothing here is editable.
    <div spellCheck={false}>
      <div className={idle ? 'min-h-[45vh] flex flex-col justify-center' : undefined}>
      <h2 className="text-xl font-bold mb-2" style={{ color: ACCENT }}>
        Stock lookup
      </h2>
      <p className="text-white/60 text-sm mb-4">
        A full company profile in four parts: the business, the numbers, the price, and the risks. Type a ticker to start.
      </p>

      <form
        className="flex flex-col sm:flex-row gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(input);
        }}
      >
        <label htmlFor="ticker" className="sr-only">
          Stock ticker
        </label>
        <input
          id="ticker"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="TICKER  e.g. META"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-bold px-4 py-2 rounded transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
          style={{ background: ACCENT, color: '#0a0a0a' }}
        >
          {loading ? 'Looking up...' : 'Lookup'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-2 text-xs">
        {(recent.length > 0 ? recent : EXAMPLES).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setInput(t);
              lookup(t);
            }}
            className="text-white/50 border border-white/15 px-2.5 py-1 rounded-full hover:text-white hover:border-white/30 transition-colors"
          >
            {t}
          </button>
        ))}
        <span className="text-white/30 self-center ml-1">{recent.length > 0 ? 'recent' : 'try one'}</span>
      </div>
      </div>

      {loading && <p className="text-sm text-white/50 mt-6 animate-pulse">Fetching quote and SEC filings…</p>}

      {error && (
        <div className="mt-6 border border-red-500/50 rounded p-4 text-sm text-red-300 bg-red-950/20">{error}</div>
      )}

      {data && (
        <div className="mt-8 space-y-10 animate-fadeInUp">
          {data.warnings.length > 0 && (
            <div className="border border-yellow-500/40 rounded p-3 text-xs text-yellow-200/80 bg-yellow-950/10 space-y-1">
              {data.warnings.map((w, i) => (
                <p key={i}>! {w}</p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-white/40">
                {[data.ticker, data.exchange, data.stats.sector].filter((x): x is string => x !== null).join(' · ')}
              </p>
              <h3 className="font-serif text-2xl font-bold text-white/95 mt-1">{data.companyName}</h3>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className={shareButtonClass}
              >
                <XIcon />
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className={shareButtonClass}
              >
                <LinkedInIcon />
              </a>
              <button onClick={copyShareLink} aria-label="Copy link" className={shareButtonClass}>
                {copied ? <Check size={16} /> : <LinkIcon size={16} />}
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded p-4 text-sm">
            <p className="font-bold text-white/90 mb-2">{displayCompanyName(data.companyName)} in 4 lines</p>
            <div className="space-y-1.5 leading-relaxed">
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                <span className="text-white/40 text-[13px] pt-[1px]">What they do</span>
                <span className="font-semibold text-white/90">{oneLiner ?? '—'}</span>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                <span className="text-white/40 text-[13px] pt-[1px]">Revenue</span>
                <span className="font-semibold text-white/90">
                  {revLine ? (
                    <>
                      <span className={TREND_COLOR[revLine.trend]}>{TREND_ARROW[revLine.trend]}</span>{' '}
                      <span className={TREND_COLOR[revLine.trend]}>{revLine.word}:</span> {revLine.detail}
                    </>
                  ) : '—'}
                </span>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                <span className="text-white/40 text-[13px] pt-[1px]">Margin</span>
                <span className="font-semibold text-white/90">
                  {margin ? (
                    <>
                      {margin.trend && (
                        <>
                          <span className={TREND_COLOR[margin.trend]}>{TREND_ARROW[margin.trend]}</span>{' '}
                        </>
                      )}
                      {margin.text}
                    </>
                  ) : '—'}
                </span>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                <span className="text-white/40 text-[13px] pt-[1px]">Size</span>
                <span className="font-semibold text-white/90">
                  {capSize && cap != null ? `${capSize} (${formatMoney(cap)})` : '—'}
                </span>
              </div>
            </div>
          </div>

          <PartHead n={1} title="Understand the business" lede="What it is and how it makes money — before any numbers." />

          <ProfileSection
            n={1}
            title="Snapshot"
            note="Market cap is the price of the whole company. P/E is how many years of current profit that price equals; compare it to the stock's own history."
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
              <span className="text-xl font-bold text-white/95">{data.companyName}</span>
              <span className="text-sm text-white/45">
                {[data.ticker, data.exchange, data.stats.sector].filter((x): x is string => x !== null).join(' · ')}
              </span>
            </div>
            {oneLiner && <p className="text-sm text-white/70 leading-relaxed mt-2">{oneLiner}</p>}
            {q ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-3">
                <span className="text-2xl font-semibold text-white/95 tabular-nums">
                  {formatPrice(q.price)}
                </span>
                {(q.change !== null || q.changePct !== null) && (
                  <span className={`text-base font-semibold tabular-nums ${up ? 'text-green-400' : 'text-red-400'}`}>
                    {formatQuoteChange(q.change, q.changePct)}
                  </span>
                )}
                <span className="text-xs text-white/35 inline-flex items-center gap-1.5">
                  {q.marketStatus && (
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isMarketOpen(q.marketStatus) ? 'bg-green-400' : 'bg-white/25'}`} />
                  )}
                  {q.marketStatus ? `${q.marketStatus} · ` : ''}{formatLastTrade(q.lastTrade, q.marketStatus)} · delayed
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/40 mt-3">Quote unavailable for this ticker.</p>
            )}
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <StatRow
                label="Market cap"
                value={data.stats.marketCap !== null ? `${formatMoney(data.stats.marketCap)}${data.stats.marketCapEstimated ? ' *' : ''}` : '—'}
                sub={capSize ?? undefined}
              />
              <StatRow
                label="52-week range"
                value={
                  week52 === null ? '—' : pos52 === null ? (
                    `${formatPrice(week52.lo)} – ${formatPrice(week52.hi)}`
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>{formatPrice(week52.lo)}</span>
                      <span className="relative h-1 flex-1 min-w-6 rounded-full bg-white/10">
                        <span
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80"
                          style={{ left: `${Math.min(100, Math.max(0, pos52 * 100))}%` }}
                        />
                      </span>
                      <span>{formatPrice(week52.hi)}</span>
                    </span>
                  )
                }
                sub={positionInRangeLabel(pos52) ?? undefined}
              />
              <StatRow
                label="P/E (TTM)"
                value={pe !== null ? pe.toFixed(1) : 'n/a'}
                sub={peHistoryNote(pe, peRange) ?? undefined}
              />
            </div>
            {data.stats.marketCapEstimated && (
              <p className="text-xs text-white/30 mt-1">* estimated from share price × latest reported shares outstanding</p>
            )}
          </ProfileSection>

          {data.description && (
            <ProfileSection
              n={2}
              title="Company overview"
              question={`What does ${shortName} do?`}
              note="If you can't say what they sell and who pays for it in one sentence after reading this, you don't understand the company yet — keep that sentence in mind while you read the numbers."
            >
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{data.description.extract}</p>
              {data.filingInsights && data.filingInsights.segments.length > 0 && (
                <dl className="mt-3">
                  <div className="grid grid-cols-[6.5rem_1fr] gap-x-3">
                    <dt className="text-white/40 text-[13px] pt-[1px]">What they sell</dt>
                    <dd className="text-sm text-white/85 leading-relaxed">{data.filingInsights.segments.join(' · ')}</dd>
                  </div>
                </dl>
              )}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                {data.filingInsights ? (
                  <>
                    <span className="text-white/40 text-[13px]">
                      From the {data.filingInsights.form}{filingDateText ? ` filed ${filingDateText}` : ''}
                    </span>
                    <span className="text-white/25 text-[13px]">·</span>
                    <ExternalLink href={data.description.url}>Read {bizItem}</ExternalLink>
                    {data.profile && (
                      <>
                        <span className="text-white/25 text-[13px]">·</span>
                        <ExternalLink href={edgarCompanyUrl(data.profile.cik)}>All filings</ExternalLink>
                      </>
                    )}
                  </>
                ) : (
                  <ExternalLink href={data.description.url}>
                    {data.description.source === 'sec' ? 'Read filings on EDGAR' : 'Read more on Wikipedia'}
                  </ExternalLink>
                )}
              </div>
              <FactGrid
                facts={[
                  { label: 'Founded', value: data.description.founded },
                  { label: 'CEO', value: data.description.ceo },
                  {
                    label: 'Employees',
                    value:
                      data.profile?.employees != null
                        ? formatInt(data.profile.employees)
                        : data.filingInsights?.employeeCount
                          ? `${data.filingInsights.employeeCount.approximate ? '~' : ''}${formatInt(data.filingInsights.employeeCount.count)}`
                          : null,
                  },
                  {
                    label: 'Headquarters',
                    value: formatHeadquarters(data.profile?.address) ?? data.description.headquarters,
                  },
                ]}
              />
            </ProfileSection>
          )}

          <ProfileSection
            n={3}
            title="Business model"
            question={`How does ${shortName} make money?`}
            note="One segment above about 70% of revenue means the company's fortunes ride on that one market. Also check customer concentration — a line like “top two customers = 30% of revenue” is a risk, not a boast."
          >
            {data.filingInsights?.businessModel ? (
              <>
                <p className="text-sm text-white/75 leading-relaxed">{data.filingInsights.businessModel}</p>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">
                  From the segment, product, and sales subsections of {bizItem} (Business) — what each part of the
                  company sells, in its own words.
                </p>
              </>
            ) : data.filingInsights?.business ? (
              <>
                <p className="text-sm text-white/75 leading-relaxed">{data.filingInsights.business}</p>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">
                  From {bizItem} (Business) of the latest {annualForm} — no separate segment or product subsection was
                  found, so this is the filing&apos;s opening description.
                </p>
              </>
            ) : (
              <p className="text-sm text-white/70 leading-relaxed">
                The latest {annualForm} wasn&apos;t available for this lookup, so this section still needs the filing
                itself: {bizItem} (Business) for the model, and the segment notes near the financial statements for
                the split.
              </p>
            )}
            {data.filingInsights?.segmentRevenue && (
              <div className="mt-4">
                <ChartSubhead>
                  Where the revenue comes from, FY
                  {data.filingInsights.segmentRevenue.years[data.filingInsights.segmentRevenue.years.length - 1]}
                </ChartSubhead>
                <SegmentMixBar series={data.filingInsights.segmentRevenue} shortName={shortName} />
              </div>
            )}
            {data.filingInsights?.segmentRevenue && data.filingInsights.segmentRevenue.years.length > 1 && (
              <div className="mt-4">
                <ChartSubhead>
                  How the mix changed, {data.filingInsights.segmentRevenue.years[0]}–
                  {data.filingInsights.segmentRevenue.years[data.filingInsights.segmentRevenue.years.length - 1]}
                </ChartSubhead>
                <SegmentMixHistory series={data.filingInsights.segmentRevenue} />
              </div>
            )}
            {!data.filingInsights?.segmentRevenue && data.filingInsights && (
              <p className="text-sm text-white/70 leading-relaxed mt-3">
                {data.filingInsights.singleSegment
                  ? `${shortName} reports one segment, so all revenue comes from one business.`
                  : `Segment revenue: see the ${data.filingInsights.form} segment note.`}
              </p>
            )}
            {data.filingInsights?.segmentOpIncome && (
              <div className="mt-4">
                <ChartSubhead>
                  Where the profit comes from, FY
                  {data.filingInsights.segmentOpIncome.years[data.filingInsights.segmentOpIncome.years.length - 1]}
                </ChartSubhead>
                <SegmentProfitBars series={data.filingInsights.segmentOpIncome} />
              </div>
            )}
            {data.filingInsights?.customerConcentration && (
              <p className="text-sm text-amber-200/90 leading-relaxed mt-3">
                ⚠ {data.filingInsights.customerConcentration.who}: {data.filingInsights.customerConcentration.pct}% of
                revenue.
              </p>
            )}
            {data.filingInsights?.segmentRevenue || data.filingInsights?.segmentOpIncome ? (
              <p className="text-xs text-white/40 mt-3 leading-relaxed">
                From the {data.filingInsights.form}
                {filingDateText ? ` filed ${filingDateText}` : ''} ·{' '}
                <ExternalLink href={data.filingInsights.sourceUrl}>Segment note</ExternalLink>
              </p>
            ) : (
              <div className="mt-2">
                {annualUrl ? (
                  <ExternalLink href={annualUrl}>Open the latest {annualForm} — {bizItem}, then the segment notes</ExternalLink>
                ) : (
                  data.profile && <ExternalLink href={edgarCompanyUrl(data.profile.cik)}>Find the {annualForm} on EDGAR</ExternalLink>
                )}
              </div>
            )}
          </ProfileSection>

          <ProfileSection
            n={4}
            title="Competition and edge"
            question={`Who is ${shortName} up against, and why does it win?`}
            note={`A company that can't name its edge in ${bizItem} usually doesn't have one. Look for switching costs, network effects, or a cost advantage — not adjectives.`}
          >
            {data.filingInsights?.competition ? (
              <>
                <p className="text-sm text-white/75 leading-relaxed">{data.filingInsights.competition}</p>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">
                  From the Competition subsection of {bizItem}, in the company&apos;s own words.
                </p>
              </>
            ) : (
              <p className="text-sm text-white/70 leading-relaxed">
                Named competitors come from the {annualForm}&apos;s {bizItem} (the Competition subsection) — no
                readable subsection was found in this filing.
              </p>
            )}
            {data.profile?.sicDescription && (
              <p className="text-xs text-white/40 mt-2 leading-relaxed">
                EDGAR groups {data.ticker} under SIC {data.profile.sic} ({data.profile.sicDescription}); same-code
                filers are the rough peer set.
              </p>
            )}
            <div className="mt-2">
              {annualUrl ? (
                <ExternalLink href={annualUrl}>Open the latest {annualForm} — {bizItem}, Competition</ExternalLink>
              ) : (
                data.profile && <ExternalLink href={edgarCompanyUrl(data.profile.cik)}>Find the {annualForm} on EDGAR</ExternalLink>
              )}
            </div>
          </ProfileSection>

          {data.financials && (
            <div>
              <PartHead n={2} title="Judge the numbers" lede="Five fiscal years plus TTM, all from filed XBRL. Every section below reads off this table." />
              <div className="mt-4">
              <FinancialsTable series={data.financials} missing={data.missingFinancials} years={years} peHistory={data.peHistory} psHistory={data.psHistory} ttm={data.ttm} pe={pe} ps={ps} />
              <div className="text-xs text-white/40 mt-3 space-y-1 leading-relaxed">
                {data.ttm && <p><strong className="text-white/70">TTM</strong> — trailing 12 months, so the picture isn&apos;t a year out of date. Balances show the latest quarter instead.</p>}
                {finYears.length > 0 && finYears.length < 5 && (
                  <p>Showing all {finYears.length} fiscal years on record.</p>
                )}
                {fyeMonth && fyeMonth !== 'December' && finYears.length > 0 && (
                  <p>Fiscal year ends in {fyeMonth} — FY{finYears[finYears.length - 1]} covered {fiscalYearSpan(fyeMonth, finYears[finYears.length - 1])}.</p>
                )}
                {data.splitAdjusted && <p>EPS and share counts restated for stock splits.</p>}
                <p className="pt-1">Source: SEC XBRL company facts, annual (10-K/20-F) filings.</p>
              </div>
              </div>
            </div>
          )}

          {data.financials && (
            <ProfileSection
              n={5}
              title="Growth"
              question={`Is ${shortName} getting bigger?`}
              note="Growing plus profitable is the combo to look for. Revenue growth with flat or falling EPS means the growth isn't reaching shareholders — check section 8 for dilution."
            >
              <div className="grid md:grid-cols-2 gap-3">
                <StatRow label="Revenue (TTM)" value={ttmVal('revenue') !== null ? formatMoney(ttmVal('revenue')) : '—'} />
                <StatRow label="Revenue growth, last year" value={latestRevYoy !== null ? formatPct(latestRevYoy) : '—'} />
                <StatRow label="Revenue growth, per year" value={revCagr !== null ? formatPct(revCagr) : '—'} />
                <StatRow label="EPS growth, per year" value={epsCagr !== null ? formatPct(epsCagr) : 'n/a'} />
              </div>
            </ProfileSection>
          )}

          {data.financials && (
            <ProfileSection
              n={6}
              title="Profitability"
              question={`Is ${shortName} a good business?`}
              note="Net margin — cents of profit kept per $1 of revenue — is the single fastest read on business quality. Compare it down the table: is each new dollar of revenue more profitable than the last, or less?"
            >
              <div className="grid md:grid-cols-2 gap-3">
                <StatRow label="Gross margin" value={grossMarginFy !== null ? formatPct(grossMarginFy) : '—'} />
                <StatRow label="Operating margin" value={opMarginFy !== null ? formatPct(opMarginFy) : '—'} />
                <StatRow label="Net margin (TTM)" value={netMarginTtm !== null ? formatPct(netMarginTtm) : '—'} />
                <StatRow label="Return on equity" value={roe !== null ? formatPct(roe) : '—'} />
              </div>
            </ProfileSection>
          )}

          {data.financials && (
            <ProfileSection
              n={7}
              title="Financial health"
              question={`Could ${shortName} survive a bad year?`}
              note="Profit can be accounting; cash is harder to fake. Cash is the buffer for buybacks, dividends, and downturns — compare debt against cash and a year's free cash flow, not against zero."
            >
              <div className="grid md:grid-cols-2 gap-3">
                <StatRow label="Cash" value={formatMoney(ttmVal('cash') ?? fyVal('cash'))} />
                <StatRow label="Total debt" value={formatMoney(ttmVal('debt') ?? fyVal('debt'))} />
                <StatRow label="Free cash flow (TTM)" value={ttmVal('fcf') !== null ? formatMoney(ttmVal('fcf')) : fyVal('fcf') !== null ? formatMoney(fyVal('fcf')) : '—'} />
                <StatRow label="Debt / equity" value={debtToEquity !== null ? debtToEquity.toFixed(2) : '—'} />
              </div>
            </ProfileSection>
          )}

          {data.financials && (
            <ProfileSection
              n={8}
              title="Shareholder returns"
              question={`What do ${shortName} owners get back?`}
              note="A falling share count means buybacks are concentrating your slice; a rising one means dilution. Pair the dividend with the payout ratio — over 100% for long means the dividend is borrowed, not earned."
            >
              <div className="grid md:grid-cols-2 gap-3">
                <StatRow label="Dividend yield" value={data.stats.dividendYield ?? '—'} />
                <StatRow label="Payout ratio" value={payout !== null ? formatPct(payout, 0) : data.stats.dividendYield === 'None' ? 'n/a' : '—'} />
                <StatRow
                  label="Share count trend"
                  value={shareChange !== null ? `${shareChange <= 0 ? '−' : '+'}${formatPct(Math.abs(shareChange), 0)} ${shareChange <= 0 ? 'buybacks' : 'dilution'}` : '—'}
                />
                {data.profile?.sharesOutstanding !== null && data.profile?.sharesOutstanding !== undefined && (
                  <StatRow
                    label="Shares outstanding"
                    value={`${formatInt(data.profile.sharesOutstanding)}${data.profile.sharesOutstandingEstimated ? ' *' : ''}`}
                  />
                )}
              </div>
              {data.profile?.sharesOutstandingEstimated && (
                <p className="text-xs text-white/30 mt-1">* estimated from market cap ÷ share price (multi-class filer)</p>
              )}
            </ProfileSection>
          )}

          <PartHead n={3} title="Price and people" lede="What the market charges, how the stock behaved, and who's in charge." />

          {data.financials && (
            <ProfileSection
              n={9}
              title="Valuation"
              question={`What is the market paying for ${shortName}?`}
              note="A multiple means nothing alone — compare it to the stock's own history in the table. Below its usual range can mean cheap or troubled; above it can mean loved or overpriced. The table tells you which is normal here."
            >
              <div className="grid md:grid-cols-2 gap-3">
                <StatRow label="P/E ratio (TTM)" value={pe !== null ? pe.toFixed(1) : 'n/a'} />
                <StatRow label="P/E, 5-year range" value={peRange ? `${peRange[0].toFixed(1)} – ${peRange[1].toFixed(1)}` : '—'} />
                <StatRow label="Price / sales (TTM)" value={ps !== null ? ps.toFixed(1) : 'n/a'} />
                <StatRow label="P/S, 5-year range" value={psRange ? `${psRange[0].toFixed(1)} – ${psRange[1].toFixed(1)}` : '—'} />
              </div>
            </ProfileSection>
          )}

          <ProfileSection
            n={10}
            title="Stock performance"
            question={`How has ${shortName} done?`}
            note="Past returns predict nothing, but the 52-week position tells you whether you'd be buying after a run-up or a selloff. Volume spikes mark the days the market cared."
          >
            {data.priceHistory && data.priceHistory.length >= 2 ? (
              <div className="space-y-3">
                <PriceChart history={data.priceHistory} />
                <div className="grid md:grid-cols-2 gap-3">
                  <StatRow label="1-year return" value={ret1 !== null ? formatPct(ret1) : '—'} />
                  <StatRow
                    label={histSpanYears >= 4.5 ? '5-year return' : `Return since ${histFirst?.slice(0, 4) ?? 'IPO'}`}
                    value={ret5 !== null ? formatPct(ret5) : '—'}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40">Price history unavailable — showing the latest snapshot only.</p>
            )}
            <div className="grid md:grid-cols-2 gap-3 mt-1">
              <StatRow label="52-week range" value={week52 ? `${formatPrice(week52.lo)} – ${formatPrice(week52.hi)}` : '—'} />
              <StatRow label="Position in range" value={positionInRangeLabel(pos52) ?? '—'} />
              <StatRow label="Volume" value={q?.volume ? formatInt(q.volume) : '—'} />
              <StatRow label="Avg volume" value={data.stats.avgVolume ? formatInt(data.stats.avgVolume) : '—'} />
            </div>
          </ProfileSection>

          <ProfileSection
            n={11}
            title="Management and ownership"
            question={`Who runs ${shortName}, and who owns it?`}
            note="Founders and executives with big stakes think like owners. On Form 4s, routine post-earnings diversification is normal — sudden cluster-selling is a question."
          >
            {data.description?.ceo && (
              <div className="grid md:grid-cols-2 gap-3 mb-2">
                <StatRow label="CEO" value={data.description.ceo} />
              </div>
            )}
            <p className="text-sm text-white/70 leading-relaxed">
              Insider ownership and recent buys and sells come from the proxy statement (DEF 14A) and Form 4 filings —
              not automated yet. Start here:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.proxyUrl && (
                <li>
                  <ExternalLink href={data.proxyUrl}>Latest proxy statement (DEF 14A) — pay, tenure, ownership</ExternalLink>
                </li>
              )}
              {form4Url && (
                <li>
                  <ExternalLink href={form4Url}>Insider transactions (Form 4) on EDGAR</ExternalLink>
                </li>
              )}
            </ul>
          </ProfileSection>

          <PartHead n={4} title="Risks and what's new" lede="What could go wrong, and what just changed." />

          <ProfileSection
            n={12}
            title="Risks and recent events"
            question={`What could go wrong at ${shortName}, and what just changed?`}
            note="Risk sections are written by lawyers — every company lists everything. The tell is order and specificity: the first risks, and the ones with numbers, are the real ones."
          >
            {data.filingInsights && data.filingInsights.risks.length > 0 ? (
              <>
                <p className="text-sm text-white/70 leading-relaxed">
                  The {annualForm}&apos;s {riskItem} names these first, in the company&apos;s own words:
                </p>
                <ul className="mt-2 mb-4 space-y-1.5 text-sm text-white/75 leading-relaxed list-disc pl-5">
                  {data.filingInsights.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-white/70 leading-relaxed">
                The top risks live in the {annualForm}&apos;s {riskItem} (Risk Factors), in the company&apos;s own
                words — no readable list was found in this filing. Meanwhile, every material event below is labeled:
              </p>
            )}
            <div className="mt-2 mb-4">
              {annualUrl ? (
                <ExternalLink href={annualUrl}>Open the latest {annualForm} — {riskItem}, Risk Factors</ExternalLink>
              ) : (
                data.profile && <ExternalLink href={edgarCompanyUrl(data.profile.cik)}>Find the {annualForm} on EDGAR</ExternalLink>
              )}
            </div>
            {eightKs.length > 0 && (
              <ul className="divide-y divide-white/5 mb-4">
                {eightKs.slice(0, 5).map((f) => (
                  <li key={f.url} className="flex items-center gap-3 py-2 text-sm">
                    <span className="text-white/85">{f.eventLabel ?? 'Material event'}</span>
                    <span className="text-white/50 text-xs tabular-nums">{f.filingDate}</span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-sm text-[#8ab4f8] underline decoration-[#8ab4f8]/40 underline-offset-[3px] hover:text-white hover:decoration-white transition-colors shrink-0"
                    >
                      EDGAR
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </ProfileSection>

          {data.filings.length > 0 && (
            <div>
              <SectionTitle>Recent filings</SectionTitle>
              {pinnedAnnual && (
                <a
                  href={pinnedAnnual.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded border px-3 py-2.5 mb-3 text-sm hover:bg-white/5 transition-colors"
                  style={{ borderColor: `${ACCENT}66` }}
                >
                  <span
                    className="shrink-0 border rounded px-2 py-0.5 text-xs font-bold"
                    style={{ borderColor: `${ACCENT}99`, color: ACCENT }}
                    title={FILING_LABELS[pinnedAnnual.form] ?? pinnedAnnual.form}
                  >
                    {pinnedAnnual.form}
                  </span>
                  <span className="text-white/85">
                    Latest annual report <span className="text-white/40 text-xs tabular-nums">· filed {pinnedAnnual.filingDate}</span>
                  </span>
                  <span className="ml-auto text-xs font-bold shrink-0" style={{ color: ACCENT }}>
                    Start here
                  </span>
                </a>
              )}
              <ul className="divide-y divide-white/5">
                {otherFilings.map((f) => (
                  <li key={f.url} className="flex items-center gap-3 py-2 text-sm">
                    <span
                      className="shrink-0 border rounded px-2 py-0.5 text-xs font-bold"
                      style={isAnnualForm(f.form) ? { borderColor: `${ACCENT}99`, color: ACCENT } : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
                      title={FILING_LABELS[f.form] ?? f.form}
                    >
                      {f.form}
                    </span>
                    <span className="text-white/50 text-xs tabular-nums">{f.filingDate}</span>
                    {f.eventLabel && <span className="text-white/70 text-xs">{f.eventLabel}</span>}
                    {f.reportDate && !f.eventLabel && <span className="text-white/30 text-xs tabular-nums hidden sm:inline">period {f.reportDate}</span>}
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-sm text-[#8ab4f8] underline decoration-[#8ab4f8]/40 underline-offset-[3px] hover:text-white hover:decoration-white transition-colors shrink-0"
                    >
                      EDGAR
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/30 mt-2">
                10-K/20-F annual report · 10-Q quarterly update · 8-K material event. Start with {bizItem} (Business)
                — the company describing itself, in its own words.
              </p>
            </div>
          )}

          <div className="text-xs text-white/30 leading-relaxed border-t border-white/10 pt-4 space-y-1">
            <p className="font-bold text-white/50">Sources and limits</p>
            <p>
              Company facts and filings: SEC EDGAR (the companies&apos; own filed figures, not estimates). Quotes,
              market stats, and price history: Nasdaq, delayed and back-adjusted for splits. Company overview,
              business, competition, and risk excerpts: the latest annual filing&apos;s own text.
            </p>
            <p>
              One-stop, not advice: this page is for research and learning — not investment advice. ETFs and funds
              show the quote and overview but no financials table, because a fund has no revenue or profit of its own.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
