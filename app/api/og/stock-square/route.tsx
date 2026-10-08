import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  fitPrice,
  formatPct,
  loadCardFontCached,
  loadStockCard,
  normalizeTicker,
  quoteCardFooter,
  sparklinePoints,
  truncateLine,
} from '@/lib/stocks';

// Square (1080x1080) post image for a stock lookup: the $TICKER cashtag,
// company name, the current price giant, one big "% today" move with a
// trend line, and a dated footer. Built for download-and-attach posts —
// link unfurls stay on the 1200x630 card.
// GET /api/og/stock-square?ticker=BULL
//
// Node runtime (not edge): the card reads the same getStockData profile as
// the page, which uses Next fetch caching. Responses carry their own
// Cache-Control so clients don't hammer upstream.

const W = 1080;
const H = 1080;
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
          paddingLeft: 90,
          paddingRight: 90,
          paddingTop: 96,
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
      <span style={{ fontSize: 40, fontWeight: 800 }}>amoljadhav.ai</span>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 120 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: GOLD, letterSpacing: 4 }}>{kicker}</span>
        <span style={{ fontSize: 110, fontWeight: 900, marginTop: 16 }}>{title}</span>
        <span style={{ fontSize: 40, color: MUTED, marginTop: 16 }}>{sub}</span>
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

  // Lean card data (quote + history) in parallel with the font: full
  // getStockData takes 20s+ cold and crawlers give up before the image.
  const { data, font, dataMs } = await loadStockCard(ticker, { history: true });
  if (!data) {
    return timed(errorCard(ticker, 'Quote unavailable', `No data found for "${ticker}".`, font), dataMs);
  }

  const q = data.quote;
  const name = displayCompanyName(data.companyName);
  const priceStr =
    q?.price !== null && q?.price !== undefined
      ? `$${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : null;
  const pricePx = fitPrice(priceStr ?? 'Quote unavailable', 230, 860);
  const chg = q?.change ?? null;
  const up = chg !== null && chg > 0;
  const down = chg !== null && chg < 0;
  const moveColor = up ? UP : down ? DOWN : MUTED;
  const pct = formatPct(q?.changePct);
  const cashPx = ticker.length > 5 ? 120 : 150;
  const hist = (data.priceHistory ?? []).map((p) => p.close).slice(-30);
  const spark = sparklinePoints(hist, 900, 140);
  const foot = quoteCardFooter(q?.lastTrade, q?.marketStatus);

  // NOTE: no fragments anywhere in this file — this satori version lays
  // a fragment's children out as a row regardless of the parent direction.
  // Built outside try (lint forbids JSX in try); the render itself throws
  // inside timed(), which the catch below converts to a fallback card.
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: cashPx, fontWeight: 900, color: GOLD, letterSpacing: 2 }}>{`$${ticker}`}</span>
      <div style={{ fontSize: 44, color: MUTED, marginTop: 8 }}>{truncateLine(name, 32)}</div>
      <span style={{ fontSize: pricePx, fontWeight: 900, lineHeight: 1, marginTop: 56 }}>
        {priceStr ?? 'Quote unavailable'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
        {(up || down) && (
          <svg width="40" height="36">
            {up ? (
              <polygon points="0,36 40,36 20,0" fill={moveColor} />
            ) : (
              <polygon points="0,0 40,0 20,36" fill={moveColor} />
            )}
          </svg>
        )}
        <span style={{ fontSize: 88, fontWeight: 800, color: moveColor, marginLeft: up || down ? 16 : 0 }}>
          {pct}
        </span>
        <span style={{ fontSize: 54, color: moveColor, opacity: 0.7, marginLeft: 18 }}>today</span>
      </div>
      {spark && (
        <svg width="900" height="140" style={{ marginTop: 36 }}>
          <polyline
            points={spark.points}
            fill="none"
            stroke={moveColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 36 }}>
        <span style={{ fontSize: 36, color: MUTED }}>{foot ?? 'Latest quote'}</span>
        <span style={{ fontSize: 40, fontWeight: 800, marginLeft: 'auto' }}>amoljadhav.ai</span>
      </div>
    </div>
  );
  try {
    return await timed(card(body, font), dataMs);
  } catch {
    return timed(errorCard(ticker, 'Card unavailable', 'Try again in a moment.', font), dataMs);
  }
}
