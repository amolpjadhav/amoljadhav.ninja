import { ImageResponse } from 'next/og';
import {
  displayCompanyName,
  fitName,
  fitPrice,
  pickLede,
  formatQuoteChange,
  getStockData,
  normalizeTicker,
  quoteDayLabel,
  truncateLine,
} from '@/lib/stocks';

// Price-hero card for a stock lookup: brand, ticker, one line on what the
// company does, the current price big, and the signed move as a dated
// detail — honest even when X serves a cached copy days later.
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

function BrandRow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800 }}>amoljadhav.ai</span>
      <span style={{ fontSize: 26, color: MUTED }}> · Company profile</span>
    </div>
  );
}

function errorCard(kicker: string, title: string, sub: string, font: ArrayBuffer | null) {
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
  const pricePx = fitPrice(priceStr ?? 'Quote unavailable');

  return card(
    // NOTE: no fragments anywhere in this file — this satori version lays
    // a fragment's children out as a row regardless of the parent direction.
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
      {oneLiner && (
        <div style={{ fontSize: 30, color: BODY, marginTop: 10 }}>{truncateLine(oneLiner, 55)}</div>
      )}
      <span style={{ fontSize: pricePx, fontWeight: 900, lineHeight: 1, marginTop: 22 }}>
        {priceStr ?? 'Quote unavailable'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: moveColor }}>{move}</span>
        {day && <span style={{ fontSize: 34, color: MUTED, marginLeft: 14 }}>· {day}</span>}
      </div>
    </div>,
    font,
  );
}
