import { ImageResponse } from 'next/og';
import {
  beatVerdict,
  etTimeLabel,
  etToday,
  fetchEnrichedWeek,
  fetchQuarterDetails,
  formatEps,
  formatMoneyShort,
  formatRevenuePair,
  logoUrl,
  previewPillDay,
  rankDay,
  shortName,
  type EnrichedEvent,
  type QuarterDetail,
} from '@/lib/earnings';
import { loadCardFontCached, loadCardFontsCached, normalizeTicker, truncateLine } from '@/lib/stocks';

// Earnings share cards: tonight's lineup, single-company preview, and the
// beat/miss result card. One route, ?type= picks the card — same query-param
// convention as /api/og/stock. Server-rendered satori (next/og), 1200×630,
// preview/result content ends ~470px high: X overlays its caption on the
// bottom ~140px, so that strip stays empty. No emoji anywhere (satori has no
// emoji font); pill icons, verdicts, and history dots are drawn discs, and
// every card line renders as one text node (split nodes caused a
// word-spacing bug).
// GET /api/og/earnings?type=tonight&date=2026-10-21
// GET /api/og/earnings?type=morning&date=2026-10-22
// GET /api/og/earnings?type=preview&ticker=TSLA
// GET /api/og/earnings?type=result&ticker=TSLA
//
// NOTE: no fragments anywhere in this file — this satori version lays a
// fragment's children out as a row regardless of the parent direction.

const W = 1200;
const H = 630;
const BG = '#0A0A0D';
const INK = '#F5F5F7';
const MUTED = '#9aa3a8';
const GOLD = '#e8a83e';
// Vivid iOS-style dots for the new cards (checks/crosses would be tofu —
// satori loads Inter only, so verdicts and history are drawn discs).
const FRESH_UP = '#30D158';
const FRESH_DOWN = '#FF453A';
const INDIGO = '94,92,230';
const MAROON = '150,50,70';

// Same deterministic hues as the Monogram fallback, so a card and its row
// agree even when the logo fetch fails.
const MONO_HUES = [152, 210, 268, 18, 330, 45, 190, 100, 290, 0];
function monoHue(symbol: string): number {
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) % 997;
  return MONO_HUES[h % MONO_HUES.length];
}

// Ambient glows: nested translucent discs (satori has no blur filter, so
// softness comes from layering). Positioned relative to the card root,
// partially off-canvas; overflow clips them into glows.
function Glow({ cx, cy, rgb }: { cx: number; cy: number; rgb: string }) {
  const layers: Array<[number, number]> = [
    [560, 0.1],
    [400, 0.13],
    [260, 0.16],
  ];
  return (
    <div style={{ position: 'absolute', display: 'flex' }}>
      {layers.map(([s, o]) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            left: cx - s / 2,
            top: cy - s / 2,
            width: s,
            height: s,
            borderRadius: s / 2,
            background: `rgba(${rgb},1)`,
            opacity: o,
          }}
        />
      ))}
    </div>
  );
}

function card(children: React.ReactNode, fonts: Map<number, ArrayBuffer> | null, maxAge = 3600) {
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
          fontFamily: fonts ? 'Inter, sans-serif' : 'sans-serif',
          paddingLeft: 60,
          paddingRight: 60,
          paddingTop: 64,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Glow cx={1120} cy={-30} rgb={INDIGO} />
        <Glow cx={60} cy={660} rgb={MAROON} />
        {children}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts:
        fonts && fonts.size > 0
          ? [...fonts.entries()].map(([weight, data]) => ({
              name: 'Inter',
              data,
              weight: weight as 500 | 600 | 700 | 800 | 900,
              style: 'normal' as const,
            }))
          : undefined,
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

function errorCard(kicker: string, title: string, sub: string, fonts: Map<number, ArrayBuffer> | null) {
  return card(
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow section="Earnings" />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: GOLD, letterSpacing: 4 }}>{kicker}</span>
        <span style={{ fontSize: 76, fontWeight: 900, marginTop: 12 }}>{title}</span>
        <span style={{ fontSize: 30, color: MUTED, marginTop: 12 }}>{sub}</span>
      </div>
    </div>,
    fonts,
    60,
  );
}

// Shared new-card pieces. Every line renders as one text node (splitting
// text across spans caused the word-spacing bug this redesign fixes).
function Pill({ dot, text, bg, border }: { dot: string; text: string; bg: string; border: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        paddingLeft: 22,
        paddingRight: 26,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 6, background: dot, marginRight: 12 }} />
      <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: 1.5 }}>{text}</span>
    </div>
  );
}

function CardBrand({ section }: { section: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ fontSize: 19, fontWeight: 700 }}>amoljadhav.ai</span>
      <span style={{ fontSize: 19, fontWeight: 500, color: MUTED }}>{` · ${section}`}</span>
    </div>
  );
}

function EstTile({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div
      style={{
        width: 250,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 22,
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 24,
        paddingBottom: 24,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span style={{ fontSize: 21, fontWeight: 500, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 52, fontWeight: 700, marginTop: 10, color: valueColor ?? INK }}>{value}</span>
      {sub ? <span style={{ fontSize: 21, fontWeight: 500, color: MUTED, marginTop: 6 }}>{sub}</span> : null}
    </div>
  );
}

function QuartersTile({ quarters }: { quarters: QuarterDetail[] }) {
  const scored = quarters.filter((qd) => qd.beat !== null);
  const wins = scored.filter((qd) => qd.beat).length;
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 22,
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 24,
        paddingBottom: 24,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <span style={{ fontSize: 21, fontWeight: 500, color: MUTED }}>Last 4 quarters</span>
        <span style={{ fontSize: 21, fontWeight: 700, marginLeft: 16 }}>
          {scored.length > 0 ? `Beat ${wins} of ${scored.length}` : 'No history'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 18 }}>
        {quarters.slice(-4).map((qd, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64, marginRight: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: qd.beat === null ? 'rgba(255,255,255,0.15)' : qd.beat ? FRESH_UP : FRESH_DOWN,
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 500, color: MUTED, marginTop: 8 }}>
              {`${qd.q} '${String(qd.year ?? '').slice(2)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function shortDay(date: string): string {
  return new Date(`${date}T12:00:00`)
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .replace(',', '');
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

// Preview card: timing pill, giant ticker hero, estimate tiles, beat
// history. Content ends ~470px high — the bottom 140px stays empty for X's
// caption overlay. No letter avatar: the ticker is the hero.
function previewBody(e: EnrichedEvent, quarters: QuarterDetail[]) {
  const name = shortName(e.companyName) ?? e.symbol;
  const pill = previewPillDay(e.date, e.hour, etToday());
  const dot = e.hour === 'bmo' ? '#FFB020' : '#8b8cf8';
  const eps = formatEps(e.epsEstimate) ?? '—';
  const rev = formatMoneyShort(e.revenueEstimate) ?? '—';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pill dot={dot} text={`${pill.day} · ${pill.timing}`} bg="rgba(124,125,244,0.16)" border="rgba(124,125,244,0.4)" />
        <CardBrand section="Earnings preview" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginTop: 24 }}>
        <span style={{ fontSize: 148, fontWeight: 800, letterSpacing: -7, lineHeight: 1 }}>{e.symbol}</span>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 28, paddingBottom: 16 }}>
          <span style={{ fontSize: 34, fontWeight: 600 }}>{truncateLine(name, 22)}</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: MUTED, marginTop: 4 }}>{shortDay(e.date)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 28 }}>
        <EstTile label="EPS estimate" value={eps} />
        <div style={{ width: 20 }} />
        <EstTile label="Revenue estimate" value={rev} />
        <div style={{ width: 20 }} />
        <QuartersTile quarters={quarters} />
      </div>
    </div>
  );
}

// Result card in the same layout: verdict pill, ticker hero, actual tiles
// plus the stock move as a third tile. Same 140px empty footer.
function resultBody(e: EnrichedEvent, quarters: QuarterDetail[], asOf: string) {
  const name = shortName(e.companyName) ?? e.symbol;
  const verdict = beatVerdict(e.epsActual, e.epsEstimate);
  const dot = verdict === 'BEAT' ? FRESH_UP : verdict === 'MISS' ? FRESH_DOWN : MUTED;
  const a = formatEps(e.epsActual);
  const est = formatEps(e.epsEstimate);
  const pair = formatRevenuePair(e.revenueActual, e.revenueEstimate);
  const ra = e.revenueActual !== null ? formatMoneyShort(e.revenueActual) : null;
  const ah = e.ahChangePct;
  const move = ah !== null && Number.isFinite(ah) ? { v: ah, label: 'After hours' } : null;
  const day = e.priceChangePct !== null && Number.isFinite(e.priceChangePct) ? { v: e.priceChangePct, label: 'Today' } : null;
  const m = move ?? day;
  const moveColor = m ? (m.v >= 0 ? FRESH_UP : FRESH_DOWN) : MUTED;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pill
          dot={dot}
          text={verdict === 'REPORTED' ? 'REPORTED' : verdict}
          bg={verdict === 'BEAT' ? 'rgba(48,209,88,0.14)' : verdict === 'MISS' ? 'rgba(255,69,58,0.14)' : 'rgba(255,255,255,0.08)'}
          border={verdict === 'BEAT' ? 'rgba(48,209,88,0.4)' : verdict === 'MISS' ? 'rgba(255,69,58,0.4)' : 'rgba(255,255,255,0.2)'}
        />
        <CardBrand section="Earnings result" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginTop: 24 }}>
        <span style={{ fontSize: 148, fontWeight: 800, letterSpacing: -7, lineHeight: 1 }}>{e.symbol}</span>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 28, paddingBottom: 16 }}>
          <span style={{ fontSize: 34, fontWeight: 600 }}>{truncateLine(name, 22)}</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: MUTED, marginTop: 4 }}>{shortDay(e.date)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 28 }}>
        <EstTile label="EPS" value={a ?? '—'} sub={a && est && verdict !== 'REPORTED' ? `vs ${est} est` : undefined} />
        <div style={{ width: 20 }} />
        <EstTile label="Revenue" value={pair ? pair.a : (ra ?? '—')} sub={pair ? `vs ${pair.e} est` : undefined} />
        <div style={{ width: 20 }} />
        <EstTile
          label="Stock"
          value={m ? `${m.v >= 0 ? '+' : ''}${(m.v * 100).toFixed(1)}%` : '—'}
          sub={m ? `${m.label} · ${asOf}` : undefined}
          valueColor={m ? moveColor : undefined}
        />
        <div style={{ width: 20 }} />
        <QuartersTile quarters={quarters} />
      </div>
    </div>
  );
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Multi-weight Inter when reachable (dim labels vs heavy numbers),
// single 900 when only that loads, system sans when nothing does.
async function loadFonts(): Promise<Map<number, ArrayBuffer> | null> {
  const multi = await loadCardFontsCached();
  if (multi && multi.size > 0) return multi;
  const single = await loadCardFontCached();
  return single ? new Map([[900, single]]) : null;
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const type = params.get('type') ?? 'tonight';
  const font = await loadFonts();

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
    const details = await fetchQuarterDetails(ticker);
    try {
      return card(previewBody(next, details), font);
    } catch {
      return errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font);
    }
  }

  if (type === 'result') {
    const done = week.events
      .filter((e) => e.symbol === ticker && e.epsActual !== null)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!done) return errorCard(ticker, 'Has not reported yet', `${ticker} has no reported earnings this week.`, font);
    const details = await fetchQuarterDetails(ticker);
    try {
      return card(resultBody(done, details, etTimeLabel(week.fetchedAt)), font);
    } catch {
      return errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font);
    }
  }

  return errorCard('EARNINGS', 'Unknown card', 'Check the link and try again.', font);
}
