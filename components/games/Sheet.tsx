'use client';

import { useEffect, type ReactNode } from 'react';

// Bottom sheet (mobile) / centered modal (desktop), r-xl, drag handle,
// backdrop blur(20px). Escape closes; body scroll locks while open.
export default function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      />
      <div
        className="games-sheet-anim relative w-full sm:max-w-md max-h-[85dvh] overflow-y-auto p-6 pt-3"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-xl)',
        }}
      >
        <div className="sm:hidden flex justify-center pb-3" aria-hidden>
          <span className="block w-10 h-1 rounded-full bg-white/20" />
        </div>
        {children}
      </div>
    </div>
  );
}
