'use client';

import { useState } from 'react';

const TOTAL = 10;

function acceptChance(theirShare: number): number {
  const pct = theirShare / TOTAL;
  if (pct >= 0.5) return 0.98;
  if (pct >= 0.4) return 0.9;
  if (pct >= 0.3) return 0.65;
  if (pct >= 0.2) return 0.35;
  if (pct >= 0.1) return 0.12;
  return 0.03;
}

interface Result {
  yourShare: number;
  theirShare: number;
  chance: number;
  accepted: boolean;
}

export default function UltimatumGame() {
  const [yourShare, setYourShare] = useState(5);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);

  function send() {
    const theirShare = TOTAL - yourShare;
    const chance = acceptChance(theirShare);
    const accepted = Math.random() < chance;
    const next = { yourShare, theirShare, chance, accepted };
    setResult(next);
    setHistory((h) => [...h, next]);
  }

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        You&rsquo;re splitting $10 with a stranger. You propose the split. They can only accept it (you both get
        your shares) or reject it (you both get nothing). Drag the slider, then send your offer.
      </p>

      <input
        type="range"
        min={0}
        max={10}
        value={yourShare}
        onChange={(e) => setYourShare(Number(e.target.value))}
        className="w-full mb-3 accent-[#0aee3c]"
      />
      <div className="flex justify-between text-sm mb-4">
        <span className="text-white/85">
          You keep: <strong className="text-[#0aee3c]">${yourShare}</strong>
        </span>
        <span className="text-white/85">
          They get: <strong className="text-[#f472b6]">${TOTAL - yourShare}</strong>
        </span>
      </div>

      <button
        onClick={send}
        className="w-full border border-white/15 rounded-lg py-2.5 text-white/85 hover:border-white/30 transition-colors mb-5"
      >
        Send offer
      </button>

      {result && (
        <div className="border-t border-white/10 pt-4 mb-4">
          {result.accepted ? (
            <p className="text-white/85 text-sm mb-1">
              <strong className="text-[#0aee3c]">Accepted.</strong>
              {' '}You get ${result.yourShare}, they get ${result.theirShare}.
            </p>
          ) : (
            <p className="text-white/85 text-sm mb-1">
              <strong className="text-[#f472b6]">Rejected.</strong>
              {' '}You both get $0 &mdash; they&rsquo;d rather walk away with nothing than accept $
              {result.theirShare} out of $10.
            </p>
          )}
          <p className="text-white/40 text-xs">
            Offers like this one get accepted roughly {Math.round(result.chance * 100)}% of the time.
          </p>
        </div>
      )}

      {history.length > 1 && (
        <div className="flex gap-1.5 mb-4">
          {history.map((r, i) => (
            <span
              key={i}
              title={`Offered them $${r.theirShare} — ${r.accepted ? 'accepted' : 'rejected'}`}
              className="w-4 h-4 rounded-sm inline-block"
              style={{ background: r.accepted ? '#0aee3c' : '#f472b6' }}
            />
          ))}
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-1">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why lowball offers get rejected</p>
        <p className="text-white/60 text-sm leading-relaxed">
          A perfectly self-interested responder should accept any amount above $0 &mdash; something is always
          better than nothing. Real people don&rsquo;t play that way. Offer someone $1 out of $10, and most people
          reject it, even though rejecting means they walk away with less than they would have had. They&rsquo;re
          willing to lose a dollar just to punish a split that feels unfair. Proposers who understand this tend to
          offer closer to half from the start &mdash; not out of generosity, but because a stingy offer is likely
          to blow up the whole deal.
        </p>
      </div>
    </div>
  );
}
