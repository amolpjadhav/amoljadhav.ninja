'use client';

import { useEffect, useRef, useState } from 'react';
import {
  calProgressLine,
  drawFortune,
  factorLine,
  historyLine,
  uptimeLine,
  yyyymmdd,
  type Fortune,
  type HistoryEvent,
} from '@/lib/terminal-scenes';

// Fortune/facts terminal: fortune → uptime → fortune → cal → fortune →
// factor → fortune → history, looping. One command, one output (wrapping
// to 2 lines max), hold, then a visible `clear`. Fixed 4-line frame, no
// layout shift; pauses off-screen and in hidden tabs; reduced motion gets
// a static snapshot with no typing or blinking.

const CHAR_MIN = 60;
const CHAR_VAR = 50;
const CLEAR_CHAR_MIN = 100;
const CLEAR_CHAR_VAR = 60;
const ENTER_PAUSE = 350;
const HOLD_MS = 2500;
const LIVE_TICK = 100;
const LIVE_TICKS = HOLD_MS / LIVE_TICK;
const CLEAR_BEAT = 800;

type SceneId = 'fortune' | 'uptime' | 'cal' | 'factor' | 'history';

const CMDS: Record<Exclude<SceneId, 'factor'>, string> = {
  fortune: '$ fortune',
  uptime: '$ uptime --you',
  cal: '$ cal --progress',
  history: '$ history --today',
};

function orderFor(history: HistoryEvent[]): SceneId[] {
  const order: SceneId[] = ['fortune', 'uptime', 'fortune', 'cal', 'fortune', 'factor', 'fortune'];
  if (history.length > 0) order.push('history');
  return order;
}

interface Line {
  id: number;
  kind: 'cmd' | 'out';
  text: string;
  href?: string;
}

type Phase = 'cmd' | 'hold' | 'live' | 'clear';

interface Engine {
  order: SceneId[];
  idx: number;
  cycle: number;
  phase: Phase;
  typed: number;
  lines: Line[];
  seq: number;
  fortunes: number[];
  factorCmd: string | null;
  liveTicks: number;
}

interface Props {
  fortunes: Fortune[];
  history: HistoryEvent[];
  snapshot: { fortune: Fortune; cal: string };
}

// Single output per scene, computed at print time inside a timeout (never
// during render, so randomness here is lint-clean).
function outputFor(
  scene: SceneId,
  eng: Engine,
  props: Pick<Props, 'fortunes' | 'history'> & { landed: number },
): { text: string; href?: string; fortunes: number[] } {
  switch (scene) {
    case 'fortune': {
      const d = drawFortune(eng.fortunes, props.fortunes.length, Math.random);
      const f = props.fortunes[d.pick];
      return { text: f?.text ?? 'No fortunes today.', href: f?.link, fortunes: d.remaining };
    }
    case 'uptime':
      return { text: uptimeLine(props.landed, Date.now()), fortunes: eng.fortunes };
    case 'cal':
      return { text: calProgressLine(Date.now()), fortunes: eng.fortunes };
    case 'factor': {
      const stamp = eng.factorCmd ?? `factor ${yyyymmdd(Date.now())}`;
      const parsed = Number(stamp.split(' ')[1]);
      const n = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : Number(yyyymmdd(Date.now()));
      return { text: factorLine(n), fortunes: eng.fortunes };
    }
    case 'history': {
      const e = props.history[Math.floor(Math.random() * props.history.length)];
      return { text: e ? historyLine(e) : 'No history today.', fortunes: eng.fortunes };
    }
  }
}

function cmdFor(scene: SceneId, eng: Engine): string {
  return scene === 'factor' ? (eng.factorCmd ?? '$ factor') : CMDS[scene];
}

export default function TerminalTyper({ fortunes, history, snapshot }: Props) {
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(true);
  const [landed] = useState(() => Date.now());
  const [eng, setEng] = useState<Engine>(() => ({
    order: orderFor(history),
    idx: 0,
    cycle: 0,
    phase: 'cmd',
    typed: 0,
    lines: [],
    seq: 0,
    fortunes: [],
    factorCmd: null,
    liveTicks: 0,
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
    const scene = eng.order[eng.idx] ?? 'fortune';
    if (eng.phase === 'hold') {
      // Scroll the old command out so `$ clear` types visibly beneath the
      // output — the 3-line frame can't fit all rows at once.
      const t = setTimeout(
        () => setEng({ ...eng, phase: 'clear', typed: 0, lines: eng.lines.slice(-1) }),
        HOLD_MS,
      );
      return () => clearTimeout(t);
    }
    if (eng.phase === 'live') {
      const t = setTimeout(() => {
        const ticks = eng.liveTicks + 1;
        if (ticks >= LIVE_TICKS) {
          setEng({ ...eng, phase: 'clear', typed: 0, liveTicks: 0, lines: eng.lines.slice(-1) });
        } else {
          setEng({
            ...eng,
            liveTicks: ticks,
            lines: eng.lines.map((l) =>
              l.kind === 'out' ? { ...l, text: uptimeLine(landed, Date.now()) } : l,
            ),
          });
        }
      }, LIVE_TICK);
      return () => clearTimeout(t);
    }
    const target = eng.phase === 'cmd' ? cmdFor(scene, eng) : '$ clear';
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
        if (eng.phase === 'cmd') {
          const out = outputFor(scene, eng, { fortunes, history, landed });
          setEng({
            ...eng,
            lines: [
              { id: eng.seq, kind: 'cmd', text: cmdFor(scene, eng) },
              { id: eng.seq + 1, kind: 'out', text: out.text, href: out.href },
            ],
            seq: eng.seq + 2,
            fortunes: out.fortunes,
            liveTicks: 0,
            phase: scene === 'uptime' ? 'live' : 'hold',
          });
        } else {
          const ni = eng.idx + 1;
          const wrap = ni >= eng.order.length;
          const next = eng.order[wrap ? 0 : ni] ?? 'fortune';
          setEng({
            ...eng,
            idx: wrap ? 0 : ni,
            cycle: wrap ? eng.cycle + 1 : eng.cycle,
            phase: 'cmd',
            typed: 0,
            lines: [],
            factorCmd: next === 'factor' ? `factor ${yyyymmdd(Date.now())}` : eng.factorCmd,
          });
        }
      },
      eng.phase === 'cmd' ? ENTER_PAUSE : CLEAR_BEAT,
    );
    return () => clearTimeout(t);
  }, [eng, active, reduceMotion, fortunes, history, landed]);

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
          Terminal cycling surprising facts, an Earth-orbit counter, year progress, date factoring, and this day in
          history.
        </span>
      </div>
    );
  }

  const scene = eng.order[eng.idx] ?? 'fortune';
  const target = eng.phase === 'clear' ? '$ clear' : eng.phase === 'cmd' ? cmdFor(scene, eng) : '';
  const typing = (eng.phase === 'cmd' || eng.phase === 'clear') && eng.typed < target.length;
  // Fully typed but awaiting the beat: keep the submitted line on screen
  // (with a solid cursor) instead of flashing a bare prompt.
  const submitted = (eng.phase === 'cmd' || eng.phase === 'clear') && !typing;
  const shown = submitted ? target : target.slice(0, eng.typed);

  return (
    <div ref={ref} className="relative" aria-label="Site terminal">
      <Sizer />
      {/* Live overlay; screen readers get the static summary instead. */}
      <div aria-hidden className="absolute inset-0">
        {eng.lines.map(renderLine)}
        {typing || submitted ? (
          <p className="whitespace-nowrap overflow-hidden leading-normal text-[#0aee3c]">
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
        Terminal cycling surprising facts, an Earth-orbit counter, year progress, date factoring, and this day in
        history.
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
