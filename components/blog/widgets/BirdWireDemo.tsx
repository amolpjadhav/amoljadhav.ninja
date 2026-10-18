'use client';

import { useState } from 'react';

// Bird on a wire: voltage is a *difference*, so what matters is the volts
// across your body, not the volts in the wire. Four scenarios share one
// schematic scene: a bird with both feet on one wire (safe), a bird
// touching two wires at the full wire-to-wire voltage (zap), a grounded
// person touching one wire at the wire-to-ground voltage (~7.2 kV on a
// 12 kV line, about three-fifths of wire-to-wire) (zap), and a lineman on
// an insulated platform (safe, same physics as the bird).
// A voltmeter reads across the body and the current follows Ohm's law
// through a dry-body 100,000 ohms.

type ScenarioId = 'bird-one' | 'bird-two' | 'person' | 'lineman';

interface Scenario {
  id: ScenarioId;
  label: string;
  voltsAcross: (wireVolts: number) => number;
  blurb: string;
}

const R_BODY = 100_000;

const SCENARIOS: Scenario[] = [
  {
    id: 'bird-one',
    label: 'Bird, one wire',
    voltsAcross: () => 0,
    blurb: 'Both feet sit at the same voltage. No difference, no push, no current — the bird is fine.',
  },
  {
    id: 'bird-two',
    label: 'Bird, two wires',
    voltsAcross: (v) => v,
    blurb: 'Feet on one wire, head on another at a different voltage. The full line voltage pushes current through the bird.',
  },
  {
    id: 'person',
    label: 'Person, grounded',
    voltsAcross: (v) => Math.round(v * 0.6),
    blurb: 'Hand on the wire, feet on the ground. The wire-to-ground voltage — about three-fifths of the line voltage — crosses the body.',
  },
  {
    id: 'lineman',
    label: 'Lineman, insulated',
    voltsAcross: () => 0,
    blurb: 'Same physics as the bird: the insulated platform leaves current with nowhere to go, so none flows.',
  },
];

function fmtVolts(v: number): string {
  return v >= 1000 ? `${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} kV` : `${Math.round(v)} V`;
}

export default function BirdWireDemo() {
  const [wireVolts, setWireVolts] = useState(12_000);
  const [scenarioId, setScenarioId] = useState<ScenarioId>('bird-one');
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const voltsAcross = scenario.voltsAcross(wireVolts);
  const currentMA = (voltsAcross / R_BODY) * 1000;
  const verdict = currentMA < 1 ? 'safe' : currentMA < 10 ? 'tingle' : 'zap';
  // The slider sets the wire-to-wire line voltage. The subline names its
  // wire-to-ground equivalent — the ≈ is honest: 0.6× is the typical ratio
  // on a neighborhood line, not a measured value. The schematic caption
  // names whichever volts the selected visitor actually touches.
  const wireToGround = Math.round(wireVolts * 0.6);
  const voltageUsed =
    scenarioId === 'bird-two'
      ? `Voltage used: ${fmtVolts(wireVolts)} (wire-to-wire)`
      : scenarioId === 'person'
        ? `Voltage used: ${fmtVolts(voltsAcross)} (to ground)`
        : 'Voltage used: 0 V across body';

  return (
    <div className="transit-ui not-prose my-6 rounded-[22px] border border-white/[0.12] bg-white/[0.06] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.8]">
      <style>{`
        .bw-flow { stroke-dasharray: 3 7; animation: bw-flow 0.5s linear infinite; }
        @keyframes bw-flow { to { stroke-dashoffset: -10; } }
        .bw-zap { animation: bw-shake 0.4s linear infinite; }
        @keyframes bw-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1.5px, 1px); }
          75% { transform: translate(1.5px, -1px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bw-flow, .bw-zap { animation: none; }
        }
      `}</style>
      <p className="mb-1 text-xs tracking-wide text-white/40 uppercase">Try it yourself</p>
      <p className="mb-4 text-sm text-white/70">
        Same wire, four visitors. Only the volts <em>across the body</em> matter — watch the meter.
      </p>

      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-white/50">
          <span>Line voltage</span>
          <span>{fmtVolts(wireVolts)} wire-to-wire</span>
        </div>
        <input
          type="range"
          min={1000}
          max={25000}
          step={1000}
          value={wireVolts}
          onChange={(e) => setWireVolts(Number(e.target.value))}
          className="w-full accent-[#0A84FF]"
          aria-label="Line voltage wire-to-wire"
        />
        <p className="mt-1 text-xs text-white/40">≈ {fmtVolts(wireToGround)} to ground</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Scenario">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenarioId(s.id)}
            aria-pressed={s.id === scenarioId}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              s.id === scenarioId
                ? 'bg-[#FFD60A] font-semibold text-black'
                : 'border border-white/[0.08] bg-[#1C1F24] text-white/70 hover:border-white/[0.18] hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 400 220" className="mb-4 w-full rounded-lg bg-black/30" role="img" aria-label={`${scenario.label}: ${fmtVolts(voltsAcross)} across the body`}>
        {/* pole */}
        <rect x="28" y="30" width="10" height="165" fill="#3a3d44" />
        <rect x="14" y="48" width="38" height="6" fill="#3a3d44" />
        {/* ground (person scenario) */}
        {scenarioId === 'person' && (
          <>
            <line x1="0" y1="195" x2="400" y2="195" stroke="#4a4e57" strokeWidth="3" />
            <text x="330" y="188" fill="#9AA0A6" fontSize="10">ground · 0 V</text>
          </>
        )}
        {/* second wire (bird-two scenario) */}
        {scenarioId === 'bird-two' && (
          <path d="M20 34 Q200 62 380 34" fill="none" stroke="#FFD60A" strokeWidth="2.5" opacity="0.9" />
        )}
        {/* main wire */}
        <path d="M20 74 Q200 104 380 74" fill="none" stroke="#FFD60A" strokeWidth="2.5" />
        <text x="300" y="66" fill="#9AA0A6" fontSize="10">{voltageUsed}</text>

        {scenarioId === 'person' && <PersonFigure zapped={verdict === 'zap'} />}
        {scenarioId === 'lineman' && <LinemanFigure />}
        {(scenarioId === 'bird-one' || scenarioId === 'bird-two') && (
          <BirdFigure twoWires={scenarioId === 'bird-two'} zapped={verdict === 'zap'} />
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-black/30 p-4">
        <div>
          <p className="text-[11px] tracking-wide text-white/40 uppercase">Across the body</p>
          <p className="font-mono text-xl text-white tabular-nums">
            <span key={voltsAcross} className="minute-flip">
              {fmtVolts(voltsAcross)}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-wide text-white/40 uppercase">Current</p>
          <p className="font-mono text-xl text-white tabular-nums">
            <span key={currentMA} className="minute-flip">
              {currentMA < 10 ? currentMA.toFixed(1) : Math.round(currentMA)} mA
            </span>
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
            verdict === 'safe'
              ? 'bg-[#30D158]/15 text-[#30D158]'
              : verdict === 'tingle'
                ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]'
                : 'bg-[#FF453A]/15 text-[#FF453A]'
          }`}
        >
          {verdict === 'safe' ? 'SAFE' : verdict === 'tingle' ? 'TINGLE' : 'ZAP'}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/60">{scenario.blurb}</p>
    </div>
  );
}

function BirdFigure({ twoWires, zapped }: { twoWires: boolean; zapped: boolean }) {
  // Feet grip the main wire at y≈89 (sag center); head reaches the upper
  // wire in the two-wire scenario.
  return (
    <g className={zapped ? 'bw-zap' : undefined}>
      {zapped && <ellipse cx="200" cy="66" rx="34" ry="30" fill="rgba(255,69,58,0.18)" />}
      <line x1="196" y1="78" x2="196" y2="89" stroke="#c98f4e" strokeWidth="2" />
      <line x1="204" y1="78" x2="204" y2="89" stroke="#c98f4e" strokeWidth="2" />
      <ellipse cx="200" cy="64" rx="16" ry="13" fill="#5b6b7a" />
      <circle cx="212" cy="56" r="7" fill="#5b6b7a" />
      <path d="M219 56 L226 58.5 L219 61 Z" fill="#FF9F0A" />
      <circle cx="214" cy="55" r="1.4" fill="#000" />
      <path d="M186 62 L176 70 L187 68 Z" fill="#4a5865" />
      {zapped && (
        <line x1="200" y1="40" x2="200" y2="92" stroke="#FF453A" strokeWidth="2.5" className="bw-flow" />
      )}
      {twoWires && <line x1="200" y1="48" x2="200" y2="40" stroke="#FF453A" strokeWidth="2" strokeDasharray="2 3" />}
    </g>
  );
}

function PersonFigure({ zapped }: { zapped: boolean }) {
  return (
    <g className={zapped ? 'bw-zap' : undefined} strokeLinecap="round">
      {zapped && <ellipse cx="200" cy="130" rx="30" ry="62" fill="rgba(255,69,58,0.14)" />}
      {/* arm up to the wire */}
      <line x1="200" y1="120" x2="200" y2="88" stroke="#d9a066" strokeWidth="7" />
      <line x1="200" y1="120" x2="184" y2="132" stroke="#d9a066" strokeWidth="7" />
      <circle cx="200" cy="106" r="9" fill="#e8b07d" />
      <line x1="200" y1="128" x2="200" y2="168" stroke="#3e6fb0" strokeWidth="9" />
      <line x1="200" y1="168" x2="192" y2="193" stroke="#3e6fb0" strokeWidth="8" />
      <line x1="200" y1="168" x2="208" y2="193" stroke="#3e6fb0" strokeWidth="8" />
      {zapped && (
        <line x1="200" y1="88" x2="200" y2="193" stroke="#FF453A" strokeWidth="2.5" className="bw-flow" />
      )}
    </g>
  );
}

function LinemanFigure() {
  return (
    <g>
      {/* insulated platform clamped to the wire */}
      <rect x="176" y="88" width="48" height="10" rx="2" fill="#2e7d46" />
      <text x="200" y="96" fill="#dff5e4" fontSize="7" textAnchor="middle">INSULATED</text>
      <line x1="192" y1="88" x2="192" y2="66" stroke="#d9a066" strokeWidth="7" strokeLinecap="round" />
      <line x1="208" y1="88" x2="208" y2="66" stroke="#d9a066" strokeWidth="7" strokeLinecap="round" />
      <line x1="200" y1="66" x2="200" y2="48" stroke="#d9a066" strokeWidth="8" strokeLinecap="round" />
      <circle cx="200" cy="40" r="8" fill="#e8b07d" />
      <path d="M191 38 A9 9 0 0 1 209 38 L209 36 L191 36 Z" fill="#FFD60A" />
    </g>
  );
}
