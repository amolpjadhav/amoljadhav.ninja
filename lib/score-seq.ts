// Compact sequence codec for the chess score card: the results tape
// (ordered squares + hit/miss) travels through the share URL into the
// OG image route. One entry = square (2 chars) + flag ('1' hit, '0'
// miss), e.g. "b21a80". Only [a-h1-8] and 0/1, so no URL-encoding needed.
export interface SeqMark {
  sq: string;
  ok: boolean;
}

export const MAX_SEQ = 64;

const CHUNK = /^[a-h][1-8][01]$/;

export function encodeSeq(past: SeqMark[]): string {
  return past
    .slice(0, MAX_SEQ)
    .filter((m) => /^[a-h][1-8]$/.test(m.sq))
    .map((m) => `${m.sq}${m.ok ? '1' : '0'}`)
    .join('');
}

export function parseSeq(raw: string | null): SeqMark[] {
  if (!raw) return [];
  const out: SeqMark[] = [];
  for (let i = 0; i + 3 <= raw.length && out.length < MAX_SEQ; i += 3) {
    const chunk = raw.slice(i, i + 3);
    if (!CHUNK.test(chunk)) continue;
    out.push({ sq: chunk.slice(0, 2), ok: chunk[2] === '1' });
  }
  return out;
}

/** Unique missed squares in first-miss order, mirroring the results UI. */
export function seqMissed(seq: SeqMark[]): string[] {
  const seen = new Set<string>();
  const missed: string[] = [];
  for (const m of seq) {
    if (!m.ok && !seen.has(m.sq)) {
      seen.add(m.sq);
      missed.push(m.sq);
    }
  }
  return missed;
}
