'use client';

import dynamic from 'next/dynamic';
import type { GameSlug } from '@/components/games/registry';

// Each game's JS loads only when its route opens — the hub stays lean.
// ssr:false: engines deal randomness on mount, so prerendering would
// hydrate-mismatch against the client's first board.
const FiveLettersPlay = dynamic(() => import('@/components/games/play/FiveLettersPlay'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading Five Letters…" />,
});
const MinesweeperPlay = dynamic(() => import('@/components/games/play/MinesweeperPlay'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading Minesweeper…" />,
});
const SudokuPlay = dynamic(() => import('@/components/games/play/SudokuPlay'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading Sudoku…" />,
});
const CodeBreakerPlay = dynamic(() => import('@/components/games/play/CodeBreakerPlay'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading Code Breaker…" />,
});
const G2048Play = dynamic(() => import('@/components/games/play/G2048Play'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading 2048…" />,
});

function BoardSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10" aria-busy="true" aria-label={label}>
      <div className="games-board-slot games-card" />
    </div>
  );
}

export default function PlayLoader({ slug, initialMode }: { slug: GameSlug; initialMode: string }) {
  switch (slug) {
    case 'five-letters':
      return <FiveLettersPlay initialMode={initialMode} />;
    case 'minesweeper':
      return <MinesweeperPlay initialMode={initialMode} />;
    case 'sudoku':
      return <SudokuPlay initialMode={initialMode} />;
    case 'code-breaker':
      return <CodeBreakerPlay initialMode={initialMode} />;
    case '2048':
      return <G2048Play initialMode={initialMode} />;
  }
}
