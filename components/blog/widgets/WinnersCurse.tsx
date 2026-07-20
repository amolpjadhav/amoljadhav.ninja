'use client';

import { useState } from 'react';

const TRUE_VALUE = 50;
const NUM_BIDDERS = 5;

interface AuctionResult {
  yourBid: number;
  otherBids: number[];
  winningBid: number;
  youWon: boolean;
}

function runAuction(yourBid: number): AuctionResult {
  const otherBids = Array.from({ length: NUM_BIDDERS }, () =>
    Math.round(TRUE_VALUE * (0.7 + Math.random() * 0.6))
  );
  const winningBid = Math.max(yourBid, ...otherBids);
  const youWon = yourBid === winningBid;
  return { yourBid, otherBids, winningBid, youWon };
}

export default function WinnersCurse() {
  const [yourBid, setYourBid] = useState(50);
  const [result, setResult] = useState<AuctionResult | null>(null);
  const [history, setHistory] = useState<AuctionResult[]>([]);

  function run() {
    const next = runAuction(yourBid);
    setResult(next);
    setHistory((h) => [...h, next]);
  }

  const timesWon = history.filter((h) => h.youWon).length;
  const avgOverpayWhenWon =
    timesWon > 0
      ? Math.round(
          history.filter((h) => h.youWon).reduce((sum, h) => sum + (h.winningBid - TRUE_VALUE), 0) / timesWon
        )
      : null;

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        A jar of coins is up for auction. Nobody knows exactly what it&rsquo;s worth &mdash; everyone just
        estimates. You&rsquo;re bidding against 5 other guessers. Highest bid wins the jar, for whatever they bid.
      </p>

      <input
        type="range"
        min={10}
        max={90}
        value={yourBid}
        onChange={(e) => setYourBid(Number(e.target.value))}
        className="w-full mb-2 accent-[#0aee3c]"
      />
      <p className="text-white/85 text-sm mb-4">
        Your bid: <strong className="text-[#0aee3c]">${yourBid}</strong>
      </p>

      <button
        onClick={run}
        className="w-full border border-white/15 rounded-lg py-2.5 text-white/85 hover:border-white/30 transition-colors mb-5"
      >
        Run the auction
      </button>

      {result && (
        <div className="border-t border-white/10 pt-4 mb-4">
          <p className="text-white/85 text-sm mb-1">
            Winning bid: <strong className="text-white/95">${result.winningBid}</strong>{' '}
            {result.youWon ? '(you)' : '(another bidder)'}
          </p>
          <p className="text-white/85 text-sm mb-1">
            The jar was actually worth: <strong className="text-[#facc15]">${TRUE_VALUE}</strong>
          </p>
          <p className={`text-sm ${result.winningBid > TRUE_VALUE ? 'text-[#f472b6]' : 'text-[#0aee3c]'}`}>
            {result.winningBid > TRUE_VALUE
              ? `The winner overpaid by $${result.winningBid - TRUE_VALUE}.`
              : `The winner actually got a good deal this time.`}
          </p>
        </div>
      )}

      {history.length > 1 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/50 text-xs">
            Across {history.length} auctions, you won {timesWon}.
            {timesWon > 0 && avgOverpayWhenWon !== null && (
              <> When you won, you overpaid by ${avgOverpayWhenWon} on average.</>
            )}
          </p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Why winning is bad news</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Everyone&rsquo;s guess is a little off in one direction or the other &mdash; that&rsquo;s normal. But the
          only way to <em>win</em>
          {' '}the auction is to have guessed higher than everyone else in the room. That&rsquo;s
          not a coincidence you can shrug off: it means the winning bid is almost never a typical guess. It&rsquo;s
          whichever guess happened to be the most optimistic one. Run this enough times, and the pattern holds up
          &mdash; winning the auction and overpaying for it turn out to be the same event, most of the time.
        </p>
      </div>
    </div>
  );
}
