import { ImageResponse } from 'next/og';

// Personalized score card for link previews (X/Twitter, iMessage, …).
// GET /api/og/score?score=16&total=20&acc=89&avg=1.8&best=1
// All params are validated and clamped — never trust the query string.
export const runtime = 'edge';

const W = 1200;
const H = 630;
const GREEN = '#4ade80';
const BG = '#0c0e10';
const PANEL = '#14171a';
const INK = '#f2f4f3';
const MUTED = '#9aa3a8';

function clampNum(v: string | null, min: number, max: number): number | null {
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; og-image/1.0)' } },
    ).then((r) => {
      if (!r.ok) throw new Error('font css');
      return r.text();
    });
    const url = css.match(/https:\/\/[^)]+\.woff2/)?.[0];
    if (!url) return null;
    const buf = await fetch(url).then((r) => {
      if (!r.ok) throw new Error('font file');
      return r.arrayBuffer();
    });
    return buf;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const score = clampNum(q.get('score'), 0, 999) ?? 0;
  const total = clampNum(q.get('total'), 1, 999) ?? 20;
  const accN = clampNum(q.get('acc'), 0, 100);
  const avgN = clampNum(q.get('avg'), 0, 99);
  const isBest = q.get('best') === '1';

  const font = await loadFont();

  // Faint 8x8 board on the right for chess identity.
  const squares = Array.from({ length: 64 }, (_, i) => {
    const light = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
    return (
      <div
        key={i}
        style={{
          width: 52,
          height: 52,
          background: light ? '#1e2422' : '#121615',
        }}
      />
    );
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          background: BG,
          color: INK,
          fontFamily: font ? 'Inter, sans-serif' : 'sans-serif',
          padding: 64,
        }}
      >
        {/* Neon edge */}
        <div style={{ width: 10, background: GREEN, borderRadius: 5, marginRight: 56 }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: GREEN, fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>
              SQUARE TRAINER
            </span>
            {isBest ? (
              <span
                style={{
                  background: GREEN,
                  color: '#06110a',
                  fontSize: 26,
                  fontWeight: 900,
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 999,
                }}
              >
                ★ NEW BEST
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12 }}>
            <span style={{ fontSize: 190, fontWeight: 900, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 72, fontWeight: 800, color: MUTED }}>/{total}</span>
          </div>
          <div style={{ fontSize: 30, color: MUTED, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>
            SQUARES NAMED IN 30 SECONDS
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 36 }}>
            {[
              ['ACCURACY', accN === null ? '—' : `${Math.round(accN)}%`],
              ['AVG / SQUARE', avgN === null ? '—' : `${avgN.toFixed(1)}s`],
              ['DRILL', 'CHESS NOTATION'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: PANEL,
                  borderRadius: 16,
                  padding: '18px 28px',
                }}
              >
                <span style={{ fontSize: 22, color: MUTED, fontWeight: 700, letterSpacing: 2 }}>
                  {label}
                </span>
                <span style={{ fontSize: 44, fontWeight: 800 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 26, color: MUTED, marginTop: 32 }}>
            amoljadhav.ai · can you beat it?
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: 416,
            alignContent: 'center',
            opacity: 0.9,
            marginLeft: 40,
          }}
        >
          {squares}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: font ? [{ name: 'Inter', data: font, weight: 900, style: 'normal' }] : undefined,
    },
  );
}
