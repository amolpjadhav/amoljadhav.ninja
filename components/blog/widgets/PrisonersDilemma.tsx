'use client';

import { useState } from 'react';

type Choice = 'silent' | 'betray';
type Scenario = 'unknown' | 'theySilent' | 'theyBetray';

// Classic payoff matrix, in years of prison time (lower is better for you).
const OUTCOMES: Record<Choice, Record<Choice, { you: number; them: number }>> = {
  silent: {
    silent: { you: 1, them: 1 },
    betray: { you: 5, them: 0 },
  },
  betray: {
    silent: { you: 0, them: 5 },
    betray: { you: 3, them: 3 },
  },
};

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'unknown', label: "Unknown (they're a coin flip)" },
  { id: 'theySilent', label: 'They stay silent' },
  { id: 'theyBetray', label: 'They betray' },
];

function resolveOpponent(scenario: Scenario): Choice {
  if (scenario === 'theySilent') return 'silent';
  if (scenario === 'theyBetray') return 'betray';
  return Math.random() < 0.5 ? 'silent' : 'betray';
}

export default function PrisonersDilemma() {
  const [scenario, setScenario] = useState<Scenario>('unknown');
  const [yourChoice, setYourChoice] = useState<Choice | null>(null);
  const [theirChoice, setTheirChoice] = useState<Choice | null>(null);
  const [rounds, setRounds] = useState(0);
  const [yourTotal, setYourTotal] = useState(0);

  function play(choice: Choice) {
    const opponentChoice = resolveOpponent(scenario);
    const outcome = OUTCOMES[choice][opponentChoice];

    setYourChoice(choice);
    setTheirChoice(opponentChoice);
    setRounds((r) => r + 1);
    setYourTotal((t) => t + outcome.you);
  }

  function changeScenario(next: Scenario) {
    setScenario(next);
    setYourChoice(null);
    setTheirChoice(null);
    setRounds(0);
    setYourTotal(0);
  }

  const outcome = yourChoice && theirChoice ? OUTCOMES[yourChoice][theirChoice] : null;
  const average = rounds > 0 ? (yourTotal / rounds).toFixed(1) : null;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You and a partner were both arrested. You can&rsquo;t communicate. Pick what you know (or don&rsquo;t know) about
        their move, then decide.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => changeScenario(s.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              scenario === s.id
                ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
                : 'border-white/15 text-white/50 hover:text-white/80 hover:border-white/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => play('silent')}
          className="border border-white/15 rounded-lg py-3 px-4 text-white/85 hover:border-[#0aee3c]/60 hover:text-[#0aee3c] transition-colors"
        >
          Stay silent
        </button>
        <button
          onClick={() => play('betray')}
          className="border border-white/15 rounded-lg py-3 px-4 text-white/85 hover:border-[#f472b6]/60 hover:text-[#f472b6] transition-colors"
        >
          Betray them
        </button>
      </div>

      {outcome && (
        <div className="border-t border-white/10 pt-4 mb-4">
          <p className="text-white/85 mb-1">
            You chose to <strong>{yourChoice === 'silent' ? 'stay silent' : 'betray'}</strong>. They chose to{' '}
            <strong>{theirChoice === 'silent' ? 'stay silent' : 'betray'}</strong>.
          </p>
          <p className="text-white/60 text-sm">
            Result: you get <span className="text-[#0aee3c] font-semibold">{outcome.you} year{outcome.you === 1 ? '' : 's'}</span>, they get{' '}
            <span className="font-semibold">{outcome.them} year{outcome.them === 1 ? '' : 's'}</span>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5">
        <div />
        <div className="text-white/40 pb-1">They stay silent</div>
        <div className="text-white/40 pb-1">They betray</div>

        <div className="text-white/40 flex items-center justify-end pr-2">You stay silent</div>
        <MatrixCell you={1} them={1} highlighted={yourChoice === 'silent' && theirChoice === 'silent'} />
        <MatrixCell you={5} them={0} highlighted={yourChoice === 'silent' && theirChoice === 'betray'} />

        <div className="text-white/40 flex items-center justify-end pr-2">You betray</div>
        <MatrixCell you={0} them={5} highlighted={yourChoice === 'betray' && theirChoice === 'silent'} />
        <MatrixCell you={3} them={3} highlighted={yourChoice === 'betray' && theirChoice === 'betray'} />
      </div>

      {rounds > 0 && (
        <div className="flex items-center justify-between text-sm mb-5">
          <p className="text-white/50">
            {rounds} round{rounds === 1 ? '' : 's'} played &middot; average{' '}
            <span className="text-white/80 font-semibold">{average}</span> year{average === '1.0' ? '' : 's'}/round for you
            {scenario === 'unknown' && rounds < 10 && (
              <span className="text-white/30"> (play a few more for a steadier average)</span>
            )}
          </p>
          <button onClick={() => changeScenario(scenario)} className="text-white/50 hover:text-white/85 underline transition-colors">
            Reset
          </button>
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why betraying wins either way</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Check both branches: <strong className="text-white/80">if they stay silent</strong>, you get 1 year by
          staying silent too, or 0 years by betraying &mdash; betraying wins.{' '}
          <strong className="text-white/80">If they betray</strong>, you get 5 years by staying silent, or 3 years
          by betraying &mdash; betraying wins again. There&rsquo;s no scenario where staying silent gives you a
          better outcome. In game theory, a choice that beats every alternative no matter what the other player
          does is called a <strong className="text-white/80">dominant strategy</strong>.
        </p>
        <p className="text-white/60 text-sm leading-relaxed mt-3">
          Here&rsquo;s the paradox: if you both follow that same logic, you both betray and both get 3 years &mdash;
          worse than the 1 year you&rsquo;d each get by staying silent. Two people acting in their own rational
          self-interest land on a worse outcome than if they&rsquo;d cooperated. That gap is the entire reason the
          Prisoner&rsquo;s Dilemma is famous.
        </p>
      </div>
    </div>
  );
}

function MatrixCell({ you, them, highlighted }: { you: number; them: number; highlighted: boolean }) {
  return (
    <div
      className={`rounded-md py-2 border ${
        highlighted ? 'border-[#0aee3c] bg-[#0aee3c]/10' : 'border-white/10'
      }`}
    >
      <span className="text-white/85">{you}</span>
      <span className="text-white/30">/</span>
      <span className="text-white/50">{them}</span>
    </div>
  );
}
