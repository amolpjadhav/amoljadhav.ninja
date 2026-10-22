import { NextResponse } from 'next/server';
import { NEWS_TICKER_UNIVERSE } from '@/lib/stocks';
import { BLUE_CHIP, fetchEarningsWeek } from '@/lib/earnings';
import { buildPrewarmPlan } from '@/lib/stock-prewarm';

// Nightly cache prewarm for the stock lookup's hottest paths. Guarded by
// CRON_SECRET like the podcast jobs: `?secret=` or `Authorization: Bearer`.
// Warms same-origin endpoints so the CDN edge fills, not just the server:
// fast quotes for the broad universe, dots + news + full payloads for the
// priority reporters (earnings-week blue chips first — Finnhub-bound calls
// stay far under 60/min). Best effort: every fetch is timed out and
// settled, the job never throws, and the response reports what warmed.
// Full 20s+ fundamentals for hundreds of tickers can't fit a serverless
// window, so only the priority subset warms full payloads; the rest warm
// fast quotes behind the staged skeletons.
//   GET /api/stocks/prewarm?secret=...[&full=8&light=48&dryRun=1]
export const dynamic = 'force-dynamic';

const CONCURRENCY = 3;
const TIMEOUT_MS = 10000;

async function eachLimit(items: string[], size: number, fn: (item: string) => Promise<boolean>, failed: string[]) {
  let i = 0;
  await Promise.all(
    new Array(Math.min(size, items.length)).fill(0).map(async () => {
      while (i < items.length) {
        const at = i++;
        try {
          if (!(await fn(items[at]))) failed.push(items[at]);
        } catch {
          failed.push(items[at]);
        }
      }
    }),
  );
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'prewarm not configured' }, { status: 503 });
  }
  const url = new URL(req.url);
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('secret');
  if (given !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const fullLimit = Math.max(0, Math.min(12, Number(url.searchParams.get('full') ?? 8) || 8));
  const lightLimit = Math.max(0, Math.min(80, Number(url.searchParams.get('light') ?? 48) || 48));
  const dryRun = url.searchParams.get('dryRun') === '1';

  const week = await fetchEarningsWeek().catch(() => null);
  const plan = buildPrewarmPlan({
    universe: NEWS_TICKER_UNIVERSE,
    earnings: (week?.events ?? []).map((e) => e.symbol),
    blueChips: [...BLUE_CHIP],
    lightLimit,
    fullLimit,
  });
  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, plan });
  }

  const origin = url.origin;
  const failed: string[] = [];
  const warmed = { global: 0, fast: 0, dots: 0, news: 0, full: 0, logos: 0 };
  const get = async (path: string): Promise<boolean> => {
    try {
      const res = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      // 404 warms nothing (unknown ticker); anything else fills the edge.
      return res.ok;
    } catch {
      return false;
    }
  };

  await eachLimit(
    ['/api/stocks/earnings', '/api/markets/strip', '/api/markets/movers'],
    CONCURRENCY,
    async (p) => {
      const ok = await get(p);
      if (ok) warmed.global += 1;
      else failed.push(p);
      return ok;
    },
    failed,
  );
  await eachLimit(
    plan.light,
    CONCURRENCY,
    async (t) => {
      const ok = await get(`/api/stocks/${t}/fast`);
      if (ok) warmed.fast += 1;
      return ok;
    },
    failed,
  );
  await eachLimit(
    plan.full,
    2,
    async (t) => {
      const [d, n, f] = await Promise.all([
        get(`/api/stocks/earnings/dots?ticker=${t}`),
        get(`/api/news?ticker=${t}`),
        get(`/api/stocks/${t}`),
      ]);
      if (d) warmed.dots += 1;
      if (n) warmed.news += 1;
      if (f) warmed.full += 1;
      return d && n && f;
    },
    failed,
  );
  await eachLimit(
    plan.light,
    CONCURRENCY,
    async (t) => {
      // Warms the logo edge cache for the movers universe. A 404 (no logo
      // on file, e.g. TSLA) still settles edge state, so only a fetch
      // exception counts as a failure.
      try {
        const res = await fetch(`${origin}/api/logo?symbol=${t}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (res.ok) warmed.logos += 1;
        return true;
      } catch {
        return false;
      }
    },
    failed,
  );

  console.log('Stocks prewarm run:', JSON.stringify({ plan: { light: plan.light.length, full: plan.full.length }, warmed, failed: failed.length }));
  return NextResponse.json({ ok: true, plan: { light: plan.light.length, full: plan.full.length }, warmed, failed });
}
