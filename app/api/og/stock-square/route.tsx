import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  fitPrice,
  formatPct,
  getStockData,
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
      headers: { 'Cache-Control': 'public, max-age=3600' },
    },
  );
}

function errorCard(kicker: string, title: string, sub: string, font: ArrayBuffer | null) {
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

  return card(
    // NOTE: no fragments anywhere in this file — this satori version lays
    // a fragment's children out as a row regardless of the parent direction.
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
    </div>,
    font,
  );
}
