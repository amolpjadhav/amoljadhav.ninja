'use client';

// Pill track on surface-2; active option is white bg + black text.
export default function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 p-1 rounded-full overflow-x-auto max-w-full"
      style={{ background: 'var(--surface-2)' }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt)}
            className="games-touch games-press games-type-callout rounded-full px-4 whitespace-nowrap"
            style={
              active
                ? { background: '#fff', color: '#000' }
                : { background: 'transparent', color: 'var(--text-2)' }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
