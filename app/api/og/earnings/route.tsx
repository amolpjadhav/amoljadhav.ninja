import { ImageResponse } from 'next/og';
import {
  beatVerdict,
  etTimeLabel,
  etToday,
  fetchEnrichedWeek,
  fetchQuarterDetails,
  formatEps,
  formatMoneyShort,
  logoUrl,
  rankDay,
  reportDateLabel,
  shortName,
  type EnrichedEvent,
} from '@/lib/earnings';
import { loadCardFontCached, normalizeTicker, truncateLine } from '@/lib/stocks';

// Earnings share cards: tonight's lineup, single-company preview, and the
// beat/miss result card. One route, ?type= picks the card — same query-param
// convention as /api/og/stock. Server-rendered satori (next/og), 1200×630,
// content ends ~550px high: X overlays its caption on the bottom ~80px, so
// that strip stays empty. No emoji anywhere (satori has no emoji font);
// verdicts and history dots are drawn shapes, not glyphs.
// GET /api/og/earnings?type=tonight&date=2026-10-21
// GET /api/og/earnings?type=morning&date=2026-10-22
// GET /api/og/earnings?type=preview&ticker=TSLA
// GET /api/og/earnings?type=result&ticker=TSLA
//
// NOTE: no fragments anywhere in this file — this satori version lays a
// fragment's children out as a row regardless of the parent direction.

const W = 1200;
const H = 630;
const BG = '#0c0e10';
const INK = '#f2f4f3';
const MUTED = '#9aa3a8';
const GOLD = '#e8a83e';
const UP = '#4ade80';
const DOWN = '#e07856';

// Same deterministic hues as the Monogram fallback, so a card and its row
// agree even when the logo fetch fails.
const MONO_HUES = [152, 210, 268, 18, 330, 45, 190, 100, 290, 0];
function monoHue(symbol: string): number {
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) % 997;
  return MONO_HUES[h % MONO_HUES.length];
}

function card(children: React.ReactNode, font: ArrayBuffer | null, maxAge = 3600) {
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
          paddingTop: 64,
        }}
      >
        {children}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: font ? [{ name: 'Inter', data: font, weight: 900, style: 'normal' }] : undefined,
      headers: { 'Cache-Control': `public, max-age=${maxAge}` },
    },
  );
}

function BrandRow({ section }: { section: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800 }}>amoljadhav.ai</span>
      <span style={{ fontSize: 26, color: MUTED }}> · {section}</span>
    </div>
  );
}

function errorCard(kicker: string, title: string, sub: string, font: ArrayBuffer | null) {
  return card(
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow section="Earnings" />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: GOLD, letterSpacing: 4 }}>{kicker}</span>
        <span style={{ fontSize: 76, fontWeight: 900, marginTop: 12 }}>{title}</span>
        <span style={{ fontSize: 30, color: MUTED, marginTop: 12 }}>{sub}</span>
      </div>
    </div>,
    font,
    60,
  );
}

// Satori throws the whole render on a broken <img>, so logos are verified
// up front; anything else becomes a letter disc.
async function usableLogos(symbols: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    symbols.map(async (s) => {
      const url = logoUrl(s);
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (r.ok && (r.headers.get('content-type') ?? '').includes('image')) out.set(s, url);
      } catch {
        /* monogram fallback */
      }
    }),
  );
  return out;
}

function LogoMark({ symbol, url, px }: { symbol: string; url: string | null; px: number }) {
  const letter = (symbol.replace(/[^A-Za-z]/g, '')[0] ?? '?').toUpperCase();
  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: px / 2,
        background: url ? '#ffffff' : `hsl(${monoHue(symbol)} 45% 30%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" width={Math.round(px * 0.72)} height={Math.round(px * 0.72)} style={{ objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: Math.round(px * 0.42), fontWeight: 900, color: '#fff' }}>{letter}</span>
      )}
    </div>
  );
}

function Kicker({ children }: { children: string }) {
  return <span style={{ fontSize: 28, fontWeight: 800, color: GOLD, letterSpacing: 4 }}>{children}</span>;
}

function dayTitle(date: string): string {
  return new Date(`${date}T12:00:00`)
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();
}

// "REPORTING TONIGHT" / "REPORTING BEFORE THE OPEN" + logo grid: up to 6
// names with market caps underneath. The one pairing X crops nothing from.
function lineupBody(date: string, half: 'amc' | 'bmo', events: EnrichedEvent[], logos: Map<string, string>) {
  const top = rankDay(events.filter((e) => e.date === date && e.hour === half)).slice(0, 6);
  const kicker = half === 'amc' ? `REPORTING TONIGHT · ${dayTitle(date)}` : `REPORTING BEFORE THE OPEN · ${dayTitle(date)}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow section="Earnings" />
      <div style={{ marginTop: 40 }}>
        <Kicker>{kicker}</Kicker>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 44 }}>
        {top.map((e) => (
          <div key={e.symbol} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 168, marginRight: 20 }}>
            <LogoMark symbol={e.symbol} url={logos.get(e.symbol) ?? null} px={116} />
            <span style={{ fontSize: 27, fontWeight: 800, marginTop: 14, textAlign: 'center', lineHeight: 1.1 }}>
              {truncateLine(shortName(e.companyName) ?? e.symbol, 14)}
            </span>
            <span style={{ fontSize: 25, color: MUTED, marginTop: 4 }}>{formatMoneyShort(e.marketCap) ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Logo is verified before render, so preview passes the real URL in.
function previewBodyWithLogo(e: EnrichedEvent, dots: boolean[], logo: string | null) {
  const name = shortName(e.companyName) ?? e.symbol;
  const eps = formatEps(e.epsEstimate);
  const rev = formatMoneyShort(e.revenueEstimate);
  const estLine = eps || rev ? `${eps ? `EPS est ${eps}` : ''}${eps && rev ? ' · ' : ''}${rev ? `Revenue est ${rev}` : ''}` : 'Estimates not announced yet';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow section="Earnings preview" />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 56 }}>
        <LogoMark symbol={e.symbol} url={logo} px={150} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 44 }}>
          <span style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.05 }}>{truncateLine(name, 26)}</span>
          <span style={{ fontSize: 34, color: MUTED, marginTop: 8 }}>reports {reportDateLabel(e.date, e.hour)}</span>
          <span style={{ fontSize: 42, fontWeight: 800, marginTop: 20 }}>{estLine}</span>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 22 }}>
            {dots.map((beat, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: beat ? UP : DOWN, marginRight: 12 }} />
            ))}
            <span style={{ fontSize: 30, color: MUTED, marginLeft: 8 }}>
              {dots.length > 0 ? `Beat ${dots.filter(Boolean).length} of last ${dots.length}` : 'No recent history'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// "[Logo] Tesla BEAT / EPS $0.52 vs $0.44 est (+18%) / Revenue … / Stock …".
function resultBody(e: EnrichedEvent, logo: string | null, asOf: string) {
  const name = shortName(e.companyName) ?? e.symbol;
  const verdict = beatVerdict(e.epsActual, e.epsEstimate);
  const color = verdict === 'BEAT' ? UP : verdict === 'MISS' ? DOWN : MUTED;
  const a = formatEps(e.epsActual);
  const est = formatEps(e.epsEstimate);
  const epsLine =
    a && est && verdict !== 'REPORTED'
      ? `EPS ${a} vs ${est} est (${surprisePct(e.epsActual, e.epsEstimate)})`
      : a
        ? `EPS ${a} reported`
        : 'Results announced';
  const ra = e.revenueActual !== null ? formatMoneyShort(e.revenueActual) : null;
  const re = formatMoneyShort(e.revenueEstimate);
  const revLine = ra && re ? `Revenue ${ra} vs ${re} est` : ra ? `Revenue ${ra}` : null;
  const ah = e.ahChangePct;
  const move = ah !== null && Number.isFinite(ah) ? { v: ah, label: 'after hours' } : null;
  const day = e.priceChangePct !== null && Number.isFinite(e.priceChangePct) ? { v: e.priceChangePct, label: 'today' } : null;
  const m = move ?? day;
  const moveLine = m
    ? `Stock ${m.v >= 0 ? '+' : ''}${(m.v * 100).toFixed(1)}% ${m.label} · as of ${asOf}`
    : `as of ${asOf}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow section="Earnings result" />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 48 }}>
        <LogoMark symbol={e.symbol} url={logo} px={150} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 44 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: MUTED }}>{truncateLine(name, 24)}</span>
          <span style={{ fontSize: 104, fontWeight: 900, color, lineHeight: 1, marginTop: 4 }}>{verdict}</span>
          <span style={{ fontSize: 50, fontWeight: 800, marginTop: 12 }}>{epsLine}</span>
          {revLine ? <span style={{ fontSize: 40, color: MUTED, marginTop: 8 }}>{revLine}</span> : null}
          <span style={{ fontSize: 32, color: move ? color : MUTED, marginTop: 12 }}>{moveLine}</span>
        </div>
      </div>
    </div>
  );
}

function surprisePct(actual: number | null, estimate: number | null): string {
  if (actual === null || estimate === null || estimate === 0) return '';
  const pct = ((actual - estimate) / Math.abs(estimate)) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const type = params.get('type') ?? 'tonight';
  const font = await loadCardFontCached();

  if (type === 'tonight' || type === 'morning') {
    const half = type === 'tonight' ? 'amc' : 'bmo';
    const rawDate = params.get('date') ?? '';
    const date = DATE_RE.test(rawDate) ? rawDate : etToday();
    const week = await fetchEnrichedWeek();
    const list = rankDay(week.events.filter((e) => e.date === date && e.hour === half)).slice(0, 6);
    if (list.length === 0) {
      return errorCard('EARNINGS', 'Nothing scheduled', `No ${half === 'amc' ? 'after-close' : 'before-open'} reports on ${date}.`, font);
    }
    const logos = await usableLogos(list.map((e) => e.symbol));
    const body = lineupBody(date, half, list, logos);
    try {
      return card(body, font);
    } catch {
      return errorCard('EARNINGS', 'Card unavailable', 'Try again in a moment.', font);
    }
  }

  const ticker = normalizeTicker(params.get('ticker') ?? '');
  if (!ticker) return errorCard('EARNINGS', 'Invalid ticker', 'Check the link and try again.', font);

  const week = await fetchEnrichedWeek();
  if (type === 'preview') {
    const next = week.events
      .filter((e) => e.symbol === ticker)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .find((e) => e.date >= week.fetchedAt.slice(0, 10));
    if (!next) return errorCard(ticker, 'No upcoming earnings', `Nothing scheduled for ${ticker} this week.`, font);
    const [details, logos] = await Promise.all([fetchQuarterDetails(ticker), usableLogos([ticker])]);
    const dots = details.map((d) => d.beat).filter((b): b is boolean => b !== null);
    try {
      return card(previewBodyWithLogo(next, dots, logos.get(ticker) ?? null), font);
    } catch {
      return errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font);
    }
  }

  if (type === 'result') {
    const done = week.events
      .filter((e) => e.symbol === ticker && e.epsActual !== null)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!done) return errorCard(ticker, 'Has not reported yet', `${ticker} has no reported earnings this week.`, font);
    const logos = await usableLogos([ticker]);
    try {
      return card(resultBody(done, logos.get(ticker) ?? null, etTimeLabel(week.fetchedAt)), font);
    } catch {
      return errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font);
    }
  }

  return errorCard('EARNINGS', 'Unknown card', 'Check the link and try again.', font);
}
