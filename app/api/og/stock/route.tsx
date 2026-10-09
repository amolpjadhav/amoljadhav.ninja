import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  fitPrice,
  formatMoney,
  formatPct,
  loadCardFontCached,
  loadStockCard,
  normalizeTicker,
  quoteDayLabel,
  sparklinePoints,
  truncateLine,
} from '@/lib/stocks';

// Price-hero card for a stock lookup, in the square card's visual language:
// gold $TICKER, company name, market cap, the current price giant, one big
// "% today" move with a trend line, and a dated detail — honest even when X
// serves a cached copy days later.
// GET /api/og/stock?ticker=NVDA&d=2026-10-06
//
// The `d` param is a cache-buster from the page metadata (one URL per trading
// session); the renderer ignores it and always draws the latest data.
// Node runtime (not edge): the card reads the same getStockData profile as
// the page, which uses Next fetch caching. Responses carry their own
// Cache-Control so crawlers don't hammer upstream.
//
// Layout budget (1200x630): 60px side margins, content ends ~520px — the
// bottom ~110px stays empty because X overlays its caption there. Stays
// 1200x630 deliberately: X center-crops square images in large-image cards,
// which would cut the ticker, MCAP, and date clean off.

const W = 1200;
const H = 630;
const BG = '#0c0e10';
const INK = '#f2f4f3';
const MUTED = '#9aa3a8';
const GOLD = '#e8a83e';
const UP = '#4ade80';
const DOWN = '#e07856';

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

function BrandRow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800 }}>amoljadhav.ai</span>
      <span style={{ fontSize: 26, color: MUTED }}> · Company profile</span>
    </div>
  );
}

// Buffer the render so Server-Timing reports the honest data/render split
// (curl time alone can't tell a slow upstream from a slow satori).
async function timed(res: ImageResponse, dataMs: number): Promise<Response> {
  const t0 = Date.now();
  const buf = await res.arrayBuffer();
  const headers = new Headers(res.headers);
  headers.set('Server-Timing', `data;dur=${dataMs}, render;dur=${Date.now() - t0}`);
  return new Response(buf, { status: res.status, headers });
}

function errorCard(kicker: string, title: string, sub: string, font: ArrayBuffer | null) {
  // Short cache: a Nasdaq blip must not pin "Quote unavailable" all day.
  return card(
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow />
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

export async function GET(req: Request) {
  const ticker = normalizeTicker(new URL(req.url).searchParams.get('ticker') ?? '');
  if (!ticker) {
    return timed(
      errorCard('STOCK LOOKUP', 'Invalid ticker', 'Check the link and try again.', await loadCardFontCached()),
      0,
    );
  }

  // Lean card data (quote + history + MCAP) in parallel with the font: full
  // getStockData takes 20s+ cold and crawlers give up before the image.
  const { data, font, dataMs } = await loadStockCard(ticker, { history: true, stats: true });
  if (!data) {
    return timed(errorCard(ticker, 'Quote unavailable', `No data found for "${ticker}".`, font), dataMs);
  }

  const q = data.quote;
  const name = displayCompanyName(data.companyName);
  const day = q ? quoteDayLabel(q.lastTrade, q.marketStatus) : null;
  const chg = q?.change ?? null;
  const up = chg !== null && chg > 0;
  const down = chg !== null && chg < 0;
  const moveColor = up ? UP : down ? DOWN : MUTED;
  const pct = formatPct(q?.changePct);
  const mcap = data.marketCap !== null ? formatMoney(data.marketCap) : null;
  const priceStr =
    q?.price !== null && q?.price !== undefined
      ? `$${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;
  const cashPx = ticker.length > 5 ? 80 : 96;
  const pricePx = fitPrice(priceStr ?? 'Quote unavailable', 170, 1080);
  const hist = (data.priceHistory ?? []).map((p) => p.close).slice(-30);
  const spark = sparklinePoints(hist, 300, 54);

  // NOTE: no fragments anywhere in this file — this satori version lays
  // a fragment's children out as a row regardless of the parent direction.
  // Built outside try (lint forbids JSX in try); the render itself throws
  // inside timed(), which the catch below converts to a fallback card.
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
        <span style={{ fontSize: cashPx, fontWeight: 900, color: GOLD, letterSpacing: 2, lineHeight: 1 }}>
          {`$${ticker}`}
        </span>
        {mcap && (
          <span style={{ fontSize: 34, color: MUTED, marginLeft: 'auto', paddingBottom: 10 }}>MCAP {mcap}</span>
        )}
      </div>
      <span style={{ fontSize: 38, color: MUTED, marginTop: 6, lineHeight: 1 }}>{truncateLine(name, 52)}</span>
      <span style={{ fontSize: pricePx, fontWeight: 900, lineHeight: 1, marginTop: 20 }}>
        {priceStr ?? 'Quote unavailable'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        {(up || down) && (
          <svg width="34" height="30">
            {up ? (
              <polygon points="0,30 34,30 17,0" fill={moveColor} />
            ) : (
              <polygon points="0,0 34,0 17,30" fill={moveColor} />
            )}
          </svg>
        )}
        <span
          style={{ fontSize: 64, fontWeight: 800, color: moveColor, marginLeft: up || down ? 12 : 0, lineHeight: 1 }}
        >
          {pct}
        </span>
        <span style={{ fontSize: 40, color: moveColor, opacity: 0.7, marginLeft: 12 }}>today</span>
        {day && <span style={{ fontSize: 34, color: MUTED, marginLeft: 12 }}>· {day}</span>}
        {spark && (
          <svg width="300" height="54" style={{ marginLeft: 'auto' }}>
            <polyline
              points={spark.points}
              fill="none"
              stroke={moveColor}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
  try {
    return await timed(card(body, font), dataMs);
  } catch {
    return timed(errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font), dataMs);
  }
}
