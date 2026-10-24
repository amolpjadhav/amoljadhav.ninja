'use client';

import type { ReactNode } from 'react';

// 44px circle button on surface-2.
export default function IconButton({
  children,
  onClick,
  label,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="games-press inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0"
      style={{
        background: active ? 'var(--game-accent)' : 'var(--surface-2)',
        color: active ? '#000' : 'var(--text-1)',
      }}
    >
      {children}
    </button>
  );
}
