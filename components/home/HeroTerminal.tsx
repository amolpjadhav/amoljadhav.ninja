import { CHANNELS, formatPerHour, formatViews, PODCAST_GENRES, timeAgo } from '@/lib/podcasts';
import { formatPct } from '@/lib/stocks';
import { buildTerminalScripts } from '@/lib/homepage';
import { getBookSpin, getPodcastLists, getPostStats, getStrip, requestNowMs } from './heroData';
import TerminalTyper from './TerminalTyper';

// Live hero terminal: every output line is real site data, typed in a loop
// of one-command scripts. Beside the intro on desktop, stacked below on mobile.
export default async function HeroTerminal() {
  const [stats, lists, strip] = await Promise.all([getPostStats(), getPodcastLists(), getStrip()]);
  const top = lists?.trending[0];
  const month = lists?.mostWatched[0];
  const scripts = buildTerminalScripts({
    posts: stats?.posts ?? null,
    latestAge: stats?.latest ? timeAgo(stats.latest.createdAt) : null,
    nowMs: requestNowMs(),
    quotes:
      (strip?.length ?? 0) > 0
        ? strip.map((s) => ({ label: s.label, pct: formatPct(s.changePct), changePct: s.changePct }))
        : null,
    topEp: top ? { channel: top.channel, vph: formatPerHour(top.viewsPerHour) } : null,
    monthEp: month ? { title: month.title, views: `${formatViews(month.views)} views` } : null,
    epCounts: lists ? { trending: lists.trending.length, month: lists.mostWatched.length } : null,
    showCount: CHANNELS.length,
    genreCount: PODCAST_GENRES.length,
    books: getBookSpin(),
  });

  return (
    <div
      className="w-full md:w-[400px] md:shrink-0 overflow-hidden rounded-lg border border-[#0aee3c]/20 bg-black font-mono text-sm"
      style={{ maxWidth: 460 }}
    >
      <div className="py-3.5 px-4">
        <TerminalTyper scripts={scripts} />
      </div>
    </div>
  );
}
