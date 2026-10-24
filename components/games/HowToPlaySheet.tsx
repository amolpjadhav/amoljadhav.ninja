'use client';

import Sheet from './Sheet';

// 3 short steps + "Why it works" (moved here from the article).
export default function HowToPlaySheet({
  open,
  onClose,
  gameName,
  steps,
  whyItWorks,
}: {
  open: boolean;
  onClose: () => void;
  gameName: string;
  steps: { title: string; body: string }[];
  whyItWorks: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`How to play ${gameName}`}>
      <h2 className="games-type-title mb-4">How to play</h2>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-3 p-3 rounded-[14px]"
            style={{ background: 'var(--surface-2)' }}
          >
            <span
              className="games-type-headline shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-full"
              style={{ background: 'var(--game-accent)', color: '#000' }}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="games-type-callout">{s.title}</p>
              <p className="games-type-caption" style={{ color: 'var(--text-2)' }}>
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <h3 className="games-type-headline mt-5 mb-2">Why it works</h3>
      <p className="games-type-body" style={{ color: 'var(--text-2)' }}>
        {whyItWorks}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="games-touch games-press games-type-callout w-full mt-5 rounded-[14px] px-5"
        style={{ background: 'var(--game-accent)', color: '#000' }}
      >
        Play
      </button>
    </Sheet>
  );
}
