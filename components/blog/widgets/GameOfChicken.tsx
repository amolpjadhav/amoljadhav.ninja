'use client';

import { useState } from 'react';

type Move = 'swerve' | 'straight';

const PAYOFFS: Record<Move, Record<Move, { you: number; them: number }>> = {
  swerve: {
    swerve: { you: 3, them: 3 },
    straight: { you: 1, them: 5 },
  },
  straight: {
    swerve: { you: 5, them: 1 },
    straight: { you: -10, them: -10 },
  },
};

interface Outcome {
  you: Move;
  them: Move;
  points: { you: number; them: number };
}

function describe(o: Outcome): string {
  if (o.you === 'swerve' && o.them === 'swerve') return 'You both swerve. No crash, no bragging rights either.';
  if (o.you === 'straight' && o.them === 'straight') return 'Nobody swerves. You crash.';
  if (o.you === 'straight' && o.them === 'swerve') return 'They swerve, you don’t. You win the standoff.';
  return 'You swerve, they don’t. You’re the chicken — but you’re both still in one piece.';
}

export default function GameOfChicken() {
  const [committed, setCommitted] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function playNormally(move: Move) {
    const them: Move = Math.random() < 0.5 ? 'swerve' : 'straight';
    const points = PAYOFFS[move][them];
    setOutcome({ you: move, them, points });
  }

  function playCommitted() {
    // A credible commitment removes your own ability to swerve, so the
    // rational response for the other driver is to swerve — they'd rather
    // look foolish than crash.
    const points = PAYOFFS.straight.swerve;
    setOutcome({ you: 'straight', them: 'swerve', points });
  }

  function switchMode(next: boolean) {
    setCommitted(next);
    setOutcome(null);
  }

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Two cars are headed straight at each other. Swerve, and you avoid a crash but look like the one who
        backed down. Neither of you swerves, and you both crash.
      </p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => switchMode(false)}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
            !committed
              ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
              : 'border-white/15 text-white/60 hover:border-white/30'
          }`}
        >
          Play it normally
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
            committed
              ? 'border-[#facc15]/60 text-[#facc15] bg-[#facc15]/10'
              : 'border-white/15 text-white/60 hover:border-white/30'
          }`}
        >
          Rip out your steering wheel first
        </button>
      </div>

      {!committed ? (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => playNormally('swerve')}
            className="border border-white/15 rounded-lg py-3 px-4 text-white/85 hover:border-[#0aee3c]/60 hover:text-[#0aee3c] transition-colors"
          >
            Swerve
          </button>
          <button
            onClick={() => playNormally('straight')}
            className="border border-white/15 rounded-lg py-3 px-4 text-white/85 hover:border-[#f472b6]/60 hover:text-[#f472b6] transition-colors"
          >
            Go straight
          </button>
        </div>
      ) : (
        <div className="mb-5">
          <p className="text-white/60 text-sm mb-3">
            You&rsquo;ve visibly thrown your steering wheel out the window. The other driver can see it. They
            know you physically can&rsquo;t swerve now, even if you wanted to.
          </p>
          <button
            onClick={playCommitted}
            className="w-full border border-[#facc15]/40 rounded-lg py-2.5 text-[#facc15] hover:border-[#facc15]/70 transition-colors"
          >
            See what they do
          </button>
        </div>
      )}

      {outcome && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/85 text-sm mb-2">{describe(outcome)}</p>
          <p className="text-white/50 text-xs">
            Score: you {outcome.points.you}, them {outcome.points.them}.
          </p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why removing your own options works</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Play it normally enough times and you&rsquo;ll crash sometimes &mdash; nobody can guess what the other
          driver will do. But throw your steering wheel out first, where they can see it, and the crash stops
          being a risk you&rsquo;re both taking together. It becomes a choice only they&rsquo;re making. A driver
          who can still swerve compares crashing to backing down and picks backing down every time. You didn&rsquo;t
          get braver. You made backing down the only option left &mdash; for them, not you.
        </p>
      </div>
    </div>
  );
}
