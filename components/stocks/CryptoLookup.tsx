'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Link as LinkIcon, Check, Search } from 'lucide-react';
import type { CoinResponse, CoinSuggestion } from '@/lib/crypto';
import { coinShareText, formatCryptoPrice, normalizeCoinId, supplyEmittedPct } from '@/lib/crypto';
import { formatCompact, formatMoney, formatPct, positionInRangeLabel, shareCacheBuster, stockShareLinks } from '@/lib/stocks';
import { categoryColor } from '@/lib/categoryColors';
import {
  ChartSubhead,
  ExternalLink,
  FactGrid,
  LinkedInIcon,
  ProfileSection,
  StatRow,
  XIcon,
  shareButtonClass,
} from './ProfileBlocks';

const ACCENT = categoryColor('Investing');
// Actions are yellow (Look up, Subscribe); the category accent stays on
// headings, never on prices.
const ACTION_BG = '#facc15';
const RECENT_KEY = 'crypto-recent';
const EXAMPLES = ['BTC', 'ETH', 'SOL'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((t): t is string => typeof t === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

// YYYY-MM-DD without Date parsing (no timezone surprises, pure render).
function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1] ?? '';
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

function fmtMonthYear(iso: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return null;
  return `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const up = points[points.length - 1] >= points[0];
  const W = 600;
  const H = 150;
  const x = (i: number) => 2 + (i / (points.length - 1)) * (W - 4);
  const y = (v: number) => H - 4 - ((v - min) / (max - min || 1)) * (H - 8);
  const pts = points.map((p, i) => `${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  const stroke = up ? '#4ade80' : '#f87171';
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" role="img" aria-label="Hourly prices, last 7 days">
        <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r="3.5" fill={stroke} />
      </svg>
      <figcaption className="flex justify-between text-xs text-white/35 tabular-nums">
        <span>7 days ago</span>
        <span>
          {formatCryptoPrice(min)} – {formatCryptoPrice(max)}
        </span>
        <span>now</span>
      </figcaption>
    </figure>
  );
}

export default function CryptoLookup({
  initialCoin,
  onBack,
}: {
  initialCoin: string;
  // Back to the unified stock search (the widget swaps components; no tabs).
  onBack?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(initialCoin);
  const [data, setData] = useState<CoinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => (typeof window === 'undefined' ? [] : loadRecent()));
  const [copied, setCopied] = useState(false);
  // Per-share cache buster (?v=...): X caches cards per page URL for days,
  // so each lookup mints a fresh share URL. Set beside setData (never
  // during render) so server and client HTML match.
  const [shareToken, setShareToken] = useState('');
  const mounted = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Symbol/name resolution against CoinGecko search. Returns the parsed
  // /api/crypto-search payload ({ id } | { suggestions } | error) or null
  // when the endpoint itself is unreachable.
  async function resolveQuery(raw: string): Promise<{ id?: string; suggestions?: CoinSuggestion[] } | null> {
    try {
      const res = await fetch(`/api/crypto-search?q=${encodeURIComponent(raw)}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  function suggestionError(raw: string, suggestions: CoinSuggestion[]): string {
    return `No data for "${raw.trim()}". Did you mean ${suggestions.map((s) => s.symbol).join(', ')}?`;
  }

  async function lookup(raw: string, retried = false): Promise<void> {
    const trimmed = raw.trim();
    if (!trimmed) {
      setError('Enter a coin name or symbol — e.g. Solana or SOL.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setCopied(false);
    try {
      // Id-shaped input (lowercase slug) goes direct; symbols and names
      // resolve through search first, since CoinGecko ids aren't symbols.
      const idShaped = /^[a-z0-9-]+$/.test(trimmed) && trimmed === trimmed.toLowerCase();
      let id = idShaped ? normalizeCoinId(trimmed) : '';
      if (!idShaped && !retried) {
        const r = await resolveQuery(trimmed);
        if (r?.id) id = r.id;
        else if (r?.suggestions?.length) throw new Error(suggestionError(trimmed, r.suggestions));
        else throw new Error('Enter a coin name or symbol — e.g. Solana or SOL.');
      }
      const res = await fetch(`/api/crypto/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) {
        // Id-shaped but unknown ("bitcon"): one resolution retry before
        // surfacing the error. The id guard below stops retry loops.
        if (!retried) {
          const r = await resolveQuery(trimmed);
          if (r?.id && r.id !== id) return lookup(r.id, true);
          if (r?.suggestions?.length) throw new Error(suggestionError(trimmed, r.suggestions));
        }
        throw new Error(json?.error || 'Lookup failed.');
      }
      setData(json as CoinResponse);
      // Fresh share URL per lookup: X caches cards per page URL for days.
      setShareToken(shareCacheBuster());
      setRecent((prev) => {
        const next = [id, ...prev.filter((t) => t !== id)].slice(0, 5);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* private mode */
        }
        return next;
      });
      router.replace(`${pathname}?coin=${id}`, { scroll: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Search-first landing: the page opens empty and only a shared ?coin=
    // link auto-runs, so a lookup result stays shareable.
    const start = normalizeCoinId(initialCoin) || normalizeCoinId(searchParams.get('coin') ?? '');
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

  useEffect(() => {
    // "/" focuses the lookup input from anywhere (unless already typing).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Mobile uses the mock's short placeholder; placeholder text can't swap
  // via CSS, so track the sm breakpoint. Copy-only: no layout shift.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const up = (data?.changePct24h ?? 0) >= 0;
  // Nothing looked up yet: the search block centers like a search homepage.
  const idle = !data && !loading && !error;

  const shareUrl =
    data && typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}?coin=${data.id}${shareToken ? `&v=${shareToken}` : ''}`
      : '';
  const shareText = data
    ? coinShareText(
        data.symbol,
        data.name,
        data.price !== null ? formatCryptoPrice(data.price) : null,
        data.changePct24h !== null ? formatPct(data.changePct24h) : null,
      )
    : '';
  const shareLinks = stockShareLinks(shareUrl, shareText);

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rangePos =
    data?.price !== null && data?.price !== undefined && data?.low24h != null && data?.high24h != null && data.high24h > data.low24h
      ? (data.price - data.low24h) / (data.high24h - data.low24h)
      : null;
  const rangeLabel = positionInRangeLabel(rangePos);
  const emitted = data ? supplyEmittedPct(data.circulating, data.maxSupply) : null;
  const returns: { label: string; value: number | null }[] = data
    ? [
        { label: '24 hours', value: data.changePct24h },
        { label: '7 days', value: data.changePct7d },
        { label: '30 days', value: data.changePct30d },
        { label: '1 year', value: data.changePct1y },
      ]
    : [];
  const coingeckoUrl = data ? `https://www.coingecko.com/en/coins/${data.id}` : '';

  return (
    // Static text trips browser spellcheck on symbols (dotted underlines);
    // nothing here is editable.
    <div spellCheck={false}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-xs font-bold text-white/45 hover:text-white/80 transition-colors"
        >
          ← Back to search
        </button>
      )}
      {idle ? (
        <>
          <form
            className="mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              lookup(input);
            }}
          >
            <label htmlFor="coin" className="sr-only">
              Coin name or symbol
            </label>
            <div className="relative flex-1 min-w-0">
              <Search size={18} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                id="coin"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isNarrow ? 'Coin or symbol' : 'Search a coin or symbol, like Solana or SOL'}
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                className="h-14 w-full rounded-[14px] border border-white/15 bg-black/40 pl-11 pr-24 text-[15px] text-white/90 placeholder:text-white/30 transition-colors focus:border-[#facc15]/80 focus:outline-none sm:pr-44"
              />
              <button
                type="submit"
                disabled={loading || input.trim() === ''}
                aria-label="Look up"
                className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center gap-1.5 rounded-[10px] font-sans text-[15px] font-semibold transition hover:brightness-110 active:translate-y-[calc(-50%+1px)] disabled:cursor-default sm:h-11 sm:w-auto sm:px-4"
                style={input.trim() ? { background: ACTION_BG, color: '#0a0a0a' } : { background: '#2a2d33', color: '#6b7280' }}
              >
                <span className="hidden sm:inline">{loading ? 'Looking up' : 'Look up'}</span>
                {loading ? (
                  <span
                    aria-hidden
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black"
                  />
                ) : (
                  <span aria-hidden>→</span>
                )}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-white/40 text-xs mr-1">{recent.length > 0 ? 'Recent' : 'Try'}</span>
            {(recent.length > 0 ? recent : EXAMPLES).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setInput(t);
                  lookup(t);
                }}
                className="bg-white/10 hover:bg-white/15 text-white/85 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: ACCENT }}>
              Crypto lookup
            </h2>
            <p className="text-white/60 text-sm mb-4">
              Price, supply, tokenomics, and trend for thousands of coins. Type a symbol to start.
            </p>

            <form
              className="mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                lookup(input);
              }}
            >
              <label htmlFor="coin" className="sr-only">
                Coin symbol
              </label>
              <div className="relative">
                <input
                  id="coin"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="SYMBOL  e.g. SOL"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-11 w-full rounded-[10px] border border-white/15 bg-black/40 pl-3 pr-[104px] text-sm text-white/90 placeholder:text-white/30 transition-colors focus:border-[#facc15]/80 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || input.trim() === ''}
                  aria-label="Look up"
                  className="absolute right-1 top-1/2 flex h-9 -translate-y-1/2 items-center justify-center gap-1.5 rounded-lg px-3 font-sans text-[13px] font-semibold transition hover:brightness-110 active:translate-y-[calc(-50%+1px)] disabled:cursor-default"
                  style={input.trim() ? { background: ACTION_BG, color: '#0a0a0a' } : { background: '#2a2d33', color: '#6b7280' }}
                >
                  {loading ? 'Looking up' : 'Lookup'}
                  {loading ? (
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black"
                    />
                  ) : (
                    <span aria-hidden>→</span>
                  )}
                </button>
              </div>
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
        </>
      )}

      {loading && <p className="text-sm text-white/50 mt-6 animate-pulse">Fetching coin data…</p>}

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
          {data.lowRank && !data.degraded && (
            <div className="border border-yellow-500/40 rounded p-3 text-xs text-yellow-200/80 bg-yellow-950/10">
              ! Outside the top {500} by market cap — thin coverage, verify key figures elsewhere.
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {data.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.image} alt="" aria-hidden className="w-10 h-10 rounded-full" />
              )}
              <div>
                <p className="text-xs text-white/40">
                  {[`$${data.symbol}`, data.rank !== null ? `Rank #${data.rank}` : 'Unranked'].join(' · ')}
                </p>
                <h3 className="font-serif text-2xl font-bold text-white/95 mt-1">{data.name}</h3>
              </div>
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

          <ProfileSection
            n={1}
            title="Snapshot"
            note="Market cap is the price of every coin combined. Compare coins by it, never by unit price — one BTC costs more than one SOL mostly because fewer exist."
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
              <span className="text-3xl font-bold text-white/95 tabular-nums">{formatCryptoPrice(data.price)}</span>
              {data.changePct24h !== null && (
                <span className={`text-base font-semibold tabular-nums ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? '↑' : '↓'} {formatPct(data.changePct24h)}
                  {data.change24h !== null && (
                    <span className="text-sm font-normal text-white/50">
                      {' '}
                      ({data.change24h >= 0 ? '+' : '−'}${formatCompact(Math.abs(data.change24h))})
                    </span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">
              24-hour move · crypto trades around the clock, so there is no close
              {data.lastUpdated ? ` · data as of ${data.lastUpdated.slice(0, 10)}` : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <StatRow
                label="Market cap"
                value={data.marketCap !== null ? formatMoney(data.marketCap) : '—'}
                sub={data.rank !== null ? `Rank #${data.rank}` : 'Unranked'}
              />
              <StatRow label="24h volume" value={data.volume24h !== null ? formatMoney(data.volume24h) : '—'} />
              <StatRow
                label="All-time high"
                value={data.ath !== null ? formatCryptoPrice(data.ath) : '—'}
                sub={
                  data.athChangePct !== null
                    ? `${formatPct(data.athChangePct)}${fmtMonthYear(data.athDate) ? ` · ${fmtMonthYear(data.athDate)}` : ''}`
                    : undefined
                }
              />
            </div>

            {data.low24h !== null && data.high24h !== null && data.price !== null && data.high24h > data.low24h && (
              <div className="mt-4">
                <ChartSubhead>24-hour range</ChartSubhead>
                <div className="flex items-center gap-3 text-sm tabular-nums">
                  <span className="text-white/50 text-xs">{formatCryptoPrice(data.low24h)}</span>
                  <div className="relative flex-1 h-1.5 rounded-full bg-white/10" role="img" aria-label={`Price ${rangeLabel ?? ''} of its 24-hour range`}>
                    <span
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/90"
                      style={{ left: `${Math.min(100, Math.max(0, (rangePos ?? 0) * 100))}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs">{formatCryptoPrice(data.high24h)}</span>
                  {rangeLabel && <span className="text-white/70 text-xs shrink-0">{rangeLabel}</span>}
                </div>
              </div>
            )}

            <p className="text-xs text-white/35 mt-4">
              Market data by <ExternalLink href="https://www.coingecko.com">CoinGecko</ExternalLink>.
            </p>
          </ProfileSection>

          {!data.degraded && (
            <>
              <ProfileSection n={2} title="Overview" question={`What is ${data.name}?`} note="Categories are CoinGecko's labels, not a rating. Read the description for what the network does, then check who actually uses it before going further.">
                {data.description ? (
                  <p className="text-[15px] text-white/80 leading-relaxed font-sans">{data.description}</p>
                ) : (
                  <p className="text-sm text-white/40">No description available for this coin.</p>
                )}
                <FactGrid
                  facts={[
                    { label: 'Launched', value: fmtDate(data.genesisDate) },
                    { label: 'Categories', value: data.categories.length > 0 ? data.categories.slice(0, 3).join(' · ') : null },
                    {
                      label: 'Community',
                      value: data.sentimentUp !== null ? `${Math.round(data.sentimentUp)}% bullish` : null,
                    },
                  ]}
                />
              </ProfileSection>

              <ProfileSection
                n={3}
                title="Tokenomics"
                question={`How many ${data.symbol} exist?`}
                note="Fully diluted value prices coins that don't exist yet. When it dwarfs market cap, future unlocks can dilute today's holders — check the vesting schedule."
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatRow
                    label="Circulating"
                    value={data.circulating !== null ? `${formatCompact(data.circulating)} ${data.symbol}` : '—'}
                  />
                  <StatRow
                    label="Max supply"
                    value={data.maxSupply !== null ? `${formatCompact(data.maxSupply)} ${data.symbol}` : 'No cap'}
                    sub={data.maxSupply === null ? 'unlocks never end' : undefined}
                  />
                  <StatRow
                    label="Emitted"
                    value={emitted !== null ? formatPct(emitted, 0) : '—'}
                    sub={emitted !== null ? 'of max supply' : undefined}
                  />
                </div>
                {emitted !== null && (
                  <div className="mt-4">
                    <div
                      className="flex h-3 rounded-full overflow-hidden bg-white/[0.06]"
                      role="img"
                      aria-label={`${formatPct(emitted, 0)} of max supply emitted`}
                    >
                      <div className="h-full bg-amber-300" style={{ width: `${emitted * 100}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-white/75 leading-relaxed font-sans">
                      {formatPct(emitted, 0)} of all {data.symbol} that will ever exist is already in circulation
                      {data.fdv !== null && data.marketCap ? (
                        <>
                          {' '}— at today&apos;s price the rest is worth {formatMoney(data.fdv - data.marketCap)} yet to unlock.
                        </>
                      ) : (
                        '.'
                      )}
                    </p>
                  </div>
                )}
                {data.fdv !== null && (
                  <p className="mt-2 text-sm text-white/50">
                    Fully diluted value {formatMoney(data.fdv)}
                    {data.marketCap ? ` · ${(data.fdv / data.marketCap).toFixed(1)}× market cap` : ''}.
                  </p>
                )}
              </ProfileSection>

              <ProfileSection
                n={4}
                title="Market performance"
                question={`How has ${data.symbol} done lately?`}
                note="Wide swings are normal here — a 30% drawdown can be noise, not news. Judge the trend across months, not days, and never by one green candle."
              >
                {data.spark7d.length >= 2 ? (
                  <div className="mb-4">
                    <ChartSubhead>Last 7 days, hourly</ChartSubhead>
                    <Sparkline points={data.spark7d} />
                  </div>
                ) : (
                  <p className="text-sm text-white/40 mb-4">No recent price history available.</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {returns.map((r) => (
                    <StatRow
                      key={r.label}
                      label={r.label}
                      value={
                        r.value !== null ? (
                          <span className={r.value >= 0 ? 'text-green-400' : 'text-red-400'}>{formatPct(r.value)}</span>
                        ) : (
                          '—'
                        )
                      }
                    />
                  ))}
                </div>
              </ProfileSection>

              <ProfileSection
                n={5}
                title="Links and resources"
                question={`Where do I verify this?`}
                note="Primary sources beat influencers: the whitepaper for the design, explorers for on-chain facts, and the official site for announcements."
              >
                <ul className="space-y-2 text-sm">
                  {data.links.homepage && (
                    <li>
                      <ExternalLink href={data.links.homepage}>Official website ↗</ExternalLink>
                    </li>
                  )}
                  {data.links.whitepaper && (
                    <li>
                      <ExternalLink href={data.links.whitepaper}>Whitepaper ↗</ExternalLink>
                    </li>
                  )}
                  {data.links.explorers.map((e) => (
                    <li key={e}>
                      <ExternalLink href={e}>Block explorer ↗</ExternalLink>
                    </li>
                  ))}
                  <li>
                    <ExternalLink href={coingeckoUrl}>CoinGecko page ↗</ExternalLink>
                  </li>
                </ul>
              </ProfileSection>
            </>
          )}

          <div className="text-xs text-white/30 leading-relaxed border-t border-white/10 pt-4 space-y-1">
            <p className="font-bold text-white/50">Sources and limits</p>
            <p>
              Market data, supply, and descriptions: CoinGecko, cached a few minutes. Reference prices fall back to
              DeFiLlama when CoinGecko is unreachable. Small coins report thin or self-reported figures — cross-check
              anything that moves money.
            </p>
            <p>
              One-stop, not advice: this page is for research and learning — not investment advice. Coins can and do go
              to zero.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
