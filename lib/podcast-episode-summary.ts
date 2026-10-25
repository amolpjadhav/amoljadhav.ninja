// Full-episode summaries from real transcripts, written as a story.
// Two passes on a cheap model (OpenRouter first, Gemini fallback): each
// ~20-minute chunk becomes ordered segment notes, then one reduce pass turns
// those into the page shape. Only the summary is stored and shown — never
// the raw transcript.
//
// Pure helpers (chunking, prompts, validation, span checks) live here so
// node tests pin them; network lives in the server-only runner below.

import type { TranscriptSegment } from './podcast-transcript';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-flash-latest';
const OPENROUTER_MODEL = process.env.EPISODE_SUMMARY_MODEL ?? 'meta-llama/llama-3.3-70b-instruct';

export interface LlmKeys {
  openRouterKey?: string;
  geminiKey?: string;
}

/** Provider order: cheap OpenRouter model first, Gemini as fallback. Pure (tested). */
export function pickProviders(keys: LlmKeys): ('openrouter' | 'gemini')[] {
  const out: ('openrouter' | 'gemini')[] = [];
  if (keys.openRouterKey) out.push('openrouter');
  if (keys.geminiKey) out.push('gemini');
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch that fails fast (120s) instead of hanging the whole batch. */
async function timedFetch(url: string, init: RequestInit, timeoutMs = 120000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface ChunkSegment {
  t_seconds: number;
  title: string;
  story: string;
  concepts: string[];
  numbers: string[];
  quote: { text: string; speaker: string; t_seconds: number } | null;
}

export interface ChunkNote {
  startSec: number;
  segments: ChunkSegment[];
}

export interface ShowHost {
  name: string;
  role: string;
}

/** "Hosts: Krystal Ball (co-host), Saagar Enjeti (co-host)." Empty when unknown. */
export function hostsLine(hosts: ShowHost[]): string {
  if (hosts.length === 0) return '';
  return `Hosts: ${hosts.map((h) => `${h.name} (${h.role})`).join(', ')}.`;
}

export interface StorySection {
  t_seconds: number;
  heading: string;
  paragraphs: string[];
}

export interface KeyIdea {
  idea: string;
  why_it_matters: string;
}

export interface Concept {
  term: string;
  explanation: string;
}

export interface EpisodeChapter {
  t_seconds: number;
  title: string;
  one_liner: string;
}

export interface EpisodeMoment {
  t_seconds: number;
  quote: string;
  speaker?: string;
}

export interface EpisodePerson {
  name: string;
  role: string;
}

export interface FullEpisodeSummary {
  hook: string;
  /** Joined section paragraphs (plain-text fallback). */
  story: string;
  sections: StorySection[];
  keyIdeas: KeyIdea[];
  concepts: Concept[];
  chapters: EpisodeChapter[];
  moments: EpisodeMoment[];
  people: EpisodePerson[];
  worthItFor: string;
}

/** Split segments into ~12-minute windows (widened for very long episodes). */
export function chunkSegments(segments: TranscriptSegment[], maxChunks = 12): TranscriptSegment[][] {
  if (segments.length === 0) return [];
  const duration = segments[segments.length - 1].t - segments[0].t;
  const window = Math.max(720, Math.ceil((duration + 1) / maxChunks));
  const chunks: TranscriptSegment[][] = [[]];
  const base = segments[0].t;
  for (const s of segments) {
    const idx = Math.floor((s.t - base) / window);
    while (chunks.length <= idx) chunks.push([]);
    chunks[chunks.length - 1].push(s);
  }
  return chunks.filter((c) => c.length > 0);
}

function chunkText(chunk: TranscriptSegment[]): string {
  return chunk.map((s) => `[${Math.floor(s.t / 60)}:${String(s.t % 60).padStart(2, '0')}] ${s.text}`).join('\n');
}

const SYSTEM = [
  'You are a sharp, neutral podcast editor writing for busy, curious readers who will NOT watch the episode.',
  'Tell them what actually happened and what they would learn, as a story — specific, concrete, faithful to the transcript.',
  'Hard rules: use ONLY the transcript, never add outside facts, dates, numbers, or context.',
  'Be specific: name who speaks, the claims they make, the numbers, examples, and reasoning they give.',
  'Replace every vague phrase ("discusses", "touches on", "talks about") with what was actually said.',
  'Attribute every opinion or contested claim to its speaker ("Saagar argues…", "Krystal counters that…").',
  'Never state a speaker\u2019s claim as fact. Political/news content: neutral tone, no editorializing.',
  'If a name is uncertain, describe the role ("the guest", "a caller") instead of guessing.',
  'Never write "Speaker N" labels: use a host name when the voice matches, a name said aloud in the transcript,',
  'else "a co-host", "the guest", or "a caller".',
  'Plain English: explain any jargon or concept the hosts use in one short clause.',
].join('\n');

const HOST_RULE =
  'Transcripts number voices ("Speaker 1", "Speaker 2") instead of naming them. Map each voice to the hosts above so readers can follow who argues what.';

export function buildChunkPrompt(
  show: string,
  title: string,
  idx: number,
  total: number,
  text: string,
  hosts: ShowHost[] = [],
): string {
  const line = hostsLine(hosts);
  return [
    SYSTEM,
    line ? `${line} ${HOST_RULE}` : '',
    '',
    `Transcript chunk (${idx + 1} of ${total}) for "${title}" (${show}), with [mm:ss] timestamps:`,
    text.slice(0, 12000),
    '',
    'Return JSON only, exactly this shape (at most 4 segments, in order, one per distinct topic shift; copy each topic\u2019s START timestamp exactly as shown):',
    '{"segments": [{"t_seconds": 0, "title": "4-9 words, specific", "story": "1-2 sentences, at most 300 characters: what was said, by whom, the argument and evidence", "concepts": ["at most 2: term — 1-line plain explanation"], "numbers": ["at most 2: figure + what it refers to"], "quote": {"text": "verbatim striking line, 3-15 words", "speaker": "name or omit", "t_seconds": 0} | null}]}',
    'Ignore ads, sponsor reads, and housekeeping; no segments for them.',
  ].join('\n');
}

export function buildReducePrompt(
  show: string,
  title: string,
  durationSec: number,
  notes: ChunkNote[],
  hosts: ShowHost[] = [],
): string {
  const body = notes
    .map((n) =>
      JSON.stringify({
        chunk_start: n.startSec,
        segments: n.segments.map((s) => ({
          t_seconds: s.t_seconds,
          title: s.title,
          story: s.story.slice(0, 600),
          concepts: s.concepts.slice(0, 2),
          numbers: s.numbers.slice(0, 2),
          quote: s.quote,
        })),
      }),
    )
    .join('\n');
  const dur = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;
  const line = hostsLine(hosts);
  return [
    SYSTEM,
    line ? `${line} ${HOST_RULE}` : '',
    '',
    `Ordered segment notes for the whole episode "${title}" by ${show} (total ${dur}):`,
    body.slice(0, 16000),
    '',
    'Write the final summary. Return JSON only, exactly this shape. Bad: "US involvement debated." Good: "Krystal argues the US is indirectly fueling the war through arms sales; Saagar counters that stopping them would hand leverage to Iran."',
    '{"hook": "1 sentence (<=35 words) leading with the episode\u2019s main topic: the most interesting thing a reader learns", "sections": [{"t_seconds": 0, "heading": "3-6 words", "paragraphs": ["1-2 paragraphs each; together the sections tell the episode as a narrative in chapter order: setup, main arguments, disagreements, conclusion", "250-400 words total across all sections. Specific names, claims, numbers; every opinion attributed"]}], "key_ideas": [{"idea": "complete informative sentence adding a NEW point (never restate the hook)", "why_it_matters": "one clause of consequence from the transcript"}], "concepts": [{"term": "x", "explanation": "newcomer-friendly"}], "chapters": [{"t_seconds": 0, "title": "specific", "one_liner": "what happens, <=20 words"}], "moments": [{"t_seconds": 0, "quote": "verbatim, <=15 words", "speaker": "name or omit"}], "people": [{"name": "real name", "role": "host/guest as stated"}]}',
    '"worth_it_for": "1 sentence: who would enjoy the full episode and why (no rating)".',
    'Chapters: 6-12, merged from the segments, spanning the WHOLE episode. At most 3 moments, 4-6 key ideas, 2-5 concepts.',
    'Use exactly the snake_case keys shown (one_liner, key_ideas, why_it_matters, worth_it_for) — never camelCase.',
    'Do not repeat the segment notes; output only the final JSON.',
  ].join('\n');
}

/** Roles, not names — never a person. */
const GENERIC_SPEAKER = /^(host|co-?host|speaker|guest|narrator|interviewer)(\s+\d+)?$/i;

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Validate one chunk's segments. Timestamps must land inside the chunk
 * (±2 min); values that look like offsets from the chunk start are shifted
 * onto absolute time so chapters never bunch at zero.
 */
export function validateChunkSegments(
  json: unknown,
  chunkStart: number,
  chunkEnd: number,
): ChunkSegment[] | null {
  const arr = (json as Record<string, unknown> | null)?.segments;
  if (!Array.isArray(arr) || arr.length === 0 || arr.length > 8) return null;
  const out: ChunkSegment[] = [];
  for (const row of arr) {
    if (typeof row !== 'object' || row === null) return null;
    const r = row as Record<string, unknown>;
    let t = Number(r.t_seconds);
    if (!Number.isFinite(t) || t < 0) return null;
    if (t < chunkStart - 120 || t > chunkEnd + 120) {
      // Maybe an offset from the chunk start rather than absolute time.
      const shifted = chunkStart + t;
      if (shifted < chunkStart - 120 || shifted > chunkEnd + 120) return null;
      t = shifted;
    }
    const title = str(r.title);
    const story = str(r.story);
    if (!title || title.length > 100 || story.length < 30 || story.length > 1500) return null;
    const concepts = Array.isArray(r.concepts) ? r.concepts : [];
    const numbers = Array.isArray(r.numbers) ? r.numbers : [];
    if (!concepts.every((c) => typeof c === 'string' && c && c.length <= 220)) return null;
    if (!numbers.every((n) => typeof n === 'string' && n && n.length <= 180)) return null;
    let quote: ChunkSegment['quote'] = null;
    if (r.quote !== null && r.quote !== undefined) {
      if (typeof r.quote !== 'object') return null;
      const q = r.quote as Record<string, unknown>;
      const text = str(q.text);
      const words = text.trim().split(/\s+/).filter(Boolean);
      if (!text || words.length < 3 || words.length > 15) return null;
      const qt = Number(q.t_seconds);
      if (!Number.isFinite(qt) || qt < 0) return null;
      quote = { text: text.slice(0, 160), speaker: str(q.speaker).slice(0, 60), t_seconds: Math.floor(qt) };
    }
    out.push({
      t_seconds: Math.floor(t),
      title: title.slice(0, 100),
      story,
      concepts: concepts as string[],
      numbers: numbers as string[],
      quote,
    });
  }
  return out;
}

/** Human-readable shape violations (empty = shape ok). Mirrors the validator. */
export function shapeErrors(json: unknown): string[] {
  if (typeof json !== 'object' || json === null) return ['not a JSON object'];
  const o = json as Record<string, unknown>;
  const errors: string[] = [];
  const hook = str(o.hook);
  const worthItFor = str(o.worth_it_for);
  if (hook.length < 20 || hook.length > 400) errors.push('hook must be 20-400 chars (1 sentence)');
  if (hook.trim().split(/\s+/).filter(Boolean).length > 40) errors.push('hook must be 35 words or fewer');
  const rawSections = Array.isArray(o.sections) ? o.sections : [];
  if (rawSections.length < 2 || rawSections.length > 10) {
    errors.push(`sections needs 2-10 chapter-ordered entries, got ${rawSections.length}`);
  }
  if (SPEAKER_LABEL.test(JSON.stringify([o.hook, o.sections, o.key_ideas, o.chapters]))) {
    errors.push('never output "Speaker N" labels — use host names or roles');
  }
  if (worthItFor.length < 20 || worthItFor.length > 400) errors.push('worth_it_for must be 20-400 chars (1 sentence)');
  const keyIdeas = Array.isArray(o.key_ideas) ? o.key_ideas : [];
  if (keyIdeas.length < 2 || keyIdeas.length > 8) {
    errors.push(`key_ideas needs 2-8 items, got ${keyIdeas.length}`);
  } else {
    keyIdeas.forEach((k, i) => {
      if (typeof k !== 'object' || k === null) errors.push(`key_ideas[${i}] is not an object`);
      else {
        if (!str((k as Record<string, unknown>).idea)) errors.push(`key_ideas[${i}].idea is empty`);
        if (!str((k as Record<string, unknown>).why_it_matters)) errors.push(`key_ideas[${i}].why_it_matters is empty`);
      }
    });
  }
  const chapters = Array.isArray(o.chapters) ? o.chapters : [];
  if (chapters.length < 3) errors.push(`chapters need at least 3, got ${chapters.length}`);
  else {
    chapters.forEach((c, i) => {
      if (typeof c !== 'object' || c === null) errors.push(`chapters[${i}] is not an object`);
      else {
        if (!str((c as Record<string, unknown>).title)) errors.push(`chapters[${i}].title is empty`);
        if (!str((c as Record<string, unknown>).one_liner)) errors.push(`chapters[${i}].one_liner is empty`);
      }
    });
  }
  return errors;
}

/** Transcription voice labels must never reach readers. */
const SPEAKER_LABEL = /speaker\s*\d+/i;

/** Shape-check the final summary; span/grounding checks live in checkSpan. */
export function validateEpisodeSummary(json: unknown): FullEpisodeSummary | null {
  if (typeof json !== 'object' || json === null) return null;
  const o = json as Record<string, unknown>;
  const hook = str(o.hook);
  const worthItFor = str(o.worth_it_for);
  if (hook.length < 20 || hook.length > 400) return null;
  if (hook.trim().split(/\s+/).filter(Boolean).length > 40) return null;
  if (worthItFor.length < 20 || worthItFor.length > 400) return null;
  const rawSections = Array.isArray(o.sections) ? o.sections : [];
  if (rawSections.length < 2 || rawSections.length > 10) return null;
  const sections: StorySection[] = [];
  let lastT = -1;
  for (const row of rawSections) {
    if (typeof row !== 'object' || row === null) return null;
    const r = row as Record<string, unknown>;
    const t = Number(r.t_seconds);
    const heading = str(r.heading);
    const paragraphs = Array.isArray(r.paragraphs) ? r.paragraphs : [];
    if (!Number.isFinite(t) || t < 0 || t <= lastT) return null;
    if (!heading || heading.length > 80) return null;
    if (paragraphs.length === 0 || paragraphs.length > 3) return null;
    if (!paragraphs.every((p) => typeof p === 'string' && p.length >= 20 && p.length <= 2500)) return null;
    lastT = t;
    sections.push({ t_seconds: Math.floor(t), heading, paragraphs: paragraphs as string[] });
  }
  const story = sections.map((s) => s.paragraphs.join('\n\n')).join('\n\n');
  if (SPEAKER_LABEL.test([hook, story, JSON.stringify(o.key_ideas), JSON.stringify(o.chapters)].join(' '))) {
    return null;
  }
  const keyIdeas = Array.isArray(o.key_ideas) ? o.key_ideas : [];
  if (keyIdeas.length < 2 || keyIdeas.length > 8) return null;
  const cleanIdeas: KeyIdea[] = [];
  for (const k of keyIdeas) {
    if (typeof k !== 'object' || k === null) return null;
    const idea = str((k as Record<string, unknown>).idea);
    const why = str(
      (k as Record<string, unknown>).why_it_matters ?? (k as Record<string, unknown>).whyItMatters,
    );
    if (!idea || idea.length > 350 || !why || why.length > 350) return null;
    cleanIdeas.push({ idea, why_it_matters: why });
  }
  const concepts = Array.isArray(o.concepts) ? o.concepts.slice(0, 8) : [];
  const cleanConcepts: Concept[] = [];
  for (const c of concepts) {
    if (typeof c !== 'object' || c === null) return null;
    const term = str((c as Record<string, unknown>).term);
    const explanation = str((c as Record<string, unknown>).explanation);
    if (!term || term.length > 80 || !explanation || explanation.length > 300) return null;
    cleanConcepts.push({ term, explanation });
  }
  const chapters = Array.isArray(o.chapters) ? o.chapters.slice(0, 15) : [];
  if (chapters.length < 3) return null;
  const cleanChapters: EpisodeChapter[] = [];
  for (const c of chapters) {
    if (typeof c !== 'object' || c === null) return null;
    const t = Number((c as Record<string, unknown>).t_seconds);
    const title = str((c as Record<string, unknown>).title);
    // Accept the model's camelCase drift; always store snake_case.
    const oneLiner = str(
      (c as Record<string, unknown>).one_liner ?? (c as Record<string, unknown>).oneLiner,
    );
    if (!Number.isFinite(t) || t < 0 || !title || title.length > 100) return null;
    if (!oneLiner || oneLiner.length > 160) return null;
    cleanChapters.push({ t_seconds: Math.floor(t), title, one_liner: oneLiner });
  }
  const moments = Array.isArray(o.moments) ? o.moments.slice(0, 3) : [];
  const cleanMoments: EpisodeMoment[] = [];
  for (const m of moments) {
    if (typeof m !== 'object' || m === null) return null;
    const r = m as Record<string, unknown>;
    const t = Number(r.t_seconds);
    const quote = str(r.quote);
    if (!Number.isFinite(t) || t < 0 || !quote) return null;
    const words = quote.trim().split(/\s+/).filter(Boolean);
    if (words.length < 3 || words.length > 15) continue;
    const speaker = str(r.speaker).trim();
    cleanMoments.push({
      t_seconds: Math.floor(t),
      quote: quote.slice(0, 160),
      ...(speaker && !GENERIC_SPEAKER.test(speaker) ? { speaker: speaker.slice(0, 60) } : {}),
    });
  }
  const people = Array.isArray(o.people) ? o.people : [];
  const cleanPeople: EpisodePerson[] = [];
  for (const p of people) {
    if (typeof p !== 'object' || p === null) return null;
    const name = str((p as Record<string, unknown>).name).trim();
    const role = str((p as Record<string, unknown>).role).trim();
    if (!name || GENERIC_SPEAKER.test(name)) continue;
    cleanPeople.push({ name: name.slice(0, 60), role: role.slice(0, 60) });
  }
  return {
    hook,
    story,
    sections,
    keyIdeas: cleanIdeas,
    concepts: cleanConcepts,
    chapters: cleanChapters,
    moments: cleanMoments,
    people: cleanPeople.slice(0, 10),
    worthItFor,
  };
}

const VAGUE_VERBS = /\b(discusses|discuss|touches on|touch on|talks about|talk about|delves|delve into)\b/gi;

function normWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export interface SpanContext {
  durationSec: number;
  /** Every cue start time from the transcript. */
  cueTimes: number[];
  /** Full transcript text (for verbatim quote checks). */
  transcript: string;
}

function fmtT(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function fmtClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '?';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

/** Compact notes for repair passes (titles + timestamps + story essence). */
export function compactNotes(notes: ChunkNote[], maxChars = 8000): string {
  const lines: string[] = [];
  for (const n of notes) {
    for (const s of n.segments) {
      lines.push(`${fmtT(s.t_seconds)} ${s.title}: ${s.story.slice(0, 250)}`);
    }
  }
  return lines.join('\n').slice(0, maxChars);
}

export function buildChapterRepairPrompt(
  show: string,
  title: string,
  durationSec: number,
  compact: string,
  problems: string[],
  legalTimes: number[],
): string {
  const stamps = [...new Set(legalTimes)].sort((a, b) => a - b).join(', ');
  return [
    SYSTEM,
    '',
    `Ordered topic notes for "${title}" (${show}, total ${fmtT(durationSec)}):`,
    compact,
    '',
    'Write the chapter list. Return JSON only: {"chapters": [{"t_seconds": 0, "title": "specific", "one_liner": "what happens, <=20 words"}]}',
    'Rules: 6-12 chapters spanning the WHOLE episode — first within 5 minutes, last past 70% of the total,',
    'no gap over a third of the total. No vague one-liners.',
    `Use ONLY these timestamps (copy exactly, they are the real topic starts): ${stamps}`,
    `Current list had these problems — fix every one:\n- ${problems.join('\n- ')}`,
  ].join('\n');
}

/**
 * Global paragraph indexes (across joined section paragraphs) containing
 * vague verbs, worst first. Pure (tested).
 */
export function vagueParagraphIndexes(story: string, limit = 4): number[] {
  VAGUE_VERBS.lastIndex = 0;
  const scored = story
    .split(/\n\n+/)
    .map((para, idx) => {
      VAGUE_VERBS.lastIndex = 0;
      const count = para.match(VAGUE_VERBS)?.length ?? 0;
      return { idx, count };
    })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((s) => s.idx);
  VAGUE_VERBS.lastIndex = 0;
  return scored;
}

export function buildParagraphRepairPrompt(heading: string, paragraph: string): string {
  return [
    SYSTEM,
    '',
    `Rewrite this ONE paragraph from the "${heading}" section of a podcast summary. Keep every fact, name, number, and attribution.`,
    'Return JSON only: {"paragraph": "same facts, 2-5 sentences"}.',
    'Rules: every sentence names a speaker and a specific claim. The words discusses, discuss, touches on, talks about, talk about, delves are FORBIDDEN — say what was actually said.',
    `Paragraph:\n${paragraph.slice(0, 1500)}`,
  ].join('\n');
}

export function buildStoryRepairPrompt(
  show: string,
  title: string,
  compact: string,
  problems: string[],
  hosts: ShowHost[] = [],
): string {
  const line = hostsLine(hosts);
  return [
    SYSTEM,
    line ? `${line} ${HOST_RULE}` : '',
    '',
    `Topic notes for "${title}" (${show}):`,
    compact,
    '',
    'Rewrite the episode story as sections. Return JSON only: {"sections": [{"t_seconds": 0, "heading": "3-6 words", "paragraphs": ["1-2 paragraphs each, 250-400 words total, narrative in chapter order. Specific names, claims, numbers; every opinion attributed"]}]}',
    'No vague verbs (discusses, touches on, talks about) — say what was actually said. Never "Speaker N".',
    'Bad: "US involvement debated." Good: "Krystal argues the US is indirectly fueling the war through arms sales; Saagar counters that stopping them would hand leverage to Iran."',
    `Current draft had these problems — fix every one:\n- ${problems.join('\n- ')}`,
  ].join('\n');
}

/** Validate a repaired chapter list (shape only). */
export function validateChapterList(json: unknown): EpisodeChapter[] | null {
  const arr = (json as Record<string, unknown> | null)?.chapters;
  if (!Array.isArray(arr) || arr.length < 3 || arr.length > 15) return null;
  const out: EpisodeChapter[] = [];
  for (const c of arr) {
    if (typeof c !== 'object' || c === null) return null;
    const t = Number((c as Record<string, unknown>).t_seconds);
    const title = str((c as Record<string, unknown>).title);
    const oneLiner = str(
      (c as Record<string, unknown>).one_liner ?? (c as Record<string, unknown>).oneLiner,
    );
    if (!Number.isFinite(t) || t < 0 || !title || title.length > 100) return null;
    if (!oneLiner || oneLiner.length > 160) return null;
    out.push({ t_seconds: Math.floor(t), title, one_liner: oneLiner });
  }
  return out;
}

/**
 * Sort chapters into time order and drop duplicate timestamps (keeping the
 * first). Chapter order IS time order, so this is normalization, not
 * invention — the span checks then judge real coverage gaps.
 */
export function normalizeChapters(chapters: EpisodeChapter[]): EpisodeChapter[] {
  const sorted = [...chapters].sort((a, b) => a.t_seconds - b.t_seconds);
  return sorted.filter((c, i) => i === 0 || c.t_seconds !== sorted[i - 1].t_seconds);
}

/** Chapter subset of the span checks (used by targeted repair). */
export function chapterSpanErrors(chapters: EpisodeChapter[], ctx: SpanContext): string[] {
  const errors: string[] = [];
  const sorted = [...chapters].sort((a, b) => a.t_seconds - b.t_seconds);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].t_seconds <= sorted[i - 1].t_seconds) {
      errors.push('chapters are not strictly increasing');
      break;
    }
  }
  if (sorted.length === 0 || sorted[0].t_seconds > 300) {
    errors.push(`no chapter near the start (first at ${fmtClock(sorted[0]?.t_seconds ?? -1)})`);
  }
  const dur = Math.max(1, ctx.durationSec);
  const last = sorted.length > 0 ? sorted[sorted.length - 1].t_seconds : 0;
  if (last < 0.7 * dur) errors.push(`chapters do not span the episode (last at ${fmtClock(last)} of ${fmtClock(dur)})`);
  let maxGap = 0;
  let maxGapAt = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i].t_seconds - sorted[i - 1].t_seconds;
    if (gap > maxGap) {
      maxGap = gap;
      maxGapAt = sorted[i - 1].t_seconds;
    }
  }
  if (maxGap > 0.35 * dur) {
    errors.push(`chapter gap covers over a third of the episode (${fmtClock(maxGap)} from ${fmtClock(maxGapAt)})`);
  }
  for (const c of sorted) {
    const near = ctx.cueTimes.some((t) => Math.abs(t - c.t_seconds) <= 30);
    if (!near) {
      errors.push(`chapter "${c.title}" timestamp matches no transcript moment`);
      break;
    }
  }
  return errors;
}

/** Story subset of the span checks (used by targeted repair). */
export function storySpanErrors(story: string): string[] {
  const errors: string[] = [];
  const words = story.trim().split(/\s+/).filter(Boolean);
  if (words.length < 200) errors.push(`story is too short to be useful (${words.length} words)`);
  const vague = story.match(VAGUE_VERBS);
  if (vague && vague.length > 1) {
    const counts = new Map<string, number>();
    for (const v of vague) counts.set(v.toLowerCase(), (counts.get(v.toLowerCase()) ?? 0) + 1);
    const detail = [...counts.entries()].map(([w, n]) => `"${w}" ×${n}`).join(', ');
    VAGUE_VERBS.lastIndex = 0;
    const at = story.split(/\n\n+/).findIndex((para) => VAGUE_VERBS.test(para));
    VAGUE_VERBS.lastIndex = 0;
    errors.push(`story hides behind vague verbs (${detail}) — say what was actually said (paragraph ${at + 1})`);
  }
  return errors;
}

/**
 * Grounding checks before saving: chapter coverage, story substance, quote
 * verbatim-ness. Returns human-readable failures (empty = pass).
 */
export function checkSpan(summary: FullEpisodeSummary, ctx: SpanContext): string[] {
  const errors: string[] = [];
  errors.push(...chapterSpanErrors(summary.chapters, ctx));
  errors.push(...storySpanErrors(summary.story));
  const hookNorm = summary.hook.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const k of summary.keyIdeas) {
    const ideaNorm = k.idea.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (hookNorm && ideaNorm && (hookNorm.includes(ideaNorm) || ideaNorm.includes(hookNorm))) {
      errors.push('hook repeats a key idea — each key idea must add a new point');
      break;
    }
  }
  const blobTokens = new Set(normWords(ctx.transcript));
  for (const m of summary.moments) {
    const words = normWords(m.quote).filter((w) => w.length > 2);
    if (words.length === 0) {
      errors.push('empty quote');
      continue;
    }
    const hit = words.filter((w) => blobTokens.has(w)).length;
    if (hit / words.length < 0.9) errors.push(`quote not verbatim from transcript: "${m.quote.slice(0, 40)}…"`);
  }
  return errors;
}

interface LlmResult {
  json: unknown;
  in: number;
  out: number;
  model: string;
}

async function openRouterJson(apiKey: string, prompt: string, maxTokens: number): Promise<LlmResult> {
  const res = await timedFetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
  if (res.status === 429) throw new Error('OpenRouter 429');
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const body = await res.json();
  const text = body?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('OpenRouter returned no text');
  const usage = body?.usage ?? {};
  return {
    json: JSON.parse(text),
    in: Number(usage.prompt_tokens) || 0,
    out: Number(usage.completion_tokens) || 0,
    model: OPENROUTER_MODEL,
  };
}

async function geminiJson(apiKey: string, prompt: string, maxTokens: number, attempt = 1): Promise<LlmResult> {
  const res = await timedFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens, temperature: 0.2 },
      }),
    },
  );
  if (res.status === 429 && attempt < 3) {
    await sleep(attempt === 1 ? 20000 : 60000);
    return geminiJson(apiKey, prompt, maxTokens, attempt + 1);
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('Gemini returned no text');
  const usage = body?.usageMetadata ?? {};
  return {
    json: JSON.parse(text),
    in: Number(usage.promptTokenCount) || 0,
    out: Number(usage.candidatesTokenCount) || 0,
    model: GEMINI_MODEL,
  };
}

/** One JSON call: OpenRouter first, Gemini fallback. Throws only when all fail. */
async function llmJson(keys: LlmKeys, prompt: string, maxTokens = 4000): Promise<LlmResult> {
  const errors: string[] = [];
  for (const provider of pickProviders(keys)) {
    let attemptPrompt = prompt;
    for (let retry = 0; retry < 2; retry += 1) {
      try {
        if (provider === 'openrouter') return await openRouterJson(keys.openRouterKey ?? '', attemptPrompt, maxTokens);
        return await geminiJson(keys.geminiKey ?? '', attemptPrompt, maxTokens);
      } catch (err) {
        // Truncated JSON means the answer outgrew the output budget: retry
        // once demanding compactness instead of repeating the same cutoff.
        // Anything else moves to the next provider.
        const parseError = err instanceof SyntaxError;
        errors.push(err instanceof Error ? err.message : 'unknown');
        if (!parseError) break;
        attemptPrompt =
          prompt + '\n\nYour previous answer was cut off for length. Answer again with HALF the words, same JSON shape.';
        await sleep(4000);
      }
    }
    await sleep(4000);
  }
  throw new Error(errors.length > 0 ? errors.join('; ') : 'no LLM provider configured');
}

export interface EpisodeRunUsage {
  promptTokens: number;
  outputTokens: number;
  chunks: number;
}

/**
 * Map-reduce one episode's transcript to a story-driven summary. The reduce
 * step is retried once with the span failures listed when grounding checks
 * fail. Throws with the reasons when the result stays unusable.
 */
export async function summarizeFullEpisode(
  keys: LlmKeys,
  show: string,
  title: string,
  segments: TranscriptSegment[],
  hosts: ShowHost[] = [],
): Promise<{ summary: FullEpisodeSummary; usage: EpisodeRunUsage; model: string }> {
  const chunks = chunkSegments(segments);
  const durationSec = Math.max(1, segments[segments.length - 1].t - segments[0].t);
  const usage: EpisodeRunUsage = { promptTokens: 0, outputTokens: 0, chunks: chunks.length };
  const notes: ChunkNote[] = [];
  const chunkErrors: string[] = [];
  let model = OPENROUTER_MODEL;
  let first = true;
  for (let i = 0; i < chunks.length; i += 1) {
    if (!first) await sleep(4000);
    first = false;
    const startSec = chunks[i][0].t;
    const endSec = chunks[i][chunks[i].length - 1].t;
    const attemptChunk = async (text: string) => {
      const r = await llmJson(keys, buildChunkPrompt(show, title, i, chunks.length, text, hosts), 6000);
      usage.promptTokens += r.in;
      usage.outputTokens += r.out;
      model = r.model;
      const segs = validateChunkSegments(r.json, startSec, endSec);
      if (!segs) throw new Error('bad chunk shape');
      return segs;
    };
    try {
      notes.push({ startSec, segments: await attemptChunk(chunkText(chunks[i])) });
    } catch {
      await sleep(4000);
      try {
        const half = chunks[i].slice(0, Math.ceil(chunks[i].length / 2));
        const halfEnd = half[half.length - 1].t;
        const r = await llmJson(keys, buildChunkPrompt(show, title, i, chunks.length, chunkText(half), hosts));
        usage.promptTokens += r.in;
        usage.outputTokens += r.out;
        model = r.model;
        const segs = validateChunkSegments(r.json, startSec, halfEnd);
        if (!segs) throw new Error('bad chunk shape');
        notes.push({ startSec, segments: segs });
      } catch (err2) {
        chunkErrors.push(`chunk ${i}: ${err2 instanceof Error ? err2.message : 'unknown'}`);
      }
    }
  }
  if (notes.length < Math.ceil(chunks.length / 2)) {
    throw new Error(`too many chunk failures (${notes.length}/${chunks.length}): ${chunkErrors.slice(0, 3).join('; ')}`);
  }
  const ctx: SpanContext = {
    durationSec,
    cueTimes: segments.map((s) => s.t),
    transcript: segments.map((s) => s.text).join(' '),
  };
  const reduceOnce = async (extra: string) => {
    const prompt = buildReducePrompt(show, title, durationSec, notes, hosts) + extra;
    const r = await llmJson(keys, prompt, 8000);
    usage.promptTokens += r.in;
    usage.outputTokens += r.out;
    model = r.model;
    return { summary: validateEpisodeSummary(r.json), errors: shapeErrors(r.json) };
  };
  let attempt = await reduceOnce('');
  if (!attempt.summary) {
    // Shape miss: tell the model exactly what was wrong and try once more.
    attempt = await reduceOnce(
      `\n\nYour previous draft had these shape problems — fix every one:\n- ${attempt.errors.join('\n- ')}`,
    );
  }
  if (!attempt.summary) throw new Error(`bad episode shape: ${attempt.errors.join('; ')}`);
  const summary = attempt.summary;
  summary.chapters = normalizeChapters(summary.chapters);
  const compact = compactNotes(notes);
  // Targeted repair: chapters and story get their own small passes instead
  // of regenerating everything (which rarely converges).
  const chapterProblems = chapterSpanErrors(summary.chapters, ctx);
  if (chapterProblems.length > 0) {
    const legalTimes = notes.flatMap((n) => n.segments.map((s) => s.t_seconds));
    const r = await llmJson(
      keys,
      buildChapterRepairPrompt(show, title, durationSec, compact, chapterProblems, legalTimes),
      4000,
    );
    usage.promptTokens += r.in;
    usage.outputTokens += r.out;
    model = r.model;
    const repaired = validateChapterList(r.json);
    if (repaired) {
      // Nudge near-misses onto real transcript moments (≤60s); invented
      // timestamps far from any cue are left alone to fail honestly. Then
      // sort and drop timestamp dupes (snapping can merge neighbors).
      for (const c of repaired) {
        let best = c.t_seconds;
        let bestGap = 61;
        for (const t of ctx.cueTimes) {
          const gap = Math.abs(t - c.t_seconds);
          if (gap < bestGap) {
            best = t;
            bestGap = gap;
          }
        }
        c.t_seconds = best;
      }
      summary.chapters = normalizeChapters(repaired);
    }
  }
  const storyProblems = storySpanErrors(summary.story);
  if (storyProblems.length > 0) {
    // Vague verbs cluster in a few paragraphs: rewrite exactly those
    // (small, focused, high success) instead of the whole story. Up to two
    // rounds — the second catches paragraphs the first round missed.
    const repairParagraphs = async (): Promise<boolean> => {
      const flat = summary.sections.flatMap((s, si) => s.paragraphs.map((p, pi) => ({ si, pi, p })));
      let repairedAny = false;
      for (const globalIdx of vagueParagraphIndexes(summary.story)) {
        const loc = flat[globalIdx];
        if (!loc) continue;
        const heading = summary.sections[loc.si].heading || title;
        const r = await llmJson(keys, buildParagraphRepairPrompt(heading, loc.p), 2000);
        usage.promptTokens += r.in;
        usage.outputTokens += r.out;
        model = r.model;
        const text =
          typeof (r.json as Record<string, unknown> | null)?.paragraph === 'string'
            ? ((r.json as Record<string, unknown>).paragraph as string)
            : '';
        VAGUE_VERBS.lastIndex = 0;
        const clean = text.length >= 20 && !VAGUE_VERBS.test(text);
        VAGUE_VERBS.lastIndex = 0;
        if (clean) {
          summary.sections[loc.si].paragraphs[loc.pi] = text;
          repairedAny = true;
        }
        await sleep(4000);
      }
      if (repairedAny) {
        summary.story = summary.sections.map((s) => s.paragraphs.join('\n\n')).join('\n\n');
      }
      return repairedAny;
    };
    await repairParagraphs();
    if (storySpanErrors(summary.story).length > 0) await repairParagraphs();
    if (storySpanErrors(summary.story).length > 0) {
      // Nothing surgical worked (or the story is too short): fall back to a
      // full-section rewrite.
      const r = await llmJson(
        keys,
        buildStoryRepairPrompt(show, title, compact, storyProblems, hosts),
        4000,
      );
      usage.promptTokens += r.in;
      usage.outputTokens += r.out;
      model = r.model;
      const parsed = r.json as Record<string, unknown>;
      const rawSections = Array.isArray(parsed.sections) ? parsed.sections : [];
      const repaired: StorySection[] = [];
      let ok = rawSections.length >= 2 && rawSections.length <= 10;
      let lastT = -1;
      if (ok) {
        for (const row of rawSections) {
          if (typeof row !== 'object' || row === null) {
            ok = false;
            break;
          }
          const rr = row as Record<string, unknown>;
          const t = Number(rr.t_seconds);
          const heading = str(rr.heading);
          const paragraphs = Array.isArray(rr.paragraphs) ? rr.paragraphs : [];
          if (!Number.isFinite(t) || t < 0 || t <= lastT || !heading) {
            ok = false;
            break;
          }
          if (!paragraphs.every((p) => typeof p === 'string' && p.length >= 20)) {
            ok = false;
            break;
          }
          lastT = t;
          repaired.push({ t_seconds: Math.floor(t), heading, paragraphs: paragraphs as string[] });
        }
      }
      if (ok) {
        summary.sections = repaired;
        summary.story = repaired.map((s) => s.paragraphs.join('\n\n')).join('\n\n');
      }
    }
  }
  const finalErrors = checkSpan(summary, ctx);
  if (finalErrors.length > 0) throw new Error(`span checks failed: ${finalErrors.join('; ')}`);
  summary.chapters.sort((a, b) => a.t_seconds - b.t_seconds);
  return { summary, usage, model };
}
