import { ImageResponse } from 'next/og';
import { quizCategoryById } from '@/lib/quiz/categories';

// Personalized quiz score card for link previews (X/Twitter, iMessage, …).
// GET /api/og/quiz?deck=pocket-laws&big=9/10&line=90%25+accuracy&l1=..&v1=..
// All params are validated and clamped — never trust the query string.
// Unknown decks and malformed scores fall back to a generic quiz card.
//
// Design mirrors /api/og/score: dark ambient glows, accent squircle with
// the deck initial (edge has no emoji font, so deck emoji stays off the
// card), giant score, stat chips. The bottom 80px stays EMPTY (X overlays
// og:title there).
export const runtime = 'edge';

const W = 1200;
const H = 630;
const INK = '#ffffff';
const MUTED = '#9aa3a8';
const FALLBACK_ACCENT = '#0aee3c';

function clampInt(v: string | null, min: number, max: number): number | null {
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clean(v: string | null, max: number): string {
  if (!v) return '';
  return v
    .replace(/[^A-Za-z0-9 ·/%:.,+#'’\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

async function loadInter(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; og-image/1.0)' },
      })
    ).text();
    const block = css.match(/@font-face\s*\{[^}]+font-weight:\s*900[^}]+\}/) ?? css.match(/@font-face\s*\{[^}]+\}/g);
    const first = Array.isArray(block) ? block[0] : block;
    const url = first?.match(/url\((https:\/\/[^)]+)\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const deck = quizCategoryById(q.get('deck') ?? '');
  const scoreM = /^(\d+)\s*\/\s*(\d+)$/.exec(q.get('big') ?? '');
  const score = scoreM ? clampInt(scoreM[1], 0, 999) : null;
  const total = scoreM ? clampInt(scoreM[2], 1, 999) : null;
  const line = clean(q.get('line'), 60);
  const chips: [string, string][] = [];
  for (let i = 1; i <= 2; i += 1) {
    const label = clean(q.get(`l${i}`), 16);
    const value = clean(q.get(`v${i}`), 16);
    if (label && value) chips.push([label, value]);
  }

  const accent = deck?.accent ?? FALLBACK_ACCENT;
  const title = deck ? `${deck.title} Quiz` : 'Ideas worth keeping';
  const initial = (deck?.title ?? 'Q').slice(0, 1);
  const big = score !== null && total !== null ? `${score}/${total}` : null;

  const interData = await loadInter();
  const fonts = interData
    ? [{ name: 'Inter', data: interData, weight: 900 as const, style: 'normal' as const }]
    : [];
  const family = fonts.length > 0 ? 'Inter, sans-serif' : 'sans-serif';

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
                background: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06110a',
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              {initial}
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: MUTED, marginLeft: 16 }}>
              {title} · amoljadhav.ai/quiz
            </span>
          </div>

          {big ? (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
              <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>{big}</div>
              <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {line ? (
                  <div style={{ fontSize: 34, fontWeight: 600, color: INK, lineHeight: 1.2 }}>{line}</div>
                ) : null}
                {chips.length > 0 ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {chips.map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          gap: 10,
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 999,
                          paddingTop: 8,
                          paddingBottom: 8,
                          paddingLeft: 18,
                          paddingRight: 18,
                          fontSize: 24,
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: MUTED }}>{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 18, lineHeight: 1.15 }}>
              Short quizzes that bring back what you miss.
            </div>
          )}

          <div style={{ fontSize: 28, fontWeight: 600, color: MUTED, marginTop: 16 }}>
            Can you beat it? Play free, no ads.
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
