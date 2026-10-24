'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import SegmentedControl from './SegmentedControl';
import type { GameMeta } from './registry';

// Identical top bar for every game: ← back, icon + name,
// center SegmentedControl, right StatChips + ⋯ menu.
export default function TopBar({
  game,
  mode,
  onModeChange,
  stats,
  menu,
}: {
  game: GameMeta;
  mode: string;
  onModeChange: (mode: string) => void;
  stats: ReactNode;
  menu: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0B0D]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/games"
            aria-label="Back to games hub"
            className="games-touch games-press inline-flex items-center justify-center rounded-full text-lg"
            style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
          >
            ←
          </Link>
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-full shrink-0"
            style={{ background: `var(${game.accentVar})` }}
          />
          <span className="games-type-headline truncate">{game.name}</span>
          <span className="md:hidden flex-1" />
          <span className="md:hidden flex items-center gap-1.5">{menu}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 md:flex-1 md:justify-center min-w-0">
          {game.modes.length > 1 && (
            <SegmentedControl
              options={game.modes}
              value={mode}
              onChange={onModeChange}
              ariaLabel={`${game.name} mode`}
            />
          )}
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          {stats}
          {menu}
        </div>
        {/* Mobile second row: stat chips scroll horizontally. */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-0.5">{stats}</div>
      </div>
    </header>
  );
}
