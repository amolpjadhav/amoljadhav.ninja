'use client';

import { useState } from 'react';

const WEEKS_PER_MONTH = 4;

// A mix of good weeks (revenue in) and bad weeks (rent, restocking, a slow
// week) so cash visibly moves in both directions — only the running total
// is guaranteed to carry forward, not to always go up.
const WEEKLY_FLOWS = [400, -150, 300, -100, 250, -300, 500, -150];
const TOTAL_WEEKS = WEEKLY_FLOWS.length;

export default function StatementComparison() {
  const [week, setWeek] = useState(0);

  const atStart = week === 0;
  const atEnd = week === TOTAL_WEEKS;

  const month = Math.floor((week - 1) / WEEKS_PER_MONTH) + 1;
  const weekInMonth = ((week - 1) % WEEKS_PER_MONTH) + 1;
  const justReset = !atStart && weekInMonth === 1 && month > 1;

  const thisFlow = atStart ? 0 : WEEKLY_FLOWS[week - 1];
  const totalCash = WEEKLY_FLOWS.slice(0, week).reduce((sum, v) => sum + v, 0);
  const monthStartIndex = (month - 1) * WEEKS_PER_MONTH;
  const thisMonthNet = WEEKLY_FLOWS.slice(monthStartIndex, week).reduce((sum, v) => sum + v, 0);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">Try it yourself</p>
      <p className="text-white/70 text-sm mb-4">
        A small shop has good weeks and bad weeks &mdash; sales come in, rent and restocking go out. Click through
        two months and watch how each statement handles the same ups and downs differently.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {atStart ? (
          <button
            onClick={() => setWeek(1)}
            className="col-span-2 border border-white/15 rounded-lg py-2.5 text-white/85 hover:border-white/30 transition-colors"
          >
            Start the first week
          </button>
        ) : (
          <>
            <button
              onClick={() => setWeek(0)}
              className="border border-white/15 rounded-lg py-2.5 text-white/70 hover:border-white/30 transition-colors text-sm"
            >
              Reset
            </button>
            <button
              onClick={() => setWeek((w) => Math.min(TOTAL_WEEKS, w + 1))}
              disabled={atEnd}
              className="border border-white/15 rounded-lg py-2.5 text-white/85 hover:border-white/30 transition-colors text-sm disabled:opacity-30 disabled:hover:border-white/15"
            >
              {atEnd ? 'Done' : 'Advance a week ▶'}
            </button>
          </>
        )}
      </div>

      {!atStart && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/50 text-xs mb-3">
            Month {month}, week {weekInMonth} of {WEEKS_PER_MONTH} &mdash; this week:{' '}
            <strong className={thisFlow >= 0 ? 'text-[#0aee3c]' : 'text-[#f472b6]'}>
              {thisFlow >= 0 ? '+' : '-'}${Math.abs(thisFlow).toLocaleString()}
            </strong>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Balance Sheet (a photo)</p>
              <p className="text-white/85 text-sm">
                Cash on hand: <strong className="text-[#0aee3c]">${totalCash.toLocaleString()}</strong>
              </p>
              <p className="text-white/40 text-xs mt-1">
                Can go up or down week to week &mdash; but never resets between months.
              </p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Income Statement (a video)</p>
              <p className="text-white/85 text-sm">
                Net this month:{' '}
                <strong className={thisMonthNet >= 0 ? 'text-[#facc15]' : 'text-[#f472b6]'}>
                  {thisMonthNet >= 0 ? '' : '-'}${Math.abs(thisMonthNet).toLocaleString()}
                </strong>
              </p>
              <p className="text-white/40 text-xs mt-1">Resets to $0 every time a new month starts.</p>
            </div>
          </div>

          {justReset && (
            <p className="text-[#f472b6] text-sm">
              📅 Month {month} begins &mdash; the income statement just reset to $0. The balance sheet kept
              whatever cash was left over from before, good weeks and bad weeks included.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-5">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Same money, two different jobs</p>
        <p className="text-white/60 text-sm leading-relaxed">
          Cash on hand can absolutely go down &mdash; a bad week, a big rent payment, restocking the shelves. What
          it doesn&rsquo;t do is reset to zero just because a new month started. The income statement is the
          opposite: it deliberately zeroes out every period, because its whole job is measuring{' '}
          <em>this stretch of time</em>, not the running total. That&rsquo;s the real difference: a balance sheet
          answers &ldquo;where do things stand right now,&rdquo; and an income statement answers &ldquo;what
          happened during this stretch of time.&rdquo;
        </p>
      </div>
    </div>
  );
}
