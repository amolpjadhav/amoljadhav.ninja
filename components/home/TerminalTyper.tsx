'use client';

import { useEffect, useRef, useState } from 'react';
import {
  birthdayDraws,
  birthdayLine,
  flipRun,
  formatFlip,
  formatHtopRow,
  formatMonty,
  HTOP_SEED,
  montyRun,
  psRow,
} from '@/lib/terminal-scenes';
import type { TerminalLines } from './heroData';

// One-command-one-output terminal: types a command, prints exactly one
// line, holds it, types `clear`, moves on. Data scenes drop out when
// their feed is down; the sims always run. Fixed 2-line frame, no layout
// shift; pauses off-screen and in hidden tabs; reduced motion gets a
// static snapshot with no typing or blinking.

const CHAR_MIN = 60;
const CHAR_VAR = 50;
const CLEAR_CHAR_MIN = 100;
const CLEAR_CHAR_VAR = 60;
const ENTER_PAUSE = 350;
const HOLD_MS = 4000;
const CLEAR_BEAT = 400;
const FLIP_COINS = 2500;
const BIRTHDAY_KIDS = 23;
const MONTY_RUNS = 1000;

type SceneId = 'blog' | 'cast' | 'market' | 'git' | 'ps' | 'flip' | 'birthday' | 'monty';

const CMDS: Record<SceneId, string> = {
  blog: '$ tail -1 blog',
  cast: '$ top podcasts',
  market: '$ market',
  git: '$ git log --oneline -n 1',
  ps: '$ ps --brain',
  flip: `$ flip --coins ${FLIP_COINS}`,
  birthday: `$ birthday --kids ${BIRTHDAY_KIDS}`,
  monty: `$ montyhall --runs ${MONTY_RUNS}`,
};

function orderFor(lines: TerminalLines): SceneId[] {
  const order: SceneId[] = [];
  if (lines.blog) order.push('blog');
  if (lines.cast) order.push('cast');
  if (lines.market) order.push('market');
  if (lines.commit) order.push('git');
  order.push('ps', 'flip', 'birthday', 'monty');
  return order;
}

interface Line {
  id: number;
  kind: 'cmd' | 'out';
  text: string;
}

type Phase = 'cmd' | 'hold' | 'clear';

interface Engine {
  order: SceneId[];
  idx: number;
  cycle: number;
  phase: Phase;
  typed: number;
  lines: Line[];
  seq: number;
}

// Single output line per scene, computed at print time inside a timeout
// (never during render, so randomness here is lint-clean).
function outputFor(scene: SceneId, lines: TerminalLines, cycle: number): string {
  switch (scene) {
    case 'blog':
      return lines.blog ?? '';
    case 'cast':
      return lines.cast ?? '';
    case 'market':
      return lines.market ?? '';
    case 'git':
      return lines.commit ?? '';
    case 'ps':
      return formatHtopRow(psRow(cycle, Math.random));
    case 'flip':
      return formatFlip(flipRun(FLIP_COINS, Math.random));
    case 'birthday':
      return birthdayLine(birthdayDraws(Math.random, BIRTHDAY_KIDS), BIRTHDAY_KIDS);
    case 'monty':
      return formatMonty(montyRun(MONTY_RUNS, Math.random));
  }
}

export default function TerminalTyper({ lines }: { lines: TerminalLines }) {
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(true);
  const [eng, setEng] = useState<Engine>(() => ({
    order: orderFor(lines),
    idx: 0,
    cycle: 0,
    phase: 'cmd',
    typed: 0,
    lines: [],
    seq: 0,
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
    const scene = eng.order[eng.idx] ?? 'ps';
    if (eng.phase === 'hold') {
      // Scroll the old command out so `$ clear` types visibly beneath the
      // output — the 2-line frame can't fit all three rows at once.
      const t = setTimeout(
        () => setEng({ ...eng, phase: 'clear', typed: 0, lines: eng.lines.slice(-1) }),
        HOLD_MS,
      );
      return () => clearTimeout(t);
    }
    const target = eng.phase === 'cmd' ? CMDS[scene] : '$ clear';
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
          setEng({
            ...eng,
            lines: [
              { id: eng.seq, kind: 'cmd', text: CMDS[scene] },
              { id: eng.seq + 1, kind: 'out', text: outputFor(scene, lines, eng.cycle) },
            ],
            seq: eng.seq + 2,
            phase: 'hold',
          });
        } else {
          const ni = eng.idx + 1;
          const wrap = ni >= eng.order.length;
          setEng({
            ...eng,
            idx: wrap ? 0 : ni,
            cycle: wrap ? eng.cycle + 1 : eng.cycle,
            phase: 'cmd',
            typed: 0,
            lines: [],
          });
        }
      },
      eng.phase === 'cmd' ? ENTER_PAUSE : CLEAR_BEAT,
    );
    return () => clearTimeout(t);
  }, [eng, active, reduceMotion, lines]);

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
      <p key={line.id} className="whitespace-nowrap overflow-hidden text-ellipsis leading-normal text-[#0aee3c]/70">
        {line.text}
      </p>
    );
  };

  // Steady state for reduced motion: the first scene, static. Sims need
  // randomness, which can't run identically on server and client, so the
  // snapshot prefers a data scene and falls back to the un-jittered ps
  // seed — fully deterministic, no hydration mismatch.
  if (reduceMotion) {
    const order = orderFor(lines);
    const scene = order.find((s) => s === 'blog' || s === 'cast' || s === 'market' || s === 'git') ?? 'ps';
    const seed = HTOP_SEED[0] ?? { pid: 101, name: 'curiosity', cpu: 97 };
    const steady: Line[] = [
      { id: 0, kind: 'cmd', text: CMDS[scene] },
      { id: 1, kind: 'out', text: scene === 'ps' ? formatHtopRow(seed) : outputFor(scene, lines, 0) },
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
        <span className="sr-only">Live terminal cycling one-line stats: latest post, podcast, market, commits, and simulations.</span>
      </div>
    );
  }

  const scene = eng.order[eng.idx] ?? 'ps';
  const target = eng.phase === 'clear' ? '$ clear' : CMDS[scene];
  const typing = eng.phase !== 'hold' && eng.typed < target.length;
  // Fully typed but awaiting the beat: keep the submitted line on screen
  // (with a solid cursor) instead of flashing a bare prompt.
  const submitted = eng.phase !== 'hold' && !typing;
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
      <span className="sr-only">Live terminal cycling one-line stats: latest post, podcast, market, commits, and simulations.</span>
    </div>
  );
}

// Invisible 2-line frame plus prompt row: pins the box height from first
// paint so scenes never shift the layout.
function Sizer() {
  return (
    <div aria-hidden className="invisible">
      {[0, 1].map((i) => (
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
