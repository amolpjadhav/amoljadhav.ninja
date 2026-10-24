'use client';

import { useEffect } from 'react';

// Short top-center pill ("Not in word list", "Copied"). Controlled by the
// parent: pass a message + key that changes per toast. The key remounts the
// inner pill so each toast gets a fresh 2.2 s dismissal timer.
export default function Toast({
  message,
  toastKey,
  onDone,
}: {
  message: string | null;
  toastKey: number;
  onDone: () => void;
}) {
  if (!message) return null;
  return <ToastPill key={toastKey} message={message} onDone={onDone} />;
}

function ToastPill({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
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
