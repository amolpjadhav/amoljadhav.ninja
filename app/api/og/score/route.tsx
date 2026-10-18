import { ImageResponse } from 'next/og';
import { parseSeq, seqMissed } from '@/lib/score-seq';
import { rankFor } from '@/lib/games/ranks';

// Personalized score card for link previews (X/Twitter, iMessage, …).
// GET /api/og/score?beat=20&d=30&avg=1.5&best=1&seq=b21e50
// Legacy links (?score=&total=&secs=) still render: beat falls back to
// score, d to secs. All params are validated and clamped — never trust
// the query string.
//
// Apple-style design: dark ambient glows, knight squircle, giant score,
// gold rank pill, and a rounded board panel with ×-marked misses. The
// bottom 80px stays EMPTY (X overlays og:title there). Rank glyphs come
// from Noto Sans Symbols 2, fetched like Inter — the edge runtime ships
// no chess-glyph font of its own.
export const runtime = 'edge';

const W = 1200;
const H = 630;
const INK = '#ffffff';
const MUTED = '#9aa3a8';
const GREEN = '#22c55e';
const DARK_GREEN = '#052e16';
const MISS = '#e5484d';
const SQ = 48;
const GAP = 6;
const DURATIONS = [15, 30, 60];

function clampNum(v: string | null, min: number, max: number): number | null {
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

async function fontCss(family: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;900&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; og-image/1.0)' } },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Font URL of the @font-face block covering a codepoint (unicode-range). */
function pickUrl(css: string, codepoint: number): string | null {
  const blocks = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
  for (const b of blocks) {
    const url = b.match(/url\((https:\/\/[^)]+)\)/)?.[1];
    const ranges = b.match(/unicode-range:\s*([^;]+);/)?.[1];
    if (!url) continue;
    // No unicode-range means the whole font: covers every codepoint.
    if (!ranges) return url;
    for (const part of ranges.split(',')) {
      const m = part.trim().match(/U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?/);
      if (!m) continue;
      const lo = parseInt(m[1], 16);
      const hi = m[2] ? parseInt(m[2], 16) : lo;
      if (codepoint >= lo && codepoint <= hi) return url;
    }
  }
  return null;
}

async function loadFontBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const beatN = clampNum(q.get('beat'), 0, 999);
  const scoreN = clampNum(q.get('score'), 0, 999);
  const n = Math.round(beatN ?? scoreN ?? 0);
  const dRaw = Number(q.get('d') ?? q.get('secs'));
  const duration = DURATIONS.includes(dRaw) ? dRaw : null;
  const total = Math.round(clampNum(q.get('total'), 1, 999) ?? Math.max(n, 1));
  const avgN = clampNum(q.get('avg'), 0, 99);
  const isBest = q.get('best') === '1';
  const seq = parseSeq(q.get('seq'));

  const rank = duration !== null ? rankFor(n, duration) : null;
  const misses = seq.length > 0 ? seqMissed(seq).length : n === 0 ? 0 : Math.max(0, total - n);
  const lineParts = [
    rank ? `${rank.rank} speed` : null,
    avgN !== null ? `${avgN}s each` : null,
    `${misses} ${misses === 1 ? 'miss' : 'misses'}`,
  ].filter((p): p is string => p !== null);

  const status = new Map<string, boolean>();
  for (const m of seq) status.set(m.sq, m.ok);

  const [interCss, symbolsCss] = await Promise.all([fontCss('Inter'), fontCss('Noto Sans Symbols 2')]);
  const interUrl = interCss ? pickUrl(interCss, 0x41) : null;
  // Chess knights live at U+265E; also cover the whole pieces block.
  const symbolsUrl = symbolsCss ? pickUrl(symbolsCss, 0x265e) : null;
  const [interData, symbolsData] = await Promise.all([
    interUrl ? loadFontBuffer(interUrl) : null,
    symbolsUrl ? loadFontBuffer(symbolsUrl) : null,
  ]);
  const fonts = [
    ...(interData ? [{ name: 'Inter', data: interData, weight: 900 as const, style: 'normal' as const }] : []),
    ...(symbolsData
      ? [{ name: 'Noto Sans Symbols 2', data: symbolsData, weight: 400 as const, style: 'normal' as const }]
      : []),
  ];
  const family = fonts.length > 0 ? 'Inter, "Noto Sans Symbols 2", sans-serif' : 'sans-serif';

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const board = [8, 7, 6, 5, 4, 3, 2, 1].map((rankNum) => (
    <div key={rankNum} style={{ display: 'flex', gap: GAP }}>
      {files.map((f, i) => {
        const sq = `${f}${rankNum}`;
        const hit = status.get(sq) ?? null;
        const light = ((8 - rankNum + i) % 2 + 2) % 2 === 0;
        return (
          <div
            key={sq}
            style={{
              width: SQ,
              height: SQ,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: hit === true ? GREEN : hit === false ? MISS : light ? '#20262b' : '#14181c',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {hit === false ? '×' : ''}
          </div>
        );
      })}
    </div>
  ));

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          backgroundColor: '#05070a',
          backgroundImage:
            'radial-gradient(600px 420px at 12% 8%, rgba(34,197,94,0.20), transparent 70%), radial-gradient(720px 520px at 92% 105%, rgba(59,130,246,0.18), transparent 70%)',
          color: INK,
          fontFamily: family,
          paddingTop: 56,
          paddingBottom: 80,
          paddingLeft: 64,
          paddingRight: 64,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: DARK_GREEN,
                fontSize: 34,
                fontWeight: 400,
              }}
            >
              {symbolsData ? '♞' : 'N'}
            </div>
            {isBest ? (
              <span
                style={{
                  background: GREEN,
                  color: '#06110a',
                  fontSize: 20,
                  fontWeight: 900,
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 14,
                  paddingRight: 14,
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  marginLeft: 14,
                }}
              >
                NEW BEST
              </span>
            ) : null}
          </div>

          <div style={{ fontSize: 33, fontWeight: 700, marginTop: 14, lineHeight: 1.25 }}>
            How fast can you read a chessboard?
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 160, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>{String(n)}</div>
            <div
              style={{
                fontSize: 34,
                color: MUTED,
                fontWeight: 600,
                marginLeft: 20,
                lineHeight: 1.2,
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              {duration !== null ? `chess squares in ${duration} seconds` : 'chess squares named'}
            </div>
          </div>

          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 14 }}>{lineParts.join(' · ')}</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: 32,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 28,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>{board}</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
