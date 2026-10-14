'use client';

import { useEffect, useRef, useState } from 'react';
import {
  calProgressLine,
  drawFortune,
  factorLine,
  historyLine,
  pickScene,
  yyyymmdd,
  type Fortune,
  type HistoryEvent,
  type TerminalScene,
  type Trivia,
} from '@/lib/terminal-scenes';

// Fortune/trivia terminal: scenes are picked at random, never repeating
// a command within the previous three scenes. Command types, output
// types, hold 2s, then a visible `clear`. Fixed 4-line frame, no layout
// shift; pauses off-screen and in hidden tabs; reduced motion gets a
// static snapshot with no typing or blinking.

const CHAR_MIN = 60;
const CHAR_VAR = 50;
const CLEAR_CHAR_MIN = 100;
const CLEAR_CHAR_VAR = 60;
const ENTER_PAUSE = 350;
const HOLD_MS = 2000;
const CLEAR_BEAT = 800;

type SceneId = TerminalScene;

const CMDS: Record<Exclude<SceneId, 'factor'>, string> = {
  fortune: '$ fortune',
  trivia: '$ trivia',
  cal: '$ cal --progress',
  history: '$ history --today',
};

interface Line {
  id: number;
  kind: 'cmd' | 'out';
  text: string;
  href?: string;
}

type Phase = 'cmd' | 'out' | 'hold' | 'clear';

interface Engine {
  scene: SceneId;
  recent: SceneId[];
  phase: Phase;
  typed: number;
  lines: Line[];
  seq: number;
  fortunes: number[];
  trivia: number[];
  factorCmd: string | null;
  outText: string;
  outHref?: string;
}

interface Props {
  fortunes: Fortune[];
  trivia: Trivia[];
  history: HistoryEvent[];
  snapshot: { fortune: Fortune; cal: string };
}

// Single output per scene, computed at print time inside a timeout (never
// during render, so randomness here is lint-clean).
function outputFor(
  scene: SceneId,
  eng: Engine,
  props: Pick<Props, 'fortunes' | 'trivia' | 'history'>,
): { text: string; href?: string; fortunes: number[]; trivia: number[] } {
  switch (scene) {
    case 'fortune': {
      const d = drawFortune(eng.fortunes, props.fortunes.length, Math.random);
      const f = props.fortunes[d.pick];
      return { text: f?.text ?? 'No fortunes today.', href: f?.link, fortunes: d.remaining, trivia: eng.trivia };
    }
    case 'trivia': {
      const d = drawFortune(eng.trivia, props.trivia.length, Math.random);
      const item = props.trivia[d.pick];
      return { text: item?.text ?? 'No trivia today.', fortunes: eng.fortunes, trivia: d.remaining };
    }
    case 'cal':
      return { text: calProgressLine(Date.now()), fortunes: eng.fortunes, trivia: eng.trivia };
    case 'factor': {
      const stamp = eng.factorCmd ?? `factor ${yyyymmdd(Date.now())}`;
      const parsed = Number(stamp.split(' ')[1]);
      const n = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : Number(yyyymmdd(Date.now()));
      return { text: factorLine(n), fortunes: eng.fortunes, trivia: eng.trivia };
    }
    case 'history': {
      const e = props.history[Math.floor(Math.random() * props.history.length)];
      return { text: e ? historyLine(e) : 'No history today.', fortunes: eng.fortunes, trivia: eng.trivia };
    }
  }
}

function cmdFor(scene: SceneId, eng: Engine): string {
  return scene === 'factor' ? (eng.factorCmd ?? '$ factor') : CMDS[scene];
}

export default function TerminalTyper({ fortunes, trivia, history, snapshot }: Props) {
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(true);
  const [eng, setEng] = useState<Engine>(() => ({
    scene: 'fortune',
    recent: ['fortune'],
    phase: 'cmd',
    typed: 0,
    lines: [],
    seq: 0,
    fortunes: [],
    trivia: [],
    factorCmd: null,
    outText: '',
    outHref: undefined,
  }));
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

  useEffect(() => {
    if (reduceMotion || !active) return undefined;
    const scene = eng.scene;
    if (eng.phase === 'hold') {
      // Scroll the old command out so `$ clear` types visibly beneath the
      // output — the 3-line frame can't fit all rows at once.
      const t = setTimeout(
        () => setEng({ ...eng, phase: 'clear', typed: 0, lines: eng.lines.slice(-1) }),
        HOLD_MS,
      );
      return () => clearTimeout(t);
    }
    const target = eng.phase === 'out' ? eng.outText : eng.phase === 'cmd' ? cmdFor(scene, eng) : '$ clear';
    if (eng.typed < target.length) {
      const t = setTimeout(
        () => setEng({ ...eng, typed: eng.typed + 1 }),
        eng.phase === 'clear'
          ? CLEAR_CHAR_MIN + Math.random() * CLEAR_CHAR_VAR
          : CHAR_MIN + Math.random() * CHAR_VAR,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        if (eng.phase === 'out') {
          // Output fully typed: settle it (with any link) and hold.
          setEng({
            ...eng,
            lines: [...eng.lines, { id: eng.seq + 1, kind: 'out', text: eng.outText, href: eng.outHref }],
            seq: eng.seq + 1,
            phase: 'hold',
          });
        } else if (eng.phase === 'cmd') {
          const out = outputFor(scene, eng, { fortunes, trivia, history });
          setEng({
            ...eng,
            lines: [{ id: eng.seq, kind: 'cmd', text: cmdFor(scene, eng) }],
            seq: eng.seq + 1,
            fortunes: out.fortunes,
            trivia: out.trivia,
            typed: 0,
            outText: out.text,
            outHref: out.href,
            phase: 'out',
          });
        } else {
          const next = pickScene(eng.recent, history.length > 0, Math.random);
          setEng({
            ...eng,
            scene: next,
            recent: [...eng.recent, next].slice(-3),
            phase: 'cmd',
            typed: 0,
            lines: [],
            factorCmd: next === 'factor' ? `factor ${yyyymmdd(Date.now())}` : eng.factorCmd,
          });
        }
      },
      eng.phase === 'cmd' ? ENTER_PAUSE : eng.phase === 'out' ? 150 : CLEAR_BEAT,
    );
    return () => clearTimeout(t);
  }, [eng, active, reduceMotion, fortunes, trivia, history]);

  const renderLine = (line: Line) => {
    if (line.kind === 'cmd') {
      return (
        <p key={line.id} className="whitespace-nowrap overflow-hidden text-ellipsis leading-normal text-[#0aee3c]">
          <span className="text-[#0aee3c]/50">$</span>
          {line.text.slice(1)}
        </p>
      );
    }
    return (
      <p key={line.id} className="whitespace-normal break-words leading-normal text-[#0aee3c]/70">
        {line.text}
        {line.href ? (
          <a href={line.href} tabIndex={-1} className="text-[#0aee3c]/50">
            {' '}
            → read
          </a>
        ) : null}
      </p>
    );
  };

  // Steady state for reduced motion: a fortune plus the year line. Fully
  // server-computed, so server and client render identically.
  if (reduceMotion) {
    const steady: Line[] = [
      { id: 0, kind: 'cmd', text: CMDS.fortune },
      { id: 1, kind: 'out', text: snapshot.fortune.text, href: snapshot.fortune.link },
      { id: 2, kind: 'out', text: snapshot.cal },
    ];
    return (
      <div ref={ref} className="relative" aria-label="Site terminal">
        <Sizer />
        <div aria-hidden className="absolute inset-0">
          {steady.map(renderLine)}
          <p className="whitespace-nowrap leading-normal">
            <span className="text-[#0aee3c]/50">$</span> <Cursor blink={false} />
          </p>
        </div>
        <span className="sr-only">
          Terminal cycling surprising facts, scale trivia, year progress, date factoring, and this day in history.
        </span>
      </div>
    );
  }

  const scene = eng.scene;
  const target = eng.phase === 'clear' ? '$ clear' : eng.phase === 'cmd' ? cmdFor(scene, eng) : '';
  const typing = (eng.phase === 'cmd' || eng.phase === 'clear') && eng.typed < target.length;
  // Fully typed but awaiting the beat: keep the submitted line on screen
  // (with a solid cursor) instead of flashing a bare prompt.
  const submitted = (eng.phase === 'cmd' || eng.phase === 'clear') && !typing;
  const shown = submitted ? target : target.slice(0, eng.typed);
  const outTyping = eng.phase === 'out';

  return (
    <div ref={ref} className="relative" aria-label="Site terminal">
      <Sizer />
      {/* Live overlay; screen readers get the static summary instead. */}
      <div aria-hidden className="absolute inset-0">
        {eng.lines.map(renderLine)}
        {outTyping ? (
          <p className="whitespace-normal break-words leading-normal text-[#0aee3c]/70">
            {eng.outText.slice(0, eng.typed)}
            <Cursor blink={false} />
          </p>
        ) : typing || submitted ? (
          <p
            className={`whitespace-nowrap overflow-hidden leading-normal ${
              eng.phase === 'clear' ? 'text-[#0aee3c]/70' : 'text-[#0aee3c]'
            }`}
          >
            {shown.startsWith('$') ? (
              <>
                <span className="text-[#0aee3c]/50">$</span>
                {shown.slice(1)}
              </>
            ) : (
              shown
            )}
            <Cursor blink={false} />
          </p>
        ) : (
          <p className="whitespace-nowrap leading-normal">
            <span className="text-[#0aee3c]/50">$</span> <Cursor blink />
          </p>
        )}
      </div>
      <span className="sr-only">
        Terminal cycling surprising facts, scale trivia, year progress, date factoring, and this day in history.
      </span>
    </div>
  );
}

// Invisible 3-line frame plus prompt row: pins the box height from first
// paint so scenes never shift the layout.
function Sizer() {
  return (
    <div aria-hidden className="invisible">
      {[0, 1, 2].map((i) => (
        <p key={i} className="whitespace-nowrap leading-normal">
          {'\u00a0'}
        </p>
      ))}
      <p className="whitespace-nowrap leading-normal">$</p>
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
