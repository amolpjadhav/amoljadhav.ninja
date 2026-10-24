'use client';

import Link from 'next/link';
import Sheet from './Sheet';
import type { GameMeta } from './registry';

// Identical structure for every game: outcome title, stat grid, streak,
// [Share] [Play again] [Next game →].
export default function ResultSheet({
  open,
  game,
  next,
  outcome,
  context,
  stats,
  streak,
  onShare,
  onPlayAgain,
  onClose,
}: {
  open: boolean;
  game: GameMeta;
  next: GameMeta;
  outcome: string;
  context: string;
  stats: { label: string; value: string }[];
  /** Consecutive-win streak; shown as "🔥 Streak n" when present. */
  streak?: number | null;
  onShare: () => void;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`${game.name} result`}>
      <div className="text-center flex flex-col items-center">
        <span
          className="games-pop inline-flex items-center justify-center w-14 h-14 rounded-full games-type-title"
          style={{ background: 'var(--game-accent)', color: '#000' }}
          aria-hidden
        >
          ✓
        </span>
        <h2 className="games-type-title mt-3">{outcome}</h2>
        <p className="games-type-callout mt-1" style={{ color: 'var(--text-2)' }}>
          {context}
        </p>
      </div>
      <dl
        className="grid mt-5 rounded-[14px] overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, Math.min(3, stats.length))}, 1fr)`,
          background: 'var(--surface-2)',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center px-2 py-3">
            <dd className="games-type-headline tabular-nums order-first">{s.value}</dd>
            <dt className="games-type-micro" style={{ color: 'var(--text-3)' }}>
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
      {typeof streak === 'number' && streak > 1 && (
        <p className="games-type-callout mt-3 text-center" style={{ color: 'var(--text-2)' }}>
          🔥 Streak {streak}
        </p>
      )}
      <div className="flex flex-col gap-2 mt-5">
        <button
          type="button"
          onClick={onShare}
          className="games-touch games-press games-type-callout rounded-[14px] px-5"
          style={{ background: 'var(--game-accent)', color: '#000' }}
        >
          Share
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="games-touch games-press games-type-callout flex-1 rounded-[14px] px-4"
            style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
          >
            Play again
          </button>
          <Link
            href={`/games/${next.slug}`}
            onClick={onClose}
            className="games-touch games-press games-type-callout flex-1 rounded-[14px] px-4 inline-flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
          >
            Next: {next.name} →
          </Link>
        </div>
      </div>
    </Sheet>
  );
}
