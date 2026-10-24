'use client';

import type { ReactNode } from 'react';

// Row of large rounded buttons under the board; the primary action is
// filled with the game's accent. Pinned to the bottom safe area on mobile.
export default function ControlDock({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 flex items-center justify-center gap-2.5 py-3 bg-[#0B0B0D]/90 backdrop-blur-xl lg:static lg:bg-transparent lg:backdrop-blur-none"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}

export function DockButton({
  children,
  onClick,
  primary,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="games-touch games-press games-type-callout rounded-[14px] px-5 inline-flex items-center justify-center gap-2 disabled:opacity-40"
      style={
        primary
          ? { background: 'var(--game-accent)', color: '#000' }
          : { background: 'var(--surface-2)', color: 'var(--text-1)' }
      }
    >
      {children}
    </button>
  );
}
