'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TermLine } from '@/lib/homepage';

// Human-ish typing rhythm: jittered keystrokes, a beat before Enter,
// instant output, a hold so the result can be read, a breath, next command.
const CHAR_MIN = 45;
const CHAR_VAR = 45;
const ENTER_PAUSE = 350;
const HOLD_PAUSE = 2500;
const GAP_PAUSE = 400;

type Wait = 'type' | 'hold' | 'clear';

// Loops the scripts like a real terminal: types one command, prints its
// output instantly on the next line, holds, clears, and starts the next.
// The box never resizes — an invisible copy of the longest script fixes the
// height from first paint. Pauses off-screen and in hidden tabs;
// reduced-motion readers get the steady state instantly with no typing,
// rotation, or blinking.
export default function TerminalTyper({ scripts }: { scripts: TermLine[][] }) {
  const [state, setState] = useState<{ si: number; li: number; ch: number; wait: Wait }>({
    si: 0,
    li: 0,
    ch: 0,
    wait: 'type',
  });
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    let inView = true;
    const update = () => setActive(inView && !document.hidden);
    const onVis = () => update();
    document.addEventListener('visibilitychange', onVis);
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        update();
      });
      io.observe(el);
    }
    update();
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const script = useMemo(() => scripts[state.si] ?? [], [scripts, state.si]);
  const sizer = useMemo(() => {
    const ranked = [...scripts].sort(
      (a, b) => b.reduce((n, l) => n + l.text.length, 0) - a.reduce((n, l) => n + l.text.length, 0),
    );
    return ranked[0] ?? [];
  }, [scripts]);

  useEffect(() => {
    if (reduceMotion || scripts.length === 0 || !active) return;
    if (state.wait === 'hold') {
      const t = setTimeout(() => setState((s) => ({ ...s, wait: 'clear' })), HOLD_PAUSE);
      return () => clearTimeout(t);
    }
    if (state.wait === 'clear') {
      const t = setTimeout(
        () => setState((s) => ({ si: (s.si + 1) % scripts.length, li: 0, ch: 0, wait: 'type' })),
        GAP_PAUSE,
      );
      return () => clearTimeout(t);
    }
    const line = script[state.li];
    if (!line) {
      const t = setTimeout(() => setState((s) => ({ ...s, wait: 'hold' })), 60);
      return () => clearTimeout(t);
    }
    if (line.typed && state.ch < line.text.length) {
      const t = setTimeout(
        () => setState((s) => ({ ...s, ch: s.ch + 1 })),
        CHAR_MIN + Math.random() * CHAR_VAR,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setState((s) => ({ ...s, li: s.li + 1, ch: 0 })),
      line.typed ? ENTER_PAUSE : 60,
    );
    return () => clearTimeout(t);
  }, [state, script, scripts.length, reduceMotion, active]);

  const renderLine = (line: TermLine, text: string, key: number | string, cursor: boolean, blink: boolean) => {
    if (line.text.startsWith('$')) {
      return (
        <p key={key} className="whitespace-nowrap overflow-hidden text-ellipsis leading-normal text-[#0aee3c]">
          {text.startsWith('$') ? (
            <>
              <span className="text-[#0aee3c]/50">$</span>
              {text.slice(1)}
            </>
          ) : (
            text
          )}
          {cursor && <Cursor blink={blink} />}
        </p>
      );
    }
    const body =
      text === line.text && line.href ? (
        <a href={line.href} className="transition-colors hover:text-[#0aee3c]">
          {text}
        </a>
      ) : (
        text
      );
    return (
      <p key={key} className="whitespace-nowrap overflow-hidden text-ellipsis leading-normal text-[#0aee3c]/70">
        {body}
        {cursor && <Cursor blink={blink} />}
      </p>
    );
  };

  if (scripts.length === 0) return null;

  // Steady state for reduced motion: first script, static prompt.
  if (reduceMotion) {
    const steady = scripts.slice(0, 1);
    return (
      <div ref={ref} aria-label="Site terminal">
        {steady.map((s, si) => s.map((l, i) => renderLine(l, l.text, `${si}-${i}`, false, false)))}
        <p className="whitespace-nowrap leading-normal">
          <span className="text-[#0aee3c]/50">$</span> <Cursor blink={false} />
        </p>
        <span className="sr-only">{scripts.flatMap((s) => s.map((l) => l.text)).join('. ')}</span>
      </div>
    );
  }

  const cleared = state.wait === 'clear';
  const blink = state.wait !== 'type';
  const typing =
    !cleared && state.wait === 'type' && !!script[state.li] && script[state.li].typed && state.ch < script[state.li].text.length;
  const current = cleared
    ? []
    : script.map((line, i) => {
        if (i > state.li) return null;
        const complete = i < state.li || !line.typed;
        const text = complete ? line.text : line.text.slice(0, state.ch);
        return renderLine(line, text, `c-${i}`, typing && i === state.li, false);
      });

  return (
    <div ref={ref} className="relative" aria-label="Site terminal">
      {/* Sizer: invisible longest script pins the box height before typing starts. */}
      <div aria-hidden className="invisible">
        {sizer.map((l, i) => renderLine(l, l.text, `s-${i}`, false, false))}
        <p className="whitespace-nowrap leading-normal text-[#0aee3c]">$</p>
      </div>
      {/* Live overlay; screen readers get the static summary instead. */}
      <div aria-hidden className="absolute inset-0">
        {current}
        {!typing && (
          <p className="whitespace-nowrap leading-normal">
            <span className="text-[#0aee3c]/50">$</span> <Cursor blink={blink} />
          </p>
        )}
      </div>
      <span className="sr-only">{scripts.flatMap((s) => s.map((l) => l.text)).join('. ')}</span>
    </div>
  );
}

function Cursor({ blink }: { blink: boolean }) {
  return (
    <span
      aria-hidden
      className={`ml-[3px] inline-block h-[1em] w-[2px] bg-[#0aee3c]/60 align-middle${blink ? ' animate-blink' : ''}`}
    />
  );
}
