'use client';

import { useEffect, useState } from 'react';

// Earth's age, counting. Sits under the tagline and gives the physics constants
// raining behind it something to point at.
//
// Everything here is BigInt, and that is not stylistic. Earth's age in seconds
// is about 1.43e17, well past Number.MAX_SAFE_INTEGER (9.0e15). At that
// magnitude consecutive doubles are 32 apart, so `seconds + 1` on a plain
// number is a no-op — the counter would sit there looking broken. BigInt counts
// exactly, and the numbers are only ever formatted, never used in arithmetic
// with anything lossy.
//
// The age is quoted against a fixed instant (J2000) rather than "now", so the
// figure is reproducible and the tail digits differ from visit to visit. The
// alternative — treating this second as exactly 4.54 billion years — would show
// every visitor the same round number, which looks tidier and means less.

// Written as BigInt() calls rather than 123n literals on purpose: tsconfig
// targets ES2017, where the literal syntax is a compile error. Do not "tidy"
// these into literals without bumping the target.
const JULIAN_YEAR_SECONDS = BigInt(31_557_600); // 365.25 days, the usual convention for deep time
const AGE_YEARS = BigInt(4_540_000_000); // 4.54 ± 0.05 billion years
const AGE_AT_ANCHOR = AGE_YEARS * JULIAN_YEAR_SECONDS; // 143,271,504,000,000,000
const ANCHOR_MS = Date.UTC(2000, 0, 1);

function group(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function ageSeconds(nowMs: number): bigint {
  return AGE_AT_ANCHOR + BigInt(Math.floor((nowMs - ANCHOR_MS) / 1000));
}

export default function EarthAgeClock() {
  // First paint uses the constant, which is identical on the server and in the
  // browser; the live value takes over on mount. Deriving it from Date.now()
  // during render would be a hydration mismatch.
  const [seconds, setSeconds] = useState<bigint>(AGE_AT_ANCHOR);

  useEffect(() => {
    const tick = () => setSeconds(ageSeconds(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Years is the quoted figure, not a division of the live count. Deriving it
  // would print 4,540,000,026 — a claim to year-level precision on a number
  // known to fifty million, and the one row a reader actually reads.
  const rows: [string, string][] = [
    [group(AGE_YEARS), 'years'],
    [group(seconds / BigInt(3600)), 'hours'],
    [group(seconds / BigInt(60)), 'minutes'],
    [group(seconds), 'seconds'],
  ];

  return (
    <div className="relative mb-4">
      <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span> earth --age
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>

      <div className="flex flex-col gap-0.5">
        {rows.map(([value, unit]) => (
          <div key={unit} className="flex items-baseline gap-2">
            <span
              className="flex-1 text-right tabular-nums text-[13px] sm:text-[15px] text-[#0aee3c]/85"
              // The last digits change every second; a fixed width stops the
              // whole column twitching as the grouping shifts.
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
            <span className="w-[52px] text-[11px] text-[#0aee3c]/45">{unit}</span>
          </div>
        ))}
      </div>

      <div className="mt-1.5 text-[10px] leading-snug text-[#0aee3c]/35">
        &plusmn; 50 million years, so the last fifteen digits are decoration &mdash; nobody knows Earth&rsquo;s age to
        the second.
      </div>
    </div>
  );
}
