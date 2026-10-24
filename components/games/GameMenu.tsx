'use client';

import { useState, type ReactNode } from 'react';
import IconButton from './IconButton';
import Sheet from './Sheet';

// ⋯ menu: How to play, Reset stats, plus per-game extras (sound/theme).
export default function GameMenu({
  gameName,
  onHowToPlay,
  onResetStats,
  extra,
}: {
  gameName: string;
  onHowToPlay: () => void;
  onResetStats: () => void;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const close = () => {
    setOpen(false);
    setConfirming(false);
  };
  return (
    <>
      <IconButton label={`${gameName} settings`} onClick={() => setOpen(true)}>
        <span aria-hidden>⋯</span>
      </IconButton>
      <Sheet open={open} onClose={close} label={`${gameName} menu`}>
        <h2 className="games-type-headline mb-4">{gameName}</h2>
        {confirming ? (
          <div className="flex flex-col gap-2">
            <p className="games-type-callout" style={{ color: 'var(--text-2)' }}>
              Erase your best scores and streaks for {gameName}? This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => {
                close();
                onResetStats();
              }}
              className="games-touch games-press games-type-callout rounded-[14px] px-4"
              style={{ background: 'var(--danger)', color: '#fff' }}
            >
              Yes, reset my stats
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="games-touch games-press games-type-callout rounded-[14px] px-4"
              style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
            >
              Keep my stats
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                close();
                onHowToPlay();
              }}
              className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
              style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
            >
              How to play
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="games-touch games-press games-type-callout rounded-[14px] px-4 text-left"
              style={{ background: 'var(--surface-2)', color: 'var(--danger)' }}
            >
              Reset stats
            </button>
            {extra}
          </div>
        )}
      </Sheet>
    </>
  );
}
