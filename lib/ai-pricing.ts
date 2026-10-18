// AI model price math + curated flagship fallback table.
//
// Prices are USD per token (OpenRouter convention). The live API route
// overwrites per-token prices from OpenRouter; when the fetch fails the
// table below is served instead, so the widget never renders empty.
// Fallback snapshot: 2026-10-18.

export interface FlagshipModel {
  id: string;
  label: string;
  vendor: string;
  promptPerToken: number;
  completionPerToken: number;
  context: number;
  /** e.g. 'Prev gen' — shown as a dim tag so older models read honestly. */
  tag?: string;
  /** True when the model can spend hidden thinking tokens, billed as output. */
  reasoning?: boolean;
}

export interface PricedModel extends FlagshipModel {
  live: boolean;
}

export const FLAGSHIPS: FlagshipModel[] = [
  { id: 'anthropic/claude-opus-5.5', label: 'Claude Opus 5.5', vendor: 'Anthropic', promptPerToken: 0.000004, completionPerToken: 0.00002, context: 1000000, reasoning: true },
  { id: 'anthropic/claude-sonnet-5.5', label: 'Claude Sonnet 5.5', vendor: 'Anthropic', promptPerToken: 0.000002, completionPerToken: 0.00001, context: 1000000, reasoning: true },
  { id: 'openai/gpt-5.5', label: 'GPT-5.5', vendor: 'OpenAI', promptPerToken: 0.000005, completionPerToken: 0.00003, context: 400000, reasoning: true },
  { id: 'openai/o3', label: 'o3', vendor: 'OpenAI', promptPerToken: 0.000002, completionPerToken: 0.000008, context: 200000, tag: 'Prev gen', reasoning: true },
  { id: 'openai/gpt-4o', label: 'GPT-4o', vendor: 'OpenAI', promptPerToken: 0.0000025, completionPerToken: 0.00001, context: 128000, tag: 'Prev gen' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', vendor: 'Google', promptPerToken: 0.00000125, completionPerToken: 0.00001, context: 1000000, reasoning: true },
  { id: 'x-ai/grok-4.7', label: 'Grok 4.7', vendor: 'xAI', promptPerToken: 0.000002, completionPerToken: 0.000006, context: 2000000, reasoning: true },
  { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1', vendor: 'DeepSeek', promptPerToken: 0.0000007, completionPerToken: 0.0000025, context: 163840, reasoning: true },
  { id: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick', vendor: 'Meta', promptPerToken: 0.0000001875, completionPerToken: 0.0000006525, context: 1000000 },
  { id: 'meta/muse-spark-1.3', label: 'Muse Spark 1.3', vendor: 'Meta', promptPerToken: 0.00000125, completionPerToken: 0.00000425, context: 1048576 },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', vendor: 'Meta', promptPerToken: 0.0000001, completionPerToken: 0.00000032, context: 131072 },
  { id: 'mistralai/mistral-large-2512', label: 'Mistral Large', vendor: 'Mistral', promptPerToken: 0.0000005, completionPerToken: 0.0000015, context: 128000 },
  { id: 'moonshotai/kimi-k2.5', label: 'Kimi K2.5', vendor: 'Moonshot', promptPerToken: 0.0000005, completionPerToken: 0.0000025, context: 262144, reasoning: true },
];

/** USD cost of one request with inputTokens in and outputTokens out. */
export function costForUsage(
  promptPerToken: number,
  completionPerToken: number,
  inputTokens: number,
  outputTokens: number,
): number {
  const input = Math.max(0, Math.floor(inputTokens)) * Math.max(0, promptPerToken);
  const output = Math.max(0, Math.floor(outputTokens)) * Math.max(0, completionPerToken);
  return input + output;
}

/** Price per million tokens, the unit every provider quotes. */
export function perMillion(perToken: number): number {
  return perToken * 1_000_000;
}

/** $1,234.56 and $0.45 for cent amounts, $0.0042 below a cent. */
export function formatUSD(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 0.01) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + n.toFixed(4);
}

/**
 * Per-request prices in cents with 2 decimals ("1.40¢", "7.10¢"), so rows
 * never round to the same dime. Switches to dollars at 10¢ and up ("$0.24").
 * Monthly totals always stay in dollars.
 */
export function formatCents(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 0.1) return formatUSD(n);
  return `${(n * 100).toFixed(2)}¢`;
}

/** Rough English words for a token count (1 token ≈ 0.75 words). */
export function wordsForTokens(tokens: number): number {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  return Math.round(tokens * 0.75);
}

/** Rough token estimate for pasted text (chars ÷ 4). */
export function tokensForChars(chars: number): number {
  if (!Number.isFinite(chars) || chars <= 0) return 0;
  return Math.floor(chars / 4);
}

/** Compact token counts: 1500 → "1.5K", 2000000 → "2M". */
export function formatTokens(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.floor(n));
}

interface OpenRouterModel {
  id?: unknown;
  name?: unknown;
  context_length?: unknown;
  pricing?: { prompt?: unknown; completion?: unknown };
}

/** Merge one curated flagship with its live OpenRouter row, if present. */
export function mergeLivePrice(base: FlagshipModel, live: OpenRouterModel | undefined): PricedModel {
  const prompt = Number(live?.pricing?.prompt);
  const completion = Number(live?.pricing?.completion);
  const context = Number(live?.context_length);
  if (live && Number.isFinite(prompt) && prompt >= 0 && Number.isFinite(completion) && completion >= 0) {
    return {
      ...base,
      promptPerToken: prompt,
      completionPerToken: completion,
      context: Number.isFinite(context) && context > 0 ? Math.floor(context) : base.context,
      live: true,
    };
  }
  return { ...base, live: false };
}
