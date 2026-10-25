'use client';

import { useEffect } from 'react';

// Short top-center pill ("Not in word list", "Copied"). Controlled by the
// parent: pass a message + key that changes per toast. The key remounts the
// inner pill so each toast gets a fresh 2.2 s dismissal timer.
export default function Toast({
  message,
  toastKey,
  onDone,
  inline,
}: {
  message: string | null;
  toastKey: number;
  onDone: () => void;
  /** Render in flow (inside a reserved slot) instead of fixed top-center. */
  inline?: boolean;
}) {
  if (!message) return null;
  return <ToastPill key={toastKey} message={message} onDone={onDone} inline={inline} />;
}

function ToastPill({
  message,
  onDone,
  inline,
}: {
  message: string;
  onDone: () => void;
  inline?: boolean;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={
        inline
          ? 'pointer-events-none'
          : 'fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none'
      }
    >
      <p
        role="status"
        aria-live="polite"
        className="games-type-callout px-4 py-2.5 rounded-full whitespace-nowrap"
        style={{
          background: 'var(--surface-3)',
          color: 'var(--text-1)',
          border: '1px solid var(--hairline)',
        }}
      >
        {message}
      </p>
    </div>
  );
}
