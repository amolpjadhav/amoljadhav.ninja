// Episode summaries for trending podcasts, from episode descriptions.
// No audio or video is ever downloaded: the YouTube API already hands us
// the description server-side, and a cheap model turns it into a TL;DR,
// bullets, and key moments. Summaries are generated once per video,
// cached in Supabase forever, and always labelled with their source.
//
// Pure helpers (chapters, promo stripping, prompt, validation) live here
// so node tests pin them; network lives in runSummaries below.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface Chapter {
  t: number;
  label: string;
}

export interface SummaryMoments {
  t_seconds: number;
  label: string;
}

export interface EpisodeSummary {
  tldr: string;
  bullets: string[];
  moments: SummaryMoments[];
  source: 'description';
}

export const SUMMARY_VERSION = 1;
export const MAX_SUMMARIES_PER_DAY = 40;
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-flash-latest';

/** "12:40 Topic" / "1:02:03 Topic" lines → seconds + label. */
export function parseChapters(description: string): Chapter[] {
  const out: Chapter[] = [];
  for (const raw of description.split('\n')) {
    const line = raw.trim().replace(/^[–\-•*]+\s*/, '');
    const m = line.match(/^(?:(\d+):)?([0-5]?\d):([0-5]\d)\s+(.{3,120})$/);
    if (!m) continue;
    const t = (m[1] ? Number(m[1]) * 3600 : 0) + Number(m[2]) * 60 + Number(m[3]);
    if (!Number.isFinite(t)) continue;
    out.push({ t, label: m[4].trim() });
  }
  return out;
}

const PROMO_PATTERNS = [
  /sponsor/i,
  /promo\s*code/i,
  /discount\s*code/i,
  /\buse code\b/i,
  /link in (the )?(bio|description)/i,
  /follow (me|us) on/i,
  /subscribe (to|for)/i,
  /patreon\.com/i,
  /buy merch/i,
  /\btour dates?\b/i,
  /\btickets?\b/i,
  /presale/i,
  /advertis/i,
  /^@[\w.]+$/,
  /^https?:\/\/\S+$/,
];

/** Drop sponsor/promo/social lines; keep chapters and real description. */
export function stripPromos(description: string): string {
  return description
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !PROMO_PATTERNS.some((re) => re.test(l)))
    .join('\n');
}

export interface SummaryInput {
  videoId: string;
  title: string;
  channel: string;
  publishedAt: string;
  durationSec?: number;
  description: string;
}

export function buildPrompt(ep: SummaryInput): string {
  const chapters = parseChapters(ep.description);
  const clean = stripPromos(ep.description).slice(0, 6000);
  const chapterLines = chapters
    .slice(0, 30)
    .map((c) => `${Math.floor(c.t / 60)}:${String(c.t % 60).padStart(2, '0')} ${c.label}`)
    .join('\n');
  return [
    'Summarize this podcast episode from its title and official description ONLY.',
    'Do not invent topics, guests, or claims not present in the text.',
    'Stay neutral: attribute opinions ("they argue…", "they discuss…"), never state claims as facts.',
    'No quote longer than 15 words. Never describe the description itself: no bullets like',
    '"the description includes…" — summarize the episode (who appears, where recorded,',
    'what topics or segments are mentioned). If the text is mostly promotion with little',
    'episode content, keep it short and factual (guests, venue, format).',
    'Reply with JSON only, exactly this shape:',
    '{"tldr": "≤140 chars, one line", "bullets": ["≤120 chars", "≤120 chars", "≤120 chars"], "moments": [{"t_seconds": 760, "label": "short"}]}',
    'Use at most 4 moments, taken from the chapter timestamps when present.',
    `Title: ${ep.title}`,
    `Channel: ${ep.channel}`,
    `Published: ${ep.publishedAt}`,
    chapterLines ? `Chapters:\n${chapterLines}` : 'Chapters: none listed',
    `Description:\n${clean}`,
  ].join('\n');
}

/** Validate model output; null when it is not a well-formed summary. */
export function validateSummary(json: unknown): EpisodeSummary | null {
  if (typeof json !== 'object' || json === null) return null;
  const o = json as Record<string, unknown>;
  if (typeof o.tldr !== 'string' || o.tldr.length === 0 || o.tldr.length > 200) return null;
  if (!Array.isArray(o.bullets) || o.bullets.length === 0 || o.bullets.length > 3) return null;
  if (!o.bullets.every((b) => typeof b === 'string' && b.length > 0 && b.length <= 200)) return null;
  const moments = Array.isArray(o.moments) ? o.moments.slice(0, 4) : [];
  const cleanMoments: SummaryMoments[] = [];
  for (const m of moments) {
    if (typeof m !== 'object' || m === null) return null;
    const t = Number((m as Record<string, unknown>).t_seconds);
    const label = (m as Record<string, unknown>).label;
    if (!Number.isFinite(t) || t < 0 || typeof label !== 'string' || label.length === 0) return null;
    cleanMoments.push({ t_seconds: Math.floor(t), label: label.slice(0, 80) });
  }
  return { tldr: o.tldr.slice(0, 200), bullets: o.bullets as string[], moments: cleanMoments, source: 'description' };
}

export interface GeminiUsage {
  promptTokens: number;
  outputTokens: number;
}

export interface SummaryRunStats {
  candidates: number;
  alreadyHad: number;
  generated: number;
  failed: string[];
  promptTokens: number;
  outputTokens: number;
}

// --- Server-only runner (script + cron route share this) ---

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('missing Supabase env');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function existingIds(db: SupabaseClient, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await db.from('podcast_summaries').select('video_id').in('video_id', ids);
  if (error) throw new Error(`summary lookup failed: ${error.message}`);
  return new Set((data ?? []).map((r: { video_id: string }) => r.video_id));
}

async function generatedToday(db: SupabaseClient): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const { count, error } = await db
    .from('podcast_summaries')
    .select('video_id', { count: 'exact', head: true })
    .gte('created_at', start.toISOString());
  if (error) throw new Error(`summary count failed: ${error.message}`);
  return count ?? 0;
}

/**
 * Summarize top episodes missing a cached summary. Never re-summarizes,
 * never exceeds the daily cap. Returns per-run stats for logging.
 */
export async function runSummaries(
  geminiKey: string,
  episodes: SummaryInput[],
  opts: { limit?: number; dryRun?: boolean } = {},
): Promise<SummaryRunStats> {
  const limit = Math.max(1, Math.min(40, opts.limit ?? 20));
  const db = admin();
  const seen = new Set<string>();
  const candidates = episodes
    .filter((ep) => (seen.has(ep.videoId) ? false : (seen.add(ep.videoId), true)))
    .slice(0, limit);
  let have: Set<string>;
  try {
    have = await existingIds(db, candidates.map((c) => c.videoId));
  } catch (err) {
    // Missing table (setup not run yet): dry runs still report candidates;
    // real runs fail loudly at the first upsert instead.
    console.warn(`summary lookup skipped: ${err instanceof Error ? err.message : err}`);
    have = new Set();
  }
  const missing = candidates.filter((c) => !have.has(c.videoId));
  const stats: SummaryRunStats = {
    candidates: candidates.length,
    alreadyHad: candidates.length - missing.length,
    generated: 0,
    failed: [],
    promptTokens: 0,
    outputTokens: 0,
  };
  if (opts.dryRun) return stats;
  const today = await generatedToday(db);
  const budget = Math.max(0, MAX_SUMMARIES_PER_DAY - today);
  let first = true;
  for (const ep of missing.slice(0, budget)) {
    // Free-tier pacing: ~4s between calls keeps us under the per-minute quota.
    if (!first) await new Promise((r) => setTimeout(r, 4000));
    first = false;
    if (!ep.description) {
      stats.failed.push(`${ep.videoId} (no description)`);
      continue;
    }
    try {
      const { summary, usage } = await summarizeWithGemini(
        geminiKey,
        buildPrompt({
          videoId: ep.videoId,
          title: ep.title,
          channel: ep.channel,
          publishedAt: ep.publishedAt,
          durationSec: ep.durationSec ?? undefined,
          description: ep.description,
        }),
      );
      const { error } = await db.from('podcast_summaries').upsert(
        {
          video_id: ep.videoId,
          tldr: summary.tldr,
          bullets: summary.bullets,
          moments: summary.moments,
          source: summary.source,
          model: GEMINI_MODEL,
          prompt_tokens: usage.promptTokens,
          output_tokens: usage.outputTokens,
        },
        { onConflict: 'video_id' },
      );
      if (error) throw new Error(error.message);
      stats.generated += 1;
      stats.promptTokens += usage.promptTokens;
      stats.outputTokens += usage.outputTokens;
    } catch (err) {
      stats.failed.push(`${ep.videoId} (${err instanceof Error ? err.message : 'unknown'})`);
    }
  }
  return stats;
}

/** One Gemini generateContent call with JSON response mode. Throws on failure. */
export async function summarizeWithGemini(
  apiKey: string,
  prompt: string,
  attempt = 1,
): Promise<{ summary: EpisodeSummary; usage: GeminiUsage }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1200, temperature: 0.2 },
      }),
    },
  );
  if (res.status === 429 && attempt < 3) {
    // Free-tier quota: back off (20s, then 60s) and retry.
    await new Promise((r) => setTimeout(r, attempt === 1 ? 20000 : 60000));
    return summarizeWithGemini(apiKey, prompt, attempt + 1);
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('Gemini returned no text');
  let summary: EpisodeSummary | null = null;
  try {
    summary = validateSummary(JSON.parse(text));
  } catch {
    summary = null;
  }
  if (!summary) {
    // Truncated or malformed JSON (long descriptions can push the model past
    // its output budget): retry once with a shorter input.
    const shortPrompt = prompt.length > 2500 ? prompt.slice(0, 2500) + '\nDescription: [truncated]' : prompt;
    const retry = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: shortPrompt }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1500, temperature: 0.2 },
        }),
      },
    );
    if (!retry.ok) throw new Error(`Gemini retry ${retry.status}`);
    const retryJson = await retry.json();
    const retryText =
      retryJson?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    try {
      summary = validateSummary(JSON.parse(retryText));
    } catch {
      summary = null;
    }
  }
  if (!summary) throw new Error('Gemini returned an invalid summary shape');
  const usage = json?.usageMetadata ?? {};
  return {
    summary,
    usage: {
      promptTokens: Number(usage.promptTokenCount) || 0,
      outputTokens: Number(usage.candidatesTokenCount) || 0,
    },
  };
}
