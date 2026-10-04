'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  BOWL_BALL_R,
  BOWL_CUSHION_X,
  BOWL_FOUL_X,
  BOWL_GRAPH_TMAX,
  BOWL_LANE_CY,
  BOWL_PIN_R,
  BOWL_PUSH,
  BOWL_SURFACES,
  bowlingCaption,
  freshBowState,
  stepBowling,
  type BowState,
} from '@/lib/bowling';

// Bowling lab: a real rolling simulation, not a cartoon. Hold to push (the
// hand lets go at the foul line), pick a lane surface to dial friction up
// and down, and watch the speed graph draw itself. Pins scatter on contact
// and push back on the ball; the back cushion stops anything that reaches it.

const VW = 640;
const VH = 330;
const LANE_L = 40;
const LANE_R = 600;
const LANE_TOP = 60;
const LANE_BOT = 160;
const FS = 0.1; // arrow px per force unit
const GRAPH = { x: 60, y: 210, w: 540, h: 90, vMax: 380 };

const col = {
  panel: '#191617',
  ink: '#e6e1df',
  muted: '#9a9290',
  line: '#2f2a2b',
  accent: '#ef6a5f',
  push: '#ef6a5f',
  fric: '#f2c14e',
  back: '#8fb4ff',
  ball: '#3b2f63',
  hole: '#16121f',
  pin: '#f3f3f3',
  pinRing: '#ef6a5f',
  pit: '#0f0d0e',
  skin: '#f8d29a',
};

function HArrow({
  x,
  y,
  len,
  dir,
  color,
  label,
  labelY,
}: {
  x: number;
  y: number;
  len: number;
  dir: 1 | -1;
  color: string;
  label?: string;
  labelY?: number;
}) {
  if (len < 3) return null;
  const tip = x + dir * len;
  const head = Math.min(11, len * 0.6);
  return (
    <g>
      <line x1={x} y1={y} x2={tip - dir * head * 0.8} y2={y} stroke={color} strokeWidth="5" strokeLinecap="round" />
      <polygon points={`${tip - dir * head},${y - 8} ${tip - dir * head},${y + 8} ${tip},${y}`} fill={color} />
      {label && (
        <text
          x={(x + tip) / 2}
          y={labelY ?? y - 12}
          fill={color}
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          stroke={col.panel}
          strokeWidth="4"
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export default function BowlingLab() {
  const [sim, setSim] = useState<BowState>(() => freshBowState());
  const holding = useRef(false);
  const slowRef = useRef(false);
  const surfRef = useRef('magic');
  const [surface, setSurface] = useState('magic');
  const [slow, setSlow] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const real = Math.min(0.05, (t - last) / 1000);
      last = t;
      const dt = real * (slowRef.current ? 0.2 : 1);
      const n = Math.max(1, Math.ceil(dt / 0.004));
      const mu = BOWL_SURFACES[surfRef.current].mu;
      setSim((prev) => {
        const s: BowState = {
          ...prev,
          pins: prev.pins.map((p) => ({ ...p })),
          samples: [...prev.samples],
          dots: [...prev.dots],
        };
        for (let i = 0; i < n; i++) stepBowling(s, dt / n, holding.current, mu);
        return s;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setHold = useCallback((on: boolean) => {
    holding.current = on;
    setPressed(on);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setHold(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setHold(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [setHold]);

  const pickSurface = (k: string) => {
    surfRef.current = k;
    setSurface(k);
  };
  const reset = () => setSim(freshBowState());
  const toggleSlow = () => {
    slowRef.current = !slowRef.current;
    setSlow(slowRef.current);
  };

  const s = sim;
  const surf = BOWL_SURFACES[surface];
  const mu = surf.mu;
  const moving = s.v > 0;
  const recentPins = s.pinHitT >= 0 && s.t - s.pinHitT < 0.45;
  const recentCushion = s.cushionT >= 0 && s.t - s.cushionT < 0.6;
  const spin = (s.x - 72) / BOWL_BALL_R;
  const holes = [
    [-5, -5],
    [5, -6],
    [0, 5],
  ].map(([hx, hy]) => [hx * Math.cos(spin) - hy * Math.sin(spin), hx * Math.sin(spin) + hy * Math.cos(spin)]);
  const noPushes = moving && mu === 0 && !s.pushingNow && !recentPins;

  const gx = (t: number) => GRAPH.x + (t / BOWL_GRAPH_TMAX) * GRAPH.w;
  const gy = (v: number) => GRAPH.y + GRAPH.h - (Math.min(v, GRAPH.vMax) / GRAPH.vMax) * GRAPH.h;
  const graphPts = s.samples.map(([t, v]) => `${gx(t).toFixed(1)},${gy(v).toFixed(1)}`).join(' ');

  const btn = (active: boolean, primary: boolean): CSSProperties => ({
    fontSize: 16,
    fontWeight: 700,
    padding: '12px 18px',
    borderRadius: 12,
    cursor: 'pointer',
    border: `1.5px solid ${primary ? col.accent : active ? col.ink : col.line}`,
    background: primary ? (active ? '#cf5248' : col.accent) : active ? col.ink : 'transparent',
    color: primary ? '#1a0e0d' : active ? col.panel : col.ink,
    touchAction: 'none',
    userSelect: 'none',
  });
  const chip = (active: boolean): CSSProperties => ({
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 999,
    cursor: 'pointer',
    border: `1.5px solid ${active ? col.accent : col.line}`,
    background: active ? 'rgba(239,106,95,0.15)' : 'transparent',
    color: active ? col.ink : col.muted,
  });

  return (
    <div style={{ background: col.panel, color: col.ink, borderRadius: 16, padding: '20px 20px 24px', maxWidth: 760 }}>
      <div role="radiogroup" aria-label="Lane surface" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: col.muted, fontSize: 14, marginRight: 4 }}>Lane:</span>
        {Object.entries(BOWL_SURFACES).map(([k, v]) => (
          <button key={k} role="radio" aria-checked={surface === k} style={chip(surface === k)} onClick={() => pickSurface(k)}>
            {v.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" role="img" aria-label={`Bowling lane, ${surf.label}. ${bowlingCaption(s, mu, surf.label)}`}>
        <rect x={LANE_L} y={LANE_TOP - 14} width={LANE_R - LANE_L} height={LANE_BOT - LANE_TOP + 28} rx="10" fill="#2a211a" />
        <rect x={LANE_L} y={LANE_TOP} width={LANE_R - LANE_L} height={LANE_BOT - LANE_TOP} fill={surf.fill} />
        {surface === 'wood' &&
          [0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={LANE_L} x2={LANE_R} y1={LANE_TOP + f * 100} y2={LANE_TOP + f * 100} stroke={surf.line} strokeWidth="2" />
          ))}
        {surface === 'carpet' &&
          Array.from({ length: 56 }, (_, i) => (
            <circle key={i} cx={LANE_L + 10 + (i % 28) * 20} cy={LANE_TOP + 25 + Math.floor(i / 28) * 50} r="2" fill={surf.line} />
          ))}
        {surface === 'magic' &&
          [
            [120, 80],
            [260, 140],
            [380, 75],
            [450, 130],
            [300, 95],
          ].map(([x, y], i) => (
            <text key={i} x={x} y={y} fill="#bfb2ff" stroke="none" opacity="0.45" fontSize="12">
              ✦
            </text>
          ))}
        {surface === 'ice' && <rect x={LANE_L} y={LANE_TOP} width={LANE_R - LANE_L} height="18" fill="#fff" opacity="0.18" />}
        <rect x={LANE_R} y={LANE_TOP - 14} width={BOWL_CUSHION_X - LANE_R + 8} height={LANE_BOT - LANE_TOP + 28} fill={col.pit} />
        <rect x={BOWL_CUSHION_X} y={LANE_TOP - 14} width="8" height={LANE_BOT - LANE_TOP + 28} rx="3" fill="#4a4446" />

        <line x1={BOWL_FOUL_X} x2={BOWL_FOUL_X} y1={LANE_TOP} y2={LANE_BOT} stroke={col.ink} strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
        <text x={BOWL_FOUL_X} y={LANE_TOP - 22} fill={col.muted} stroke="none" fontSize="13" textAnchor="middle">
          hand lets go here
        </text>

        {s.dots.map((x, i) => (
          <circle key={i} cx={x} cy={BOWL_LANE_CY} r="5" fill={col.ink} opacity="0.28" />
        ))}

        {s.pins.map(
          (p, i) =>
            !p.gone && (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={BOWL_PIN_R} fill={col.pin} />
                <circle cx={p.x} cy={p.y} r={BOWL_PIN_R - 3.5} fill="none" stroke={col.pinRing} strokeWidth="2" />
              </g>
            ),
        )}

        {s.pushingNow && <rect x={s.x - BOWL_BALL_R - 22} y={BOWL_LANE_CY - 15} width="20" height="30" rx="8" fill={col.skin} />}

        <circle cx={s.x} cy={BOWL_LANE_CY} r={BOWL_BALL_R} fill={col.ball} />
        {holes.map(([hx, hy], i) => (
          <circle key={i} cx={s.x + hx} cy={BOWL_LANE_CY + hy} r="2.6" fill={col.hole} />
        ))}

        {s.pushingNow && <HArrow x={s.x - BOWL_PUSH * FS} y={BOWL_LANE_CY - 30} len={BOWL_PUSH * FS - 4} dir={1} color={col.push} label="your push" />}
        {moving && mu > 0 && !s.pushingNow && (
          <HArrow x={s.x} y={BOWL_LANE_CY + 30} len={Math.max(6, mu * FS)} dir={-1} color={col.fric} label="friction" labelY={BOWL_LANE_CY + 48} />
        )}
        {moving && mu > 0 && s.pushingNow && <HArrow x={s.x} y={BOWL_LANE_CY + 30} len={Math.max(6, mu * FS)} dir={-1} color={col.fric} />}
        {recentPins && <HArrow x={s.x + BOWL_BALL_R} y={BOWL_LANE_CY - 30} len={50} dir={-1} color={col.back} label="pins push back" />}
        {recentCushion && <HArrow x={s.x + BOWL_BALL_R} y={BOWL_LANE_CY - 30} len={50} dir={-1} color={col.back} label="cushion pushes back" />}
        {noPushes && (
          <text
            x={s.x}
            y={BOWL_LANE_CY - 26}
            fill={col.ink}
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
            stroke={col.panel}
            strokeWidth="4"
            paintOrder="stroke"
          >
            no pushes on it
          </text>
        )}

        <line x1={GRAPH.x} y1={GRAPH.y} x2={GRAPH.x} y2={GRAPH.y + GRAPH.h} stroke={col.line} strokeWidth="2" />
        <line x1={GRAPH.x} y1={GRAPH.y + GRAPH.h} x2={GRAPH.x + GRAPH.w} y2={GRAPH.y + GRAPH.h} stroke={col.line} strokeWidth="2" />
        <text x={GRAPH.x - 8} y={GRAPH.y + 12} fill={col.muted} stroke="none" fontSize="13" textAnchor="end">
          speed
        </text>
        <text x={GRAPH.x + GRAPH.w} y={GRAPH.y + GRAPH.h + 18} fill={col.muted} stroke="none" fontSize="13" textAnchor="end">
          time
        </text>
        {graphPts && <polyline points={graphPts} fill="none" stroke={col.accent} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
        {!graphPts && (
          <text x={GRAPH.x + GRAPH.w / 2} y={GRAPH.y + GRAPH.h / 2 + 5} fill={col.muted} stroke="none" fontSize="14" textAnchor="middle">
            the ball&apos;s speed will draw itself here
          </text>
        )}
      </svg>

      <p aria-live="polite" style={{ minHeight: '3em', margin: '8px 0 16px', lineHeight: 1.55, fontSize: 17 }}>
        {bowlingCaption(s, mu, surf.label)}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          style={btn(pressed, true)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setHold(true);
          }}
          onPointerUp={() => setHold(false)}
          onPointerCancel={() => setHold(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setHold(true);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') setHold(false);
          }}
        >
          Hold to push
        </button>
        <button style={btn(slow, false)} onClick={toggleSlow} aria-pressed={slow}>
          Slow-mo
        </button>
        <button style={btn(false, false)} onClick={reset}>
          Reset
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
        <strong>Challenge:</strong> on magic-smooth, get the ball to slow down before it reaches the pins. Push
        soft, push hard, try slow-mo.
        <br />
        <span style={{ color: col.muted }}>Then switch to carpet and try to stop it just short of the pins.</span>
      </div>
    </div>
  );
}
