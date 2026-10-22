import { extractTickers, getCompanyNews, getMarketNews, newsAge, type NewsItem } from '@/lib/news';
import { formatPct, getStockCardData, NEWS_TICKER_UNIVERSE } from '@/lib/stocks';
import SourceFavicon from './SourceFavicon';

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

// Headlines with ticker chips showing today's move — clicking a chip opens
// that company's lookup. Without a ticker it is "What's moving markets"
// (cleaned general headlines); with one it is that company's own news,
// used below the company sections on ticker pages instead of the general
// list. Server-rendered; silent when the feed is down.
function favicon(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return null;
  }
}

function Chip({ symbol, changePct }: { symbol: string; changePct: number | null }) {
  const v = changePct ?? 0;
  const color = Math.abs(v) * 100 < 0.005 ? 'rgba(255,255,255,0.45)' : v > 0 ? '#4ade80' : '#f87171';
  const arrow = Math.abs(v) * 100 < 0.005 ? '•' : v > 0 ? '▲' : '▼';
  return (
    <a
      href={`${LOOKUP_PATH}?ticker=${symbol}`}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums transition hover:brightness-125"
      style={{ color, background: `${color}26` }}
      aria-label={`${symbol}, ${formatPct(changePct)}. Look up.`}
    >
      {symbol} {arrow}
      {formatPct(changePct)}
    </a>
  );
}

function Meta({ n }: { n: NewsItem }) {
  const fav = favicon(n.url);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm tabular-nums text-white/65">
      {fav && <SourceFavicon src={fav} />}
      {n.source} · {newsAge(n.datetime)}
    </span>
  );
}

type Tagged = { n: NewsItem; tickers: string[] };

// One meta line under every headline: pills, then source and age.
// Rows share one height and scan the same way; nothing hides in a
// right-aligned column that truncates the headline.
function MetaLine({ item, tickers, moves }: { item: NewsItem; tickers: string[]; moves: Map<string, number | null> }) {
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      {tickers.map((t) => (
        <Chip key={t} symbol={t} changePct={moves.get(t) ?? null} />
      ))}
      {tickers.length > 0 && (
        <span aria-hidden className="text-white/30">
          ·
        </span>
      )}
      <Meta n={item} />
    </span>
  );
}

function LeadStory({ item, tickers, moves }: { item: NewsItem; tickers: string[]; moves: Map<string, number | null> }) {
  // Text-only by design: the feed's "images" are publisher logos, not
  // story art, and the list scans better without a thumbnail column.
  return (
    <div className="group px-1 pb-1">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[22px] font-semibold leading-snug text-white/95 line-clamp-2 group-hover:underline"
      >
        {item.headline}
      </a>
      <MetaLine item={item} tickers={tickers} moves={moves} />
    </div>
  );
}

function RowStory({ item, tickers, moves }: { item: NewsItem; tickers: string[]; moves: Map<string, number | null> }) {
  return (
    <div className="group px-1 py-3.5 transition-colors hover:bg-white/[0.03]">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[17px] font-medium leading-snug text-white/85 line-clamp-2 group-hover:underline"
      >
        {item.headline}
      </a>
      <MetaLine item={item} tickers={tickers} moves={moves} />
    </div>
  );
}

export default async function MarketHeadlines({ ticker }: { ticker?: string }) {
  const sym = (ticker ?? '').trim().toUpperCase();
  const items = sym
    ? await getCompanyNews(sym, 7, 5).catch(() => [] as NewsItem[])
    : await getMarketNews(5).catch(() => [] as NewsItem[]);
  if (items.length === 0) return null;

  // Ticker pages match against the page's own company name too — small
  // caps live outside the static alias map, and without their name every
  // story would slide into "Market news".
  const pageNames: Record<string, string> = {};
  if (sym) {
    const pageCard = await getStockCardData(sym).catch(() => null);
    const raw = pageCard?.companyName?.trim();
    if (raw) pageNames[sym] = raw;
  }
  const universe = sym ? [...new Set([...NEWS_TICKER_UNIVERSE, sym])] : NEWS_TICKER_UNIVERSE;
  const withTickers: Tagged[] = items.map((n) => ({ n, tickers: extractTickers(n, universe, pageNames) }));
  const unique = [...new Set(withTickers.flatMap(({ tickers }) => tickers))];
  const moves = new Map<string, number | null>();
  await Promise.all(
    unique.map(async (t) => {
      const card = await getStockCardData(t).catch(() => null);
      moves.set(t, card?.quote?.changePct ?? null);
    }),
  );

  // A ticker feed carries general market stories (Asia stocks, Barclays)
  // alongside company news: only stories that actually name a ticker keep
  // pills, and the rest sit under their own head with none.
  if (sym) {
    const matched = withTickers.filter((w) => w.tickers.length > 0);
    const market = withTickers.filter((w) => w.tickers.length === 0).slice(0, 3);
    if (matched.length === 0 && market.length === 0) return null;
    const [mLead, ...mRest] = matched;
    return (
      <section aria-label={`${sym} news`} className="mt-10 font-sans">
        {mLead && (
          <>
            <h2 className="mb-3 text-2xl font-bold text-white/95">{sym} news</h2>
            <div className="rounded-2xl bg-[#25262B] p-5">
              <LeadStory item={mLead.n} tickers={mLead.tickers} moves={moves} />
              {mRest.length > 0 && (
                <ul className="divide-y divide-white/10">
                  {mRest.map(({ n, tickers }) => (
                    <li key={n.id}>
                      <RowStory item={n} tickers={tickers} moves={moves} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
        {market.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-2xl font-bold text-white/95">Market news</h2>
            <div className="rounded-2xl bg-[#25262B] p-5">
              <ul className="divide-y divide-white/10">
                {market.map(({ n }) => (
                  <li key={n.id}>
                    <RowStory item={n} tickers={[]} moves={moves} />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    );
  }

  const [lead, ...rest] = withTickers;
  return (
    <section aria-label="What's moving markets" className="mt-10 font-sans">
      <h2 className="mb-3 text-2xl font-bold text-white/95">What&apos;s moving markets</h2>

      <div className="rounded-2xl bg-[#25262B] p-5">
        <LeadStory item={lead.n} tickers={lead.tickers} moves={moves} />
        <ul className="divide-y divide-white/10">
          {rest.map(({ n, tickers }) => (
            <li key={n.id}>
              <RowStory item={n} tickers={tickers} moves={moves} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
