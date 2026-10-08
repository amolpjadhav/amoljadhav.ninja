import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  fitName,
  fitPrice,
  formatQuoteChange,
  loadCardFontCached,
  loadStockCard,
  normalizeTicker,
  quoteDayLabel,
} from '@/lib/stocks';

// Price-hero card for a stock lookup: brand, ticker, the current price big,
// and the signed move as a dated detail — honest even when X serves a
// cached copy days later.
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
const INK = '#f2f4f3';
const MUTED = '#9aa3a8';
const ACCENT = '#facc15'; // Investing category color
const UP = '#4ade80';
const DOWN = '#f87171';

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
        <span style={{ fontSize: 28, fontWeight: 800, color: ACCENT, letterSpacing: 4 }}>{kicker}</span>
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

  // Lean card data (quote only) in parallel with the font: full
  // getStockData takes 20s+ cold and crawlers give up before the image.
  const { data, font, dataMs } = await loadStockCard(ticker);
  if (!data) {
    return timed(errorCard(ticker, 'Quote unavailable', `No data found for "${ticker}".`, font), dataMs);
  }

  const q = data.quote;
  const name = displayCompanyName(data.companyName);
  const day = q ? quoteDayLabel(q.lastTrade, q.marketStatus) : null;
  const move = q ? formatQuoteChange(q.change, q.changePct) : '—';
  const up = (q?.change ?? 0) >= 0;
  const moveColor = q && q.change !== null ? (up ? UP : DOWN) : MUTED;
  const priceStr =
    q?.price !== null && q?.price !== undefined
      ? `$${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;

  // One layout for stocks and ETFs alike: the quote never depended on
  // financials, so the old ETF fork is gone.
  const tickerPx = ticker.length > 5 ? 80 : 96;
  const fitted = fitName(ticker, name, 1080, tickerPx);
  const pricePx = fitPrice(priceStr ?? 'Quote unavailable', 170);

  // NOTE: no fragments anywhere in this file — this satori version lays
  // a fragment's children out as a row regardless of the parent direction.
  // Built outside try (lint forbids JSX in try); the render itself throws
  // inside timed(), which the catch below converts to a fallback card.
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BrandRow />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginTop: 20 }}>
        <span style={{ fontSize: tickerPx, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>
          {ticker}
        </span>
        <span style={{ fontSize: fitted.px, fontWeight: 800, marginLeft: 20, paddingBottom: 10 }}>
          {fitted.text}
        </span>
      </div>
      <span style={{ fontSize: pricePx, fontWeight: 900, lineHeight: 1, marginTop: 30 }}>
        {priceStr ?? 'Quote unavailable'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: moveColor }}>{move}</span>
        {day && <span style={{ fontSize: 34, color: MUTED, marginLeft: 14 }}>· {day}</span>}
      </div>
    </div>
  );
  try {
    return await timed(card(body, font), dataMs);
  } catch {
    return timed(errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font), dataMs);
  }
}
