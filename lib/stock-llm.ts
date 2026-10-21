// AI company overviews for the stock lookup, cached forever per filing
// accession. The rewrite is generated once per annual filing from the
// filing's own Item 1/4 excerpt (the same text the extractive pipeline
// produces) — never per page view — and the widget prefers it over the raw
// extract, labeled as an AI summary. No audio/video; no full filing is ever
// stored, only the short rewrite.
//
// Cost guard mirrors the podcast jobs: generation runs only in the nightly
// /api/stocks/summaries job (capped + paced), reads tolerate a missing
// table or key by falling back to the extractive text.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const STOCK_SUMMARY_KIND = 'overview';
export const STOCK_SUMMARY_VERSION = 1;
export const STOCK_SUMMARY_MAX_PER_RUN = 10;
const GEMINI_MODEL = process.env.STOCK_SUMMARY_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-flash-latest';

/** Filing URLs embed the accession without dashes
 *  (…/Archives/edgar/data/1045810/000104581026012345/nvda-10k.htm).
 *  Returns the digits, or null when the URL is not an EDGAR filing. */
export function accessionFromFilingUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = String(url).match(/\/Archives\/edgar\/data\/\d+\/(\d{10,40})\//);
  return m ? m[1] : null;
}

/** Rewrite prompt: third-person plain-English overview from the filing's
 *  own business excerpt. JSON only, bounded, nothing invented. */
export function buildOverviewPrompt(input: { ticker: string; name: string; form: string; excerpt: string }): string {
  const excerpt = input.excerpt.slice(0, 4000);
  return [
    `Rewrite the business overview below as a plain-English company summary for a curious reader.`,
    `Use ONLY the text provided: never add facts, numbers, dates, or context not present in it.`,
    `Third person, no hype, no advice. Reply with JSON only, exactly this shape:`,
    `{"overview": "≤600 chars, 2-4 sentences: what the company sells, who pays, how it makes money"}`,
    `Ticker: ${input.ticker}`,
    `Company: ${input.name}`,
    `Source: latest ${input.form} business section`,
    `Text:`,
    excerpt,
  ].join('\n');
}

/** Shape + length gate for a generated overview. Null when unusable. */
export function validateOverviewSummary(json: unknown): { overview: string } | null {
  if (!json || typeof json !== 'object') return null;
  const overview = (json as Record<string, unknown>).overview;
  if (typeof overview !== 'string') return null;
  const text = overview.trim().replace(/\s+/g, ' ');
  if (text.length < 80 || text.length > 900) return null;
  return { overview: text };
}

interface LlmUsage {
  json: unknown;
  model: string;
  promptTokens: number;
  outputTokens: number;
}

async function geminiJson(apiKey: string, prompt: string, maxTokens = 1200): Promise<LlmUsage> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens, temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(60000),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('Gemini returned no text');
  const usage = body?.usageMetadata ?? {};
  return {
    json: JSON.parse(text),
    model: GEMINI_MODEL,
    promptTokens: Number(usage.promptTokenCount) || 0,
    outputTokens: Number(usage.candidatesTokenCount) || 0,
  };
}

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('missing Supabase env');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface CachedOverview {
  text: string;
  model: string;
}

/** Cached rewrite for this exact filing, or null (missing table/row/key
 *  all read as null — the extractive text stands). */
export async function getCachedOverview(
  db: SupabaseClient,
  ticker: string,
  accession: string,
): Promise<CachedOverview | null> {
  const { data, error } = await db
    .from('stock_llm_summaries')
    .select('text,model')
    .eq('ticker', ticker.trim().toUpperCase())
    .eq('accession', accession)
    .eq('kind', STOCK_SUMMARY_KIND)
    .maybeSingle();
  if (error) throw new Error(`overview lookup failed: ${error.message}`);
  if (!data) return null;
  return { text: data.text as string, model: (data.model as string) ?? '' };
}

export async function saveOverview(
  db: SupabaseClient,
  row: { ticker: string; accession: string; text: string; model: string; promptTokens: number; outputTokens: number },
): Promise<void> {
  const { error } = await db.from('stock_llm_summaries').upsert(
    {
      ticker: row.ticker.trim().toUpperCase(),
      accession: row.accession,
      kind: STOCK_SUMMARY_KIND,
      text: row.text,
      model: row.model,
      prompt_tokens: row.promptTokens,
      output_tokens: row.outputTokens,
    },
    { onConflict: 'ticker,accession,kind' },
  );
  if (error) throw new Error(`overview save failed: ${error.message}`);
}

/** One model call producing a validated overview. Throws on failure. */
export async function generateOverview(
  apiKey: string,
  input: { ticker: string; name: string; form: string; excerpt: string },
): Promise<{ text: string; model: string; promptTokens: number; outputTokens: number }> {
  const { json, model, promptTokens, outputTokens } = await geminiJson(
    apiKey,
    buildOverviewPrompt(input),
  );
  const valid = validateOverviewSummary(json);
  if (!valid) throw new Error('overview failed validation');
  return { text: valid.overview, model, promptTokens, outputTokens };
}

export function adminDb(): SupabaseClient {
  return admin();
}
