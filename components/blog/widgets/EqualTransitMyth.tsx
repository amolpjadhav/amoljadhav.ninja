'use client';

// Visualises the OLD textbook story (equal transit time): air splits at the
// front of the wing, the top puff takes the "longer road" over the curve,
// hurries to catch up, and meets the bottom puff at the back edge.
// The animation shows what the myth CLAIMS — the article then debunks it.

export default function EqualTransitMyth() {
  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">The old story, drawn</p>
      <p className="text-white/70 text-sm mb-4">
        Watch the two puffs of air. The old story says they split at the front and meet again at the
        back — so the top puff must hurry along its longer road.
      </p>

      <div className="bg-black/30 rounded-lg p-3 mb-4 overflow-hidden">
        <svg viewBox="0 0 600 280" className="w-full h-auto" role="img" aria-label="Diagram of the equal transit time myth: air splits at the wing's leading edge and reunites at the trailing edge">
          {/* Top (longer) path — dashed so kids can trace it */}
          <path
            id="ett-top"
            d="M 20 150 C 90 145, 130 60, 300 55 C 420 52, 460 120, 480 150 L 580 150"
            fill="none"
            stroke="#f87171"
            strokeWidth={2.5}
            strokeDasharray="7 5"
            opacity={0.9}
          />
          {/* Bottom (shorter) path */}
          <path
            id="ett-bottom"
            d="M 20 195 L 180 195 L 480 185 L 580 185"
            fill="none"
            stroke="#5b9bf5"
            strokeWidth={2.5}
            strokeDasharray="7 5"
            opacity={0.9}
          />

          {/* Wing cross-section: curved on top, flat below */}
          <path
            d="M 180 150 C 230 95, 340 95, 480 160 L 480 178 L 180 185 Z"
            fill="#9aa3ad"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={2}
          />
          <text x={305} y={160} fontSize={16} fill="#1c1d20" fontWeight="bold" textAnchor="middle">
            wing
          </text>

          {/* Split point + reunion point */}
          <circle cx={180} cy={168} r={5} fill="#fff" opacity={0.85} />
          <text x={88} y={172} fontSize={12} fill="rgba(255,255,255,0.6)">
            split here
          </text>
          <circle cx={480} cy={168} r={5} fill="#fff" opacity={0.85} />
          <text x={488} y={172} fontSize={12} fill="rgba(255,255,255,0.6)">
            meet here?
          </text>

          {/* Travelling puffs — same duration, so they arrive together, exactly as the myth claims */}
          <circle r={8} fill="#f87171">
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#ett-top" />
            </animateMotion>
          </circle>
          <circle r={8} fill="#5b9bf5">
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#ett-bottom" />
            </animateMotion>
          </circle>

          {/* Path labels */}
          <text x={300} y={38} fontSize={13} fill="#f87171" fontWeight="bold" textAnchor="middle">
            LONGER road on top — hurry!
          </text>
          <text x={330} y={218} fontSize={13} fill="#5b9bf5" fontWeight="bold" textAnchor="middle">
            SHORTER road below — slow
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70">
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 mr-1.5" />
          top puff (fast)
        </span>
        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 mr-1.5" />
          bottom puff (slow)
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-black/30 p-4">
        <p className="text-white/85 text-sm font-bold mb-2">
          But how does that lift the plane? (This is what the old story claims.)
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-white/70 text-sm">
          <li>
            The red puff has the longer road, so it sprints super fast. The blue puff has the short
            road, so it strolls along slowly.
          </li>
          <li>
            Here comes the story&rsquo;s big rule: <strong className="text-white/90">fast air pushes
            softly, slow air pushes hard.</strong> Imagine running past someone and barely brushing
            their shoulder (fast, soft) versus giving them a slow, heavy shove (slow, hard).
          </li>
          <li>
            So the slow blue air under the wing pushes UP hard, while the fast red air above pushes
            DOWN only softly. The strong push wins — the wing gets shoved upward. That upward win is
            what the old story calls <strong className="text-white/90">lift</strong>.
          </li>
        </ol>
      </div>
      <p className="text-white/50 text-xs mt-3">
        Spoiler: smoke-tunnel films show the top air arrives well before the bottom air — there was
        never a reunion to explain. Keep reading.
      </p>
    </div>
  );
}
