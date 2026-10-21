import { NextResponse } from 'next/server';
import { BLUE_CHIP, fetchEarningsWeek } from '@/lib/earnings';
import {
  buildFilingInsights,
  cikPad,
  fetchFilingText,
  fetchSecTickerMap,
  fetchSubmissions,
  findAnnualFiling,
  MAG7,
  normalizeTicker,
  tickerVariants,
} from '@/lib/stocks';
import {
  accessionFromFilingUrl,
  adminDb,
  generateOverview,
  getCachedOverview,
  saveOverview,
  STOCK_SUMMARY_MAX_PER_RUN,
} from '@/lib/stock-llm';

// Nightly AI overview generation, guarded by CRON_SECRET like the other
// jobs. For priority tickers missing a cached rewrite of their latest
// annual filing: resolve CIK → latest 10-K/20-F/40-F → Item 1/4 excerpt →
// one Gemini rewrite → cached forever under (ticker, accession). The light
// path skips companyfacts/history (no full payload), caps the run, and
// paces model calls — same cost discipline as the podcast jobs.
//   GET /api/stocks/summaries?secret=...[&limit=4&dryRun=1]
export const dynamic = 'force-dynamic';

const PACE_MS = 4000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'summaries not configured' }, { status: 503 });
  }
  const url = new URL(req.url);
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('secret');
  if (given !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const limit = Math.max(1, Math.min(STOCK_SUMMARY_MAX_PER_RUN, Number(url.searchParams.get('limit') ?? 4) || 4));
  const dryRun = url.searchParams.get('dryRun') === '1';

  const week = await fetchEarningsWeek().catch(() => null);
  const blue = new Set([...BLUE_CHIP]);
  const candidates = [
    ...new Set([...(week?.events ?? []).map((e) => e.symbol).filter((s) => blue.has(s)), ...MAG7]),
  ];
  const stats = {
    candidates: candidates.length,
    alreadyHad: 0,
    generated: 0,
    failed: [] as string[],
    promptTokens: 0,
    outputTokens: 0,
  };
  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, ...stats, tickers: candidates.slice(0, limit) });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'missing GEMINI_API_KEY' }, { status: 503 });
  }
  let db;
  try {
    db = adminDb();
  } catch {
    return NextResponse.json({ error: 'missing Supabase env' }, { status: 503 });
  }

  const map = await fetchSecTickerMap().catch(() => null);
  let paced = false;
  for (const raw of candidates.slice(0, limit)) {
    const ticker = normalizeTicker(raw);
    if (!ticker) continue;
    try {
      const entry = map ? tickerVariants(ticker).map((v) => map.get(v)).find(Boolean) : undefined;
      if (!entry) {
        stats.failed.push(`${ticker} (no SEC entry)`);
        continue;
      }
      const cik = cikPad(entry.cik);
      const sub = await fetchSubmissions(cik);
      const annual = findAnnualFiling(sub.filings?.recent, cik);
      const undashed = annual ? accessionFromFilingUrl(annual.url) : null;
      if (!annual || !undashed) {
        stats.failed.push(`${ticker} (no annual filing)`);
        continue;
      }
      const have = await getCachedOverview(db, ticker, undashed).catch(() => null);
      if (have) {
        stats.alreadyHad += 1;
        continue;
      }
      if (paced) await sleep(PACE_MS);
      paced = true;
      const html = await fetchFilingText(annual.url);
      const insights = buildFilingInsights(html, annual.form, annual.url, annual.filingDate);
      if (!insights?.business) {
        stats.failed.push(`${ticker} (no business excerpt)`);
        continue;
      }
      const gen = await generateOverview(geminiKey, {
        ticker,
        name: sub.name ?? ticker,
        form: annual.form,
        excerpt: insights.business,
      });
      await saveOverview(db, {
        ticker,
        accession: undashed,
        text: gen.text,
        model: gen.model,
        promptTokens: gen.promptTokens,
        outputTokens: gen.outputTokens,
      });
      stats.generated += 1;
      stats.promptTokens += gen.promptTokens;
      stats.outputTokens += gen.outputTokens;
    } catch (err) {
      stats.failed.push(`${ticker} (${err instanceof Error ? err.message : 'failed'})`);
    }
  }

  console.log('Stock summaries run:', JSON.stringify({ ...stats, failed: stats.failed.length }));
  return NextResponse.json({ ok: true, ...stats });
}
