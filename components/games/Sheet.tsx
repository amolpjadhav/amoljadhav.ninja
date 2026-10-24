'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Bottom sheet (mobile) / centered modal (desktop), r-xl, drag handle,
// backdrop blur(20px). Escape/backdrop close; body scroll locks, focus is
// trapped inside while open and returns to the trigger on close.
export default function Sheet({
  open,
  onClose,
  label,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? [...panel.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter(
            (el) => !el.hasAttribute('disabled'),
          )
        : [];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0] as HTMLElement;
      const last = items[items.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      (prevFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open ]);

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
        ref={panelRef}
        className="games-sheet-anim relative w-full sm:max-w-md max-h-[85dvh] flex flex-col overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-xl)',
        }}
      >
        <div className={`overflow-y-auto px-6 pt-3 ${footer ? 'pb-4' : 'pb-6'}`}>
          <div className="sm:hidden flex justify-center pb-3" aria-hidden>
            <span className="block w-10 h-1 rounded-full bg-white/20" />
          </div>
          {children}
        </div>
        {footer ? (
          <div
            className="px-6 pt-3 pb-6 shrink-0"
            style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--hairline)' }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
