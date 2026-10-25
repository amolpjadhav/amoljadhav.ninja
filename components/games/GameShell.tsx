'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import TopBar from './TopBar';
import type { GameMeta } from './registry';

// Play-view frame: TopBar + board area + dock + side panel (desktop) /
// sheets (mobile). One card level: the board sits directly on --bg.
export default function GameShell({
  game,
  mode,
  onModeChange,
  stats,
  menu,
  board,
  tray,
  dock,
  sidePanel,
  howToPlay,
  wide,
  narrow,
  squareBoard = true,
}: {
  game: GameMeta;
  mode: string;
  onModeChange: (mode: string) => void;
  stats: ReactNode;
  menu: ReactNode;
  board: ReactNode;
  /** Optional strip between board and dock (five-letters keyboard). */
  tray?: ReactNode;
  dock: ReactNode;
  sidePanel: ReactNode;
  howToPlay: ReactNode;
  /** Wider centered group (chess): 1200px cap, 32px gutters. */
  wide?: boolean;
  /** Single centered column (five letters): 520px cap, no side panel. */
  narrow?: boolean;
  /** Square locked board slot (default). Chess opts out: its board column
   *  holds player bars + footer, so it owns its own sizing. */
  squareBoard?: boolean;
}) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ ['--game-accent' as string]: game.accent }}
    >
      <TopBar
        game={game}
        mode={mode}
        onModeChange={onModeChange}
        stats={stats}
        menu={menu}
      />
      <div
        className={
          narrow
            ? 'flex-1 w-full mx-auto px-4 pb-8 flex flex-col max-w-[520px]'
            : `flex-1 w-full mx-auto px-4 md:px-6 pb-8 grid gap-6 lg:grid-cols-[1fr_320px] ${wide ? 'max-w-[1200px] lg:gap-8' : 'max-w-6xl'}`
        }
      >
        <main className="flex flex-col gap-4 min-w-0">
          <div className={squareBoard && !narrow ? 'games-board-slot games-board-lock' : 'min-w-0'}>
            {board}
          </div>
          {tray}
          {dock}
        </main>
        {!narrow && (
          <aside className="hidden lg:flex flex-col gap-4 min-w-0">{sidePanel}</aside>
        )}
        {/* Mobile: how-to-play and stats surface through the ⋯ menu sheets. */}
        <div className="lg:hidden">{howToPlay}</div>
      </div>
    </div>
  );
}

// Hub frame: centered column, server-rendered SEO text lives in page.tsx.
export function HubShell({ children }: { children: ReactNode }) {
  return (
    <main className="w-full max-w-[1080px] mx-auto px-4 md:px-6 pt-10 pb-16 flex flex-col gap-8">
      {children}
      <footer className="pt-4 border-t border-white/10">
        <p className="games-type-caption" style={{ color: 'var(--text-3)' }}>
          <Link href="/blog" className="underline underline-offset-2">
            More writing
          </Link>{' '}
          · 2048 original by Gabriele Cirulli (MIT)
        </p>
      </footer>
    </main>
  );
}
