import type { Metadata } from 'next';
import ShareRedirect from '@/components/blog/ShareRedirect';
import {
  beatVerdict,
  earningsCardImageUrl,
  earningsSharePageUrl,
  etToday,
  fetchEnrichedWeek,
  formatEps,
  previewShareText,
  rankDay,
  reportDateLabel,
  resultShareText,
  type EarningsCardType,
} from '@/lib/earnings';
import { normalizeTicker } from '@/lib/stocks';

// Earnings share landing: /share/earnings?type=preview&ticker=META
// Crawlers read the card metadata below (that's the snapshot embedded in
// an X post). Humans bounce to the stock lookup page via <ShareRedirect />.
// Same convention as the chess score cards in /share/[slug]: the shared URL
// is an HTML page, because X only renders a large card for a page carrying
// twitter:card + og:image meta — never for a raw image URL.
const SITE = 'https://amoljadhav.ai';
const LOOKUP_PATH = '/blog/look-up-stock-and-company-details';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function cardType(raw: string | undefined): EarningsCardType {
  return raw === 'result' || raw === 'tonight' || raw === 'morning' ? raw : 'preview';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const type = cardType(first(sp.type));
  const ticker = normalizeTicker(first(sp.ticker) ?? '');

  let title = 'Upcoming earnings';
  let description = 'Who reports, when, and whether they beat.';
  let extra: Record<string, string> = {};
  let lookupUrl = LOOKUP_PATH;

  if (type === 'tonight' || type === 'morning') {
    const half = type === 'tonight' ? 'amc' : 'bmo';
    const rawDate = first(sp.date) ?? '';
    const date = DATE_RE.test(rawDate) ? rawDate : etToday();
    extra = { date };
    const week = await fetchEnrichedWeek();
    const list = rankDay(week.events.filter((e) => e.date === date && e.hour === half)).slice(0, 6);
    const day = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const halfLabel = half === 'amc' ? 'after the close' : 'before the open';
    if (list.length > 0) {
      const head = list
        .slice(0, 3)
        .map((e) => e.symbol)
        .join(', ');
      title = `Reporting ${half === 'amc' ? 'tonight' : 'before the open'} · ${day}`;
      description = `${head}${list.length > 3 ? ` +${list.length - 3} more` : ''} report ${halfLabel}.`;
    } else {
      title = `No reports ${day}`;
      description = `Nothing scheduled ${halfLabel} on ${day}.`;
    }
  } else if (ticker) {
    lookupUrl = `${LOOKUP_PATH}?ticker=${ticker}`;
    extra = { ticker };
    const week = await fetchEnrichedWeek();
    if (type === 'preview') {
      const next = week.events
        .filter((e) => e.symbol === ticker)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .find((e) => e.date >= week.fetchedAt.slice(0, 10));
      if (next) {
        title = `$${ticker} reports ${reportDateLabel(next.date, next.hour)}`;
        description = previewShareText({
          symbol: ticker,
          date: next.date,
          hour: next.hour,
          epsEstimate: next.epsEstimate,
          revenueEstimate: next.revenueEstimate,
          beats: next.beats,
        });
      } else {
        title = `$${ticker} earnings preview`;
        description = `Nothing scheduled for $${ticker} this week.`;
      }
    } else {
      const done = week.events
        .filter((e) => e.symbol === ticker && e.epsActual !== null)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      if (done) {
        const verdict = beatVerdict(done.epsActual, done.epsEstimate);
        const verb = verdict === 'BEAT' ? 'beats' : verdict === 'MISS' ? 'misses' : verdict === 'INLINE' ? 'meets' : 'reports';
        const a = formatEps(done.epsActual);
        const est = formatEps(done.epsEstimate);
        title =
          a && est && verdict !== 'REPORTED'
            ? `$${ticker} ${verb}: EPS ${a} vs ${est} est`
            : `$${ticker} ${verb}${a ? `: EPS ${a}` : ''}`;
        description = resultShareText({
          symbol: ticker,
          epsActual: done.epsActual,
          epsEstimate: done.epsEstimate,
          priceChangePct: done.priceChangePct,
          ahChangePct: done.ahChangePct,
        });
      } else {
        title = `$${ticker} has not reported yet`;
        description = `$${ticker} has no reported earnings this week.`;
      }
    }
  }

  // Per-share nonce: the client mints a fresh `v` per share so X fetches a
  // freshly rendered card instead of its first cached image (chess cards
  // are unique per game; earnings params need the nonce). It rides into
  // both URLs — a fresh page pointing at a reused image URL would still
  // show the stale image. The og route ignores unknown params.
  const v = first(sp.v);
  const withNonce = v && /^[A-Za-z0-9]{1,12}$/.test(v) ? { ...extra, v } : extra;
  const cardUrl = earningsCardImageUrl(type, withNonce);
  const pageUrl = earningsSharePageUrl(type, withNonce);
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${lookupUrl}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
      images: [{ url: cardUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cardUrl],
    },
  };
}

export default async function EarningsSharePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ticker = normalizeTicker(first(sp.ticker) ?? '');
  const to = ticker ? `${LOOKUP_PATH}?ticker=${ticker}` : LOOKUP_PATH;
  return <ShareRedirect to={to} note="Taking you to the stock lookup…" />;
}
