import { ImageResponse } from 'next/og';
import { cleanCompanyNameForSearch, extractQuote, formatPct, normalizeTicker } from '@/lib/stocks';

// Link-preview card for a stock lookup: ticker, company, latest price.
// GET /api/og/stock?ticker=NVDA
// The query string is validated; unknown tickers get an error card, never an
// exception. Plain fetches (no Next cache options) — this runs on the edge.
export const runtime = 'edge';

const W = 1200;
const H = 630;
const BG = '#0c0e10';
const PANEL = '#14171a';
const INK = '#f2f4f3';
const MUTED = '#9aa3a8';
const ACCENT = '#facc15'; // Investing category color
const UP = '#4ade80';
const DOWN = '#f87171';
const NASDAQ_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; og-image/1.0)' },
    }).then((r) => {
      if (!r.ok) throw new Error('font css');
      return r.text();
    });
    const url = css.match(/https:\/\/[^)]+\.woff2/)?.[0];
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
          background: BG,
          color: INK,
          fontFamily: font ? 'Inter, sans-serif' : 'sans-serif',
          padding: 64,
        }}
      >
        <div style={{ width: 10, background: ACCENT, borderRadius: 5, marginRight: 56 }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          {children}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: font ? [{ name: 'Inter', data: font, weight: 900, style: 'normal' }] : undefined,
    },
  );
}

async function fetchQuoteData(ticker: string) {
  const init = { headers: { 'User-Agent': NASDAQ_UA, Accept: 'application/json' } };
  const get = (cls: string) =>
    fetch(`https://api.nasdaq.com/api/quote/${ticker}/info?assetclass=${cls}`, init).then((r) =>
      r.ok ? r.json().then((j) => j?.data) : null,
    );
  let data = await get('stocks');
  if (!extractQuote(data)) data = await get('etf');
  if (data?.symbol?.toUpperCase() !== ticker) return null;
  const quote = extractQuote(data);
  if (!quote || quote.price === null) return null;
  return { quote, name: data.companyName ? cleanCompanyNameForSearch(String(data.companyName)) : ticker };
}

export async function GET(req: Request) {
  const ticker = normalizeTicker(new URL(req.url).searchParams.get('ticker') ?? '');
  const font = await loadFont();

  if (!ticker) {
    return card(
      <>
        <div style={{ fontSize: 40, fontWeight: 900, color: ACCENT, letterSpacing: 3 }}>STOCK LOOKUP</div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 16 }}>Invalid ticker</div>
        <div style={{ fontSize: 28, color: MUTED, marginTop: 24 }}>amoljadhav.ai</div>
      </>,
      font,
    );
  }

  const found = await fetchQuoteData(ticker).catch(() => null);
  if (!found) {
    return card(
      <>
        <div style={{ fontSize: 40, fontWeight: 900, color: ACCENT, letterSpacing: 3 }}>{ticker}</div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 16 }}>Quote unavailable</div>
        <div style={{ fontSize: 28, color: MUTED, marginTop: 24 }}>amoljadhav.ai · stock lookup</div>
      </>,
      font,
    );
  }

  {
    const { quote, name } = found;
    const up = (quote.change ?? 0) >= 0;
    const changeColor = up ? UP : DOWN;
    const changeText =
      quote.change !== null ? `${up ? '+' : ''}${quote.change.toFixed(2)} (${formatPct(quote.changePct)})` : '—';

    return card(
      <>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: ACCENT, letterSpacing: 4 }}>{ticker}</span>
          <span style={{ fontSize: 30, color: MUTED, fontWeight: 700 }}>{name.slice(0, 48)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, marginTop: 8 }}>
          <span style={{ fontSize: 170, fontWeight: 900, lineHeight: 1 }}>
            ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: 56, fontWeight: 800, color: changeColor }}>{changeText}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: PANEL,
              borderRadius: 14,
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <span style={{ fontSize: 20, color: MUTED, fontWeight: 700, letterSpacing: 2 }}>
              {quote.marketStatus ? quote.marketStatus.toUpperCase() : 'QUOTE'}
            </span>
            <span style={{ fontSize: 32, fontWeight: 800 }}>
              {quote.lastTrade ? `as of ${quote.lastTrade}` : 'delayed'}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 26, color: MUTED, marginTop: 28 }}>amoljadhav.ai · stock lookup</div>
      </>,
      font,
    );
  }
}
