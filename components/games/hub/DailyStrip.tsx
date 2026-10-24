'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GAME_BY_SLUG } from '../registry';
import {
  DAILY_GAMES,
  formatCountdown,
  msUntilMidnightPT,
  ptDateString,
  readHubStore,
} from './hub-stats';

// Today's daily set: progress dots, midnight-PT countdown (ticks every
// second, tabular), one chip per daily game. Celebrates + share button
// when all 3 are done. Reads localStorage defensively — before hydration
// (and when keys don't exist yet) it renders the 0-of-3 default.
// Client-only island (loaded with ssr:false): reading localStorage during
// render is safe because this component never renders on the server.
export default function DailyStrip() {
  const [store] = useState(() => readHubStore());
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const done = store.dailyDone;
  const date = new Date(now);
  const dayLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
  const today = ptDateString(date);
  const complete = done >= DAILY_GAMES.length;

  async function shareDailySet() {
    const text =
      `Daily games ${today} — ${done} of ${DAILY_GAMES.length} done\n` +
      `amoljadhav.ai/games`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Dismissed share sheet or denied clipboard: not an error state.
    }
  }

  return (
    <section aria-labelledby="games-daily" className="games-card p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="games-daily"
          className="games-type-micro"
          style={{ color: 'var(--text-3)' }}
        >
          Today&apos;s daily · {dayLabel}
        </h2>
        <p
          className="games-type-caption"
          style={{ color: 'var(--text-2)' }}
          aria-live="off"
        >
          {done} of {DAILY_GAMES.length} done · next set in{' '}
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCountdown(msUntilMidnightPT(date))}
          </span>
        </p>
        <div
          className="flex gap-1.5"
          role="img"
          aria-label={`${done} of ${DAILY_GAMES.length} daily games done`}
        >
          {DAILY_GAMES.map((slug, i) => (
            <span
              key={slug}
              aria-hidden
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                background:
                  i < done ? 'var(--success)' : 'rgba(255,255,255,.16)',
              }}
            />
          ))}
        </div>
      </div>

      <ul className="grid gap-2.5 mt-4 sm:grid-cols-3">
        {DAILY_GAMES.map((slug) => {
          const game = GAME_BY_SLUG[slug];
          const solved = store.perGame[slug]?.solvedToday ?? false;
          return (
            <li key={slug}>
              <Link
                href={`/games/${slug}`}
                className="games-press games-touch flex items-center justify-between gap-2 rounded-2xl px-4 no-underline"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--hairline)',
                }}
              >
                <span className="games-type-callout">{game.name}</span>
                <span
                  className="games-type-micro"
                  style={{
                    color: solved ? 'var(--success)' : `var(${game.accentVar})`,
                  }}
                >
                  {solved ? 'Solved ✓' : 'Play →'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {complete && (
        <div
          className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl p-4"
          style={{ background: 'var(--surface-2)' }}
        >
          <p className="games-type-callout">
            Daily set complete 🔥
            {store.streakDays > 0 ? ` ${store.streakDays}` : ''}
          </p>
          <button
            type="button"
            onClick={shareDailySet}
            className="games-press games-touch games-type-callout rounded-full px-5"
            style={{ background: '#fff', color: '#000' }}
          >
            {copied ? 'Copied' : 'Share daily set'}
          </button>
        </div>
      )}
    </section>
  );
}
