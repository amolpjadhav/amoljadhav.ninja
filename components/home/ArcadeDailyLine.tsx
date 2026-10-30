'use client';

import { useEffect, useState } from 'react';
import {
  DAILY_GAMES,
  formatCountdown,
  msUntilMidnightPT,
  readHubStore,
} from '@/components/games/hub/hub-stats';

// "Today's daily · k/3 done · next in hh:mm" — local progress, ticking.
// Server and first client paint both render the zero state, so the store
// resolves after mount with no hydration mismatch.
export default function ArcadeDailyLine() {
  const [snap, setSnap] = useState({ done: 0, ms: 0 });
  useEffect(() => {
    const update = () =>
      setSnap({ done: readHubStore().dailyDone, ms: msUntilMidnightPT(new Date()) });
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="tabular-nums">
      Today&apos;s daily · {snap.done}/{DAILY_GAMES.length} done · next in {formatCountdown(snap.ms)}
    </span>
  );
}
