// One-stop stock lookup: company profile, quote, fundamentals, filings.
//
// Data comes from two free, keyless sources, combined server-side:
//   SEC EDGAR   - ticker/CIK map, company profile, XBRL fundamentals, filings,
//                 and the Company overview (latest 10-K/20-F Item 1/4 business
//                 excerpt, like the Business/Competition/Risks sections)
//   Nasdaq API  - quote (price, change, volume) + summary (market cap, 52wk)
//
// Pure parsing/formatting helpers are exported for unit tests; the fetch*
// functions run server-side only (the API route calls getStockData).

export interface AnnualPoint {
  year: string;
  end: string;
  value: number;
  filed: string;
}

export interface FinancialSeries {
  key: string;
  label: string;
  unit: 'USD' | 'USD/shares' | 'shares';
  points: AnnualPoint[];
}

export interface Filing {
  form: string;
  filingDate: string;
  reportDate: string;
  url: string;
  // Plain-English 8-K event label ("Earnings", "Management change") — null
  // for 10-K/10-Q and unmapped items.
  eventLabel: string | null;
}

export interface StockQuote {
  price: number | null;
  change: number | null;
  changePct: number | null;
  volume: number | null;
  lastTrade: string | null;
  marketStatus: string | null;
}

export interface StockStats {
  marketCap: number | null;
  marketCapEstimated: boolean;
  week52High: number | null;
  week52Low: number | null;
  sector: string | null;
  industry: string | null;
  // Computed uniformly as annualised dividends ÷ price. 'None' when the
  // company is known not to pay one, null only when the quote feed is down.
  dividendYield: string | null;
  avgVolume: number | null;
  // Trailing-twelve-month dividends per share behind the yield (XBRL first,
  // Nasdaq annualised backup). Null when the company pays nothing or the
  // figure is unknown.
  dpsTtm: number | null;
}

export interface StockProfile {
  cik: string;
  sic: string | null;
  sicDescription: string | null;
  address: string | null;
  fiscalYearEnd: string | null;
  stateOfIncorporation: string | null;
  employees: number | null;
  sharesOutstanding: number | null;
  sharesOutstandingEstimated: boolean;
}

export interface StockDescription {
  extract: string;
  url: string;
  title: string;
  source: 'wikidata' | 'wikipedia' | 'sec';
  // Company facts (inception, HQ, CEO). Always null on the 10-K path — the
  // filing has no reliable tags for them; the UI falls back to the SEC
  // address for HQ. Non-null only from the legacy Wikipedia helpers below.
  founded: string | null;
  headquarters: string | null;
  ceo: string | null;
}

export interface StockResponse {
  ticker: string;
  companyName: string;
  exchange: string | null;
  quote: StockQuote | null;
  stats: StockStats;
  profile: StockProfile | null;
  description: StockDescription | null;
  financials: FinancialSeries[] | null;
  missingFinancials: string[];
  splitAdjusted: boolean;
  peHistory: PePoint[] | null;
  psHistory: PePoint[] | null;
  // Weekly closes (last close per week), oldest first, for the price chart
  // and trailing returns. Null when Nasdaq history is unavailable.
  priceHistory: PricePoint[] | null;
  ttm: TtmValues | null;
  filings: Filing[];
  // Business/competition/risks excerpts from the latest annual filing's own
  // text. Null when the document is unreachable or unparseable — the profile
  // sections fall back to their stubs.
  filingInsights: FilingInsights | null;
  // Latest proxy statement (DEF 14A) for the management section, if filed.
  proxyUrl: string | null;
  warnings: string[];
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested)
// ---------------------------------------------------------------------------

// Normalise user input to a canonical ticker: uppercased, $ and whitespace
// stripped, separators unified to dots — BRK.B, BRK-B and BRK/B are the same
// company. Returns '' when invalid.
export function normalizeTicker(input: string): string {
  const t = (input || '')
    .trim()
    .toUpperCase()
    .replace(/^\$/, '')
    .replace(/\s+/g, '')
    .replace(/[-/]/g, '.');
  return /^[A-Z][A-Z0-9.]{0,9}$/.test(t) ? t : '';
}

// Lookup variants for one canonical ticker: SEC's directory uses dashes
// (BRK-B) while Nasdaq uses dots (BRK.B). Dot form first.
export function tickerVariants(canonical: string): string[] {
  if (!canonical) return [];
  const dash = canonical.replace(/\./g, '-');
  return canonical === dash ? [canonical] : [canonical, dash];
}

export function cikPad(cik: number | string): string {
  return String(cik).padStart(10, '0');
}

export interface XbrlEntry {
  start?: string;
  end: string;
  val: number;
  accn: string;
  fy: string | number;
  fp: string;
  form: string;
  filed: string;
}

export function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
}

export interface XbrlConceptData {
  units?: Record<string, XbrlEntry[]>;
}

const ANNUAL_FORMS = new Set(['10-K', '10-K/A', '20-F', '20-F/A', '40-F', '40-F/A']);

// Pull an annual (fiscal-year) series out of SEC companyfacts. Tries each
// concept in order and returns the first one with annual data.
//
// Four traps, all verified against live filings. `fy` is the filing's focus
// year, not the period's — a 10-K's comparative columns for earlier years all
// carry the filing's own fy — so the year comes from the period end date.
// Only full-year durations count (>350 days); point-in-time balance-sheet
// items carry no start date and match on the fiscal year-end instead.
// Entries dedupe per exact period end with the latest filing winning (which
// absorbs restatements), collapsing to one point per calendar year. And
// filers switch concepts mid-history — NVIDIA tagged revenue one way through
// FY2022 and another way after — so candidates merge with concept-list order
// as the tiebreak: for each year the first concept with data wins (same
// concept still takes the latest filing). That keeps overlapping definitions
// consistent instead of mixing them year to year. Points come back
// oldest-first for tables.
export function extractAnnualSeries(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  taxonomy: string,
  concepts: string[],
  unit: FinancialSeries['unit'],
  key: string,
  label: string,
  years = 5,
): FinancialSeries | null {
  const tax = facts?.[taxonomy];
  if (!tax) return null;
  const byYear = new Map<string, XbrlEntry>();
  for (const concept of concepts) {
    const entries = tax[concept]?.units?.[unit];
    if (!entries || entries.length === 0) continue;
    const mine = new Map<string, XbrlEntry>();
    for (const e of entries) {
      if (!ANNUAL_FORMS.has(e.form)) continue;
      if (e.fp !== 'FY') continue;
      if (typeof e.val !== 'number' || !Number.isFinite(e.val)) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.end)) continue;
      if (e.start && daysBetween(e.start, e.end) <= 350) continue;
      const year = e.end.slice(0, 4);
      const prev = mine.get(year);
      if (!prev || e.end > prev.end || (e.end === prev.end && e.filed > prev.filed)) {
        mine.set(year, e);
      }
    }
    for (const [year, e] of mine) {
      if (!byYear.has(year)) byYear.set(year, e);
    }
  }
  if (byYear.size === 0) return null;
  const points = [...byYear.values()]
    .sort((a, b) => (a.end < b.end ? 1 : -1))
    .slice(0, years)
    .sort((a, b) => (a.end < b.end ? -1 : 1))
    .map((e) => ({
      year: e.end.slice(0, 4),
      end: e.end,
      value: e.val,
      filed: e.filed,
    }));
  return { key, label, unit, points };
}

// Latest value of a point-in-time concept (shares outstanding, employees).
// Takes whatever unit the concept reports in.
export function extractLatestPoint(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  taxonomy: string,
  concept: string,
): { value: number; end: string; filed: string } | null {
  const units = facts?.[taxonomy]?.[concept]?.units;
  if (!units) return null;
  let best: XbrlEntry | null = null;
  for (const entries of Object.values(units)) {
    for (const e of entries || []) {
      if (typeof e.val !== 'number' || !Number.isFinite(e.val)) continue;
      if (!best || e.end > best.end || (e.end === best.end && e.filed > best.filed)) best = e;
    }
  }
  return best ? { value: best.val, end: best.end, filed: best.filed } : null;
}

// ---------------------------------------------------------------------------
// Stock splits. A split restates per-share history, but a 10-K only restates
// its own three-year window — older years keep pre-split values and the table
// shows a fake collapse. There is no keyless split-history API (Nasdaq has
// none), so splits are a small curated table; the adjustment is filing-date
// aware, so extra history is harmless: a point is only adjusted when both its
// period and its filing predate the split, otherwise the filing already
// restated it. ratio = new shares per old share (10 for a 10:1 split).

export interface SplitEvent {
  exDate: string; // ex-split date, YYYY-MM-DD
  ratio: number;
}

export const STOCK_SPLITS: Record<string, SplitEvent[]> = {
  NVDA: [
    { exDate: '2024-06-10', ratio: 10 },
    { exDate: '2021-07-20', ratio: 4 },
  ],
  AAPL: [
    { exDate: '2020-08-31', ratio: 4 },
    { exDate: '2014-06-09', ratio: 7 },
  ],
  TSLA: [
    { exDate: '2022-08-25', ratio: 3 },
    { exDate: '2020-08-31', ratio: 5 },
  ],
  AMZN: [{ exDate: '2022-06-06', ratio: 20 }],
  GOOGL: [
    { exDate: '2022-07-18', ratio: 20 },
    { exDate: '2014-04-03', ratio: 2 },
  ],
  GOOG: [
    { exDate: '2022-07-18', ratio: 20 },
    { exDate: '2014-04-03', ratio: 2 },
  ],
  AVGO: [{ exDate: '2024-10-07', ratio: 10 }],
};

// Cumulative adjustment for one point: the product of every split ratio whose
// ex-date came after both the period end and the filing date. Per-share
// values divide by it, share counts multiply by it. Returns 1 (no-op) for
// tickers and points that need nothing.
export function splitFactor(ticker: string, end: string, filed: string): number {
  let factor = 1;
  for (const s of STOCK_SPLITS[ticker] ?? []) {
    if (end < s.exDate && filed < s.exDate) factor *= s.ratio;
  }
  return factor;
}

export interface PePoint {
  year: string;
  value: number | null;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

// P/E at each fiscal year-end: last close on or before the period end
// (weekends and holidays fall back to the prior trading day) divided by
// diluted EPS. Null when there is no earlier close (pre-IPO years) or EPS is
// zero/negative. No split math needed: Nasdaq back-adjusts history into
// current shares (verified: NVDA 2019 closes come back ~$4.60), matching the
// restated EPS it divides by.
export function buildPeHistory(eps: FinancialSeries | undefined, closes: PricePoint[]): PePoint[] | null {
  if (!eps || closes.length === 0) return null;
  const sorted = [...closes].sort((a, b) => (a.date < b.date ? -1 : 1));
  return eps.points.map((p) => {
    let close: { date: string; close: number } | null = null;
    for (const c of sorted) {
      if (c.date > p.end) break;
      close = c;
    }
    if (!close || !(p.value > 0)) return { year: p.year, value: null };
    return { year: p.year, value: close.close / p.value };
  });
}

// Price-to-sales at each fiscal year-end: year-end close ÷ revenue per share
// (annual revenue ÷ average diluted shares). Null when either leg is missing
// or revenue is zero/negative.
export function buildPsHistory(
  revenue: FinancialSeries | undefined,
  shares: FinancialSeries | undefined,
  closes: PricePoint[],
): PePoint[] | null {
  if (!revenue || !shares || closes.length === 0) return null;
  const sorted = [...closes].sort((a, b) => (a.date < b.date ? -1 : 1));
  const spsByYear = new Map<string, number>();
  const sharesByYear = new Map(shares.points.map((p) => [p.year, p.value]));
  for (const p of revenue.points) {
    const sh = sharesByYear.get(p.year);
    if (sh && p.value > 0) spsByYear.set(p.year, p.value / sh);
  }
  return revenue.points.map((p) => {
    let close: PricePoint | null = null;
    for (const c of sorted) {
      if (c.date > p.end) break;
      close = c;
    }
    const sps = spsByYear.get(p.year);
    if (!close || !sps) return { year: p.year, value: null };
    return { year: p.year, value: close.close / sps };
  });
}

// Last close per calendar week, oldest first. Shrinks ~7 years of daily
// history to a chart-friendly payload without moving any visible point.
export function downsampleWeekly(closes: PricePoint[]): PricePoint[] {
  const sorted = [...closes].sort((a, b) => (a.date < b.date ? -1 : 1));
  const byWeek = new Map<string, PricePoint>();
  for (const c of sorted) {
    const d = new Date(`${c.date}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) continue;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    byWeek.set(monday.toISOString().slice(0, 10), c);
  }
  return [...byWeek.values()];
}

// Trailing return over the last `years` years: last close vs the first close
// on or after the cutoff. History shorter than the window measures from its
// own start; null only with fewer than two points or a non-positive start.
export function periodReturn(closes: PricePoint[], years: number): number | null {
  if (closes.length < 2 || !(years > 0)) return null;
  const sorted = [...closes].sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = sorted[sorted.length - 1];
  const cutoff = new Date(Date.parse(`${last.date}T00:00:00Z`));
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - years);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const start = sorted.find((c) => c.date >= cutoffStr) ?? sorted[0];
  if (!(start.close > 0)) return null;
  return last.close / start.close - 1;
}

export interface FilingsRecent {
  form?: string[];
  filingDate?: string[];
  reportDate?: string[];
  accessionNumber?: string[];
  primaryDocument?: string[];
  // 8-K item numbers per filing ("2.02,9.01"), parallel to the arrays above.
  items?: string[];
}

// SEC parallel-array recent-filings structure -> flat list with EDGAR links.
export function pickFilings(
  recent: FilingsRecent | null | undefined,
  cikPadded: string,
  forms: string[],
  limit: number,
): Filing[] {
  if (!recent) return [];
  const want = new Set(forms);
  const n = Math.min(
    recent.form?.length ?? 0,
    recent.filingDate?.length ?? 0,
    recent.accessionNumber?.length ?? 0,
    recent.primaryDocument?.length ?? 0,
  );
  const out: Filing[] = [];
  for (let i = 0; i < n && out.length < limit; i++) {
    const form = recent.form![i];
    if (!want.has(form)) continue;
    out.push({
      form,
      filingDate: recent.filingDate![i],
      reportDate: recent.reportDate?.[i] ?? '',
      eventLabel: filingEventLabel(form, recent.items?.[i]),
      url: edgarFilingUrl(cikPadded, recent.accessionNumber![i], recent.primaryDocument![i]),
    });
  }
  return out;
}

export const FILING_LABELS: Record<string, string> = {
  '10-K': 'Annual report',
  '10-Q': 'Quarterly report',
  '8-K': 'Material event',
  '20-F': 'Annual report (foreign filer)',
  '40-F': 'Annual report (Canadian filer)',
};

// 8-K item numbers -> plain-English event labels. An 8-K can carry several
// items ("2.02,9.01"); the first mapped one wins, the rest are exhibits and
// boilerplate. Only 8-Ks get labels.
const EIGHT_K_LABELS: Record<string, string> = {
  '1.01': 'Material agreement',
  '1.02': 'Agreement terminated',
  '2.01': 'Acquisition',
  '2.02': 'Earnings',
  '3.01': 'Listing notice',
  '4.01': 'Auditor change',
  '5.02': 'Management change',
  '5.03': 'Bylaw change',
  '5.07': 'Shareholder vote',
  '7.01': 'Company update',
  '8.01': 'Other event',
};

export function filingEventLabel(form: string, items: string | undefined): string | null {
  if (form !== '8-K' || !items) return null;
  for (const item of items.split(',')) {
    const label = EIGHT_K_LABELS[item.trim()];
    if (label) return label;
  }
  return null;
}

// EDGAR URL of the latest filing of one form (DEF 14A proxy, 10-K). Null
// when the form never appears in the recent-filings window.
export function findFormUrl(
  recent: FilingsRecent | null | undefined,
  cikPadded: string,
  form: string,
): string | null {
  const n = Math.min(recent?.form?.length ?? 0, recent?.accessionNumber?.length ?? 0, recent?.primaryDocument?.length ?? 0);
  for (let i = 0; i < n; i++) {
    if (recent!.form![i] !== form) continue;
    return edgarFilingUrl(cikPadded, recent!.accessionNumber![i], recent!.primaryDocument![i]);
  }
  return null;
}

// ---------------------------------------------------------------------------
// 10-K text extraction (pure, unit-tested)
// ---------------------------------------------------------------------------

const HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'",
  mdash: '—', ndash: '–', hellip: '…', copy: '©', reg: '®', trade: '™',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);?/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);?/g, (_, n: string) => {
      const lower = n.toLowerCase();
      if (lower === 'amp') return '&';
      return HTML_ENTITIES[lower] ?? `&${n};`;
    });
}

// One filing HTML document -> plain text, one paragraph per line. Bold and
// italic spans are kept as **markers** because risk-factor titles are bold;
// scripts, styles, and tables' tag soup are dropped.
export function htmlToText(html: string): string {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<(b|strong|i|em)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<\/?(p|div|table|tr|td|th|h[1-6]|br|li|ul|ol|section|article|hr|title|header|footer)[^>]*>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeHtmlEntities(s);
  return s
    .split('\n')
    .map((l) => l.replace(/[ \t\r\f\v]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

const TEN_K_ITEMS = [
  '1', '1A', '1B', '1C', '2', '3', '4', '5', '6', '7', '7A', '8', '9', '9A', '9B', '9C',
  '10', '11', '12', '13', '14', '15',
];
const TWENTY_F_ITEMS = [
  '1', '2', '3', '4', '4A', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
  '16A', '16B', '16C', '16D', '16E', '16F', '16G', '16H', '16I', '16J', '16K', '17', '18', '19',
];

// Slice one item (e.g. "1A") out of filing text: from its heading to the next
// heading of a later item. Three traps: the boundary guard keeps ITEM 1 from
// matching ITEM 1A/1B/10–15; the table of contents up front lists every item,
// so a candidate immediately followed by an earlier item (TOC "Item 1A" →
// body "Item 1" — body order never runs backwards) never starts a slice;
// repeated page headers of the same item share their end with the true
// start, so measuring each candidate to the later item that would end its
// slice lets the true start win.
export function extractItemSection(text: string, items: string[], target: string): string | null {
  const occ: { index: number; item: string }[] = [];
  for (const it of items) {
    const re = new RegExp(`^\\s*ITEM\\s+${it}(?![A-Z0-9])`, 'gim');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) occ.push({ index: m.index, item: it });
  }
  occ.sort((a, b) => a.index - b.index);
  const order = new Map(items.map((it, i) => [it, i]));
  const rank = order.get(target) ?? -1;
  if (rank < 0) return null;
  const higherAfter = (i: number): number => {
    for (let j = i + 1; j < occ.length; j++) {
      if ((order.get(occ[j].item) ?? -1) > rank) return occ[j].index;
    }
    return -1;
  };
  const cands: number[] = [];
  for (let i = 0; i < occ.length; i++) if (occ[i].item === target) cands.push(i);
  if (cands.length === 0) return null;
  const bounded = cands.filter((i) => higherAfter(i) >= 0);
  let start: number;
  if (bounded.length === 0) {
    // No later item anywhere: positional fallback, last wins (TOC first).
    start = occ[cands[cands.length - 1]].index;
  } else {
    let best = -1;
    let widest = -1;
    for (const i of bounded) {
      const nxt = occ[i + 1];
      if (nxt && (order.get(nxt.item) ?? -1) < rank) continue;
      const gap = higherAfter(i) - occ[i].index;
      if (gap > widest) {
        widest = gap;
        best = occ[i].index;
      }
    }
    if (best < 0) return null;
    start = best;
  }
  let end = text.length;
  for (const o of occ) {
    if (o.index > start && (order.get(o.item) ?? -1) > rank) {
      end = o.index;
      break;
    }
  }
  const slice = text.slice(start, end);
  return slice.length > 200 ? slice : null;
}

function stripBoldMarkers(s: string): string {
  return s.replace(/\*\*/g, '');
}

// Lawyer boilerplate that opens items but says nothing: forward-looking
// disclaimers, defined-term notes, and Item 1A's "carefully consider" intro.
const BOILERPLATE = /forward-looking|forward looking|unless the context otherwise requires|as used in this (annual )?report|wish to caution readers|you should carefully consider|should be considered in addition to|sets forth the material risk factors/i;

// ESG/legal disclaimer lines that open some Item 1s (AMD's voluntary-
// disclosures paragraph) plus definitional openers ("References in this
// Annual Report…", "As used herein…"). Kept separate from BOILERPLATE so
// the lede can reuse it without touching the money-subsection filters.
const FILING_DISCLAIMER =
  /voluntary disclosures?|our website|materiality|securities laws?|incorporated by reference|references in this|as used herein/i;

// A paragraph starting with a connective ("Additionally, we make…") is never
// the first thing a company says about itself — it's a disclaimer tail.
const CONNECTIVE_START = /^(Additionally|Furthermore|Moreover|In addition|As such|As a result|Accordingly)\b/i;

// Summary-style sections mash headings, categories, and bullets into one
// span ("Risk Factors Summary ... • Failure to meet ..."): keep the text
// after the last bullet, and drop page-number/TOC prefixes.
function cleanRiskTitle(t: string): string {
  const bullet = Math.max(t.lastIndexOf('•'), t.lastIndexOf('·'));
  if (bullet >= 0) t = t.slice(bullet + 1).trim();
  return t.replace(/^\d+\s+Table of Contents\s*/i, '').trim();
}

// Filings hard-wrap paragraphs across lines ("...could\nnegatively affect
// ..."), so rejoin lines until sentence punctuation before reading them.
function joinWrappedLines(lines: string[]): string[] {
  const paras: string[] = [];
  let buf = '';
  for (const l of lines) {
    buf = buf ? `${buf} ${l}` : l;
    if (/[.!?…]["'”’)\]]?$/.test(l)) {
      paras.push(buf);
      buf = '';
    }
  }
  if (buf) paras.push(buf);
  return paras;
}

// An excerpt that stopped mid-sentence (a subheading break after a wrapped
// line) cuts back to its last sentence end instead.
function completeSentences(text: string): string {
  if (/[.!?…]["'”’)\]]?$/.test(text)) return text;
  return truncateSentences(text, Math.max(text.length - 1, 1));
}

function isSubheading(line: string): boolean {
  const t = line.trim().replace(/^\*\*|\*\*$/g, '');
  if (t.length === 0 || t.length >= 70 || /[.:;]$/.test(t)) return false;
  return t === t.toUpperCase() || t.split(/\s+/).length <= 5;
}

// Filing text hard-wraps around punctuation ("enrich life for all .", "( ex-quay )") —
// collapse spaces before closing punctuation and after openers. Quotes
// excluded: the space before an OPENING quote is correct.
export function cleanSpacing(s: string): string {
  return s.replace(/\s+([.,;:!?%)\]}])/g, '$1').replace(/([(\[{])\s+/g, '$1');
}

// Item 1's opening paragraphs: the company describing what it does. Drops the
// heading line, boilerplate openers, disclaimer/definitional lines, and
// leading subheads ("Overview"). Null when nothing substantive survives.
export function extractBusinessExcerpt(itemText: string, maxChars = 700): string | null {
  const lines = itemText.split('\n').slice(1);
  const body = lines.filter(
    (l) => !/^(ITEM\s+\d|PART\s+[IVX]+)/i.test(l) && !BOILERPLATE.test(l) && !FILING_DISCLAIMER.test(l) && !CONNECTIVE_START.test(l.trim()),
  );
  while (body.length > 0 && isSubheading(body[0])) body.shift();
  const text = cleanSpacing(stripBoldMarkers(body.join(' ').replace(/\s+/g, ' ').trim()));
  if (text.replace(/\s/g, '').length < 100) return null;
  return completeSentences(truncateSentences(text, maxChars));
}

// The Competition subsection of Item 1: real competitor names, in the
// company's own words. Handles both a bare "Competition" heading line and a
// bold "**Competition.** ..." lead-in; skips sub-subheads ("Automotive") and
// stops at the next subheading.
export function extractCompetition(businessText: string, maxChars = 900): string | null {
  const lines = businessText.split('\n');
  const idx = lines.findIndex((l) => /^(?:\*\*)?competition(?:\*\*)?[\s:.—-]*/i.test(l.trim()) && l.trim().length < 120);
  if (idx < 0) return null;
  const first = lines[idx].trim().replace(/^(?:\*\*)?competition(?:\*\*)?[\s:.—-]*/i, '');
  const out: string[] = first ? [first] : [];
  for (const l of lines.slice(idx + 1)) {
    if (out.length === 0 && isSubheading(l)) continue;
    if (out.length > 0 && isSubheading(l)) break;
    out.push(l);
  }
  const text = cleanSpacing(stripBoldMarkers(out.join(' ').replace(/\s+/g, ' ').trim()));
  if (text.replace(/\s/g, '').length < 80) return null;
  return completeSentences(truncateSentences(text, maxChars));
}

// Item 1 subsections that say how the company makes money, by priority:
// reportable segments first (TSLA "Segment Information", NVDA "Our
// Businesses", 20-F "B. Business Overview"), then what it sells, then where,
// then how it sells. Verified against live TSLA/NVDA 10-Ks. Matched at the
// start of a heading line (after any "B. " enumerator), so body sentences
// mentioning segments never match.
const MONEY_HEADINGS: { re: RegExp; rank: number }[] = [
  { re: /\bsegments?\b|business segments|our businesses|reportable|business overview/i, rank: 1 },
  { re: /our\s+products?(\s+and\s+services?)?|products?\s+and\s+services?|^products?$/i, rank: 2 },
  { re: /our markets|^markets$/i, rank: 3 },
  { re: /\brevenue\b/i, rank: 4 },
  { re: /sales\s+and\s+marketing/i, rank: 5 },
  { re: /\bservices\b|(financial|professional)\s+services?/i, rank: 6 },
  { re: /our customers?|^customers?$/i, rank: 7 },
];

// Services/customers headings about support, not revenue — "Service and
// Warranty", "Customer Service". TSLA's "Financial Services" (financing,
// insurance) stays: it says how money is made.
const NOT_MONEY = /warranty|customer service|support|satisfaction|complaint/i;

function matchMoneyHeading(line: string): number | null {
  const t = line.trim();
  // Bare heading lines only — Item 1 money subsections are structural titles
  // ("Segment Information", "**Our Businesses**"), never bold lead-ins.
  if (!isSubheading(t)) return null;
  if (/^\d{1,4}$/.test(t) || /^table of contents$/i.test(t)) return null;
  if (/^(ITEM\s+\d|PART\s+[IVX]+)/i.test(t)) return null;
  if (NOT_MONEY.test(t)) return null;
  const bare = t.replace(/\*\*/g, '').replace(/^[A-Z0-9][.)]\s+/, '');
  for (const { re, rank } of MONEY_HEADINGS) {
    const m = bare.match(re);
    if (m && m.index === 0) return rank;
  }
  return null;
}

// How the company makes money: Item 1's segments/products/markets/sales
// subsections, up to three in priority (not document) order. Item 1's opening
// paragraphs are often mission-statement fluff (TSLA leads with AI abundance);
// these subsections name what each part of the company sells, to whom, and
// through which channels. Page-number and Table of Contents reruns inside a
// section are skipped, never stoppers; repeated page headers of the same
// heading resolve to the first occurrence. Null when Item 1 has no money
// subsection — the caller falls back to the business excerpt.
export function extractBusinessModel(businessText: string, maxChars = 1000): string | null {
  const lines = businessText.split('\n');
  const found: { rank: number; index: number }[] = [];
  const seen = new Set<string>();
  lines.forEach((l, i) => {
    if (i === 0) return; // the ITEM 1 heading itself
    const rank = matchMoneyHeading(l);
    if (rank === null) return;
    const key = l.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ rank, index: i });
  });
  found.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const parts: string[] = [];
  for (const f of found.slice(0, 3)) {
    const out: string[] = [];
    for (const l of lines.slice(f.index + 1)) {
      const t = l.trim();
      if (t.length === 0 || /^\d{1,4}$/.test(t) || /^table of contents$/i.test(t)) continue;
      if (/^(ITEM\s+\d|PART\s+[IVX]+)/i.test(t) || BOILERPLATE.test(t)) continue;
      if (matchMoneyHeading(l)) break;
      if (out.length === 0 && isSubheading(l)) continue;
      if (out.length > 0 && isSubheading(l)) break;
      out.push(l);
    }
    if (out.length > 0) parts.push(out.join(' '));
  }
  const text = cleanSpacing(stripBoldMarkers(parts.join(' ').replace(/\s+/g, ' ').trim()));
  if (text.replace(/\s/g, '').length < 100) return null;
  return completeSentences(truncateSentences(text, maxChars));
}

// Reportable segment names for the "What they sell" row, in filing order.
// Shapes, first hit wins: inline colon lists ("three segments: North
// America, International, and AWS"), "The X segment" lead-ins (NVDA's model
// text), and bullet lists after a trailing colon (AMD). [] when nothing
// parses — the row hides instead of guessing.
export function extractSegmentNames(
  businessModel: string | null | undefined,
  itemText: string | null | undefined,
): string[] {
  for (const text of [businessModel, itemText]) {
    if (!text) continue;
    const inline = parseInlineSegmentList(text);
    if (inline) return inline;
    const theX = parseTheXSegment(text);
    if (theX) return theX;
  }
  if (itemText) {
    const trailing = parseTrailingSegmentBullets(itemText);
    if (trailing) return trailing;
  }
  return [];
}

const SMALL_WORDS = new Set(['and', 'or', 'of', 'the', 'for', 'in', 'on', 'at', 'to', 'vs']);

function cleanSegmentName(p: string): string | null {
  let n = p
    .trim()
    .replace(/\.$/, '')
    .replace(/\s+(and|or)$/i, '')
    .replace(/^\s*(and|or)\s+/i, '')
    .replace(/^\((?:[ivx]+|\d+|[a-z])\)\s*/i, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim();
  // All-lowercase fragments ("energy generation and storage") read as chips
  // better title-cased; mixed-case names keep the filing's casing.
  if (n === n.toLowerCase()) {
    n = n
      .split(/\s+/)
      .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  }
  if (n.length < 2 || n.length > 60 || /[.?!]/.test(n) || /\bsegments?\b/i.test(n)) return null;
  return n;
}

function splitNameList(tail: string): string[] {
  const markers = tail.match(/\((?:[ivx]+|\d+|[a-z])\)/gi) || [];
  const parts =
    markers.length >= 2
      ? tail.split(/\s*(?=\((?:[ivx]+|\d+|[a-z])\))/i)
      : /[,;]/.test(tail)
        ? tail.split(/[,;]/)
        : tail.split(/\s+and\s+/i);
  const out: string[] = [];
  for (const p of parts) {
    const n = cleanSegmentName(p);
    if (n && !out.some((x) => x.toLowerCase() === n.toLowerCase())) out.push(n);
  }
  return out;
}

function parseInlineSegmentList(text: string): string[] | null {
  for (const s of splitSentences(text)) {
    if (!SEGMENT_COUNT.test(s)) continue;
    const tail = s.slice(s.lastIndexOf(':') + 1);
    if (!tail || tail === s) continue;
    if (/^\s*[•\-*]/.test(tail) || /^\s*\d{1,2}[.)]/.test(tail)) continue;
    const names = splitNameList(tail);
    if (names.length >= 1) return names.slice(0, 6);
  }
  return null;
}

function parseTheXSegment(text: string): string[] | null {
  const out: string[] = [];
  const push = (n: string) => {
    const t = n.trim();
    if (t.length >= 2 && t.length <= 60 && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  };
  for (const s of splitSentences(text)) {
    const lead = s.match(/^\s*[Tt]he\s+([A-Z][^.\n]{1,60}?)\s+segment\b/);
    if (lead) push(lead[1]);
    for (const m of s.matchAll(/•\s*[Tt]he\s+([A-Z][^;.\n]{1,60}?)\s+segment\b/g)) push(m[1]);
  }
  return out.length >= 2 ? out.slice(0, 6) : null;
}

function parseTrailingSegmentBullets(itemText: string): string[] | null {
  const lines = itemText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!/\bsegments?\b[^:\n]{0,24}:\s*$/i.test(lines[i])) continue;
    const out: string[] = [];
    for (const l of lines.slice(i + 1)) {
      const t = l.trim();
      if (!t) break;
      const m = t.match(/^[•\-*]\s+(.+)$/) || t.match(/^\d{1,2}[.)]\s+(.+)$/);
      if (!m) break;
      const seg = m[1].match(/^(?:the\s+)?(.+?)\s+segment\b/i);
      const biz = !seg && m[1].match(/^(.+? business unit)\b/i);
      const name = (
        seg ? seg[1] : biz ? biz[1].replace(/\s*\([^)]*\)/g, '').replace(/\s+business unit$/i, '') : m[1].split(':')[0].replace(/[;.,]+$/, '')
      ).trim();
      if (name.length < 2 || name.length > 60 || /[.?!]/.test(name)) break;
      out.push(name);
      if (out.length >= 6) break;
    }
    if (out.length >= 1) return out;
  }
  return null;
}

// Headcount from Item 1's Human Capital disclosure, three shapes in order:
// "employed approximately 31,000 employees" (AMD), "had a global workforce
// of 78,865 employees" (META), "employee headcount worldwide was 134,785"
// (TSLA), and qualified "employed approximately 223,000 people" (MSFT).
// First match per shape wins — filings state the latest year first. XBRL
// EntityNumberOfEmployees stays primary; this fills filers that don't tag
// it. The people-shape requires a qualifier so subset counts ("200 people
// in our Austin office") can't win over the total.
const EMPLOYEE_COUNT =
  /\b(?:employed|had|have)\s+((?:approximately|about|around|nearly|almost|more than|over)\s+)?(?:a\s+)?(?:global\s+)?(?:total\s+)?(?:workforce\s+of\s+|headcount\s+of\s+)?([\d,]+)\s+(?:full-time\s+and\s+part-time\s+|full-time\s+|part-time\s+)?employees\b/i;
const HEADCOUNT_WAS = /(?:employee\s+)?headcount\w*(?:\s+worldwide)?\s+(?:was|of)\s+(approximately\s+)?([\d,]+)/i;
const PEOPLE_COUNT = /\bemployed\s+((?:approximately|about|around|nearly|almost|more than|over)\s+)([\d,]+)\s+people\b/i;

export function extractEmployeeCount(text: string | null | undefined): { count: number; approximate: boolean } | null {
  if (!text) return null;
  const m = text.match(EMPLOYEE_COUNT) ?? text.match(HEADCOUNT_WAS) ?? text.match(PEOPLE_COUNT);
  if (!m) return null;
  const count = parseInt(m[2].replace(/,/g, ''), 10);
  if (!Number.isFinite(count) || count <= 0) return null;
  return { count, approximate: m[1] !== undefined };
}

// ---- Segment financials (Business model charts) ----

export interface SegmentSeries {
  concept: string;
  years: number[];
  members: string[];
  values: (number | null)[][];
  totals: (number | null)[];
}

const REVENUE_SEGMENT_CONCEPTS = [
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'SalesRevenueNet',
  'Revenues',
  'RevenueFromContractWithCustomerIncludingAssessedTax',
];
const OPINCOME_SEGMENT_CONCEPTS = ['OperatingIncomeLoss'];

function localName(qname: string): string {
  return qname.includes(':') ? qname.slice(qname.indexOf(':') + 1) : qname;
}

const MEMBER_FIXUPS: Record<string, string> = { datacenter: 'Data Center', iot: 'IoT' };

function humanizeSegmentMember(raw: string, acronyms?: Map<string, string>): string {
  let s = localName(raw);
  for (const suffix of ['Member', 'Segments', 'Segment', 'BusinessUnits', 'BusinessUnit']) {
    if (s !== suffix && s.endsWith(suffix)) s = s.slice(0, -suffix.length);
  }
  const expanded = acronyms?.get(s);
  if (expanded) s = expanded.replace(/\s+business unit$/i, '');
  const fix = MEMBER_FIXUPS[s.toLowerCase()];
  if (fix) return fix;
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .map((w, i) => {
      if (/^[A-Z0-9&]+$/.test(w)) return w;
      const lower = w.toLowerCase();
      return i > 0 && SMALL_WORDS.has(lower) ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function isOtherSegment(name: string): boolean {
  return /^(all other|other|corporate|unallocated|eliminations)\b/i.test((name || '').trim());
}

// Revenue and operating income by reportable segment, parsed from the
// filing's own inline XBRL (StatementBusinessSegmentsAxis contexts). Two
// filer styles: bare single-dimension contexts (MSFT, META) and
// consolidation-typed ones (NVDA, MU, AMD pair the axis with
// ConsolidationItemsAxis=OperatingSegmentsMember) — both accepted, and
// when both tag the same member+year the explicitly typed fact wins.
// Periods are gated to full years (350–380 days) so quarterly contexts
// can't collide with annual ones. The revenue concept is picked by coverage
// and validated against the consolidated total — a >15% mismatch means
// mixed concepts, so the series is dropped instead of charted wrong. Years
// come from the one filing parsed (usually three); older filings are
// deliberately not merged in, because segment redefinitions (AMD folded
// Client+Gaming in 2025) would mix two taxonomies in one chart.
export function extractSegmentFinancials(
  html: string | null | undefined,
  businessText?: string | null,
): {
  revenue: SegmentSeries | null;
  opIncome: SegmentSeries | null;
} {
  const none = { revenue: null, opIncome: null };
  if (!html || !html.includes('StatementBusinessSegmentsAxis')) return none;
  const usdUnits = new Set<string>();
  let sawUnits = false;
  for (const m of html.matchAll(/<xbrli:unit\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/xbrli:unit>/g)) {
    sawUnits = true;
    if (/<xbrli:measure>iso4217:USD<\/xbrli:measure>/.test(m[2])) usdUnits.add(m[1]);
  }
  const segCtx = new Map<string, { member: string; year: number; typed: boolean }>();
  const consolCtx = new Map<string, number>();
  for (const m of html.matchAll(/<xbrli:context\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/xbrli:context>/g)) {
    const body = m[2];
    const start = /<xbrli:startDate>([^<]+)<\/xbrli:startDate>/.exec(body)?.[1] ?? '';
    const end = /<xbrli:endDate>([^<]+)<\/xbrli:endDate>/.exec(body)?.[1] ?? '';
    const days = durationDays(start, end);
    if (days === null || days < 350 || days > 380) continue;
    const year = Number(end.slice(0, 4));
    if (!Number.isInteger(year) || year < 1900 || year > 2100) continue;
    const dims = [...body.matchAll(/dimension="([^"]+)"[^>]*>([^<]+)</g)];
    if (dims.length === 0) {
      consolCtx.set(m[1], year);
      continue;
    }
    const segDim = dims.find((d) => localName(d[1]) === 'StatementBusinessSegmentsAxis');
    if (!segDim) {
      if (dims.length === 1 && localName(dims[0][1]) === 'ConsolidationItemsAxis') {
        const memLocal = localName(dims[0][2].trim());
        if (/consolidated/i.test(memLocal)) consolCtx.set(m[1], year);
        else segCtx.set(m[1], { member: `__corp__:${dims[0][2].trim()}`, year, typed: true });
      }
      continue;
    }
    const rest = dims.filter((d) => d !== segDim);
    const typed =
      rest.length === 1 &&
      localName(rest[0][1]) === 'ConsolidationItemsAxis' &&
      localName(rest[0][2].trim()) === 'OperatingSegmentsMember';
    if (rest.length > 0 && !typed) continue;
    segCtx.set(m[1], { member: segDim[2].trim(), year, typed });
  }
  if (segCtx.size === 0) return none;
  const acronyms = extractAcronymDefs(businessText);
  const segFacts = new Map<string, number>();
  const consolFacts = new Map<string, number>();
  const ingest = (typedOnly: boolean) => {
    for (const m of html.matchAll(/<ix:nonFraction\b([^>]*)>([\s\S]*?)<\/ix:nonFraction>/g)) {
      const attrs = m[1];
      const ctx = /contextRef="([^"]+)"/.exec(attrs)?.[1];
      if (!ctx) continue;
      const seg = segCtx.get(ctx);
      const consolYear = consolCtx.get(ctx);
      if (!seg && consolYear === undefined) continue;
      if (seg && seg.typed !== typedOnly) continue;
      const nameAttr = /name="([^"]+)"/.exec(attrs)?.[1];
      if (!nameAttr) continue;
      const concept = localName(nameAttr);
      const unit = /unitRef="([^"]+)"/.exec(attrs)?.[1] ?? '';
      if (sawUnits && !usdUnits.has(unit)) continue;
      const scale = Number(/scale="([^"]+)"/.exec(attrs)?.[1] ?? 0);
      if (!Number.isFinite(scale)) continue;
      const negSign = /sign="-"/.test(attrs);
      let raw = m[2].replace(/,/g, '').trim();
      if (raw === '' && !/fixed-zero/.test(attrs)) continue;
      let paren = false;
      if (/^\(.*\)$/.test(raw)) {
        paren = true;
        raw = raw.slice(1, -1);
      }
      let v = Number(raw);
      if (!Number.isFinite(v)) {
        if (!/fixed-zero/.test(attrs)) continue;
        v = 0;
      }
      v = (negSign || paren ? -Math.abs(v) : v) * Math.pow(10, scale);
      if (!Number.isFinite(v)) continue;
      if (seg) {
        const k = `${concept}|${seg.member}|${seg.year}`;
        // Unsigned reconciling magnitudes (AMD's +4,007 next to its signed
        // twin) are presentation, not addends — the signed copy carries it.
        if (k.includes('MaterialReconcilingItemsMember') && v > 0) continue;
        if (!segFacts.has(k)) segFacts.set(k, v);
      } else if (!typedOnly) {
        const k = `${concept}|${consolYear}`;
        if (!consolFacts.has(k)) consolFacts.set(k, v);
      }
    }
  };
  ingest(true);
  ingest(false);
  return {
    revenue: buildSegmentSeries(segFacts, consolFacts, REVENUE_SEGMENT_CONCEPTS, acronyms),
    opIncome: buildSegmentSeries(segFacts, consolFacts, OPINCOME_SEGMENT_CONCEPTS, acronyms),
  };
}

function durationDays(start: string, end: string): number | null {
  const p = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : NaN;
  };
  const a = p(start);
  const b = p(end);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  return Math.round((b - a) / 86400000);
}

// Filings define their own acronyms ("Cloud Memory Business Unit ("CMBU")")
// while tagging facts with the bare acronym ("mu:CMBUMember") — map them so
// chart labels read as words.
function extractAcronymDefs(text: string | null | undefined): Map<string, string> {
  const out = new Map<string, string>();
  if (!text) return out;
  for (const m of text.matchAll(/\b([A-Z][A-Za-z& ]+?)\s+\(["“”]([A-Z]{2,6})["“”]\)/g)) {
    if (!out.has(m[2])) out.set(m[2], m[1].trim());
  }
  return out;
}

// Consolidation-typed buckets without a segment dimension (AMD tags the
// operating-income reconciliation as MaterialReconcilingItemsMember, plus a
// signed copy on bare OperatingSegmentsMember).
const CORP_BUCKET_NAMES: Record<string, string> = {
  materialreconcilingitemsmember: 'Corporate and Other',
  operatingsegmentsmember: 'Corporate and Other',
  corporatenonsegmentmember: 'Corporate',
  consolidationeliminationsmember: 'Eliminations',
};

function bucketDisplayName(raw: string): string {
  return CORP_BUCKET_NAMES[localName(raw).toLowerCase()] ?? humanizeSegmentMember(raw);
}

function buildSegmentSeries(
  segFacts: Map<string, number>,
  consolFacts: Map<string, number>,
  concepts: string[],
  acronyms: Map<string, string>,
): SegmentSeries | null {
  let best: string | null = null;
  let bestN = 0;
  for (const c of concepts) {
    let n = 0;
    for (const k of segFacts.keys()) if (k.startsWith(c + '|')) n++;
    if (n > bestN) {
      bestN = n;
      best = c;
    }
  }
  if (!best || bestN === 0) return null;
  const years = [...new Set([...segFacts.keys()].filter((k) => k.startsWith(best + '|')).map((k) => Number(k.split('|')[2])))]
    .filter((y) => Number.isInteger(y))
    .sort((a, b) => a - b)
    .slice(-5);
  if (years.length === 0) return null;
  const disp = new Map<string, string>();
  const latestVal = new Map<string, number | null>();
  const latest = years[years.length - 1];
  for (const k of segFacts.keys()) {
    if (!k.startsWith(best + '|')) continue;
    const raw = k.split('|')[1];
    if (disp.has(raw)) continue;
    const d = raw.startsWith('__corp__:') ? bucketDisplayName(raw.slice('__corp__:'.length)) : humanizeSegmentMember(raw, acronyms);
    if ([...disp.values()].some((x) => x.toLowerCase() === d.toLowerCase())) continue;
    disp.set(raw, d);
    latestVal.set(raw, segFacts.get(`${best}|${raw}|${latest}`) ?? null);
  }
  // All-zero rows (MU's zero Corporate revenue) are chart noise; real ramps
  // keep at least one nonzero year.
  const alive = [...disp.keys()].filter((r) =>
    years.some((y) => {
      const v = segFacts.get(`${best}|${r}|${y}`);
      return v !== null && v !== undefined && v !== 0;
    }),
  );
  const build = (raws: string[]) => {
    if (raws.length < 2) return null;
    raws.sort((a, b) => {
      const oa = isOtherSegment(disp.get(a)!) ? 1 : 0;
      const ob = isOtherSegment(disp.get(b)!) ? 1 : 0;
      if (oa !== ob) return oa - ob;
      return (latestVal.get(b) ?? -Infinity) - (latestVal.get(a) ?? -Infinity);
    });
    const total = consolFacts.get(`${best}|${latest}`) ?? null;
    const sum = raws.reduce((a, r) => a + (segFacts.get(`${best}|${r}|${latest}`) ?? 0), 0);
    if (total !== null && Math.abs(total) > 0 && Math.abs(sum - total) / Math.abs(total) > 0.15) return null;
    return {
      concept: best,
      years,
      members: raws.map((r) => disp.get(r)!),
      values: raws.map((r) => years.map((y) => segFacts.get(`${best}|${r}|${y}`) ?? null)),
      totals: years.map((y) => consolFacts.get(`${best}|${y}`) ?? null),
    };
  };
  return build(alive) ?? build(alive.filter((r) => !r.startsWith('__corp__:')));
}

// "We operate in one reportable segment" — but not "combined X into one
// reportable segment" (a merger, like AMD's Client+Gaming fold).
export function isSingleSegmentText(text: string | null | undefined): boolean {
  if (!text) return false;
  return (
    /\b(one|single)\b[^.\n]{0,40}?\b(reportable |operating )?segments?\b/i.test(text) &&
    !/\binto (one|a single)\b[^.\n]{0,40}?\bsegments?\b/i.test(text)
  );
}

// Customer concentration ("Apple Inc. accounted for 12% of total revenue",
// NVDA's "sales to one direct customer represented 22% of total revenue").
// The sentence usually lives in MD&A or the notes, not Item 1, so callers
// pass all three and the first hit (latest year comes first) wins. Both
// patterns require an of-revenue tail, so receivables splits ("15% of
// accounts receivable") and geographic splits ("headquartered outside…")
// never match. Explicit non-findings ("no single customer…") match
// nothing, so a returned value always means a real concentration.
const CONC_TAIL = 'of\\s+(?:(?:total|net|consolidated|our)\\s+)*(?:revenue|sales)';
const CONC_NUMWORD: Record<string, string> = {
  one: 'One customer',
  another: 'One customer',
  two: 'Two customers',
  three: 'Three customers',
  four: 'Four customers',
  five: 'Five customers',
  six: 'Six customers',
};
export function extractCustomerConcentration(text: string | null | undefined): { who: string; pct: number } | null {
  if (!text) return null;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const named = new RegExp(
    `([A-Z][\\w&.,'’\\- ]{1,60}?)\\s+(?:accounted for|represented|comprised)\\s+(?:approximately\\s+)?(\\d+(?:\\.\\d+)?)\\s*%[^.]{0,20}?${CONC_TAIL}`,
    'i',
  );
  const anon = new RegExp(
    `\\b((?:top\\s+)?(?:one|two|three|four|five|six|\\d+|another)(?:\\s+[a-z]+)?\\s+customers?|largest customer)\\b[^.]{0,50}?\\b(?:accounted for|represented|comprised)\\b[^.]{0,20}?(\\d+(?:\\.\\d+)?)\\s*%[^.]{0,20}?${CONC_TAIL}`,
    'i',
  );
  for (const s of splitSentences(text)) {
    if (/headquarter|outside\s+(of|the)/i.test(s)) continue;
    const m = s.match(named);
    if (m) {
      const whoRaw = m[1].trim().replace(/[,;]+$/, '');
      const who = /^(one customer|a single customer)$/i.test(whoRaw)
        ? 'One customer'
        : /^[A-Z][\w&.'’\-]*(?:\s+[A-Z][\w&.'’\-]*)*$/.test(whoRaw)
          ? whoRaw
          : null;
      const pct = Number(m[2]);
      if (who && pct > 0 && pct <= 100) return { who, pct };
    }
    const m2 = s.match(anon);
    if (m2) {
      const pct = Number(m2[2]);
      if (pct > 0 && pct <= 100) {
        const words = m2[1].split(/\s+/);
        const first = words[0].toLowerCase();
        const who =
          first === 'largest'
            ? 'Largest customer'
            : first === 'top'
              ? words.map(cap).join(' ')
              : CONC_NUMWORD[first] ?? (/^\d+$/.test(first) ? `${first} customers` : null);
        if (who) return { who, pct };
      }
    }
  }
  return null;
}

// Item 1A's risk titles: usually bold lead-ins, deduped, capped. Falls back
// to opening sentences (past the boilerplate intro) when a filer bolds
// nothing.
export function extractRiskHeadings(item1aText: string, max = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of item1aText.matchAll(/\*\*([^*][^*]*?)\*\*/g)) {
    const t = cleanRiskTitle(m[1].replace(/\s+/g, ' ').trim());
    if (t.length < 25 || t.length > 220 || !/[a-z]/.test(t) || /^item\s+\d/i.test(t) || BOILERPLATE.test(t)) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= max) break;
  }
  if (out.length > 0) return out;
  const paras = joinWrappedLines(
    item1aText
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean),
  );
  return paras
    .filter((p) => !BOILERPLATE.test(p))
    .map((p) => cleanRiskTitle(p))
    .filter((p) => p.length > 60)
    .slice(0, max)
    .map((p) => stripBoldMarkers(truncateSentences(p, 200)));
}

export interface FilingInsights {
  business: string | null;
  // How the company makes money: Item 1's segments/products/markets/sales
  // subsections. Null when Item 1 has no money subsection — the UI falls back
  // to the business excerpt.
  businessModel: string | null;
  // Reportable segment names for the "What they sell" row ([] when the
  // enumeration doesn't parse — the row hides).
  segments: string[];
  // Headcount from Item 1's Human Capital disclosure. XBRL stays primary;
  // this fills filers that don't tag EntityNumberOfEmployees.
  employeeCount: { count: number; approximate: boolean } | null;
  // Filing date of the annual report (SEC ISO date) for "From the … filed …".
  filingDate: string | null;
  // Revenue and operating income by segment, from the filing's inline XBRL.
  segmentRevenue: SegmentSeries | null;
  segmentOpIncome: SegmentSeries | null;
  // Disclosed customer concentration ("X accounted for Y% of revenue").
  customerConcentration: { who: string; pct: number } | null;
  // True when Item 1 says the company reports a single segment.
  singleSegment: boolean;
  competition: string | null;
  risks: string[];
  form: string;
  sourceUrl: string;
}

// Latest annual filing (10-K/20-F/40-F) anywhere in the recent window. Unlike
// the 12-item display list, this scans everything — frequent Form 4 filers
// (NVDA's 10-K sits past index 100) still resolve their annual report.
export function findAnnualFiling(
  recent: FilingsRecent | null | undefined,
  cikPadded: string,
): { form: string; url: string; filingDate: string | null } | null {
  const n = Math.min(recent?.form?.length ?? 0, recent?.accessionNumber?.length ?? 0, recent?.primaryDocument?.length ?? 0);
  for (let i = 0; i < n; i++) {
    const form = recent!.form![i];
    if (form !== '10-K' && form !== '20-F' && form !== '40-F') continue;
    return {
      form,
      url: edgarFilingUrl(cikPadded, recent!.accessionNumber![i], recent!.primaryDocument![i]),
      filingDate: recent!.filingDate?.[i] ?? null,
    };
  }
  return null;
}

// One annual filing document -> the four excerpts the profile needs. 10-K
// uses Items 1/1A; 20-F uses Item 4 (company info) and Item 3 from its Risk
// Factors subheading. Null when neither item parses (40-F included).
export function buildFilingInsights(
  html: string,
  form: string,
  sourceUrl: string,
  filingDate?: string | null,
): FilingInsights | null {
  const text = htmlToText(html);
  const tenK = form === '10-K' || form === '10-K/A';
  const items = tenK ? TEN_K_ITEMS : TWENTY_F_ITEMS;
  const business = extractItemSection(text, items, tenK ? '1' : '4');
  let risks = extractItemSection(text, items, tenK ? '1A' : '3');
  if (!business && !risks) return null;
  if (risks && !tenK) {
    const lines = risks.split('\n');
    const at = lines.findIndex((l) => /risk factors/i.test(l) && l.length < 80);
    if (at >= 0) risks = lines.slice(at).join('\n');
  }
  const businessModel = business ? extractBusinessModel(business) : null;
  const seg = extractSegmentFinancials(html, business);
  // Concentration disclosures live in MD&A or the notes more often than in
  // Item 1 (NVDA's "one direct customer… 22%" sits in Item 7).
  const mda = extractItemSection(text, items, tenK ? '7' : '5');
  const notes = extractItemSection(text, items, '8');
  const concText = [business, mda, notes].filter(Boolean).join('\n');
  return {
    business: business ? extractBusinessExcerpt(business) : null,
    businessModel,
    segments: extractSegmentNames(businessModel, business),
    employeeCount: business ? extractEmployeeCount(business) : null,
    segmentRevenue: seg.revenue,
    segmentOpIncome: seg.opIncome,
    customerConcentration: extractCustomerConcentration(concText),
    singleSegment: isSingleSegmentText(business),
    competition: business ? extractCompetition(business) : null,
    risks: risks ? extractRiskHeadings(risks) : [],
    form,
    sourceUrl,
    filingDate: filingDate ?? null,
  };
}

// Company overview from the same annual filing as the other profile sections:
// the Item 1/4 business excerpt, in the company's own words. Falls back to the
// SEC submissions description (still SEC, not Wikipedia) for filers without a
// readable business item — ETFs and funds, which file no 10-K. Null when
// neither exists. Founded/HQ/CEO ride along from Wikidata when available.
export function buildOverviewDescription(
  business: string | null | undefined,
  sourceUrl: string | null | undefined,
  companyName: string,
  secDescription: string | null | undefined,
  cikPadded: string | null,
  facts?: WikidataCompany | null,
): StockDescription | null {
  if (business && sourceUrl) {
    return {
      extract: business,
      url: sourceUrl,
      title: companyName,
      source: 'sec',
      founded: facts?.founded ?? null,
      headquarters: facts?.headquarters ?? null,
      ceo: facts?.ceo ?? null,
    };
  }
  if (secDescription && cikPadded) {
    return {
      extract: truncateSentences(secDescription, 900),
      url: edgarCompanyUrl(cikPadded),
      title: companyName,
      source: 'sec',
      founded: facts?.founded ?? null,
      headquarters: facts?.headquarters ?? null,
      ceo: facts?.ceo ?? null,
    };
  }
  return null;
}

export function edgarFilingUrl(cikPadded: string, accessionNumber: string, primaryDoc: string): string {
  const cikNum = String(Number(cikPadded));
  const acc = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${cikNum}/${acc}/${primaryDoc}`;
}

// Year columns for the financials table: the last maxYears complete fiscal
// years, where "complete" means revenue or net income exists — asset-only
// years and entirely blank columns are dropped so young companies show what
// exists instead of a table of dashes.
export function tableYears(series: FinancialSeries[], maxYears = 5): string[] {
  const funded = new Set<string>();
  for (const s of series) {
    if (s.key !== 'revenue' && s.key !== 'netIncome') continue;
    for (const p of s.points) funded.add(p.year);
  }
  return [...new Set(series.flatMap((s) => s.points.map((p) => p.year)))]
    .filter((y) => funded.has(y))
    .sort()
    .slice(-maxYears);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// SEC fiscalYearEnd is MMDD ("0131", "1231"). Returns the month name.
export function fiscalYearEndMonth(fiscalYearEnd: string | null | undefined): string | null {
  if (!fiscalYearEnd || !/^\d{4}$/.test(fiscalYearEnd)) return null;
  const m = Number(fiscalYearEnd.slice(0, 2));
  return m >= 1 && m <= 12 ? MONTH_NAMES[m - 1] : null;
}

// Human span of a fiscal year: FY2026 ending in January ran Feb 2025–Jan 2026.
export function fiscalYearSpan(monthName: string | null, year: string): string | null {
  if (!monthName) return null;
  const m = MONTH_NAMES.indexOf(monthName) + 1;
  if (m < 1 || m > 12) return null;
  const y = Number(year);
  if (!Number.isFinite(y)) return null;
  if (m === 12) return `January–December ${year}`;
  return `${MONTH_NAMES[m]} ${y - 1}–${monthName} ${year}`;
}

const DIV_DPS_CONCEPTS = ['CommonStockDividendsPerShareDeclared', 'CommonStockDividendsPerShareCashPaid'];
const DIV_FORMS = new Set(['10-K', '10-K/A', '10-Q', '10-Q/A', '20-F', '20-F/A', '40-F', '40-F/A']);

// Trailing-twelve-month common dividends per share from XBRL. Nasdaq only
// publishes dividend history for Nasdaq-listed stocks (NYSE tickers like JPM
// and O get nothing), so this is the uniform source: quarterly or monthly
// declared-DPS slices (YTD and annual aggregates excluded by duration),
// deduped per period end, summed over the trailing 400 days, annualised when
// fewer than four slices exist (new payers), split-adjusted per point.
export function ttmDividendsPerShare(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  ticker: string,
): number | null {
  const tax = facts?.['us-gaap'];
  if (!tax) return null;
  const byEnd = new Map<string, { val: number; filed: string }>();
  for (const concept of DIV_DPS_CONCEPTS) {
    const entries = tax[concept]?.units?.['USD/shares'];
    if (!entries) continue;
    for (const e of entries) {
      if (!DIV_FORMS.has(e.form)) continue;
      if (!e.start) continue;
      const dur = daysBetween(e.start, e.end);
      if (dur <= 0 || dur > 95) continue;
      if (typeof e.val !== 'number' || !Number.isFinite(e.val)) continue;
      const val = e.val / splitFactor(ticker, e.end, e.filed);
      const prev = byEnd.get(e.end);
      if (!prev || e.filed > prev.filed) byEnd.set(e.end, { val, filed: e.filed });
    }
  }
  if (byEnd.size === 0) return null;
  const latest = [...byEnd.keys()].sort().pop()!;
  const cutoff = new Date(Date.parse(latest) - 400 * 86400000).toISOString().slice(0, 10);
  const pts = [...byEnd.entries()]
    .filter(([end]) => end > cutoff)
    .map(([, p]) => p.val);
  if (pts.length === 0) return null;
  const sum = pts.reduce((a, b) => a + b, 0);
  return pts.length >= 4 ? sum : (sum * 4) / pts.length;
}

export interface QuarterPoint {
  end: string;
  value: number;
  filed: string;
}

const QTR_FORMS = new Set(['10-K', '10-K/A', '10-Q', '10-Q/A', '20-F', '20-F/A', '40-F', '40-F/A']);

// Quarterly points for TTM math, oldest first. Two shapes exist: income
// statements file quarter-to-date slices in 10-Qs (≤95 days), while cash flow
// statements file year-to-date ladders — so each quarter is either a direct
// QTD slice (preferred) or derived as this rung minus the previous rung
// within 120 days (Q1 has no previous rung, so YTD is the quarter; Q4 falls
// out as FY annual minus Q3 YTD). Same-end restatements take the latest
// filing; concept-list order breaks cross-concept ties, as with annuals.
export function extractQuarters(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  taxonomy: string,
  concepts: string[],
  unit: string,
): QuarterPoint[] {
  const tax = facts?.[taxonomy];
  if (!tax) return [];
  const direct = new Map<string, QuarterPoint>();
  const ladder = new Map<string, { point: QuarterPoint; dur: number }>();
  for (const concept of concepts) {
    const entries = tax[concept]?.units?.[unit];
    if (!entries) continue;
    const mine = new Map<string, { point: QuarterPoint; qtd: boolean; dur: number }>();
    for (const e of entries) {
      if (!QTR_FORMS.has(e.form)) continue;
      if (!e.start) continue;
      if (typeof e.val !== 'number' || !Number.isFinite(e.val)) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.end)) continue;
      const dur = daysBetween(e.start, e.end);
      if (dur <= 0) continue;
      const prev = mine.get(e.end);
      if (!prev || e.filed > prev.point.filed) {
        mine.set(e.end, { point: { end: e.end, value: e.val, filed: e.filed }, qtd: dur <= 95, dur });
      }
    }
    for (const [end, m] of mine) {
      if (m.qtd) {
        if (!direct.has(end)) direct.set(end, m.point);
      } else if (!ladder.has(end)) {
        ladder.set(end, { point: m.point, dur: m.dur });
      }
    }
  }
  // Direct slices stand as quarters; ladder rungs difference against the
  // previous rung within 120 days — previous rungs include direct slices, so
  // a HY rung differences against Q1 (a short rung with no previous rung is
  // Q1 itself and stands alone; Q4 falls out as FY annual minus Q3 YTD). An
  // undifferenced long rung is a bare annual, never a quarter — dropped.
  const out = new Map<string, QuarterPoint>(direct);
  const combined = new Map<string, { value: number; filed: string }>();
  for (const [end, p] of direct) combined.set(end, p);
  for (const [end, r] of ladder) {
    if (!combined.has(end)) combined.set(end, r.point);
  }
  for (const end of [...ladder.keys()].sort()) {
    if (out.has(end)) continue;
    const cur = ladder.get(end)!;
    let prev: { value: number; filed: string } | null = null;
    for (const prevEnd of [...combined.keys()].filter((k) => k < end).sort().reverse()) {
      const days = daysBetween(prevEnd, end);
      if (days <= 0) continue;
      if (days > 120) break;
      prev = combined.get(prevEnd)!;
      break;
    }
    if (!prev && cur.dur > 120) continue;
    out.set(
      end,
      prev
        ? { end, value: cur.point.value - prev.value, filed: cur.point.filed > prev.filed ? cur.point.filed : prev.filed }
        : { ...cur.point },
    );
  }
  return [...out.values()].sort((a, b) => (a.end < b.end ? -1 : 1));
}

// Sum of the last four quarter-ends within 400 days of the latest. Anything
// less is not a trailing twelve months.
export function ttmSum(quarters: QuarterPoint[]): number | null {
  if (quarters.length < 4) return null;
  const sorted = [...quarters].sort((a, b) => (a.end < b.end ? -1 : 1));
  const latest = sorted[sorted.length - 1].end;
  const cutoff = new Date(Date.parse(latest) - 400 * 86400000).toISOString().slice(0, 10);
  const window = sorted.filter((q) => q.end > cutoff);
  if (window.length < 4) return null;
  return window.slice(-4).reduce((a, q) => a + q.value, 0);
}

// TTM for one flow row: first taxonomy with four quarters wins. Per-share
// rows split-adjust each quarter before summing.
export function ttmValue(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  ticker: string,
  tries: { taxonomy: string; concepts: string[] }[],
  unit: string,
  perShare = false,
): number | null {
  for (const t of tries) {
    const quarters = extractQuarters(facts, t.taxonomy, t.concepts, unit).map((q) =>
      perShare ? { ...q, value: q.value / splitFactor(ticker, q.end, q.filed) } : q,
    );
    const sum = ttmSum(quarters);
    if (sum !== null) return sum;
  }
  return null;
}

// Latest reported value across concepts (balances for the TTM column):
// newest period end wins, concept-list order breaks ties.
export function latestAcross(
  facts: Record<string, Record<string, XbrlConceptData>> | null | undefined,
  taxonomy: string,
  concepts: string[],
  unit: string,
): { value: number; end: string; filed: string } | null {
  const tax = facts?.[taxonomy];
  if (!tax) return null;
  let best: { value: number; end: string; filed: string; order: number } | null = null;
  concepts.forEach((concept, order) => {
    let mine: { value: number; end: string; filed: string } | null = null;
    for (const e of tax[concept]?.units?.[unit] ?? []) {
      if (typeof e.val !== 'number' || !Number.isFinite(e.val)) continue;
      if (!mine || e.end > mine.end || (e.end === mine.end && e.filed > mine.filed)) {
        mine = { value: e.val, end: e.end, filed: e.filed };
      }
    }
    if (!mine) return;
    if (!best || mine.end > best.end || (mine.end === best.end && order < best.order)) {
      best = { ...mine, order };
    }
  });
  return best ? { value: best.value, end: best.end, filed: best.filed } : null;
}

// Latest point value of a series (for P/E: latest FY diluted EPS).
export function latestValue(series: FinancialSeries | undefined): number | null {
  const pts = series?.points;
  if (!pts || pts.length === 0) return null;
  return pts[pts.length - 1].value;
}

// Total shares outstanding. Multi-class filers (GOOGL, BRK, META) report per
// class, which companyfacts drops — so the market-implied count (cap ÷ price)
// is a candidate too, and the larger wins: for single-class filers the two
// agree to within buyback drift, for multi-class filers the estimate is the
// only total. `estimated` is true when the estimate drove the answer.
export function resolveSharesOutstanding(
  dei: number | null,
  marketCap: number | null,
  price: number | null,
): { value: number | null; estimated: boolean } {
  const filed = dei !== null && dei > 0 ? Math.round(dei) : null;
  const implied =
    marketCap !== null && price !== null && price > 0 ? Math.round(marketCap / price) : null;
  if (filed === null && implied === null) return { value: null, estimated: false };
  if (implied !== null && (filed === null || implied > filed)) return { value: implied, estimated: true };
  return { value: filed, estimated: false };
}

// Year-over-year growth per point, aligned with the input (first is null).
export function yoyGrowth(points: AnnualPoint[]): (number | null)[] {
  return points.map((p, i) => {
    if (i === 0) return null;
    const prev = points[i - 1].value;
    if (!prev) return null;
    return (p.value - prev) / Math.abs(prev);
  });
}

// Compound annual growth rate from the first point to the last, annualised
// over the calendar span between period ends. Null with fewer than two
// points, a non-positive start, or no elapsed time.
export function cagr(points: AnnualPoint[]): number | null {
  return cagrDetails(points)?.rate ?? null;
}

export interface CagrDetails {
  rate: number;
  startYear: string;
  endYear: string;
}

// Compound annual growth rate with its endpoints, for lines like "Growing:
// +11.1% a year (2021–2025)". Same computation as cagr; null under the same
// conditions (fewer than two points, non-positive start, no elapsed time).
export function cagrDetails(points: AnnualPoint[]): CagrDetails | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => (a.end < b.end ? -1 : 1));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const years = daysBetween(first.end, last.end) / 365.25;
  if (!(first.value > 0) || !(years > 0)) return null;
  return {
    rate: Math.pow(last.value / first.value, 1 / years) - 1,
    startYear: first.year,
    endYear: last.year,
  };
}

export type TrendDir = 'up' | 'down' | 'flat';

// Snapshot "Revenue" answer: "Growing: +11.1% a year (2021–2025)". ±1% is
// flat; the trend drives the arrow and its color.
export function revenueLine(details: CagrDetails | null): { word: string; detail: string; trend: TrendDir } | null {
  if (!details) return null;
  const trend: TrendDir = details.rate >= 0.01 ? 'up' : details.rate <= -0.01 ? 'down' : 'flat';
  const word = trend === 'up' ? 'Growing' : trend === 'down' ? 'Shrinking' : 'Flat';
  return { word, detail: `${formatPct(details.rate)} a year (${details.startYear}–${details.endYear})`, trend };
}

// Snapshot "Margin" answer: "Keeps 8¢ of every $1, up from 2¢ in 2022".
// Compares the current (usually TTM) margin against an earlier fiscal year;
// without a base it returns the bare clause and a null trend (no arrow).
export function marginLine(
  current: number | null | undefined,
  base: number | null | undefined,
  baseYear: string | null,
): { text: string; trend: TrendDir | null } | null {
  if (current === null || current === undefined || !Number.isFinite(current)) return null;
  const cents = (m: number) => `${Math.round(Math.abs(m) * 100)}¢`;
  const main = current < 0 ? `Loses ${cents(current)} of every $1` : `Keeps ${cents(current)} of every $1`;
  if (base === null || base === undefined || !baseYear) return { text: main, trend: null };
  const diff = current - base;
  const trend: TrendDir = diff >= 0.005 ? 'up' : diff <= -0.005 ? 'down' : 'flat';
  const word = trend === 'up' ? 'up from' : trend === 'down' ? 'down from' : 'flat vs';
  return { text: `${main}, ${word} ${base < 0 ? 'losing ' : ''}${cents(base)} in ${baseYear}`, trend };
}

// ---------------------------------------------------------------------------
// Formatting (unit-tested)
// ---------------------------------------------------------------------------

function trimZeros(s: string): string {
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

export function formatMoney(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  if (a >= 1e12) return `${sign}$${trimZeros((a / 1e12).toFixed(2))}T`;
  if (a >= 1e9) return `${sign}$${trimZeros((a / 1e9).toFixed(2))}B`;
  if (a >= 1e6) return `${sign}$${trimZeros((a / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${sign}$${trimZeros((a / 1e3).toFixed(1))}K`;
  return `${sign}$${trimZeros(a.toFixed(2))}`;
}

// Share prices always carry two decimals ("$287.20", never "$287.2") —
// formatMoney trims small values, so the quote, range, and chart rows use
// this instead.
export function formatPrice(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// "2485 AUGUSTINE DRIVE, SANTA CLARA, CA, 95054" -> "Santa Clara, CA". City
// plus region only — the street and ZIP never help a reader. Title-cases
// SEC ALL-CAPS; unparseable input passes through title-cased rather than
// raw. Null in, null out (the UI falls back to the Wikidata city).
export function formatHeadquarters(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const region = (s: string) => (s.length === 2 ? s.toUpperCase() : title(s));
  if (parts.length >= 4) return `${title(parts[parts.length - 3])}, ${region(parts[parts.length - 2])}`;
  if (parts.length === 3) {
    return /\d/.test(parts[2])
      ? `${title(parts[0])}, ${region(parts[1])}`
      : `${title(parts[1])}, ${region(parts[2])}`;
  }
  if (parts.length === 2) return `${title(parts[0])}, ${region(parts[1])}`;
  return title(parts[0]);
}

export function formatEps(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(2)}`;
}

export function formatPct(x: number | null | undefined, digits = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return '—';
  return `${x < 0 ? '-' : x > 0 ? '+' : ''}${Math.abs(x * 100).toFixed(digits)}%`;
}

export function formatInt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

// Word-aware single-line truncation in width units for the OG stock card:
// CJK glyphs run ~2x latin width, so they count double (a 20-F one-liner
// can be half Chinese). "Taiwan Semiconductor Manuf…" never happens — it
// cuts at the last space ("Taiwan Semiconductor…"); a cut ending mid-CJK
// keeps the hard cut, since CJK has no word spaces to honor.
export function truncateLine(s: string, max: number): string {
  const w = (c: string) => (c.codePointAt(0)! > 0xff ? 2 : 1);
  let total = 0;
  for (const c of s) total += w(c);
  if (total <= max) return s;
  let used = 0;
  let cut = '';
  for (const c of s) {
    const cw = w(c);
    if (used + cw > max) break;
    used += cw;
    cut += c;
  }
  cut = cut.trimEnd();
  if (!cut) return '…';
  const last = [...cut].pop()!;
  if (w(last) === 2) return `${cut}…`;
  const sp = cut.lastIndexOf(' ');
  return `${sp > 8 ? cut.slice(0, sp) : cut}…`;
}

// Company-name text and size that fit beside the ticker on one card line:
// estimates both widths (~0.68em for the caps ticker, ~0.6em mixed-case
// name), then shrinks the name (and, for pathological pairs, shortens it)
// into what's left. Names are SEC/Nasdaq latin-alphabet; CJK width only
// matters for one-liners. Verified against BRK.A + TSMC renders.
export function fitName(
  ticker: string,
  name: string,
  colWidth: number,
  tickerPx: number,
): { text: string; px: number } {
  const avail = Math.max(colWidth - [...ticker].length * tickerPx * 0.68 - 20, 120);
  const text = truncateLine(name, Math.max(10, Math.min(30, Math.floor(avail / 18))));
  const px = Math.min(40, Math.max(24, Math.floor(avail / (Math.max([...text].length, 1) * 0.62))));
  return { text, px };
}

// Price-hero size for the OG stock cards: maxPx for normal quotes, shrinking
// so even BRK.A's "$712,345.00" stays inside targetWidth. Prices are never
// truncated, only shrunk.
export function fitPrice(priceStr: string, maxPx = 150, targetWidth = 900): number {
  const len = Math.max([...priceStr].length, 1);
  return Math.min(maxPx, Math.max(72, Math.floor(targetWidth / (len * 0.62))));
}

// Compact unitless scaling for share counts: 24100000000 -> "24.10B".
export function formatCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  if (a >= 1e12) return `${sign}${trimZeros((a / 1e12).toFixed(2))}T`;
  if (a >= 1e9) return `${sign}${trimZeros((a / 1e9).toFixed(2))}B`;
  if (a >= 1e6) return `${sign}${trimZeros((a / 1e6).toFixed(2))}M`;
  if (a >= 1e3) return `${sign}${trimZeros((a / 1e3).toFixed(1))}K`;
  return `${sign}${trimZeros(a.toFixed(0))}`;
}

// "$738.88" / "12,563,616" / "-0.41%" -> number. "N/A" -> null.
export function parseNum(s: unknown): number | null {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (typeof s !== 'string') return null;
  const n = Number(s.replace(/[$,%]/g, '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

// "Meta Platforms, Inc. Class A Common Stock" -> "Meta Platforms, Inc."
// Keeps the legal suffix: "Apple Inc." searches far better than "Apple".
export function cleanCompanyNameForSearch(name: string): string {
  return (name || '')
    .replace(/\s+(Class\s+[A-Z][\w\s]*?)?Common\s+Stock.*$/i, '')
    .replace(/\s+(Class\s+[A-Z])\s*$/i, '')
    .trim();
}

// Display name prefers the Nasdaq feed ("Amazon.com, Inc.") over EDGAR's
// filing name ("AMAZON COM INC") — filers self-report in ALL CAPS with no
// punctuation, and the raw form leaks into headings and share text.
export function pickCompanyName(
  secName: string | null | undefined,
  nasdaqName: string | null | undefined,
  entryTitle: string | null | undefined,
  ticker: string,
): string {
  return (nasdaqName ? cleanCompanyNameForSearch(nasdaqName) : null) || secName || entryTitle || ticker;
}

// Display name for headlines and cards: "Tesla, Inc." -> "Tesla". Strips
// chained legal suffixes ("Taiwan Semiconductor Manufacturing Company
// Limited" -> "Taiwan Semiconductor Manufacturing"). Search keeps the legal
// suffix (cleanCompanyNameForSearch); display drops it. Returns the input
// when nothing would remain.
export function displayCompanyName(name: string): string {
  let n = (name || '').trim();
  // Share-class tail first (Nasdaq appends it: "…Class A Ordinary Shares",
  // "…Class C Capital Stock", or bare "…Common Stock" as in "PepsiCo, Inc.
  // Common Stock"). The Class designator is one letter and the tail must
  // end in Stock/Shares, so "First Class Holdings" survives.
  n = n
    .replace(/\s+Class\s+[A-Z0-9](\s+[A-Za-z]+){0,3}\s+(Stock|Shares?)\s*$/i, '')
    .replace(/\s+Class\s+[A-Z0-9]\s*$/i, '')
    .replace(/\s+(Common\s+Stock|Ordinary\s+Shares?|Capital\s+Stock)\s*$/i, '')
    .trim();
  // Older and foreign filers file in ALL CAPS ("BERKSHIRE HATHAWAY INC").
  // Title-case those (word starts only, so "McDonald's" keeps its shape);
  // mixed-case names pass through untouched.
  if (/[A-Z]/.test(n) && !/[a-z]/.test(n)) {
    n = n.toLowerCase().replace(/(^|[\s\-–—(/&])(\w)/g, (_, p: string, c: string) => p + c.toUpperCase());
  }
  const stripped = n
    .replace(
      /((?:\s+|\s*,\s*)(Inc|Corp|Corporation|Incorporated|Company|Holdings?|Group|Ltd|Limited|LLC|PL[CK]|Co|Trust|LPs?|LLP|NV|SA|AG|SE|SpA|AB))+\.?$/i,
      '',
    )
    .replace(/\.(com|net|org|io|ai)$/i, '')
    .replace(/\scom$/i, '') // dotless twin: SEC files "AMAZON COM INC"
    .trim();
  return stripped || (name || '').trim();
}

// Abbreviations that end with a period but never end a sentence —
// "Berkshire Hathaway Inc. ("Berkshire") is…" is one sentence.
const SENTENCE_ABBREV = /^([A-Za-z]\.)*[A-Za-z]$|^(No|Mr|Mrs|Ms|Dr|St|Rd|Ave|Blvd|vs|Inc|Corp|Co|Ltd|Jr|Sr|Esq)$/i;

// All sentences of a text, split on non-abbreviation ends (trailing text
// without an end counts as the last sentence).
function splitSentences(s: string): string[] {
  const out: string[] = [];
  const re = /[.?!]["'”’)\]]*\s+/g;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const word = s.slice(0, m.index).split(/\s+/).pop() ?? '';
    if (SENTENCE_ABBREV.test(word)) continue;
    out.push(s.slice(start, m.index + m[0].trimEnd().length));
    start = m.index + m[0].length;
  }
  const tail = s.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function capSentence(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max).trimEnd();
  const sp = cut.lastIndexOf(' ');
  return `${sp > max * 0.5 ? cut.slice(0, sp) : cut}…`;
}

// First sentence of a text, for one-liners. Falls back to a trimmed prefix
// when no sentence end exists.
export function firstSentence(text: string, max = 220): string {
  const s = (text || '').trim();
  const [first] = splitSentences(s);
  return capSentence(first ?? s, max);
}

// Mission-language roots: "We seek to be Earth's most customer-centric
// company" says nothing about what a company sells. The lede is the first
// sentence WITHOUT them. "Principles" is whole-word only — "principal"
// (products, offices) opens substantive sentences. "Focused" and "leverage"
// catch intent-framing ("We are focused on bringing AI…", "We intend to
// leverage our operations…") — the WHAT usually follows in plainer sentences.
const MISSION_FLUFF =
  /\b(mission|vision|striv\w*|seek\w*|aspir\w*|principles?|guid\w*|obsess\w*|passion\w*|excel\w*|centric|focus\w*|leverag\w*)\b/i;

// Cross-references never lede ("See Item 7.", "Refer to Note 21.") — short
// ones would otherwise win the fit rule below.
const LEDE_CROSSREF = /^\s*(see|refer to)\b/i;

function ledeWorthy(s: string): boolean {
  return !MISSION_FLUFF.test(s) && !LEDE_CROSSREF.test(s) && !FILING_DISCLAIMER.test(s) && !CONNECTIVE_START.test(s.trim());
}

// One-liner for the Snapshot box, the share card, and the share description:
// the first substantive sentence of the business text, skipping mission
// fluff. Falls back to the first sentence when everything matches (a fluff
// lede still beats a blank box).
export function ledeSentence(text: string, max = 220): string {
  const s = (text || '').trim();
  if (!s) return '';
  const sents = splitSentences(s);
  return capSentence(sents.find(ledeWorthy) ?? sents[0] ?? s, max);
}

// A sentence enumerating reportable segments ("organized into three
// segments: North America, International, and AWS") names the business
// lines — the best single-sentence lede when one fits. At most one adjective
// between the count and "segments" ("two reportable segments").
const SEGMENT_COUNT = /\b(one|two|three|four|five|six|\d+)\s+(\w+\s+)?segments?\b/i;

// First substantive sentence that fits uncut, preferring a segment
// enumeration; null when every candidate needs the cap (a capped lede reads
// as a cutoff — the caller falls through to the next source instead).
function cleanLede(text: string | null | undefined, max: number): string | null {
  const s = (text || '').trim();
  if (!s) return null;
  const cands = splitSentences(s).filter((x) => ledeWorthy(x) && x.length <= max);
  return cands.find((x) => SEGMENT_COUNT.test(x)) ?? cands[0] ?? null;
}

// Overview-first lede: the overview's first clean sentence wins (it says what
// the company IS); the business-model text only fills in when the overview is
// all fluff or overlong (TSLA's opens with two capped AI-framing sentences,
// its model text with the crisp segment line). Final fallback caps the
// overview like ledeSentence — a cut lede still beats a blank box.
export function pickLede(
  extract: string | null | undefined,
  businessModel: string | null | undefined,
  max = 220,
): string {
  return cleanLede(extract, max) ?? cleanLede(businessModel, max) ?? ledeSentence(extract || businessModel || '', max);
}

// Day move with units on both legs: "+$1.90 (+0.5%)". Either leg alone when
// the other is missing, "—" when both are.
export function formatQuoteChange(
  change: number | null | undefined,
  changePct: number | null | undefined,
): string {
  const bits: string[] = [];
  if (typeof change === 'number' && Number.isFinite(change)) {
    const grouped = Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    bits.push(`${change < 0 ? '-' : '+'}$${grouped}`);
  }
  if (typeof changePct === 'number' && Number.isFinite(changePct)) bits.push(`(${formatPct(changePct)})`);
  return bits.length > 0 ? bits.join(' ') : '—';
}

// Position of today's price in its 52-week range as a plain-English label,
// in fifths. Null/NaN stays blank.
export function positionInRangeLabel(pos: number | null | undefined): string | null {
  if (pos === null || pos === undefined || !Number.isFinite(pos)) return null;
  if (pos >= 0.8) return 'near the high';
  if (pos >= 0.6) return 'upper range';
  if (pos >= 0.4) return 'mid-range';
  if (pos >= 0.2) return 'lower range';
  return 'near the low';
}

// P/E against its own 5-year range: "below its 5-yr range (32.2–52.4)".
// Null without both legs — the tile shows the bare multiple instead.
export function peHistoryNote(pe: number | null | undefined, range: [number, number] | null): string | null {
  if (pe === null || pe === undefined || !Number.isFinite(pe) || !range) return null;
  const [lo, hi] = range;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  const pos = pe < lo ? 'below' : pe > hi ? 'above' : 'within';
  return `${pos} its 5-yr range (${lo.toFixed(1)}–${hi.toFixed(1)})`;
}

export function isMarketOpen(marketStatus: string | null | undefined): boolean {
  return /open/i.test(marketStatus ?? '');
}

// Status-line stamp: time only while the market is open ("12:07 PM ET" — the
// date is implied), the full stamp when closed ("Oct 6, 2026"). Unparseable
// stamps pass through untouched.
export function formatLastTrade(lastTrade: string | null | undefined, marketStatus: string | null | undefined): string {
  if (!lastTrade) return '—';
  if (!isMarketOpen(marketStatus)) return lastTrade;
  return lastTrade.replace(/^[A-Za-z]{3} \d{1,2}, \d{4} /, '');
}

// SEC ISO filing date -> "Nov 20, 2025" for the "From the … filed …" line.
// Parsed manually (never Date) so server timezones can't shift the day.
export function formatFilingDate(iso: string | null | undefined): string | null {
  const m = (iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  return `${months[mo - 1]} ${Number(m[3])}, ${m[1]}`;
}

// Card dateline from a Nasdaq quote: "Oct 6 close" when the market is closed,
// "Oct 6" while live, null when the quote carries no parseable date. Parsed
// manually (never Date) so server timezones can't shift the day. Keeps cached
// cards honest about which session the price belongs to.
export function quoteDayLabel(
  lastTrade: string | null | undefined,
  marketStatus: string | null | undefined,
): string | null {
  const day = quoteDayParts(lastTrade);
  if (!day) return null;
  return /closed/i.test(marketStatus ?? '') ? `${day.label} close` : day.label;
}

// Dated footer for the square post card: "Oct 7, 2026 close" once the
// session is final, bare "Oct 8, 2026" while live. Falls back to the
// yearless label when the feed omits the year.
export function quoteCardFooter(
  lastTrade: string | null | undefined,
  marketStatus: string | null | undefined,
): string | null {
  const day = quoteDayParts(lastTrade);
  if (!day) return null;
  const base = day.param ? (formatFilingDate(day.param) ?? day.label) : day.label;
  return /closed/i.test(marketStatus ?? '') ? `${base} close` : base;
}

// Machine twin of quoteDayLabel: "Oct 6, 2026" -> "2026-10-06", for the dated
// image URL (?d=...) that forces social caches to refresh each session.
export function quoteDayParam(lastTrade: string | null | undefined): string | null {
  const day = quoteDayParts(lastTrade);
  return day ? day.param : null;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function quoteDayParts(lastTrade: string | null | undefined): { label: string; param: string } | null {
  if (!lastTrade) return null;
  const named = lastTrade.match(/([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  if (named) {
    const mi = SHORT_MONTHS.findIndex((m) => m.toLowerCase() === named[1].slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const dd = String(Number(named[2])).padStart(2, '0');
      // No year (intraday feeds sometimes omit it): dateline only, no param.
      if (!named[3]) return { label: `${SHORT_MONTHS[mi]} ${Number(named[2])}`, param: '' };
      return { label: `${SHORT_MONTHS[mi]} ${Number(named[2])}`, param: `${named[3]}-${String(mi + 1).padStart(2, '0')}-${dd}` };
    }
  }
  const iso = lastTrade.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const mi = Number(iso[2]) - 1;
    if (mi >= 0 && mi < 12) return { label: `${SHORT_MONTHS[mi]} ${Number(iso[3])}`, param: iso[0] };
  }
  return null;
}

// Revenue values -> SVG polyline points plus the end-dot position, scaled
// into a width×height box for the card sparkline. Flat series draw a level
// line; fewer than two points (or no finite values) returns null.
export function sparklinePoints(
  values: (number | null | undefined)[],
  width: number,
  height: number,
): { points: string; endX: number; endY: number } | null {
  const vals = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (vals.length < 2 || !(width > 0) || !(height > 0)) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  // Padding exceeds the dot radius and half the stroke, so neither clips at
  // the viewport edge (a clipped dot renders square).
  const pad = 8;
  const x = (i: number) => pad + (i / (vals.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  return { points: pts.join(' '), endX: x(vals.length - 1), endY: y(vals[vals.length - 1]) };
}

const NAME_STOPWORDS = new Set([
  'the', 'inc', 'corp', 'co', 'corporation', 'company', 'companies', 'incorporated',
  'holdings', 'holding', 'group', 'limited', 'ltd', 'llc', 'plc', 'nv', 'sa', 'ag',
  'class', 'common', 'stock', 'shares', 'trust', 'lp', 'llp', 'spa', 'se',
]);

function significantWords(name: string): string[] {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !NAME_STOPWORDS.has(w));
}

// Guard against Wikipedia search drift: the top hit for an obscure name can be
// unrelated. Accept when the title shares a significant word with the company
// name, or is its acronym ("International Business Machines" -> "IBM").
export function wikipediaRelevant(companyName: string, resultTitle: string): boolean {
  const words = significantWords(companyName);
  if (words.length === 0) return false;
  const title = ` ${resultTitle.toLowerCase()} `;
  if (words.some((w) => title.includes(` ${w} `) || title.includes(` ${w}s `))) return true;
  const initials = words
    .slice(0, 4)
    .map((w) => w[0])
    .join('');
  const compact = resultTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (initials.length < 2) return false;
  // "Taiwan Semiconductor Manufacturing" -> "TSMC": the short name extends
  // the initials rather than equalling them.
  return compact === initials || (initials.length >= 3 && compact.startsWith(initials));
}

// ---------------------------------------------------------------------------
// Server fetchers
// ---------------------------------------------------------------------------

const SEC_UA = 'amoljadhav-ninja-stock-lookup/1.0 (https://amoljadhav.ai)';
const NASDAQ_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function fetchJson(url: string, init: RequestInit, revalidateSeconds: number): Promise<unknown> {
  const res = await fetch(url, { ...init, next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
  return res.json();
}

interface TickerMapEntry {
  cik: number;
  title: string;
}

export async function fetchSecTickerMap(): Promise<Map<string, TickerMapEntry>> {
  const json = (await fetchJson(
    'https://www.sec.gov/files/company_tickers.json',
    { headers: { 'User-Agent': SEC_UA, Accept: 'application/json' } },
    86400,
  )) as Record<string, { cik_str: number; ticker: string; title: string }>;
  const map = new Map<string, TickerMapEntry>();
  for (const row of Object.values(json)) {
    if (row?.ticker && row?.cik_str) map.set(row.ticker.toUpperCase(), { cik: row.cik_str, title: row.title });
  }
  return map;
}

interface SecSubmissions {
  name?: string;
  description?: string;
  tickers?: string[];
  exchanges?: string[];
  sic?: string;
  sicDescription?: string;
  fiscalYearEnd?: string;
  stateOfIncorporation?: string;
  addresses?: { business?: { street1?: string; city?: string; stateOrCountry?: string; zipCode?: string } };
  filings?: { recent?: FilingsRecent };
}

export async function fetchSubmissions(cikPadded: string): Promise<SecSubmissions> {
  return (await fetchJson(
    `https://data.sec.gov/submissions/CIK${cikPadded}.json`,
    { headers: { 'User-Agent': SEC_UA, Accept: 'application/json' } },
    3600,
  )) as SecSubmissions;
}

interface SecCompanyFacts {
  cik?: number;
  entityName?: string;
  facts?: Record<string, Record<string, XbrlConceptData>>;
}

export async function fetchCompanyFacts(cikPadded: string): Promise<SecCompanyFacts> {
  return (await fetchJson(
    `https://data.sec.gov/api/xbrl/companyfacts/CIK${cikPadded}.json`,
    { headers: { 'User-Agent': SEC_UA, Accept: 'application/json' } },
    21600,
  )) as SecCompanyFacts;
}

// One filing's main document as raw HTML. Filed documents never change, so
// this caches for a month; oversized documents (>30MB) are refused rather
// than parsed.
export async function fetchFilingText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': SEC_UA, Accept: 'text/html' },
    next: { revalidate: 2592000 },
  });
  if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
  const text = await res.text();
  if (text.length > 30_000_000) throw new Error('filing too large');
  return text;
}

export interface NasdaqQuoteJson {
  data?: {
    symbol?: string;
    companyName?: string;
    exchange?: string;
    primaryData?: {
      lastSalePrice?: string;
      netChange?: string;
      percentageChange?: string;
      lastTradeTimestamp?: string;
      volume?: string;
    };
    marketStatus?: string;
  };
}

interface NasdaqSummaryJson {
  data?: {
    summaryData?: Record<string, { label?: string; value?: string }>;
  };
}

function nasdaqUsable(d: NasdaqQuoteJson['data']): boolean {
  const p = d?.primaryData?.lastSalePrice;
  return !!d?.symbol && typeof p === 'string' && p !== 'N/A';
}

// Pure: pull a StockQuote out of a Nasdaq /info payload. Shared by the lookup
// API, the OG image route, and page metadata so every surface reads the price
// the same way.
export function extractQuote(q: NasdaqQuoteJson['data']): StockQuote | null {
  if (!nasdaqUsable(q)) return null;
  const pct = parseNum(q!.primaryData!.percentageChange);
  return {
    price: parseNum(q!.primaryData!.lastSalePrice),
    change: parseNum(q!.primaryData!.netChange),
    changePct: pct !== null ? pct / 100 : null,
    volume: parseNum(q!.primaryData!.volume),
    lastTrade: q!.primaryData!.lastTradeTimestamp ?? null,
    marketStatus: q!.marketStatus ?? null,
  };
}

// Share-post text for a lookup, e.g. "$NVDA $187.50 (+1.2%) — NVIDIA Corporation".
// The ticker is cashtagged ($NVDA) so it linkifies on X.
export function stockShareText(ticker: string, companyName: string, quote: StockQuote | null): string {
  if (!quote || quote.price === null) return `$${ticker} — ${companyName}`;
  const pct = quote.changePct !== null ? ` (${formatPct(quote.changePct)})` : '';
  return `$${ticker} $${quote.price.toFixed(2)}${pct} — ${companyName}`;
}

// Per-share cache buster for social URLs: X caches cards per page URL for
// days, so each share link carries a unique moment token (?v=...) and the
// page passes it through to og:image. Short base36 timestamp.
export function shareCacheBuster(now = Date.now()): string {
  return Math.max(0, Math.floor(now)).toString(36);
}

export function stockShareLinks(pageUrl: string, text: string): { x: string; linkedin: string } {
  return {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
  };
}

export async function fetchNasdaq(ticker: string): Promise<{ quote: NasdaqQuoteJson['data']; summary: NasdaqSummaryJson['data'] }> {
  const init = { headers: { 'User-Agent': NASDAQ_UA, Accept: 'application/json' } };
  const [quoteJson, summaryJson] = await Promise.all([
    fetchJson(`https://api.nasdaq.com/api/quote/${ticker}/info?assetclass=stocks`, init, 120) as Promise<NasdaqQuoteJson>,
    fetchJson(`https://api.nasdaq.com/api/quote/${ticker}/summary?assetclass=stocks`, init, 300) as Promise<NasdaqSummaryJson>,
  ]);
  if (nasdaqUsable(quoteJson?.data)) return { quote: quoteJson.data, summary: summaryJson?.data };
  // ETFs live under a different asset class ("Symbol not exists" otherwise).
  try {
    const [etfQuote, etfSummary] = await Promise.all([
      fetchJson(`https://api.nasdaq.com/api/quote/${ticker}/info?assetclass=etf`, init, 120) as Promise<NasdaqQuoteJson>,
      fetchJson(`https://api.nasdaq.com/api/quote/${ticker}/summary?assetclass=etf`, init, 300) as Promise<NasdaqSummaryJson>,
    ]);
    if (nasdaqUsable(etfQuote?.data)) return { quote: etfQuote.data, summary: etfSummary?.data };
  } catch {
    /* fall through to the stocks-shaped result */
  }
  return { quote: quoteJson?.data, summary: summaryJson?.data };
}

export interface StockCardData {
  ticker: string;
  companyName: string;
  quote: StockQuote | null;
  priceHistory: PricePoint[];
}

// Lean quote-only loader for social cards and crawler metadata: Nasdaq /info
// (+ /historical for the square trend) under one shared timeout, no SEC or
// Wikidata. Full getStockData takes 20s+ cold and crawlers give up — this
// stays inside ~8s and degrades to null/[] instead of hanging.
const CARD_TIMEOUT_MS = 8000;

async function fetchNasdaqInfoData(
  ticker: string,
  signal: AbortSignal,
): Promise<NasdaqQuoteJson['data'] | null> {
  const init: RequestInit = {
    headers: { 'User-Agent': NASDAQ_UA, Accept: 'application/json' },
    signal,
  };
  for (const cls of ['stocks', 'etf']) {
    try {
      const json = (await fetchJson(
        `https://api.nasdaq.com/api/quote/${ticker}/info?assetclass=${cls}`,
        init,
        120,
      )) as NasdaqQuoteJson;
      if (nasdaqUsable(json?.data)) return json.data;
    } catch {
      /* try the next asset class */
    }
  }
  return null;
}

export async function getStockCardData(
  ticker: string,
  opts?: { history?: boolean; timeoutMs?: number },
): Promise<StockCardData | null> {
  const budget = opts?.timeoutMs ?? CARD_TIMEOUT_MS;
  const signal = AbortSignal.timeout(budget);
  const work = (async () => {
    const [info, history] = await Promise.all([
      fetchNasdaqInfoData(ticker, signal).catch(() => null),
      (opts?.history ? fetchNasdaqHistorical(ticker, signal) : Promise.resolve([])).catch(() => []),
    ]);
    if (!info) return null;
    return {
      ticker,
      companyName: info.companyName || ticker,
      quote: extractQuote(info),
      priceHistory: history,
    };
  })();
  // Backstop race: some fetch wrappers swallow abort signals, so the promise
  // race (not the signal) is what actually bounds the wait. Cleared whenever
  // the work wins so no timer outlives the call.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const fallback = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), budget + 1000);
  });
  try {
    return await Promise.race([work, fallback]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Inter Black for card headlines, fetched once per serverless instance
// (shared by both card routes). Satori parses ttf/otf/woff only (no woff2),
// so ask Google Fonts with an ancient UA, which is served truetype.
// Anything failing falls back to system sans — layouts never depend on
// the webfont.
let cardFontPromise: Promise<ArrayBuffer | null> | null = null;
export function loadCardFontCached(): Promise<ArrayBuffer | null> {
  if (!cardFontPromise) {
    cardFontPromise = (async () => {
      try {
        const css = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap', {
          headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)' },
          signal: AbortSignal.timeout(4000),
        }).then((r) => {
          if (!r.ok) throw new Error('font css');
          return r.text();
        });
        const url = css.match(/https:\/\/[^)]+\.ttf/)?.[0];
        if (!url) return null;
        const buf = await fetch(url, { signal: AbortSignal.timeout(4000) }).then((r) => {
          if (!r.ok) throw new Error('font file');
          return r.arrayBuffer();
        });
        return buf;
      } catch {
        return null;
      }
    })();
  }
  return cardFontPromise;
}

// One call's worth of card inputs — quote data and font in parallel — with
// the elapsed data wait for Server-Timing. Lives here (not the routes) so
// the timing stays out of JSX-bearing functions.
export async function loadStockCard(
  ticker: string,
  opts?: { history?: boolean },
): Promise<{ data: StockCardData | null; font: ArrayBuffer | null; dataMs: number }> {
  const t0 = Date.now();
  const [data, font] = await Promise.all([
    getStockCardData(ticker, opts).catch(() => null),
    loadCardFontCached(),
  ]);
  return { data, font, dataMs: Date.now() - t0 };
}

interface WikiSearchJson {
  query?: { search?: { title?: string }[] };
}

interface WikiSummaryJson {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
}

export async function fetchWikipediaSummary(
  title: string,
  source: StockDescription['source'],
): Promise<StockDescription | null> {
  const slug = title.replace(/ /g, '_');
  const summary = (await fetchJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
    { headers: { 'User-Agent': SEC_UA } },
    604800,
  )) as WikiSummaryJson;
  if (!summary?.extract) return null;
  return {
    extract: truncateSentences(summary.extract, 900),
    url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
    title: summary.title ?? title,
    source,
    founded: null,
    headquarters: null,
    ceo: null,
  };
}

export async function fetchWikipediaDescription(companyName: string): Promise<StockDescription | null> {
  const q = cleanCompanyNameForSearch(companyName);
  if (!q) return null;
  const search = (await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&formatversion=2`,
    { headers: { 'User-Agent': SEC_UA } },
    604800,
  )) as WikiSearchJson;
  const hits = search?.query?.search ?? [];
  const hit = hits.find((h) => h?.title && wikipediaRelevant(companyName, h.title));
  if (!hit?.title) return null;
  return fetchWikipediaSummary(hit.title, 'wikipedia');
}

interface WikidataBinding {
  article?: { value?: string };
  inception?: { value?: string };
  hq?: { value?: string };
  ceo?: { value?: string };
}

interface WikidataSparqlJson {
  results?: { bindings?: WikidataBinding[] };
}

export interface WikidataCompany {
  title: string;
  founded: string | null;
  headquarters: string | null;
  ceo: string | null;
}

// One SPARQL binding -> article title plus company facts. Inception is a
// full timestamp ("1993-04-05T00:00:00Z"); only the year is kept.
export function parseWikidataCompanyFacts(binding: WikidataBinding | undefined): WikidataCompany | null {
  const val = binding?.article?.value;
  const m = val?.match(/\/wiki\/(.+)$/);
  if (!m) return null;
  const year = binding?.inception?.value?.match(/^(\d{4})/)?.[1] ?? null;
  return {
    title: decodeURIComponent(m[1].replace(/_/g, ' ')),
    founded: year,
    headquarters: binding?.hq?.value ?? null,
    ceo: binding?.ceo?.value ?? null,
  };
}

// Company name search is fragile ("Target", "Block", "Oracle" all collide),
// so resolve the Wikipedia article through Wikidata by exact ticker instead.
// Coverage note, verified live: tickers live as P249 qualifiers on the stock
// exchange (P414) statement — direct P249 claims are empty even for Apple —
// so both patterns are queried. Tickers here are normalised ([A-Z0-9.]), so
// interpolating them into SPARQL is safe. The same query picks up inception
// (P571), headquarters (P159) and CEO (P169) when present.
export async function fetchWikidataCompany(tickers: string[]): Promise<WikidataCompany | null> {
  for (const t of tickers) {
    const sparql =
      `SELECT ?article ?inception ?hq ?ceo WHERE { { ?item wdt:P249 "${t}". } UNION ` +
      `{ ?item p:P414 ?stmt. ?stmt pq:P249 "${t}". } ` +
      `?article schema:about ?item. ?article schema:inLanguage "en". ` +
      `?article schema:isPartOf <https://en.wikipedia.org/>. ` +
      `OPTIONAL { ?item wdt:P571 ?inception. } ` +
      `OPTIONAL { ?item wdt:P159 ?hqItem. ?hqItem rdfs:label ?hq. FILTER(LANG(?hq) = "en") } ` +
      `OPTIONAL { ?item wdt:P169 ?ceoItem. ?ceoItem rdfs:label ?ceo. FILTER(LANG(?ceo) = "en") } } LIMIT 1`;
    try {
      const json = (await fetchJson(
        `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`,
        { headers: { 'User-Agent': SEC_UA, Accept: 'application/sparql-results+json' } },
        2592000,
      )) as WikidataSparqlJson;
      const parsed = parseWikidataCompanyFacts(json?.results?.bindings?.[0]);
      if (parsed) return parsed;
    } catch {
      /* try the next variant, then fall back to name search */
    }
  }
  return null;
}

export function edgarCompanyUrl(cikPadded: string): string {
  return `https://www.sec.gov/edgar/browse/?CIK=${Number(cikPadded)}&owner=exclude`;
}

interface NasdaqHistoricalJson {
  data?: { tradesTable?: { rows?: { date?: string; close?: string }[] } };
}

// Daily closes, oldest first. One request covers ~7 years — the endpoint
// paginates at 15 rows by default, so limit=9999 pulls the whole range in a
// single response, cached a week (history never changes). fromdate looks far
// enough back to cover five fiscal years for January year-ends.
export async function fetchNasdaqHistorical(ticker: string, signal?: AbortSignal): Promise<PricePoint[]> {
  const from = new Date(Date.now() - 7 * 365 * 86400000).toISOString().slice(0, 10);
  const init: RequestInit = { headers: { 'User-Agent': NASDAQ_UA, Accept: 'application/json' } };
  if (signal) init.signal = signal;
  for (const cls of ['stocks', 'etf']) {
    try {
      const json = (await fetchJson(
        `https://api.nasdaq.com/api/quote/${ticker}/historical?assetclass=${cls}&fromdate=${from}&limit=9999`,
        init,
        604800,
      )) as NasdaqHistoricalJson;
      const rows = json?.data?.tradesTable?.rows ?? [];
      const out: PricePoint[] = [];
      for (const r of rows) {
        const m = (r.date ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        const close = parseNum(r.close);
        if (!m || close === null) continue;
        out.push({ date: `${m[3]}-${m[1]}-${m[2]}`, close });
      }
      if (out.length > 0) return out.sort((a, b) => (a.date < b.date ? -1 : 1));
    } catch {
      /* try the next asset class */
    }
  }
  return [];
}

function truncateSentences(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  let lastEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.\n'));
  // Don't stop on abbreviations ("No.", "U.S.", "e.g.") — walk back to a
  // real sentence end instead.
  while (lastEnd > max * 0.4) {
    const word = cut.slice(0, lastEnd + 1).split(' ').pop() ?? '';
    if (!/^([A-Za-z]\.|(No|Mr|Mrs|Ms|Dr|St|vs)\.)$/i.test(word)) break;
    const prev = Math.max(cut.lastIndexOf('. ', lastEnd - 2), cut.lastIndexOf('.\n', lastEnd - 2));
    if (prev < 0) break;
    lastEnd = prev;
  }
  return (lastEnd > max * 0.4 ? cut.slice(0, lastEnd + 1) : `${cut.trimEnd()}…`);
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

const REVENUE_CONCEPTS = [
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'Revenues',
  'RevenueFromContractWithCustomerIncludingAssessedTax',
  'SalesRevenueNet',
  'RevenuesNetOfInterestExpense', // banks
];

interface SeriesDef {
  key: string;
  label: string;
  unit: 'USD' | 'USD/shares' | 'shares';
  tries: { taxonomy: string; concepts: string[] }[];
  custom?: 'debt' | 'fcf';
  splitDir?: 'per-share' | 'shares';
}

const CASH_CONCEPTS = [
  'CashAndCashEquivalentsAtCarryingValue',
  'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents',
  'CashAndDueFromBanks', // banks
];

const SERIES_DEFS: SeriesDef[] = [
  { key: 'revenue', label: 'Revenue', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: REVENUE_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['Revenue'] }] },
  { key: 'grossProfit', label: 'Gross profit', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: ['GrossProfit'] }, { taxonomy: 'ifrs-full', concepts: ['GrossProfit'] }] },
  { key: 'operatingIncome', label: 'Operating income', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: ['OperatingIncomeLoss'] }] },
  { key: 'netIncome', label: 'Net income', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: ['NetIncomeLoss'] }, { taxonomy: 'ifrs-full', concepts: ['ProfitLoss'] }] },
  { key: 'eps', label: 'EPS (diluted)', unit: 'USD/shares', splitDir: 'per-share', tries: [{ taxonomy: 'us-gaap', concepts: ['EarningsPerShareDiluted'] }, { taxonomy: 'ifrs-full', concepts: ['DilutedEarningsLossPerShare'] }] },
  { key: 'cash', label: 'Cash', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: CASH_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['CashAndCashEquivalents'] }] },
  { key: 'debt', label: 'Total debt', unit: 'USD', tries: [], custom: 'debt' },
  { key: 'fcf', label: 'Free cash flow', unit: 'USD', tries: [], custom: 'fcf' },
  { key: 'shares', label: 'Avg diluted shares', unit: 'shares', splitDir: 'shares', tries: [{ taxonomy: 'us-gaap', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'] }, { taxonomy: 'ifrs-full', concepts: ['AdjustedWeightedAverageShares', 'WeightedAverageShares'] }] },
  { key: 'assets', label: 'Total assets', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: ['Assets'] }, { taxonomy: 'ifrs-full', concepts: ['Assets'] }] },
  { key: 'equity', label: 'Total equity', unit: 'USD', tries: [{ taxonomy: 'us-gaap', concepts: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'] }, { taxonomy: 'ifrs-full', concepts: ['Equity', 'EquityAttributableToOwnersOfParent'] }] },
];

// Cost of revenue for gross-profit derivation ONLY — never a table row.
// Restricted to total-cost concepts: CostOfGoodsAndServicesSold is partial
// for some filers (AMZN's excludes fulfillment), so revenue minus that would
// print a wrong gross profit. META/GOOGL tag the total as CostOfRevenue;
// AMZN doesn't, which is exactly what keeps them out of the derivation.
const COST_OF_REVENUE_TRIES = [
  { taxonomy: 'us-gaap', concepts: ['CostOfRevenue'] },
  { taxonomy: 'ifrs-full', concepts: ['CostOfSales'] },
];

// Gross profit = revenue − cost of revenue, matched by fiscal year-end, for
// filers that present no gross subtotal. All-or-nothing per series: mixing
// filed years with derived years would corrupt YoY comparisons, so callers
// only invoke this when the filed series is entirely absent. Null unless at
// least one year matches on both legs.
export function deriveGrossProfit(
  revenue: FinancialSeries | null | undefined,
  cost: FinancialSeries | null | undefined,
): AnnualPoint[] | null {
  if (!revenue || !cost) return null;
  const byEnd = new Map(cost.points.map((p) => [p.end, p.value]));
  const pts = revenue.points.flatMap((r) => {
    const c = byEnd.get(r.end);
    return c === undefined ? [] : [{ year: r.year, end: r.end, value: r.value - c, filed: r.filed }];
  });
  return pts.length > 0 ? pts : null;
}

function pointsByYear(s: FinancialSeries | null): Map<string, AnnualPoint> {
  return new Map((s?.points ?? []).map((p) => [p.year, p]));
}

// Total debt = current borrowings + noncurrent borrowings, assembled per year
// from whichever decomposition the filer uses (verified: AAPL splits current
// into commercial paper + current LTD; JPM pairs short-term borrowings with
// LTD-including-current-maturities; Realty Income splits secured + notes
// payable). DebtCurrent is all-inclusive when present, so it suppresses the
// detail legs for that year rather than double-counting them.
const DEBT_CURRENT_ALL = ['DebtCurrent'];
const DEBT_CURRENT_PARTS = ['CommercialPaper', 'LongTermDebtCurrent', 'ShortTermBorrowings'];
const DEBT_NONCURRENT = [
  'LongTermDebtNoncurrent',
  'LongTermDebtAndCapitalLeaseObligationsIncludingCurrentMaturities',
];
const DEBT_FALLBACK_PARTS = ['NotesPayable', 'SecuredDebt'];

function sumPresent(points: (AnnualPoint | undefined)[]): number | null {
  const vals = points.filter((p): p is AnnualPoint => !!p).map((p) => p.value);
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null;
}

export function buildDebtSeries(facts: SecCompanyFacts['facts']): FinancialSeries | null {
  const leg = (taxonomy: string, concepts: string[]) =>
    pointsByYear(extractAnnualSeries(facts, taxonomy, concepts, 'USD', 'debt', 'Total debt', 50));
  const assemble = (
    currentAll: Map<string, AnnualPoint>,
    currentParts: Map<string, AnnualPoint>[],
    noncurrent: Map<string, AnnualPoint>,
    fallbackParts: Map<string, AnnualPoint>[],
  ): AnnualPoint[] => {
    const years = new Set<string>();
    for (const m of [currentAll, noncurrent, ...currentParts, ...fallbackParts]) {
      for (const y of m.keys()) years.add(y);
    }
    const points: AnnualPoint[] = [];
    for (const year of years) {
      const curAll = currentAll.get(year)?.value;
      const curSum = sumPresent(currentParts.map((m) => m.get(year)));
      const current = curAll ?? curSum;
      const non = noncurrent.get(year)?.value ?? sumPresent(fallbackParts.map((m) => m.get(year)));
      if (current === null && non === null) continue;
      const ends = [currentAll.get(year), noncurrent.get(year), ...currentParts.map((m) => m.get(year)), ...fallbackParts.map((m) => m.get(year))]
        .filter((p): p is AnnualPoint => !!p);
      const end = ends.map((p) => p.end).sort().pop()!;
      const filed = ends.map((p) => p.filed).sort().pop()!;
      points.push({ year, end, value: (current ?? 0) + (non ?? 0), filed });
    }
    return points.sort((a, b) => (a.end < b.end ? 1 : -1)).slice(0, 5).sort((a, b) => (a.end < b.end ? -1 : 1));
  };

  const usGaap = assemble(
    leg('us-gaap', DEBT_CURRENT_ALL),
    DEBT_CURRENT_PARTS.map((c) => leg('us-gaap', [c])),
    leg('us-gaap', DEBT_NONCURRENT),
    DEBT_FALLBACK_PARTS.map((c) => leg('us-gaap', [c])),
  );
  if (usGaap.length > 0) return { key: 'debt', label: 'Total debt', unit: 'USD', points: usGaap };
  const ifrs = assemble(
    new Map(),
    [leg('ifrs-full', ['CurrentPortionOfLongtermBorrowings'])],
    leg('ifrs-full', ['LongtermBorrowings']),
    [],
  );
  if (ifrs.length > 0) return { key: 'debt', label: 'Total debt', unit: 'USD', points: ifrs };
  return null;
}

const OCF_CONCEPTS = [
  'NetCashProvidedByUsedInOperatingActivities',
  'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations',
];
const CAPEX_CONCEPTS = [
  'PaymentsToAcquirePropertyPlantAndEquipment',
  'PaymentsToAcquireProductiveAssets',
  'PaymentsToAcquireCommercialRealEstate', // REITs
  'PaymentsToAcquireRealEstate',
];

// Free cash flow = operating cash flow − capex. Capex usually files negative
// (cash used) but some filers report the magnitude positive, so the absolute
// value is subtracted either way. A year needs both legs; banks report no
// capex tag, so they legitimately have no row.
export function buildFcfSeries(facts: SecCompanyFacts['facts']): FinancialSeries | null {
  for (const taxonomy of ['us-gaap', 'ifrs-full']) {
    const ocfConcepts = taxonomy === 'us-gaap' ? OCF_CONCEPTS : ['CashFlowsFromUsedInOperatingActivities'];
    const capexConcepts =
      taxonomy === 'us-gaap' ? CAPEX_CONCEPTS : ['PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities'];
    const ocf = pointsByYear(extractAnnualSeries(facts, taxonomy, ocfConcepts, 'USD', 'fcf', 'Free cash flow', 50));
    const capex = pointsByYear(extractAnnualSeries(facts, taxonomy, capexConcepts, 'USD', 'fcf', 'Free cash flow', 50));
    const points: AnnualPoint[] = [];
    for (const [year, o] of ocf) {
      const c = capex.get(year);
      if (!c) continue;
      points.push({
        year,
        end: o.end > c.end ? o.end : c.end,
        value: o.value - Math.abs(c.value),
        filed: o.filed > c.filed ? o.filed : c.filed,
      });
    }
    if (points.length > 0) {
      points.sort((a, b) => (a.end < b.end ? 1 : -1));
      return {
        key: 'fcf',
        label: 'Free cash flow',
        unit: 'USD',
        points: points.slice(0, 5).sort((a, b) => (a.end < b.end ? -1 : 1)),
      };
    }
  }
  return null;
}

export interface BuiltFinancials {
  series: FinancialSeries[];
  // Labels for rows the filer never reported (banks don't report gross
  // profit) so the UI can explain the gap instead of showing a bare dash.
  missing: string[];
  // True when at least one EPS point was restated for a stock split.
  splitAdjusted: boolean;
}

// Latest-quarter total debt: same leg assembly as the annual row, each leg at
// its latest reported end (ends can mix across legs by a quarter — the closest
// honest current reading).
function debtLatest(facts: SecCompanyFacts['facts']): number | null {
  const latest = (taxonomy: string, concepts: string[]) => latestAcross(facts, taxonomy, concepts, 'USD')?.value ?? null;
  const curAll = latest('us-gaap', DEBT_CURRENT_ALL);
  const curParts = DEBT_CURRENT_PARTS.map((c) => latest('us-gaap', [c])).filter((v): v is number => v !== null);
  const non = latest('us-gaap', DEBT_NONCURRENT);
  const fb = DEBT_FALLBACK_PARTS.map((c) => latest('us-gaap', [c])).filter((v): v is number => v !== null);
  const current = curAll ?? (curParts.length > 0 ? curParts.reduce((a, b) => a + b, 0) : null);
  const noncur = non ?? (fb.length > 0 ? fb.reduce((a, b) => a + b, 0) : null);
  if (current !== null || noncur !== null) return (current ?? 0) + (noncur ?? 0);
  const iCur = latest('ifrs-full', ['CurrentPortionOfLongtermBorrowings']);
  const iNon = latest('ifrs-full', ['LongtermBorrowings']);
  if (iCur !== null || iNon !== null) return (iCur ?? 0) + (iNon ?? 0);
  return null;
}

export type TtmValues = Record<string, number>;

// Trailing-twelve-month column: TTM sums for flow rows (revenue through
// free cash flow), latest reported quarter for balances (cash, debt, shares,
// assets, equity). Keys absent means no data — never zero-filled. Null
// unless at least revenue or net income has a TTM.
export function buildTtm(facts: SecCompanyFacts['facts'], ticker: string): TtmValues | null {
  const ttm: TtmValues = {};
  const flow = (key: string, tries: { taxonomy: string; concepts: string[] }[], unit: string, perShare = false) => {
    const v = ttmValue(facts, ticker, tries, unit, perShare);
    if (v !== null) ttm[key] = v;
  };
  flow('revenue', [{ taxonomy: 'us-gaap', concepts: REVENUE_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['Revenue'] }], 'USD');
  flow('grossProfit', [{ taxonomy: 'us-gaap', concepts: ['GrossProfit'] }, { taxonomy: 'ifrs-full', concepts: ['GrossProfit'] }], 'USD');
  // No filed gross quarters (META, GOOGL): TTM revenue − TTM cost of revenue.
  if (ttm.grossProfit === undefined && ttm.revenue !== undefined) {
    const cost = ttmValue(facts, ticker, COST_OF_REVENUE_TRIES, 'USD');
    if (cost !== null) ttm.grossProfit = ttm.revenue - cost;
  }
  flow('operatingIncome', [{ taxonomy: 'us-gaap', concepts: ['OperatingIncomeLoss'] }], 'USD');
  flow('netIncome', [{ taxonomy: 'us-gaap', concepts: ['NetIncomeLoss'] }, { taxonomy: 'ifrs-full', concepts: ['ProfitLoss'] }], 'USD');
  flow('eps', [{ taxonomy: 'us-gaap', concepts: ['EarningsPerShareDiluted'] }, { taxonomy: 'ifrs-full', concepts: ['DilutedEarningsLossPerShare'] }], 'USD/shares', true);
  const ocf = ttmValue(facts, ticker, [{ taxonomy: 'us-gaap', concepts: OCF_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['CashFlowsFromUsedInOperatingActivities'] }], 'USD');
  const capex = ttmValue(facts, ticker, [{ taxonomy: 'us-gaap', concepts: CAPEX_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities'] }], 'USD');
  if (ocf !== null && capex !== null) ttm.fcf = ocf - Math.abs(capex);

  const balance = (key: string, tries: { taxonomy: string; concepts: string[] }[], unit: string, splitDir?: 'shares') => {
    for (const t of tries) {
      const p = latestAcross(facts, t.taxonomy, t.concepts, unit);
      if (p) {
        ttm[key] = splitDir === 'shares' ? p.value * splitFactor(ticker, p.end, p.filed) : p.value;
        return;
      }
    }
  };
  balance('cash', [{ taxonomy: 'us-gaap', concepts: CASH_CONCEPTS }, { taxonomy: 'ifrs-full', concepts: ['CashAndCashEquivalents'] }], 'USD');
  balance('shares', [{ taxonomy: 'us-gaap', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'] }, { taxonomy: 'ifrs-full', concepts: ['AdjustedWeightedAverageShares', 'WeightedAverageShares'] }], 'shares', 'shares');
  balance('assets', [{ taxonomy: 'us-gaap', concepts: ['Assets'] }, { taxonomy: 'ifrs-full', concepts: ['Assets'] }], 'USD');
  balance('equity', [{ taxonomy: 'us-gaap', concepts: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'] }, { taxonomy: 'ifrs-full', concepts: ['Equity', 'EquityAttributableToOwnersOfParent'] }], 'USD');
  const debt = debtLatest(facts);
  if (debt !== null) ttm.debt = debt;

  if (ttm.revenue === undefined && ttm.netIncome === undefined) return null;
  return ttm;
}

export function buildFinancials(facts: SecCompanyFacts['facts'], ticker: string): BuiltFinancials {
  const out: FinancialSeries[] = [];
  const missing: string[] = [];
  let splitAdjusted = false;
  for (const def of SERIES_DEFS) {
    let found: FinancialSeries | null = null;
    if (def.custom === 'debt') found = buildDebtSeries(facts);
    else if (def.custom === 'fcf') found = buildFcfSeries(facts);
    else {
      for (const t of def.tries) {
        found = extractAnnualSeries(facts, t.taxonomy, t.concepts, def.unit, def.key, def.label);
        if (found) break;
      }
    }
    if (!found && def.key === 'grossProfit') {
      // No gross subtotal on the face statement (META, GOOGL): derive
      // revenue − cost of revenue. The revenue def runs first, so it's
      // already in `out` when this runs.
      const revenue = out.find((s) => s.key === 'revenue');
      let cost: FinancialSeries | null = null;
      for (const t of COST_OF_REVENUE_TRIES) {
        cost = extractAnnualSeries(facts, t.taxonomy, t.concepts, 'USD', 'costOfRevenue', 'Cost of revenue');
        if (cost) break;
      }
      const points = deriveGrossProfit(revenue, cost);
      if (points) found = { key: def.key, label: def.label, unit: def.unit, points };
    }
    if (!found) {
      missing.push(def.label);
      continue;
    }
    if (def.splitDir) {
      found = {
        ...found,
        points: found.points.map((p) => {
          const f = splitFactor(ticker, p.end, p.filed);
          if (f !== 1) splitAdjusted = true;
          if (f === 1) return p;
          return { ...p, value: def.splitDir === 'per-share' ? p.value / f : p.value * f };
        }),
      };
    }
    out.push(found);
  }
  return { series: out, missing, splitAdjusted };
}

function formatAddress(b?: SecSubmissions['addresses']): string | null {
  const a = b?.business;
  if (!a) return null;
  const parts = [a.street1, a.city, a.stateOrCountry, a.zipCode].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

// Combines SEC + Nasdaq + Wikipedia. Never throws for a found ticker: missing
// pieces become nulls with warnings, so the page degrades honestly.
export async function getStockData(rawTicker: string): Promise<StockResponse | null> {
  const ticker = normalizeTicker(rawTicker);
  if (!ticker) return null;
  const variants = tickerVariants(ticker);
  const warnings: string[] = [];

  const [mapResult, nasdaqResult, wikiResult] = await Promise.allSettled([
    fetchSecTickerMap(),
    fetchNasdaq(variants[0]),
    fetchWikidataCompany(variants),
  ]);
  const wiki = wikiResult.status === 'fulfilled' ? wikiResult.value : null;
  const map = mapResult.status === 'fulfilled' ? mapResult.value : null;
  if (mapResult.status === 'rejected') warnings.push('SEC ticker directory unreachable — trying quote only.');
  const entry = map ? variants.map((v) => map.get(v)).find(Boolean) : undefined;
  const nasdaq = nasdaqResult.status === 'fulfilled' ? nasdaqResult.value : null;
  if (nasdaqResult.status === 'rejected') warnings.push('Live quote unavailable — showing fundamentals only.');

  const q = nasdaq?.quote;
  const hasQuote = !!q?.symbol && variants.includes(q.symbol.toUpperCase()) && nasdaqUsable(q);
  if (!entry && !hasQuote) return null;

  const cikPadded = entry ? cikPad(entry.cik) : null;
  const [subResult, factsResult] = cikPadded
    ? await Promise.allSettled([fetchSubmissions(cikPadded), fetchCompanyFacts(cikPadded)])
    : [{ status: 'rejected' } as const, { status: 'rejected' } as const];
  const sub = subResult.status === 'fulfilled' ? subResult.value : null;
  const facts = factsResult.status === 'fulfilled' ? factsResult.value : null;
  if (cikPadded && subResult.status === 'rejected') warnings.push('SEC company profile unreachable.');
  if (cikPadded && factsResult.status === 'rejected') warnings.push('SEC fundamentals unreachable.');

  const companyName = pickCompanyName(sub?.name, q?.companyName, entry?.title, ticker);

  // Company overview, business, competition, and risks in the company's own
  // words, from the latest annual filing's full text. Best-effort: any failure
  // keeps the section stubs, and foreign filers' 20-F maps onto Items 4/3.
  // Fetched before the overview so the overview can reuse the same excerpt.
  let filingInsights: FilingInsights | null = null;
  const annualFiling = sub && cikPadded ? findAnnualFiling(sub.filings?.recent, cikPadded) : null;
  if (annualFiling) {
    try {
      filingInsights = buildFilingInsights(
        await fetchFilingText(annualFiling.url),
        annualFiling.form,
        annualFiling.url,
        annualFiling.filingDate,
      );
    } catch {
      /* stubs stay */
    }
  }

  // Company overview from the 10-K business excerpt (SEC submissions
  // description as the fallback for filers with no readable Item 1 — ETFs and
  // funds). No Wikipedia: every profile section now reads off the filing.
  const description: StockDescription | null = buildOverviewDescription(
    filingInsights?.business,
    filingInsights?.sourceUrl,
    companyName,
    sub?.description,
    cikPadded,
    wiki,
  );
  if (!description) warnings.push('No matching company overview found — check the filings below for the business description.');

  const built = facts?.facts ? buildFinancials(facts.facts, ticker) : { series: [], missing: [], splitAdjusted: false };
  const financials = built.series;
  if (cikPadded && financials.length === 0) {
    warnings.push('No annual financials in XBRL — common for ETFs, funds, and recent filers.');
  }

  // Price history feeds the P/E and P/S year-end multiples, the price
  // chart, and trailing returns. Fetched only when financials exist, after
  // the quote calls settle to stay gentle with Nasdaq's rate limits.
  let peHistory: PePoint[] | null = null;
  let psHistory: PePoint[] | null = null;
  let priceHistory: PricePoint[] | null = null;
  const epsSeries = financials.find((s) => s.key === 'eps');
  if (financials.length > 0) {
    try {
      const closes = await fetchNasdaqHistorical(variants[0]);
      if (closes.length > 0) {
        if (epsSeries) peHistory = buildPeHistory(epsSeries, closes);
        psHistory = buildPsHistory(
          financials.find((s) => s.key === 'revenue'),
          financials.find((s) => s.key === 'shares'),
          closes,
        );
        priceHistory = downsampleWeekly(closes);
      }
    } catch {
      /* multiples and chart stay empty; the table still renders */
    }
  }

  const sharesPoint = facts?.facts ? extractLatestPoint(facts.facts, 'dei', 'EntityCommonStockSharesOutstanding') : null;
  const deiShares =
    sharesPoint && sharesPoint.value > 0
      ? sharesPoint.value * splitFactor(ticker, sharesPoint.end, sharesPoint.filed)
      : null;
  const employees = facts?.facts ? extractLatestPoint(facts.facts, 'dei', 'EntityNumberOfEmployees') : null;

  const s = nasdaq?.summary?.summaryData ?? {};
  const price = hasQuote ? parseNum(q!.primaryData!.lastSalePrice) : null;
  let marketCap = parseNum(s.MarketCap?.value);
  let marketCapEstimated = false;
  if (marketCap === null && price !== null && deiShares !== null) {
    marketCap = price * deiShares;
    marketCapEstimated = true;
  }
  const resolvedShares = resolveSharesOutstanding(deiShares, marketCap, price);
  const week52 = (s.FiftTwoWeekHighLow?.value ?? s.FiftyTwoWeekHighLow?.value ?? '').split('/');
  const quote: StockQuote | null = hasQuote ? extractQuote(q) : null;

  // Dividend yield, computed the same way for every company: trailing
  // twelve months of dividends per share ÷ current price. XBRL first (works
  // for NYSE tickers, where Nasdaq publishes no dividend history), Nasdaq's
  // annualised figure as backup. A us-gaap filer with neither pays nothing
  // ('None'); anything else without data stays unknown (null).
  let dividendYield: string | null = null;
  const ttmDps = facts?.facts ? ttmDividendsPerShare(facts.facts, ticker) : null;
  const annDps = parseNum(s.AnnualizedDividend?.value);
  const dps = ttmDps !== null && ttmDps > 0 ? ttmDps : annDps !== null && annDps > 0 ? annDps : null;
  if (dps !== null && price !== null && price > 0) {
    dividendYield = `${((dps / price) * 100).toFixed(2)}%`;
  } else if (facts?.facts?.['us-gaap']) {
    dividendYield = 'None';
  }

  const filings = sub ? pickFilings(sub.filings?.recent, cikPadded!, ['10-K', '10-Q', '8-K', '20-F', '40-F'], 12) : [];

  return {
    ticker,
    companyName,
    exchange: sub?.exchanges?.[0] ?? q?.exchange ?? null,
    quote,
    stats: {
      marketCap,
      marketCapEstimated,
      week52High: week52.length === 2 ? parseNum(week52[0]) : null,
      week52Low: week52.length === 2 ? parseNum(week52[1]) : null,
      sector: s.Sector?.value && s.Sector.value !== 'N/A' ? s.Sector.value : null,
      // Nasdaq taxonomy only — no SEC SIC fallback, so every ticker is
      // classified by the same source (the header and card read these too).
      industry: s.Industry?.value && s.Industry.value !== 'N/A' ? s.Industry.value : null,
      dividendYield,
      avgVolume: parseNum(s.AverageVolume?.value),
      dpsTtm: dps,
    },
    profile: sub
      ? {
          cik: cikPadded!,
          sic: sub.sic ?? null,
          sicDescription: sub.sicDescription ?? null,
          address: formatAddress(sub.addresses),
          fiscalYearEnd: sub.fiscalYearEnd ?? null,
          stateOfIncorporation: sub.stateOfIncorporation ?? null,
          employees: employees ? Math.round(employees.value) : null,
          sharesOutstanding: resolvedShares.value,
          sharesOutstandingEstimated: resolvedShares.estimated,
        }
      : null,
    description,
    financials: financials.length > 0 ? financials : null,
    missingFinancials: financials.length > 0 ? built.missing : [],
    splitAdjusted: built.splitAdjusted,
    peHistory,
    psHistory,
    priceHistory,
    ttm: financials.length > 0 && facts?.facts ? buildTtm(facts.facts, ticker) : null,
    filings,
    filingInsights,
    proxyUrl: sub && cikPadded ? findFormUrl(sub.filings?.recent, cikPadded, 'DEF 14A') : null,
    warnings,
    fetchedAt: new Date().toISOString(),
  };
}
