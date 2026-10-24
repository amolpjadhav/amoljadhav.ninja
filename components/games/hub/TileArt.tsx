// Static SVG mid-game board art for the hub tiles (spec section 3).
// Server-safe: pure SVG, decorative (aria-hidden), no game logic.
// On hover the parent tile plays a tiny 2s loop via CSS (see games.css).

import type { GameSlug } from '../registry';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 120"
      className="games-tile-art"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function FiveLettersArt() {
  const rows: { letters: string; tones: string[] }[] = [
    { letters: 'CRANE', tones: ['#3A3A3C', '#3A3A3C', '#E4B43C', '#3A3A3C', '#2BA39A'] },
    { letters: 'ROAST', tones: ['#3A3A3C', '#2BA39A', '#3A3A3C', '#E4B43C', '#3A3A3C'] },
    { letters: 'CLIMB', tones: ['#2BA39A', '#2BA39A', '#3A3A3C', '#3A3A3C', '#3A3A3C'] },
  ];
  return (
    <Frame>
      {rows.map((row, r) => (
        <g key={r} className={r === 2 ? 'games-art-pop' : undefined}>
          {row.letters.split('').map((ch, c) => (
            <g key={c}>
              <rect
                x={22 + c * 32}
                y={8 + r * 36}
                width={28}
                height={28}
                rx={6}
                fill={row.tones[c]}
              />
              <text
                x={36 + c * 32}
                y={28 + r * 36}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill="#fff"
              >
                {ch}
              </text>
            </g>
          ))}
        </g>
      ))}
    </Frame>
  );
}

function MinesweeperArt() {
  // 6x4 patch: revealed numbers in classic dark-mode colors, two flags.
  const nums: { v: string; c: string }[][] = [
    [
      { v: '1', c: '#64D2FF' },
      { v: '1', c: '#64D2FF' },
      { v: '2', c: '#30D158' },
      { v: '', c: '' },
      { v: '', c: '' },
      { v: '', c: '' },
    ],
    [
      { v: '⚑', c: '#BF5AF2' },
      { v: '2', c: '#30D158' },
      { v: '3', c: '#FF453A' },
      { v: '2', c: '#30D158' },
      { v: '1', c: '#64D2FF' },
      { v: '1', c: '#64D2FF' },
    ],
    [
      { v: '1', c: '#64D2FF' },
      { v: '1', c: '#64D2FF' },
      { v: '', c: '' },
      { v: '', c: '' },
      { v: '', c: '' },
      { v: '', c: '' },
    ],
    [
      { v: '', c: '' },
      { v: '⚑', c: '#BF5AF2' },
      { v: '', c: '' },
      { v: '', c: '' },
      { v: '', c: '' },
      { v: '', c: '' },
    ],
  ];
  return (
    <Frame>
      {nums.map((row, r) =>
        row.map((cell, c) => {
          const revealed = cell.v !== '' && cell.v !== '⚑';
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={14 + c * 28}
                y={6 + r * 28}
                width={25}
                height={25}
                rx={6}
                fill={revealed ? '#0B0B0D' : '#1F2024'}
                stroke="rgba(255,255,255,.08)"
              />
              {cell.v !== '' && (
                <text
                  x={26.5 + c * 28}
                  y={24 + r * 28}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill={cell.c}
                >
                  {cell.v}
                </text>
              )}
            </g>
          );
        }),
      )}
    </Frame>
  );
}

function SudokuArt() {
  const givens = new Map([
    ['0,1', '3'],
    ['0,4', '7'],
    ['1,0', '6'],
    ['1,3', '1'],
    ['2,2', '9'],
    ['3,5', '4'],
    ['4,4', '5'],
    ['5,6', '2'],
    ['6,7', '8'],
    ['7,8', '6'],
    ['8,0', '2'],
  ]);
  const users = new Map([
    ['0,0', '5'],
    ['4,0', '7'],
    ['8,8', '1'],
  ]);
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const g = givens.get(`${r},${c}`);
      const u = users.get(`${r},${c}`);
      const hl = r === 4 && c === 4;
      cells.push(
        <g key={`${r},${c}`}>
          <rect
            x={46 + c * 12}
            y={6 + r * 12}
            width={12}
            height={12}
            fill={hl ? 'rgba(255,159,10,.35)' : 'transparent'}
          />
          {(g ?? u) && (
            <text
              x={52 + c * 12}
              y={15.5 + r * 12}
              textAnchor="middle"
              fontSize={8.5}
              fontWeight={g ? 600 : 500}
              fill={g ? '#fff' : '#0A84FF'}
            >
              {g ?? u}
            </text>
          )}
        </g>
      );
    }
  }
  const grid = [];
  for (let i = 0; i <= 9; i++) {
    const major = i % 3 === 0;
    grid.push(
      <line
        key={`v${i}`}
        x1={46 + i * 12}
        y1={6}
        x2={46 + i * 12}
        y2={114}
        stroke={major ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)'}
        strokeWidth={major ? 1.5 : 0.75}
      />,
      <line
        key={`h${i}`}
        x1={46}
        y1={6 + i * 12}
        x2={154}
        y2={6 + i * 12}
        stroke={major ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)'}
        strokeWidth={major ? 1.5 : 0.75}
      />,
    );
  }
  return (
    <Frame>
      {cells}
      {grid}
    </Frame>
  );
}

function CodeBreakerArt() {
  const pegs = ['#FF6FB5', '#FFD60A', '#0A84FF', '#30D158'];
  return (
    <Frame>
      {[0, 1].map((row) => (
        <g
          key={row}
          opacity={row === 0 ? 1 : 0.35}
          className={row === 0 ? 'games-art-pop' : undefined}
        >
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={45 + i * 32}
              cy={32 + row * 52}
              r={13}
              fill={row === 0 ? pegs[i] : '#1F2024'}
              stroke="rgba(255,255,255,.12)"
            />
          ))}
          {/* 2x2 feedback dot cluster */}
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={`f${i}`}
              cx={170 + (i % 2) * 11}
              cy={24 + row * 52 + Math.floor(i / 2) * 11}
              r={4}
              fill={row === 0 && i < 2 ? '#fff' : 'transparent'}
              stroke="rgba(255,255,255,.4)"
              strokeWidth={1.2}
            />
          ))}
        </g>
      ))}
    </Frame>
  );
}

function G2048Art() {
  const tiles = [
    { x: 30, y: 12, v: '128', bg: '#3BC46C', fg: '#fff', s: 15 },
    { x: 92, y: 12, v: '256', bg: '#5AD17F', fg: '#fff', s: 15 },
    { x: 30, y: 64, v: '512', bg: '#7EDC97', fg: '#fff', s: 15 },
    { x: 92, y: 64, v: '1024', bg: '#FFD60A', fg: '#000', s: 12 },
  ];
  return (
    <Frame>
      <rect x={18} y={4} width={164} height={112} rx={12} fill="#16171A" />
      {tiles.map((t, i) => (
        <g key={t.v} className={i === 3 ? 'games-art-pop' : undefined}>
          <rect x={t.x} y={t.y} width={58} height={44} rx={8} fill={t.bg} />
          <text
            x={t.x + 29}
            y={t.y + 28}
            textAnchor="middle"
            fontSize={t.s}
            fontWeight={700}
            fill={t.fg}
          >
            {t.v}
          </text>
        </g>
      ))}
    </Frame>
  );
}

function ChessArt() {
  // 6x4 endgame patch on the classic palette, last move tinted gold.
  const last = new Set(['2,1', '3,1']);
  return (
    <Frame>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 6 }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={14 + c * 28}
            y={6 + r * 28}
            width={28}
            height={28}
            fill={last.has(`${r},${c}`) ? 'rgba(229,192,123,.5)' : (r + c) % 2 === 0 ? '#E8DCC4' : '#B58863'}
          />
        )),
      )}
      <text x={42} y={52} textAnchor="middle" fontSize={26} aria-hidden>
        ♞
      </text>
      <text x={126} y={80} textAnchor="middle" fontSize={26} aria-hidden>
        ♜
      </text>
      <text x={98} y={52} textAnchor="middle" fontSize={26} aria-hidden>
        ♚
      </text>
    </Frame>
  );
}

export default function TileArt({ slug }: { slug: GameSlug }) {
  switch (slug) {
    case 'five-letters':
      return <FiveLettersArt />;
    case 'minesweeper':
      return <MinesweeperArt />;
    case 'sudoku':
      return <SudokuArt />;
    case 'code-breaker':
      return <CodeBreakerArt />;
    case '2048':
      return <G2048Art />;
    case 'chess':
      return <ChessArt />;
  }
}
