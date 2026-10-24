'use client';

import Sheet from './Sheet';

// Confirm Restart / New game when a game is in progress.
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  body,
  confirmLabel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  body: string;
  confirmLabel: string;
}) {
  return (
    <Sheet open={open} onClose={onCancel} label={title}>
      <h2 className="games-type-headline">{title}</h2>
      <p className="games-type-body mt-2" style={{ color: 'var(--text-2)' }}>
        {body}
      </p>
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="games-touch games-press games-type-callout flex-1 rounded-[14px] px-4"
          style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
        >
          Keep playing
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="games-touch games-press games-type-callout flex-1 rounded-[14px] px-4"
          // Deep destructive red: white text clears 4.5:1 here, while it
          // fails on the brighter --danger (≈3.4:1).
          style={{ background: '#d70015', color: '#fff' }}
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
