'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MASH_FINISH_X,
  MASH_MAX_MASS,
  MASH_PUSH,
  MASH_RACERS,
  MASH_START_X,
  fmtSpeed,
  freshMash,
  mashCaption,
  mashPush,
  stepMash,
  type MashMass,
  type MashState,
} from '@/lib/mash';

/* ---------- world ---------- */
const VW = 640;
const VH = 372;
const LANES = { scooter: 60, truck: 160 }; // lane center y
const LANE_H = 76;
const SPEED_UNIT = 3; // px/s per displayed speed point (mass 1 gets +4 per push)
const ARROW_MS = 160;
const GRAPH = { x: 60, y: 252, w: 540, h: 92 };

const col = {
  panel: '#1c1a15',
  ink: '#e8e4d8',
  muted: '#9c968a',
  line: '#35322b',
  lane: '#262420',
  accent: '#f6d34a',
  push: '#f6d34a',
  crate: '#b07a45',
  crateEdge: '#7d5530',
  deck: '#5a7fe0',
  metal: '#9aa1ab',
  tire: '#141414',
  skin: '#f8d29a',
  truck: '#f07d3a',
  glass: '#bfe0ff',
};

function Arrow({ x, y, len, color }: { x: number; y: number; len: number; color: string }) {
  const head = 10;
  return (
    <g>
      <line
        x1={x - len}
        y1={y}
        x2={x - head * 0.8}
        y2={y}
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <polygon points={`${x - head},${y - 7} ${x - head},${y + 7} ${x},${y}`} fill={color} />
    </g>
  );
}

function Crates({ n, x, y }: { n: number; x: number; y: number }) {
  // stacked from the bottom up, two per row
  return Array.from({ length: n }, (_, i) => (
    <rect
      key={i}
      x={x + (i % 2) * 15}
      y={y - 14 - Math.floor(i / 2) * 14}
      width="13"
      height="13"
      rx="2"
      fill={col.crate}
      stroke={col.crateEdge}
      strokeWidth="1.5"
    />
  ));
}

function Scooter({ x, cy, crates }: { x: number; cy: number; crates: number }) {
  const deckY = cy + 16;
  return (
    <g transform={`translate(${x - 92}, 0)`}>
      <rect x={20} y={deckY - 3} width={62} height={7} rx="3" fill={col.deck} />
      <line x1={78} y1={deckY} x2={84} y2={cy - 22} stroke={col.metal} strokeWidth="5" strokeLinecap="round" />
      <line x1={76} y1={cy - 22} x2={92} y2={cy - 22} stroke={col.metal} strokeWidth="5" strokeLinecap="round" />
      <circle cx={24} cy={deckY + 8} r="7" fill={col.tire} />
      <circle cx={80} cy={deckY + 8} r="7" fill={col.tire} />
      <circle cx={66} cy={cy - 10} r="9" fill={col.skin} />
      <rect x={60} y={cy - 2} width={12} height={16} rx="4" fill={col.accent} />
      <Crates n={crates} x={24} y={deckY - 3} />
    </g>
  );
}

function Truck({ x, cy, crates }: { x: number; cy: number; crates: number }) {
  return (
    <g transform={`translate(${x - 112}, 0)`}>
      <rect x={4} y={cy - 6} width={108} height={22} rx="6" fill={col.truck} />
      <rect x={72} y={cy - 24} width={30} height={20} rx="5" fill={col.truck} />
      <rect x={80} y={cy - 20} width={16} height={9} rx="2" fill={col.glass} />
      <polygon points={`12,${cy + 14} 22,${cy - 4} 28,${cy + 14}`} fill={col.accent} />
      <polygon points={`28,${cy + 14} 38,${cy - 4} 44,${cy + 14}`} fill={col.accent} />
      <circle cx={26} cy={cy + 22} r="14" fill={col.tire} />
      <circle cx={26} cy={cy + 22} r="5" fill={col.metal} />
      <circle cx={92} cy={cy + 22} r="14" fill={col.tire} />
      <circle cx={92} cy={cy + 22} r="5" fill={col.metal} />
      <Crates n={crates} x={12} y={cy - 6} />
    </g>
  );
}

/** Cheap render snapshot: the sim ref stays the source of truth, and each
 *  frame (or mash) publishes a copy so render never reads the ref. */
function snapSim(s: MashState): MashState {
  return {
    ...s,
    r: { scooter: { ...s.r.scooter }, truck: { ...s.r.truck } },
    samples: [...s.samples],
  };
}

export default function MashLab({ onRace }: { onRace?: () => void }) {
  const sim = useRef<MashState>(freshMash());
  const massRef = useRef<MashMass>({ scooter: 1, truck: 4 });
  const [mass, setMass] = useState<MashMass>({ scooter: 1, truck: 4 });
  const [snap, setSnap] = useState<MashState>(() => freshMash());
  const [hit, setHit] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const arrowTimer = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      stepMash(sim.current, dt);
      setSnap(snapSim(sim.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doMash = () => {
    mashPush(sim.current, massRef.current);
    setSnap(snapSim(sim.current));
    onRace?.();
    setHit(true);
    setTimeout(() => setHit(false), 90);
    setShowArrows(true);
    window.clearTimeout(arrowTimer.current);
    arrowTimer.current = window.setTimeout(() => setShowArrows(false), ARROW_MS);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && e.target === document.body) {
        e.preventDefault();
        doMash();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = snap;
  const locked = s.started;
  const changeMass = (k: keyof MashMass, d: number) => {
    if (locked) return;
    const next = {
      ...massRef.current,
      [k]: Math.min(MASH_MAX_MASS, Math.max(MASH_RACERS[k].base, massRef.current[k] + d)),
    };
    massRef.current = next;
    setMass(next);
  };
  const reset = () => {
    sim.current = freshMash();
    setSnap(snapSim(sim.current));
  };
  const resetAll = () => {
    reset();
    massRef.current = { scooter: 1, truck: 4 };
    setMass(massRef.current);
  };



  // graph (auto-scaling)
  const tMax = Math.max(8, s.t);
  let vMax = 60;
  s.samples.forEach(([, a, b]) => {
    vMax = Math.max(vMax, (a ?? 0) * 1.15, (b ?? 0) * 1.15);
  });
  const gx = (t: number) => GRAPH.x + (t / tMax) * GRAPH.w;
  const gy = (v: number) => GRAPH.y + GRAPH.h - (v / vMax) * GRAPH.h;
  const line = (idx: number) =>
    s.samples
      .filter((p) => p[idx] !== null)
      .map((p) => `${gx(p[0]).toFixed(1)},${gy(p[idx] as number).toFixed(1)}`)
      .join(' ');

  const btn = (primary: boolean, active = false): React.CSSProperties => ({
    font: 'inherit',
    fontSize: 16,
    fontWeight: 700,
    padding: '12px 18px',
    borderRadius: 12,
    cursor: 'pointer',
    border: `1.5px solid ${primary ? col.accent : col.line}`,
    background: primary ? (active ? '#d9b52c' : col.accent) : 'transparent',
    color: primary ? '#1a160a' : col.ink,
    touchAction: 'manipulation',
    userSelect: 'none',
    transform: primary && active ? 'scale(0.96)' : 'none',
    transition: 'transform 60ms',
  });
  const small = (disabled: boolean): React.CSSProperties => ({
    font: 'inherit',
    fontSize: 18,
    fontWeight: 700,
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `1.5px solid ${col.line}`,
    background: 'transparent',
    color: disabled ? col.line : col.ink,
    cursor: disabled ? 'not-allowed' : 'pointer',
    lineHeight: 1,
  });

  return (
    <div
      style={{
        background: col.panel,
        color: col.ink,
        borderRadius: 16,
        padding: '20px 20px 24px',
        fontFamily: 'inherit',
        maxWidth: 760,
      }}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        role="img"
        aria-label={`Race. Scooter mass ${mass.scooter}, truck mass ${mass.truck}. ${mashCaption(s, mass)}`}
      >
        {Object.entries(LANES).map(([k, cy]) => (
          <g key={k}>
            <rect
              x={6}
              y={cy - LANE_H / 2}
              width={622}
              height={LANE_H}
              rx="10"
              fill={col.lane}
              stroke={col.line}
            />
            {Array.from({ length: 7 }, (_, i) => (
              <rect
                key={i}
                x={MASH_START_X - 8}
                y={cy - LANE_H / 2 + 4 + i * 10}
                width="6"
                height="5"
                fill={col.ink}
                opacity="0.7"
              />
            ))}
            <line
              x1={MASH_FINISH_X}
              x2={MASH_FINISH_X}
              y1={cy - LANE_H / 2 + 4}
              y2={cy + LANE_H / 2 - 4}
              stroke={col.ink}
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <text
              x={MASH_FINISH_X - 6}
              y={cy - LANE_H / 2 + 16}
              fill={col.muted}
              fontSize="12"
              textAnchor="end"
            >
              finish
            </text>
          </g>
        ))}

        <Scooter x={s.r.scooter.x} cy={LANES.scooter} crates={mass.scooter - 1} />
        <Truck x={s.r.truck.x} cy={LANES.truck} crates={mass.truck - 4} />

        {showArrows && (
          <>
            <Arrow x={s.r.scooter.x - 74} y={LANES.scooter + 16} len={36} color={col.push} />
            <Arrow x={s.r.truck.x - 110} y={LANES.truck + 6} len={36} color={col.push} />
            <text
              x={s.r.scooter.x - 92}
              y={LANES.scooter - 2}
              fill={col.push}
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
              stroke={col.panel}
              strokeWidth="4"
              paintOrder="stroke"
            >
              same push
            </text>
            <text
              x={s.r.truck.x - 128}
              y={LANES.truck - 14}
              fill={col.push}
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
              stroke={col.panel}
              strokeWidth="4"
              paintOrder="stroke"
            >
              same push
            </text>
          </>
        )}

        {/* speed graph */}
        <line x1={GRAPH.x} y1={GRAPH.y} x2={GRAPH.x} y2={GRAPH.y + GRAPH.h} stroke={col.line} strokeWidth="2" />
        <line
          x1={GRAPH.x}
          y1={GRAPH.y + GRAPH.h}
          x2={GRAPH.x + GRAPH.w}
          y2={GRAPH.y + GRAPH.h}
          stroke={col.line}
          strokeWidth="2"
        />
        <text x={GRAPH.x - 8} y={GRAPH.y + 12} fill={col.muted} fontSize="13" textAnchor="end">
          speed
        </text>
        <text x={GRAPH.x + GRAPH.w} y={GRAPH.y + GRAPH.h + 18} fill={col.muted} fontSize="13" textAnchor="end">
          time
        </text>
        {s.samples.length > 1 ? (
          <>
            <polyline points={line(2)} fill="none" stroke={MASH_RACERS.truck.color} strokeWidth="3" strokeLinejoin="round" />
            <polyline points={line(1)} fill="none" stroke={MASH_RACERS.scooter.color} strokeWidth="3" strokeLinejoin="round" />
            <text x={GRAPH.x + 10} y={GRAPH.y - 8} fill={MASH_RACERS.scooter.color} fontSize="13" fontWeight="700">
              scooter
            </text>
            <text x={GRAPH.x + 80} y={GRAPH.y - 8} fill={MASH_RACERS.truck.color} fontSize="13" fontWeight="700">
              truck
            </text>
          </>
        ) : (
          <text
            x={GRAPH.x + GRAPH.w / 2}
            y={GRAPH.y + GRAPH.h / 2 + 5}
            fill={col.muted}
            fontSize="14"
            textAnchor="middle"
          >
            both speeds will draw themselves here
          </text>
        )}
      </svg>

      <p aria-live="polite" style={{ minHeight: '3em', margin: '8px 0 14px', lineHeight: 1.55, fontSize: 17 }}>
        {mashCaption(s, mass)}
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {Object.entries(MASH_RACERS).map(([k, r]) => {
          const key = k as keyof MashMass;
          const perPush = MASH_PUSH / mass[key] / SPEED_UNIT;
          return (
            <div key={k} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <span style={{ color: r.color, fontWeight: 700, minWidth: '8.5rem' }}>{r.name}</span>
              <button
                aria-label={`Take a crate off the ${r.name}`}
                style={small(locked || mass[key] <= r.base)}
                disabled={locked || mass[key] <= r.base}
                onClick={() => changeMass(key, -1)}
              >
                −
              </button>
              <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '4.5rem', textAlign: 'center' }}>
                mass {mass[key]}
              </span>
              <button
                aria-label={`Add a crate to the ${r.name}`}
                style={small(locked || mass[key] >= MASH_MAX_MASS)}
                disabled={locked || mass[key] >= MASH_MAX_MASS}
                onClick={() => changeMass(key, 1)}
              >
                +
              </button>
              <span style={{ color: col.muted, fontSize: 15 }}>
                each push adds <strong style={{ color: col.ink }}>+{fmtSpeed(perPush)}</strong> speed
              </span>
            </div>
          );
        })}
        {locked && (
          <span style={{ color: col.muted, fontSize: 14 }}>
            Crates are locked mid-race. Hit Race again to change them.
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <button
          style={btn(true, hit)}
          onPointerDown={(e) => {
            if (e.pointerType !== 'mouse' || e.button === 0) doMash();
          }}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              doMash();
            }
          }}
        >
          MASH!
        </button>
        <button style={btn(false)} onClick={reset}>
          Race again
        </button>
        <button style={btn(false)} onClick={resetAll}>
          Reset crates
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: '14px 16px',
          border: `1.5px dashed ${col.line}`,
          borderRadius: 12,
          lineHeight: 1.55,
          fontSize: 15,
        }}
      >
        <strong>Challenge:</strong> make it a dead heat, with both racers crossing the line together.
        <br />
        <span style={{ color: col.muted }}>
          Then the hard one: make the monster truck win, without changing the truck.
        </span>
      </div>
    </div>
  );
}
