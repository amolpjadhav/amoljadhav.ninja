import { extractTickers, getMarketNews, newsAge, type NewsItem } from '@/lib/news';
import { formatPct, getStockCardData, NEWS_TICKER_UNIVERSE } from '@/lib/stocks';

const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';

// "What's moving markets": cleaned headlines (clickbait filtered,
// primary publishers first), each tied to the market with ticker chips
// showing today's move — clicking a chip opens that company's lookup.
// Server-rendered below the movers; silent when the feed is down.
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
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-bold tabular-nums transition hover:brightness-125"
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
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs tabular-nums text-white/35">
      {fav && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fav} alt="" width={16} height={16} loading="lazy" className="rounded-sm" aria-hidden />
      )}
      {n.source} · {newsAge(n.datetime)}
    </span>
  );
}

export default async function MarketHeadlines() {
  const items = await getMarketNews(5).catch(() => [] as NewsItem[]);
  if (items.length === 0) return null;

  const withTickers = items.map((n) => ({ n, tickers: extractTickers(n, NEWS_TICKER_UNIVERSE) }));
  const unique = [...new Set(withTickers.flatMap(({ tickers }) => tickers))];
  const moves = new Map<string, number | null>();
  await Promise.all(
    unique.map(async (t) => {
      const card = await getStockCardData(t).catch(() => null);
      moves.set(t, card?.quote?.changePct ?? null);
    }),
  );

  const [lead, ...rest] = withTickers;
  const leadFav = favicon(lead.n.url);

  return (
    <section aria-label="What's moving markets" className="mt-10 font-sans">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
        What&apos;s moving markets
      </h2>

      <div className="group mb-2 flex gap-4 rounded-xl bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.05]">
        {lead.n.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.n.image}
            alt=""
            width={120}
            height={80}
            loading="lazy"
            className="h-20 w-[120px] shrink-0 rounded-lg object-cover"
            aria-hidden
          />
        ) : (
          <span className="flex h-20 w-[120px] shrink-0 items-center justify-center rounded-lg bg-white/[0.06]" aria-hidden>
            {leadFav && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leadFav} alt="" width={32} height={32} loading="lazy" aria-hidden />
            )}
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-2">
          <a
            href={lead.n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold leading-snug text-white/90 line-clamp-2 group-hover:underline"
          >
            {lead.n.headline}
          </a>
          <span className="flex flex-wrap items-center gap-2">
            {lead.tickers.map((t) => (
              <Chip key={t} symbol={t} changePct={moves.get(t) ?? null} />
            ))}
            <Meta n={lead.n} />
          </span>
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {rest.map(({ n, tickers }) => (
          <li key={n.id}>
            <div className="group flex items-baseline gap-3 px-1 py-2.5 transition-colors hover:bg-white/[0.03]">
              <span className="min-w-0 flex-1">
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-[15px] leading-snug text-white/85 line-clamp-2 sm:line-clamp-1 group-hover:underline"
                >
                  {n.headline}
                </a>
                {tickers.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {tickers.map((t) => (
                      <Chip key={t} symbol={t} changePct={moves.get(t) ?? null} />
                    ))}
                  </span>
                )}
              </span>
              <Meta n={n} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
