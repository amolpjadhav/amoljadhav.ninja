// Static orientation diagram for the water-tower analogy — a labeled tower,
// hose, and house, with a gentle continuous flow animation. No controls;
// this just anchors the picture before the interactive sections explain it.
export default function WaterTowerDiagram() {
  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">The picture to keep in mind</p>
      <p className="text-white/70 text-sm mb-4">
        A tower holds water up high. A hose carries it down and into the house. Every idea below is just a different way of
        describing some part of this.
      </p>

      <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
        <svg
          viewBox="0 0 430 200"
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto mx-auto"
          style={{ minWidth: 280 }}
        >
          <path d="M0,200 L130,55 L430,200 Z" fill="rgba(255,255,255,0.04)" />

          <rect x="95" y="30" width="60" height="45" rx="4" fill="rgba(91,155,245,0.22)" stroke="rgba(91,155,245,0.5)" />
          <polygon points="88,30 162,30 125,8" fill="rgba(91,155,245,0.32)" />
          <text x="125" y="20" fontSize="11" fill="rgba(255,255,255,0.55)" textAnchor="middle">
            Water tower
          </text>

          <path
            d="M125,75 L125,172 L300,172"
            fill="none"
            stroke="rgba(91,155,245,0.35)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} r={4} fill="#5b9bf5">
              <animate
                attributeName="cx"
                values="125;125;300"
                keyTimes="0;0.45;1"
                dur="3.2s"
                begin={`${i * 0.8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="75;172;172"
                keyTimes="0;0.45;1"
                dur="3.2s"
                begin={`${i * 0.8}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
          <text x="210" y="188" fontSize="11" fill="rgba(255,255,255,0.55)" textAnchor="middle">
            Hose (like a wire)
          </text>

          <rect x="302" y="142" width="66" height="38" fill="rgba(250,204,21,0.14)" stroke="rgba(250,204,21,0.4)" />
          <polygon points="297,142 373,142 335,113" fill="rgba(250,204,21,0.22)" />
          <text x="335" y="103" fontSize="11" fill="rgba(255,255,255,0.55)" textAnchor="middle">
            House (uses the water)
          </text>
        </svg>
      </div>
    </div>
  );
}
