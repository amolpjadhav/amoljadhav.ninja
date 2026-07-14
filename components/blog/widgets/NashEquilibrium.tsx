'use client';

import { useState } from 'react';

type Choice = 'A' | 'B';

const PAYOFFS: Record<Choice, Record<Choice, { you: number; friend: number }>> = {
  A: { A: { you: 3, friend: 3 }, B: { you: 0, friend: 0 } },
  B: { A: { you: 0, friend: 0 }, B: { you: 3, friend: 3 } },
};

function opposite(c: Choice): Choice {
  return c === 'A' ? 'B' : 'A';
}

export default function NashEquilibrium() {
  const [selected, setSelected] = useState<{ you: Choice; friend: Choice } | null>(null);
  const [explored, setExplored] = useState<Set<string>>(new Set());

  function select(you: Choice, friend: Choice) {
    setSelected({ you, friend });
    setExplored((prev) => new Set(prev).add(`${you}${friend}`));
  }

  const current = selected ? PAYOFFS[selected.you][selected.friend] : null;
  const youIfSwitch = selected ? PAYOFFS[opposite(selected.you)][selected.friend] : null;
  const friendIfSwitch = selected ? PAYOFFS[selected.you][opposite(selected.friend)] : null;
  const youWantSwitch = current && youIfSwitch ? youIfSwitch.you > current.you : false;
  const friendWantSwitch = current && friendIfSwitch ? friendIfSwitch.friend > current.friend : false;
  const stable = selected ? !youWantSwitch && !friendWantSwitch : false;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-5">
        You and a friend are meeting up, but you never agreed where &mdash; Coffee Shop A or Coffee Shop B. You
        each pick without knowing the other&rsquo;s choice. Click any square to check: if you both ended up there,
        would either of you want to switch?
      </p>

      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5">
        <div />
        <div className="text-white/40 pb-1">Friend picks A</div>
        <div className="text-white/40 pb-1">Friend picks B</div>

        <div className="text-white/40 flex items-center justify-end pr-2">You pick A</div>
        <GridCell you="A" friend="A" selected={selected} onClick={select} />
        <GridCell you="A" friend="B" selected={selected} onClick={select} />

        <div className="text-white/40 flex items-center justify-end pr-2">You pick B</div>
        <GridCell you="B" friend="A" selected={selected} onClick={select} />
        <GridCell you="B" friend="B" selected={selected} onClick={select} />
      </div>

      {selected && current && (
        <div className="border-t border-white/10 pt-4 mb-4">
          <p className="text-white/85 mb-2">
            {selected.you === selected.friend ? (
              <>
                You both pick <strong>Coffee Shop {selected.you}</strong>
                {' '}&mdash; you meet up successfully.
              </>
            ) : (
              <>
                You pick <strong>{selected.you}</strong>, they pick <strong>{selected.friend}</strong>
                {' '}&mdash; you miss each other.
              </>
            )}
          </p>
          <p className="text-white/60 text-sm mb-1">
            Would you switch?{' '}
            {youWantSwitch
              ? `Yes — switching to ${opposite(selected.you)} would get you a better outcome.`
              : 'No — switching would only make things worse (or the same) for you.'}
          </p>
          <p className="text-white/60 text-sm mb-3">
            Would they switch?{' '}
            {friendWantSwitch
              ? `Yes — switching to ${opposite(selected.friend)} would get them a better outcome.`
              : 'No — switching would only make things worse (or the same) for them.'}
          </p>
          {stable ? (
            <p className="text-[#0aee3c] text-sm font-semibold">
              &#10003; Stable &mdash; neither of you wants to move. This is a Nash Equilibrium.
            </p>
          ) : (
            <p className="text-[#f472b6] text-sm font-semibold">
              &#10007; Not stable &mdash; at least one of you has an incentive to switch.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">What this shows</p>
        <p className="text-white/60 text-sm leading-relaxed">
          A Nash Equilibrium is any outcome where no one can do better by changing only their own move &mdash;
          everyone else&rsquo;s choice held fixed. Try all four squares above and you&rsquo;ll find{' '}
          <strong className="text-white/80">two</strong>{' '}
          of them: both at A, and both at B. That&rsquo;s normal &mdash;
          a game can have zero, one, or several Nash equilibria. Nothing says the equilibrium has to be unique, or
          even good; it just has to be a place where nobody wants to move first.
        </p>
        <p className="text-white/60 text-sm leading-relaxed mt-3">
          You actually already met one in the Prisoner&rsquo;s Dilemma above: <strong className="text-white/80">both betray</strong>{' '}
          was the one outcome where neither prisoner wanted to switch &mdash; even though it wasn&rsquo;t the best
          outcome either of them could have had.
        </p>
        {explored.size >= 4 && (
          <p className="text-[#0aee3c]/80 text-xs mt-3">You&rsquo;ve checked all four squares.</p>
        )}
      </div>
    </div>
  );
}

function GridCell({
  you,
  friend,
  selected,
  onClick,
}: {
  you: Choice;
  friend: Choice;
  selected: { you: Choice; friend: Choice } | null;
  onClick: (you: Choice, friend: Choice) => void;
}) {
  const payoff = PAYOFFS[you][friend];
  const isSelected = selected?.you === you && selected?.friend === friend;

  return (
    <button
      onClick={() => onClick(you, friend)}
      className={`rounded-md py-2 border transition-colors ${
        isSelected ? 'border-[#0aee3c] bg-[#0aee3c]/10' : 'border-white/10 hover:border-white/30'
      }`}
    >
      <span className="text-white/85">{payoff.you}</span>
      <span className="text-white/30">/</span>
      <span className="text-white/50">{payoff.friend}</span>
    </button>
  );
}
