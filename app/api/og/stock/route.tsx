import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  pickLede,
  formatMoney,
  formatPct,
  formatQuoteChange,
  getStockData,
  latestValue,
  normalizeTicker,
  quoteDayLabel,
  sparklinePoints,
  yoyGrowth,
} from '@/lib/stocks';

// Profile-teaser card for a stock lookup: brand, ticker, what the company
// does, four key numbers, a revenue sparkline, and the price as a dated,
// secondary detail — honest even when X serves a cached copy days later.
// GET /api/og/stock?ticker=NVDA&d=2026-10-06
//
// The `d` param is a cache-buster from the page metadata (one URL per trading
// session); the renderer ignores it and always draws the latest data.
// Node runtime (not edge): the card reads the same getStockData profile as
// the page, which uses Next fetch caching. Responses carry their own
// Cache-Control so crawlers don't hammer upstream.
//
// Layout budget (1200x630): 60px side margins, content ends ~500px — the
// bottom ~110px stays empty because X overlays its caption there.

const W = 1200;
const H = 630;
const BG = '#0c0e10';
const PANEL = '#14171a';
const INK = '#f2f4f3';
const BODY = '#c7ced3';
const MUTED = '#9aa3a8';
const ACCENT = '#facc15'; // Investing category color
const UP = '#4ade80';
const DOWN = '#f87171';

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    // Satori parses ttf/otf/woff only (no woff2), so ask Google Fonts with an
    // ancient UA, which is served truetype. Anything failing falls back to
    // system sans — the layout never depends on the webfont.
    const css = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap', {
      headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)' },
    }).then((r) => {
      if (!r.ok) throw new Error('font css');
      return r.text();
    });
    const url = css.match(/https:\/\/[^)]+\.ttf/)?.[0];
    if (!url) return null;
    const buf = await fetch(url).then((r) => {
      if (!r.ok) throw new Error('font file');
      return r.arrayBuffer();
    });
    return buf;
  } catch {
    return null;
  }
}

function card(children: React.ReactNode, font: ArrayBuffer | null) {
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          color: INK,
          fontFamily: font ? 'Inter, sans-serif' : 'sans-serif',
          paddingLeft: 60,
          paddingRight: 60,
          paddingTop: 44,
        }}
      >
        {children}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: font ? [{ name: 'Inter', data: font, weight: 900, style: 'normal' }] : undefined,
      headers: { 'Cache-Control': 'public, max-age=3600' },
    },
  );
}

// Word-aware single-line truncation in width units: CJK glyphs run ~2x latin
// width, so they count double (a 20-F one-liner can be half Chinese).
// "Taiwan Semiconductor Manuf…" never happens — it cuts at the last space
// ("Taiwan Semiconductor…"); a cut ending mid-CJK keeps the hard cut, since
// CJK has no word spaces to honor.
function truncateLine(s: string, max: number): string {
  const w = (c: string) => (c.codePointAt(0)! > 0xff ? 2 : 1);
  let total = 0;
  for (const c of s) total += w(c);
  if (total <= max) return s;
  let used = 0;
  let cut = '';
  for (const c of s) {
    const cw = w(c);
    if (used + cw > max) break;
    used += cw;
    cut += c;
  }
  cut = cut.trimEnd();
  if (!cut) return '…';
  const last = [...cut].pop()!;
  if (w(last) === 2) return `${cut}…`;
  const sp = cut.lastIndexOf(' ');
  return `${sp > 8 ? cut.slice(0, sp) : cut}…`;
}

// Company-name text and size that fit beside the ticker on one line:
// estimates both widths (~0.68em for the caps ticker, ~0.6em mixed-case
// name), then shrinks the name (and, for pathological pairs, shortens it)
// into what's left. Names are SEC/Nasdaq latin-alphabet; CJK width only
// matters for one-liners. Verified against BRK.A + TSMC renders.
function fitName(
  ticker: string,
  name: string,
  colWidth: number,
  tickerPx: number,
): { text: string; px: number } {
  const avail = Math.max(colWidth - [...ticker].length * tickerPx * 0.68 - 20, 120);
  const text = truncateLine(name, Math.max(10, Math.min(30, Math.floor(avail / 18))));
  const px = Math.min(40, Math.max(24, Math.floor(avail / (Math.max([...text].length, 1) * 0.62))));
  return { text, px };
}

function BrandRow({ right }: { right: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800 }}>amoljadhav.ai</span>
      <span style={{ fontSize: 26, color: MUTED }}> · Company profile</span>
      {right && (
        <span style={{ fontSize: 24, color: MUTED, marginLeft: 'auto' }}>{truncateLine(right, 52)}</span>
      )}
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  const missing = value === '—' || value === 'n/a';
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: PANEL,
        borderRadius: 16,
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 22,
        paddingRight: 22,
      }}
    >
      <span style={{ fontSize: 20, color: MUTED, fontWeight: 700, letterSpacing: 3 }}>{label}</span>
      <span style={{ fontSize: 48, fontWeight: 900, color: missing ? MUTED : INK, marginTop: 8 }}>{value}</span>
      {sub ?? null}
    </div>
  );
}

function errorCard(kicker: string, title: string, sub: string, font: ArrayBuffer | null) {
  return card(
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow right={null} />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: ACCENT, letterSpacing: 4 }}>{kicker}</span>
        <span style={{ fontSize: 76, fontWeight: 900, marginTop: 12 }}>{title}</span>
        <span style={{ fontSize: 30, color: MUTED, marginTop: 12 }}>{sub}</span>
      </div>
    </div>,
    font,
  );
}

export async function GET(req: Request) {
  const ticker = normalizeTicker(new URL(req.url).searchParams.get('ticker') ?? '');
  const font = await loadFont();

  if (!ticker) {
    return errorCard('STOCK LOOKUP', 'Invalid ticker', 'Check the link and try again.', font);
  }

  const data = await getStockData(ticker).catch(() => null);
  if (!data) {
    return errorCard(ticker, 'Quote unavailable', `No data found for "${ticker}".`, font);
  }

  const q = data.quote;
  const name = displayCompanyName(data.companyName);
  const oneLiner = pickLede(data.description?.extract, data.filingInsights?.businessModel, 200) || null;
  const sectorLine = [data.stats.sector, data.stats.industry].filter(Boolean).join(' · ') || null;
  const day = q ? quoteDayLabel(q.lastTrade, q.marketStatus) : null;
  const move = q ? formatQuoteChange(q.change, q.changePct) : '—';
  const up = (q?.change ?? 0) >= 0;
  const moveColor = q && q.change !== null ? (up ? UP : DOWN) : MUTED;
  const priceStr =
    q?.price !== null && q?.price !== undefined
      ? `$${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;

  // No annual financials (ETFs, funds, fresh filers): price and the fund
  // description carry the card instead of tiles.
  if (!data.financials) {
    const etfTickerPx = ticker.length > 5 ? 84 : 100;
    const etfName = fitName(ticker, name, 1080, etfTickerPx);
    return card(
      // NOTE: no fragments anywhere in this file — this satori version lays
      // a fragment's children out as a row regardless of the parent direction.
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BrandRow right={sectorLine} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 }}>
          <span style={{ fontSize: etfTickerPx, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>
            {ticker}
          </span>
          <span style={{ fontSize: etfName.px, fontWeight: 800, marginLeft: 22, paddingBottom: 12 }}>
            {etfName.text}
          </span>
        </div>
        {oneLiner && (
          <div style={{ fontSize: 28, color: BODY, marginTop: 8 }}>{truncateLine(oneLiner, 68)}</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28 }}>
          <span style={{ fontSize: priceStr && priceStr.length > 10 ? 80 : 100, fontWeight: 900, lineHeight: 1 }}>
            {priceStr ?? 'Quote unavailable'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: moveColor }}>{move}</span>
            {day && <span style={{ fontSize: 34, color: MUTED, marginLeft: 14 }}>· {day}</span>}
            <span style={{ fontSize: 28, fontWeight: 700, color: ACCENT, marginLeft: 'auto' }}>Full profile →</span>
          </div>
        </div>
      </div>,
      font,
    );
  }

  // Profile card: the business, four key numbers, the revenue trend — price
  // secondary and dated.
  const seriesOf = (key: string) => data.financials?.find((s) => s.key === key);
  const revPts = seriesOf('revenue')?.points ?? [];
  const revYoy = yoyGrowth(revPts);
  const revGrowth = revYoy.length > 0 ? revYoy[revYoy.length - 1] : null;
  const ttm = data.ttm;
  const revTtm = ttm?.revenue ?? latestValue(seriesOf('revenue'));
  const margin =
    ttm?.revenue && ttm?.netIncome !== undefined
      ? ttm.netIncome / Math.abs(ttm.revenue)
      : (() => {
          const r = latestValue(seriesOf('revenue'));
          const n = latestValue(seriesOf('netIncome'));
          return r && n !== null ? n / Math.abs(r) : null;
        })();
  const trailingEps = ttm?.eps ?? latestValue(seriesOf('eps'));
  const pe = q?.price != null && trailingEps !== null && trailingEps > 0 ? q.price / trailingEps : null;
  const spark = sparklinePoints(
    revPts.map((p) => p.value),
    310,
    92,
  );
  const tickerPx = ticker.length > 5 ? 80 : 96;
  // Left column is full width without a sparkline, minus the spark box with one.
  const fitted = fitName(ticker, name, spark ? 746 : 1080, tickerPx);

  return card(
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow right={sectorLine} />
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
            <span style={{ fontSize: tickerPx, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>
              {ticker}
            </span>
            <span style={{ fontSize: fitted.px, fontWeight: 800, marginLeft: 20, paddingBottom: 10 }}>
              {fitted.text}
            </span>
          </div>
          {oneLiner && (
            <div style={{ fontSize: 28, color: BODY, marginTop: 8 }}>{truncateLine(oneLiner, 50)}</div>
          )}
        </div>
        {spark && (
          <div style={{ display: 'flex', flexDirection: 'column', width: 310, marginLeft: 24 }}>
            <svg width="310" height="92">
              <polyline
                points={spark.points}
                fill="none"
                stroke={ACCENT}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={spark.endX} cy={spark.endY} r={6.5} fill={ACCENT} />
            </svg>
            <span style={{ fontSize: 20, color: MUTED, marginTop: 6, textAlign: 'right' }}>
              Revenue, last 5 fiscal years
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginTop: 20 }}>
        <StatTile label="MARKET CAP" value={data.stats.marketCap !== null ? formatMoney(data.stats.marketCap) : '—'} />
        <StatTile
          label="REVENUE TTM"
          value={revTtm !== null ? formatMoney(revTtm) : '—'}
          sub={
            revGrowth !== null ? (
              <span style={{ fontSize: 24, fontWeight: 800, color: revGrowth < 0 ? DOWN : UP, marginTop: 4 }}>
                {formatPct(revGrowth)}
              </span>
            ) : undefined
          }
        />
        <StatTile label="NET MARGIN" value={margin !== null ? formatPct(margin, 0) : '—'} />
        <StatTile label="P/E" value={pe !== null ? pe.toFixed(1) : 'n/a'} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginTop: 20 }}>
        <span style={{ fontSize: 40, fontWeight: 800 }}>{priceStr ?? 'Quote unavailable'}</span>
        <span style={{ fontSize: 30, fontWeight: 800, color: moveColor, marginLeft: 14, paddingBottom: 3 }}>
          {move}
        </span>
        {day && (
          <span style={{ fontSize: 28, color: MUTED, marginLeft: 12, paddingBottom: 3 }}>· {day}</span>
        )}
        <span style={{ fontSize: 26, fontWeight: 700, color: ACCENT, marginLeft: 'auto', paddingBottom: 4 }}>
          Full profile →
        </span>
      </div>
    </div>,
    font,
  );
}
