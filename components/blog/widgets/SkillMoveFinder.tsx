'use client';

import { useState } from 'react';
import { InputChips } from './SkillInput';

// Skill-move finder with a controller diagram: pick a platform, click a move,
// and the exact sticks and buttons light up on the pad. New FC 27 moves carry
// an "inputs TBA" tag because the community is still mapping their combos.
// Static SVG plus click/hover state only — no looping motion.

type Platform = 'ps' | 'xbox';
type KeyId = 'L1' | 'L2' | 'LS' | 'R1' | 'R2' | 'RS';

interface Move {
  name: string;
  stars: number;
  ps: string;
  xbox: string;
  use: string;
  when: string;
  keys: KeyId[];
  isNew?: boolean;
}

const MOVES: Move[] = [
  { name: 'Ball Roll', stars: 2, ps: 'Hold RS ← / →', xbox: 'Hold RS ← / →', use: 'Sidestep a lunge, then explode the other way.', when: 'A defender steps to you, or you need half a yard for a shot or pass.', keys: ['RS'] },
  { name: 'Drag Back', stars: 2, ps: 'Hold L2+R2, flick LS ↓', xbox: 'Hold LT+RT, flick LS ↓', use: 'Stop dead when a defender overcommits.', when: 'Someone is sprinting at you — let their momentum carry them past, then turn.', keys: ['L2', 'R2', 'LS'] },
  { name: 'Stepover', stars: 2, ps: 'Rotate RS ↑→', xbox: 'Rotate RS ↑→', use: 'Freeze a defender at the edge of the box.', when: 'Just before a shot or a burst — buys half a yard, not a highlight reel.', keys: ['RS'] },
  { name: 'Fake Turn', stars: 4, ps: '○ or ✕ + LS opposite', xbox: 'B or A + LS opposite', use: 'Sell a turn one way, burst the other. Tight spaces.', when: 'A defender is reading you in a phone booth — 1v1s, cutting inside, box edge.', keys: ['LS'], isNew: true },
  { name: 'Heel to Heel Flick', stars: 4, ps: 'Flick RS ↑ then ↓', xbox: 'Flick RS ↑ then ↓', use: 'Pop past a challenge facing goal at full sprint.', when: 'Facing goal with green grass ahead — one flick and you are through.', keys: ['RS'] },
  { name: 'Ball Roll Spin', stars: 4, ps: 'Hold L1, RS direction then flick RS ↑', xbox: 'Hold LB, RS direction then flick RS ↑', use: 'Roll across your body, spin away from pressure.', when: 'Tightly marked with your back half-turned — spin into the space behind.', keys: ['L1', 'RS'], isNew: true },
  { name: 'Stepover Combo', stars: 5, ps: 'Hold L2, flick RS ↑ + direction', xbox: 'Hold LT, flick RS ↑ + direction', use: 'Chain stepovers, then accelerate into space.', when: 'A 1v1 with a second to spare — set the direction, then go. Never linger.', keys: ['L2', 'RS'], isNew: true },
  { name: 'Elastico', stars: 5, ps: 'RS →, rotate ↓←', xbox: 'RS →, rotate ↓←', use: 'The most violent direction change in the game. 1v1s only.', when: 'An isolated 1v1 with the exit lane open — never into a covered lane.', keys: ['RS'] },
  { name: 'Kneel Header', stars: 1, ps: 'L2 + R1 + flick RS ↑', xbox: 'LT + RB + flick RS ↑', use: 'Kneeling redirect for crosses. Needs the Trickster Playstyle, not stars.', when: 'A cross already in the air toward your Trickster — a viral goal, not a game plan.', keys: ['L2', 'R1', 'RS'], isNew: true },
];

const FILTERS = ['All', '1★', '2★', '4★', '5★', 'New'] as const;

// Shoulder/trigger labels per platform.
const SHOULDER: Record<Platform, Record<string, string>> = {
  ps: { L1: 'L1', L2: 'L2', R1: 'R1', R2: 'R2' },
  xbox: { L1: 'LB', L2: 'LT', R1: 'RB', R2: 'RT' },
};
// Face buttons per platform: [top, right, bottom, left].
const FACES: Record<Platform, [string, string, string, string]> = {
  ps: ['△', '○', '✕', '□'],
  xbox: ['Y', 'B', 'A', 'X'],
};

const ACTIVE = '#0aee3c';
const IDLE_FILL = '#2a2b2f';
const IDLE_STROKE = 'rgba(255,255,255,0.22)';

function ShoulderButton({
  x,
  y,
  label,
  active,
}: {
  x: number;
  y: number;
  label: string;
  active: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={76}
        height={26}
        rx={8}
        fill={active ? ACTIVE : IDLE_FILL}
        stroke={active ? ACTIVE : IDLE_STROKE}
        strokeWidth={1.5}
      />
      <text
        x={x + 38}
        y={y + 18}
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
        fill={active ? '#101210' : 'rgba(255,255,255,0.65)'}
      >
        {label}
      </text>
    </g>
  );
}

function Stick({
  cx,
  cy,
  label,
  active,
}: {
  cx: number;
  cy: number;
  label: string;
  active: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={27} fill={active ? ACTIVE : IDLE_FILL} stroke={active ? ACTIVE : IDLE_STROKE} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={11} fill="none" stroke={active ? '#101210' : 'rgba(255,255,255,0.35)'} strokeWidth={2} />
      <text x={cx} y={cy + 44} fontSize={13} fontWeight="bold" textAnchor="middle" fill={active ? ACTIVE : 'rgba(255,255,255,0.55)'}>
        {label}
      </text>
    </g>
  );
}

function Controller({ platform, activeKeys }: { platform: Platform; activeKeys: KeyId[] }) {
  const isActive = (k: KeyId) => activeKeys.includes(k);
  const faces = FACES[platform];
  const sh = SHOULDER[platform];
  // Left cluster swaps with platform: Xbox puts the stick on top, PlayStation the D-pad.
  const topLeft: 'stick' | 'dpad' = platform === 'xbox' ? 'stick' : 'dpad';
  const stickLeft = { cx: 168, cy: topLeft === 'stick' ? 118 : 196 };
  const dpad = { cx: 168, cy: topLeft === 'stick' ? 196 : 118 };

  return (
    <svg viewBox="0 0 640 330" className="w-full h-auto" role="img" aria-label={`${platform === 'ps' ? 'PlayStation' : 'Xbox'} controller with move inputs highlighted`}>
      {/* shoulders */}
      <ShoulderButton x={128} y={26} label={sh.L1} active={isActive('L1')} />
      <ShoulderButton x={128} y={56} label={sh.L2} active={isActive('L2')} />
      <ShoulderButton x={436} y={26} label={sh.R1} active={isActive('R1')} />
      <ShoulderButton x={436} y={56} label={sh.R2} active={isActive('R2')} />

      {/* body */}
      <rect x={88} y={86} width={464} height={196} rx={88} fill="#1e1f23" stroke="rgba(255,255,255,0.14)" strokeWidth={2} />

      {/* left cluster: D-pad */}
      <g>
        <rect x={dpad.cx - 10} y={dpad.cy - 30} width={20} height={60} rx={5} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
        <rect x={dpad.cx - 30} y={dpad.cy - 10} width={60} height={20} rx={5} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
      </g>

      {/* left stick */}
      <Stick cx={stickLeft.cx} cy={stickLeft.cy} label="LS" active={isActive('LS')} />

      {/* face buttons */}
      {[
        { dx: 0, dy: -27, label: faces[0] },
        { dx: 27, dy: 0, label: faces[1] },
        { dx: 0, dy: 27, label: faces[2] },
        { dx: -27, dy: 0, label: faces[3] },
      ].map((b) => (
        <g key={b.label}>
          <circle cx={472 + b.dx} cy={150 + b.dy} r={16} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
          <text x={472 + b.dx} y={150 + b.dy + 5} fontSize={14} fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.65)">
            {b.label}
          </text>
        </g>
      ))}

      {/* right stick */}
      <Stick cx={372} cy={208} label="RS" active={isActive('RS')} />

      {/* center marks */}
      <rect x={296} y={140} width={48} height={26} rx={6} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
      <circle cx={272} cy={153} r={6} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
      <circle cx={368} cy={153} r={6} fill={IDLE_FILL} stroke={IDLE_STROKE} strokeWidth={1.5} />
    </svg>
  );
}

export default function SkillMoveFinder() {
  const [platform, setPlatform] = useState<Platform>('ps');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [selected, setSelected] = useState<string>('Ball Roll');

  const shown = MOVES.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'New') return m.isNew;
    return m.stars === Number(filter[0]);
  });
  const current = MOVES.find((m) => m.name === selected) ?? MOVES[0];
  const input = platform === 'ps' ? current.ps : current.xbox;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-5 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Pick your controller, click a move, and watch the exact sticks and buttons light up.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPlatform('ps')}
          className={`text-xs font-bold px-4 py-1.5 rounded ${
            platform === 'ps' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white/85'
          }`}
        >
          PlayStation
        </button>
        <button
          type="button"
          onClick={() => setPlatform('xbox')}
          className={`text-xs font-bold px-4 py-1.5 rounded ${
            platform === 'xbox' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white/85'
          }`}
        >
          Xbox
        </button>
        <span className="text-white/30 text-xs self-center mx-1">·</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-3 py-1.5 rounded ${
              filter === f ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white/85'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-3 mb-2 overflow-hidden">
        <Controller platform={platform} activeKeys={current.keys} />
        <p className="text-center text-sm mt-1">
          <span className="text-white/90 font-bold">{current.name}</span>{' '}
          <span className="text-amber-400 font-bold">{'★'.repeat(current.stars)}</span>
          <span className="text-white/50"> — </span>
          <InputChips input={input} highlight={current.keys.length > 0} />
        </p>
      </div>

      <ul className="space-y-2 mt-3" style={{ listStyle: 'none' }}>
        {shown.map((m) => (
          <li key={m.name}>
            <button
              type="button"
              onClick={() => setSelected(m.name)}
              className={`w-full text-left rounded-lg px-4 py-3 transition-colors ${
                selected === m.name ? 'bg-white/15 ring-1 ring-white/25' : 'bg-black/30 hover:bg-black/50'
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-white/90 text-sm font-bold">{m.name}</span>
                <span className="text-amber-400 text-xs font-bold">{'★'.repeat(m.stars)}</span>
                {m.isNew && (
                  <span className="text-[11px] font-bold uppercase tracking-wide text-green-400">
                    New in FC 27
                  </span>
                )}
              </div>
              <div className="mt-1.5">
                <InputChips input={platform === 'ps' ? m.ps : m.xbox} highlight={selected === m.name && m.keys.length > 0} />
              </div>
              <p className="text-white/50 text-xs mt-0.5">{m.use}</p>
              <p className="text-[13px] mt-1">
                <span className="font-bold text-white/85">When: </span>
                <span className="text-white/70">{m.when}</span>
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
