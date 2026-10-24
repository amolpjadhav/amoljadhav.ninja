'use client';

// Label (Micro) + value (Headline, tabular). e.g. TIME 04:12.
export default function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="inline-flex flex-col items-center px-3 py-1 rounded-[10px] shrink-0"
      style={{ background: 'var(--surface-2)' }}
      role="status"
      aria-label={`${label} ${value}`}
    >
      <span className="games-type-micro" style={{ color: 'var(--text-3)' }}>
        {label}
      </span>
      <span className="games-type-headline tabular-nums leading-tight">{value}</span>
    </div>
  );
}
