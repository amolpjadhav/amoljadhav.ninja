import { getTerminalLines } from './heroData';
import TerminalTyper from './TerminalTyper';

// One-command-one-output hero terminal beside the intro on desktop,
// stacked below on mobile. The server composes the data lines; the sims
// run client-side.
export default async function HeroTerminal() {
  const lines = await getTerminalLines();
  return (
    <div
      className="w-full md:w-[400px] md:shrink-0 overflow-hidden rounded-lg border border-[#0aee3c]/20 bg-black font-mono text-sm"
      style={{ maxWidth: 460 }}
    >
      <div className="py-3.5 px-4">
        <TerminalTyper lines={lines} />
      </div>
    </div>
  );
}
