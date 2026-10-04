'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  TRAMPOLINE_GRAVITY,
  forcePoints,
  restState,
  stepTrampoline,
  trampolineCaption,
  type TrampolineState,
} from '@/lib/trampoline';

// Trampoline lab: a real spring simulation, not a cartoon. A damped-spring
// mat plus gravity, integrated live — the pair arrows are measured every
// frame from one contact force, so they always tie. Press Drop her in, hold
// Push (or space) to pump higher, freeze moments with Slow-mo and Freeze.

const VW = 640;
const VH = 500;
const CX = 320;
const MAT_Y = 280;
const MAT_L = 140;
const MAT_R = 500;
const FS = 0.02; // arrow px per force unit (gravity renders ≈ 18px)

const col = {
  panel: '#151a17',
  ink: '#dfe5dc',
  muted: '#8f998f',
  line: '#2a322c',
  up: '#6ee75a',
  down: '#ff7a6b',
  grav: '#f2c14e',
  mat: '#6b9cf0',
  frame: '#3a3f45',
  legs: '#9aa1ab',
  skin: '#f8d29a',
  shirt: '#f0a6e8',
  pants: '#2b2e36',
};

function Arrow({
  x,
  y,
  len,
  dir,
  color,
  label,
  labelSide = 'right',
}: {
  x: number;
  y: number;
  len: number;
  dir: 1 | -1;
  color: string;
  label: string;
  labelSide?: 'right' | 'left';
}) {
  if (len < 4) return null;
  const tip = y + dir * len;
  const head = Math.min(12, len * 0.6);
  const lx = labelSide === 'right' ? x + 12 : x - 12;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={tip - dir * head * 0.8} stroke={color} strokeWidth="6" strokeLinecap="round" />
      <polygon points={`${x - 9},${tip - dir * head} ${x + 9},${tip - dir * head} ${x},${tip}`} fill={color} />
      <text
        x={lx}
        y={y + dir * len * 0.5 + 5}
        fill={color}
        stroke="none"
        fontSize="15"
        fontWeight="700"
        textAnchor={labelSide === 'right' ? 'start' : 'end'}
      >
        {label}
      </text>
    </g>
  );
}

function Bar({ label, value, color, max = 600 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 11rem) 1fr 3rem', alignItems: 'center', gap: 10 }}>
      <span style={{ color, fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div style={{ height: 12, background: col.line, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
      </div>
      <span style={{ color: col.ink, fontVariantNumeric: 'tabular-nums', textAlign: 'right', fontSize: 14 }}>{value}</span>
    </div>
  );
}

export default function TrampolineLab() {
  const [sim, setSim] = useState<TrampolineState>(() => restState());
  const pushing = useRef(false);
  const slowRef = useRef(false);
  const frozenRef = useRef(false);
  const [slow, setSlow] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const real = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!frozenRef.current) {
        const dt = real * (slowRef.current ? 0.2 : 1);
        const n = Math.max(1, Math.ceil(dt / 0.002));
        setSim((prev) => {
          let s = prev;
          for (let i = 0; i < n; i++) s = stepTrampoline(s, dt / n, pushing.current);
          return s;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setPush = useCallback((on: boolean) => {
    pushing.current = on;
    setPressed(on);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setPush(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setPush(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [setPush]);

  const drop = () => {
    setSim((prev) => ({ ...restState(), hb: 180, v: 0, N: 0, depth: 0, best: prev.best }));
  };
  const reset = () => {
    setSim(restState());
    setSlow(false);
    slowRef.current = false;
    setFrozen(false);
    frozenRef.current = false;
  };
  const toggleSlow = () => {
    slowRef.current = !slowRef.current;
    setSlow(slowRef.current);
  };
  const toggleFreeze = () => {
    frozenRef.current = !frozenRef.current;
    setFrozen(frozenRef.current);
  };

  const s = sim;
  const contact = s.depth > 0;
  const feetY = MAT_Y - (s.hb - s.L);
  const dipY = MAT_Y + s.depth;
  const hipY = feetY - s.L;
  const torsoTop = hipY - 44;
  const headY = torsoTop - 16;
  const pair = contact ? forcePoints(s.N) : 0;
  const squash = contact ? Math.min(1, s.depth / 60) : 0;

  const btn = (active: boolean, primary: boolean): CSSProperties => ({
    fontSize: 16,
    fontWeight: 700,
    padding: '12px 18px',
    borderRadius: 12,
    cursor: 'pointer',
    border: `1.5px solid ${primary ? col.up : active ? col.ink : col.line}`,
    background: primary ? (active ? '#4fc23c' : col.up) : active ? col.ink : 'transparent',
    color: primary ? '#0d140c' : active ? col.panel : col.ink,
    touchAction: 'none',
    userSelect: 'none',
  });

  return (
    <div style={{ background: col.panel, color: col.ink, borderRadius: 16, padding: '20px 20px 24px', maxWidth: 760 }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" role="img" aria-label={`Trampoline. ${trampolineCaption(s)} Pair push: ${pair}. Gravity: 100.`}>
        {/* frame */}
        <line x1={MAT_L + 10} y1={MAT_Y + 12} x2={MAT_L - 30} y2={MAT_Y + 150} stroke={col.legs} strokeWidth="9" strokeLinecap="round" />
        <line x1={MAT_R - 10} y1={MAT_Y + 12} x2={MAT_R + 30} y2={MAT_Y + 150} stroke={col.legs} strokeWidth="9" strokeLinecap="round" />
        <rect x={MAT_L - 16} y={MAT_Y - 8} width={MAT_R - MAT_L + 32} height="16" rx="8" fill={col.frame} />
        {/* mat: sags where her feet press */}
        <path
          d={`M ${MAT_L} ${MAT_Y} Q ${CX} ${MAT_Y + 2 * s.depth} ${MAT_R} ${MAT_Y}`}
          stroke={col.mat}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />

        {/* buddy */}
        <g>
          <rect x={CX - 17} y={hipY} width="13" height={s.L} rx="6" fill={col.pants} />
          <rect x={CX + 4} y={hipY} width="13" height={s.L} rx="6" fill={col.pants} />
          <rect x={CX - 24 - squash * 3} y={torsoTop} width={48 + squash * 6} height="46" rx="10" fill={col.shirt} />
          <circle cx={CX} cy={headY} r="19" fill={col.skin} />
          <circle cx={CX - 7} cy={headY - 3} r="2.6" fill="#1a1a1a" />
          <circle cx={CX + 7} cy={headY - 3} r="2.6" fill="#1a1a1a" />
          {contact && s.depth > 35 ? (
            <ellipse cx={CX} cy={headY + 8} rx="4" ry="5" fill="#1a1a1a" />
          ) : (
            <path
              d={`M ${CX - 8} ${headY + 6} Q ${CX} ${headY + 13} ${CX + 8} ${headY + 6}`}
              stroke="#1a1a1a"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* forces */}
        <Arrow x={CX + 50} y={torsoTop + 23} len={TRAMPOLINE_GRAVITY * FS} dir={1} color={col.grav} label="gravity" />
        {contact && (
          <>
            <Arrow x={CX - 50} y={feetY} len={s.N * FS} dir={-1} color={col.up} label="mat pushes her" labelSide="left" />
            <Arrow x={CX} y={dipY + 8} len={s.N * FS} dir={1} color={col.down} label="she pushes mat" />
          </>
        )}
        {!contact && (
          <text x={CX} y={MAT_Y + 50} fill={col.muted} stroke="none" fontSize="15" textAnchor="middle">
            not touching, so no push pair
          </text>
        )}
        {frozen && (
          <text x={18} y={30} fill={col.ink} stroke="none" fontSize="15" fontWeight="700">
            ⏸ frozen
          </text>
        )}
        {slow && !frozen && (
          <text x={18} y={30} fill={col.ink} stroke="none" fontSize="15" fontWeight="700">
            🐢 slow-mo
          </text>
        )}
      </svg>

      <p aria-live="polite" style={{ minHeight: '3em', margin: '8px 0 16px', lineHeight: 1.55, fontSize: 17 }}>
        {trampolineCaption(s)}
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 6 }}>
        <Bar label="Mat pushes her ↑" value={pair} color={col.up} />
        <Bar label="She pushes mat ↓" value={pair} color={col.down} />
        <Bar label="Gravity pulls her ↓" value={100} color={col.grav} />
      </div>
      <p style={{ color: col.muted, fontSize: 14, margin: '4px 0 18px' }}>
        The top two are one pair, so they always tie. They push on different things, so they don&apos;t cancel.
        Best bounce: <strong style={{ color: col.ink }}>{Math.round(s.best)} cm</strong>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button style={btn(false, true)} onClick={drop}>
          Drop her in
        </button>
        <button
          style={btn(pressed, false)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setPush(true);
          }}
          onPointerUp={() => setPush(false)}
          onPointerCancel={() => setPush(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setPush(true);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') setPush(false);
          }}
        >
          Hold to push
        </button>
        <button style={btn(slow, false)} onClick={toggleSlow} aria-pressed={slow}>
          Slow-mo
        </button>
        <button style={btn(frozen, false)} onClick={toggleFreeze} aria-pressed={frozen}>
          {frozen ? 'Unfreeze' : 'Freeze'}
        </button>
        <button style={btn(false, false)} onClick={reset}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 18, padding: '14px 16px', border: `1.5px dashed ${col.line}`, borderRadius: 12, lineHeight: 1.55, fontSize: 15 }}>
        <strong>Challenge:</strong> freeze her at a moment when the green and red bars are different sizes.
        Try slow-mo. Try pushing.
        <br />
        <span style={{ color: col.muted }}>Tip: hold Push (or the space bar) to bounce higher. Let go and the bounces fade.</span>
      </div>
    </div>
  );
}
