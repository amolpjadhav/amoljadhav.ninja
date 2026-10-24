'use client';

import { useCallback, useState } from 'react';
import { GAME_LABEL, buildGameChallenge, buildGameChallengeXUrl, type GameId } from '@/lib/games/share';

// Per-widget share row: challenge links need no finished game — anyone
// can send friends straight at this widget mid-play. Renders the same
// in every game widget, directly above How to play.
export default function WidgetShareBar({ game }: { game: GameId }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildGameChallenge(game).anchorUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied: the X link still works.
    }
  }, [game]);

  return (
    <div className="mt-3 flex w-full items-center justify-end gap-2">
      <span className="text-xs text-white/35">Share this game</span>
      <a
        href={buildGameChallengeXUrl(game)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Challenge a friend at ${GAME_LABEL[game]} on X`}
        className="flex h-7 w-7 touch-manipulation items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/85 transition-all hover:bg-white/20 active:scale-95"
      >
        𝕏
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy link to ${GAME_LABEL[game]}`}
        className="flex h-7 touch-manipulation items-center rounded-full bg-white/10 px-2.5 text-[11px] font-bold text-white/85 transition-all hover:bg-white/20 active:scale-95"
      >
        {copied ? 'Copied ✓' : 'Copy link'}
      </button>
    </div>
  );
}
