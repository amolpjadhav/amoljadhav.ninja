'use client';

// Inline combo chips for use inside article prose:
//   <span data-widget="skill-input" data-input="Hold L2+R2, flick LS ↓"></span>
// ArticleContent portals this into the placeholder and passes data-input as
// the `input` prop. Also exports InputChips for the SkillMoveFinder widget
// so both speak the same visual language.

type Token = { kind: 'key' | 'arrow' | 'rotate' | 'text'; value: string };

const ARROW_DIRS = ['←', '→', '↑', '↓'];
const BUTTON_NAMES = ['L1', 'L2', 'R1', 'R2', 'LB', 'LT', 'RB', 'RT', 'LS', 'RS', '△', '○', '✕', '□', '■', 'Y', 'B', 'A', 'X'];

// Splits an input string into renderable tokens: button key-caps, drawn
// arrows, a rotate glyph, and plain connective words. Anything unrecognized
// (like "Inputs TBA") falls through as text.
function tokenize(input: string): Token[] {
  const re = /(l1|l2|r1|r2|lb|lt|rb|rt|ls|rs|[△○✕□■]|\b[ybax]\b|←|→|↑|↓|rotate)/gi;
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const gap = input.slice(last, m.index).trim();
    if (gap) tokens.push({ kind: 'text', value: gap });
    const v = m[0];
    const upper = v.toUpperCase();
    tokens.push({
      kind: ARROW_DIRS.includes(v) ? 'arrow' : upper === 'ROTATE' ? 'rotate' : 'key',
      value: BUTTON_NAMES.includes(upper) ? upper : v,
    });
    last = m.index + v.length;
  }
  const rest = input.slice(last).trim();
  if (rest) tokens.push({ kind: 'text', value: rest });
  return tokens;
}

function ArrowIcon({ dir }: { dir: string }) {
  const angle = { '↑': 0, '→': 90, '↓': 180, '←': 270 }[dir] ?? 0;
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} style={{ transform: `rotate(${angle}deg)` }} aria-hidden="true">
      <path d="M8 2.5v11M3.5 8.5 8 4l4.5 4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InputChips({ input, highlight }: { input: string; highlight: boolean }) {
  const hot = highlight;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      {tokenize(input).map((t, i) => {
        if (t.kind === 'key') {
          return (
            <kbd
              key={i}
              className={`rounded-md border px-1.5 py-0.5 font-sans text-[11px] font-bold ${
                hot ? 'border-green-400/60 bg-green-400/15 text-green-300' : 'border-white/20 bg-white/10 text-white/90'
              }`}
            >
              {t.value}
            </kbd>
          );
        }
        if (t.kind === 'arrow' || t.kind === 'rotate') {
          return (
            <span
              key={i}
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                hot ? 'bg-green-400 text-black' : 'bg-white/15 text-white/90'
              }`}
            >
              {t.kind === 'arrow' ? <ArrowIcon dir={t.value} /> : <RotateIcon />}
            </span>
          );
        }
        return (
          <span key={i} className="text-xs text-white/50">
            {t.value}
          </span>
        );
      })}
    </span>
  );
}

export default function SkillInput({ input }: { input?: string }) {
  if (!input) return null;
  return <InputChips input={input} highlight={false} />;
}
