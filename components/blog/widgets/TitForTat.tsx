'use client';

import { useState } from 'react';

type Move = 'silent' | 'betray';
type Strategy = 'always-cooperate' | 'always-betray' | 'tit-for-tat' | 'random';

const STRATEGIES: { id: Strategy; label: string }[] = [
  { id: 'always-cooperate', label: 'Always cooperate' },
  { id: 'always-betray', label: 'Always betray' },
  { id: 'tit-for-tat', label: 'Tit-for-tat' },
  { id: 'random', label: 'Random' },
];

const PAYOFFS: Record<Move, Record<Move, { you: number; them: number }>> = {
  silent: { silent: { you: 1, them: 1 }, betray: { you: 5, them: 0 } },
  betray: { silent: { you: 0, them: 5 }, betray: { you: 3, them: 3 } },
};

function getMove(strategy: Strategy, opponentHistory: Move[]): Move {
  if (strategy === 'always-cooperate') return 'silent';
  if (strategy === 'always-betray') return 'betray';
  if (strategy === 'random') return Math.random() < 0.5 ? 'silent' : 'betray';
  // tit-for-tat: cooperate first, then mirror the opponent's last move
  return opponentHistory.length === 0 ? 'silent' : opponentHistory[opponentHistory.length - 1];
}

interface Round {
  you: Move;
  them: Move;
  youScore: number;
  themScore: number;
}

function simulate(yourStrategy: Strategy, theirStrategy: Strategy, rounds: number): Round[] {
  const yourHistory: Move[] = [];
  const theirHistory: Move[] = [];
  const log: Round[] = [];

  for (let i = 0; i < rounds; i++) {
    const you = getMove(yourStrategy, theirHistory);
    const them = getMove(theirStrategy, yourHistory);
    const outcome = PAYOFFS[you][them];
    log.push({ you, them, youScore: outcome.you, themScore: outcome.them });
    yourHistory.push(you);
    theirHistory.push(them);
  }

  return log;
}

function dotColor(round: Round): string {
  if (round.you === 'silent' && round.them === 'silent') return '#0aee3c';
  if (round.you === 'betray' && round.them === 'betray') return '#f472b6';
  return '#facc15';
}

export default function TitForTat() {
  const [yourStrategy, setYourStrategy] = useState<Strategy>('tit-for-tat');
  const [theirStrategy, setTheirStrategy] = useState<Strategy>('always-betray');
  const [log, setLog] = useState<Round[] | null>(null);

  function run() {
    setLog(simulate(yourStrategy, theirStrategy, 10));
  }

  const yourTotal = log ? log.reduce((sum, r) => sum + r.youScore, 0) : null;
  const theirTotal = log ? log.reduce((sum, r) => sum + r.themScore, 0) : null;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        Same prisoner&rsquo;s dilemma as before &mdash; stay silent or betray, measured in years in prison &mdash;
        but now played 10 times in a row against the same partner. Pick a strategy for each side and see who ends
        up with fewer years overall.
      </p>

      <p className="text-xs text-white/40 mb-2">Your strategy</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setYourStrategy(s.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              yourStrategy === s.id
                ? 'border-[#0aee3c]/60 text-[#0aee3c] bg-[#0aee3c]/10'
                : 'border-white/15 text-white/50 hover:text-white/80 hover:border-white/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40 mb-2">Their strategy</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setTheirStrategy(s.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              theirStrategy === s.id
                ? 'border-[#f472b6]/60 text-[#f472b6] bg-[#f472b6]/10'
                : 'border-white/15 text-white/50 hover:text-white/80 hover:border-white/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        onClick={run}
        className="w-full border border-white/15 rounded-lg py-2.5 text-white/85 hover:border-white/30 transition-colors mb-5"
      >
        Play 10 rounds
      </button>

      {log && yourTotal !== null && theirTotal !== null && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex gap-1.5 mb-4">
            {log.map((r, i) => (
              <span
                key={i}
                title={`Round ${i + 1}: you ${r.you === 'silent' ? 'stayed silent' : 'betrayed'}, they ${
                  r.them === 'silent' ? 'stayed silent' : 'betrayed'
                }`}
                className="w-4 h-4 rounded-sm inline-block"
                style={{ background: dotColor(r) }}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/85">
              You: <strong className="text-[#0aee3c]">{yourTotal} years total</strong>
            </span>
            <span className="text-white/85">
              Them: <strong className="text-[#f472b6]">{theirTotal} years total</strong>
            </span>
          </div>
          <p className="text-white/40 text-xs">
            Lower is better for each side. Fewer years overall means that strategy did well across all 10 rounds,
            not just one.
          </p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why tit-for-tat holds up</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Try &ldquo;tit-for-tat&rdquo; against &ldquo;always betray.&rdquo; You lose the first round &mdash; you
          cooperated, they didn&rsquo;t. But tit-for-tat immediately copies that betrayal back, so it never gets
          exploited twice in a row. Now try it against &ldquo;always cooperate&rdquo; or against itself: it locks
          into mutual cooperation and stays there. That&rsquo;s the whole appeal &mdash; tit-for-tat can&rsquo;t be
          taken advantage of for long, but it also doesn&rsquo;t hold a grudge. The instant the other side
          cooperates again, it does too.
        </p>
      </div>
    </div>
  );
}
