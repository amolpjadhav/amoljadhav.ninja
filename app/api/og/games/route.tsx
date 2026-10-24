import { ImageResponse } from 'next/og';
import { parseCardParams } from '@/lib/games/share';
import type { Mark } from '@/lib/games/five-letters';

// Personalized score card for the classic-games article, sibling of
// /api/og/score (chess notation). GET /api/og/games?g=code-breaker&big=4/10&…
// All params are re-validated via parseCardParams — never trust the URL.
export const runtime = 'edge';

const W = 1200;
const H = 630;
const BG = '#0c0e10';
const PANEL = '#14171a';
const INK = '#f3ecd9';
const MUTED = '#9aa3a8';
const GREEN = '#0aee3c';

// Per-game accent (spec §2 tokens); the query-param API is unchanged —
// the accent is derived from the existing `g` param.
const ACCENT: Record<string, string> = {
  'five-letters': '#64D2FF',
  minesweeper: '#BF5AF2',
  sudoku: '#FF9F0A',
  'code-breaker': '#FF6FB5',
  'game-2048': '#30D158',
};

const PLAY_SLUG: Record<string, string> = {
  'five-letters': 'five-letters',
  minesweeper: 'minesweeper',
  sudoku: 'sudoku',
  'code-breaker': 'code-breaker',
  'game-2048': '2048',
};
const TILE: Record<Mark, string> = { correct: '#0d9488', present: '#E0A33A', absent: '#2b3136' };

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; og-image/1.0)' },
    }).then((r) => {
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
  const card = parseCardParams((k) => q.get(k)) ?? {
    game: 'five-letters' as const,
    label: 'Classic Games',
    big: '—',
    line: '',
    stats: [] as [string, string][],
    grid: [] as Mark[][],
  };
  const font = await loadFont();
  const accent = ACCENT[card.game] ?? GREEN;
  const playSlug = PLAY_SLUG[card.game] ?? card.game;

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
        <div style={{ width: 10, background: accent, borderRadius: 5, marginRight: 56 }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <span style={{ color: accent, fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>
            {card.label.toUpperCase()}
          </span>
          {card.big === '—' && card.stats.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12 }}>
              <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1.05 }}>CAN YOU BEAT IT?</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12 }}>
              <span style={{ fontSize: 170, fontWeight: 900, lineHeight: 1 }}>{card.big}</span>
            </div>
          )}
          {card.line ? (
            <div style={{ fontSize: 30, color: MUTED, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>
              {card.line.toUpperCase()}
            </div>
          ) : null}

          {card.stats.length > 0 ? (
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              {card.stats.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: PANEL,
                    borderRadius: 14,
                    paddingTop: 14,
                    paddingBottom: 14,
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                >
                  <span style={{ fontSize: 20, color: MUTED, fontWeight: 700, letterSpacing: 2 }}>
                    {label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 36, fontWeight: 800 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ fontSize: 26, color: MUTED, marginTop: 32 }}>
            amoljadhav.ai/games/{playSlug}
          </div>
        </div>

        {card.grid.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 8,
              marginLeft: 40,
            }}
          >
            {card.grid.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: 8 }}>
                {row.map((m, c) => (
                  <div
                    key={c}
                    style={{ width: 56, height: 56, borderRadius: 10, background: TILE[m] }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: font ? [{ name: 'Inter', data: font, weight: 900, style: 'normal' }] : undefined,
    },
  );
}
