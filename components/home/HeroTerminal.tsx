import fortunesData from '@/data/fortunes.json';
import { getHistoryEvents, snapshotFor } from './heroData';
import TerminalTyper from './TerminalTyper';
import type { Fortune } from '@/lib/terminal-scenes';

// Fortune/facts hero terminal beside the intro on desktop, stacked below
// on mobile. The server feeds first paint (snapshot fortune + year line,
// today's history events); the loop runs client-side.
export default async function HeroTerminal() {
  const raw = fortunesData as { text?: unknown; link?: unknown }[];
  const fortunes: Fortune[] = raw
    .filter((f): f is Fortune => typeof f?.text === 'string' && f.text.length > 0)
    .map((f) => (typeof f.link === 'string' ? { text: f.text, link: f.link } : { text: f.text }));
  const history = await getHistoryEvents();
  const snapshot = snapshotFor(fortunes);
  return (
    <div
      className="w-full md:w-[480px] md:shrink-0 overflow-hidden rounded-lg border border-[#0aee3c]/20 bg-black font-mono text-sm"
      style={{ maxWidth: 540 }}
    >
      <div className="py-3.5 px-4">
        <TerminalTyper fortunes={fortunes} history={history} snapshot={snapshot} />
      </div>
    </div>
  );
}
