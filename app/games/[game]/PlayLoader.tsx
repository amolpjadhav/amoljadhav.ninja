'use client';

import dynamic from 'next/dynamic';
import { GAME_BY_SLUG, type GameSlug } from '@/components/games/registry';

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
const ChessPlay = dynamic(() => import('@/components/games/play/ChessPlay'), {
  ssr: false,
  loading: () => <BoardSkeleton label="Loading Chess…" />,
});

function BoardSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10" aria-busy="true" aria-label={label}>
      <div className="games-board-slot games-card" />
    </div>
  );
}

export default function PlayLoader({ slug, initialMode }: { slug: GameSlug; initialMode: string }) {
  // --game-accent must cover the whole play tree INCLUDING the sheets:
  // ResultSheet/HowToPlaySheet/ConfirmDialog render as GameShell siblings,
  // so a token set only on GameShell's root never reaches them (black
  // text on a transparent background). One wrapper here fixes all games.
  const accent = GAME_BY_SLUG[slug].accent;
  let play: React.ReactNode;
  switch (slug) {
    case 'five-letters':
      play = <FiveLettersPlay initialMode={initialMode} />;
      break;
    case 'minesweeper':
      play = <MinesweeperPlay initialMode={initialMode} />;
      break;
    case 'sudoku':
      play = <SudokuPlay initialMode={initialMode} />;
      break;
    case 'code-breaker':
      play = <CodeBreakerPlay initialMode={initialMode} />;
      break;
    case '2048':
      play = <G2048Play initialMode={initialMode} />;
      break;
    case 'chess':
      play = <ChessPlay initialMode={initialMode} />;
      break;
  }
  return <div style={{ ['--game-accent' as string]: accent }}>{play}</div>;
}
