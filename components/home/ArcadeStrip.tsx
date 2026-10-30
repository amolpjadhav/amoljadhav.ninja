import Link from 'next/link';
import TileArt from '@/components/games/hub/TileArt';
import type { GameSlug } from '@/components/games/registry';
import ArcadeDailyLine from './ArcadeDailyLine';

// One 12-col Arcade strip instead of per-game cards: static copy plus live
// daily progress, reusing the /games hub tile art. The standalone Chess
// Notation Trainer card is gone — it lives inside Chess now.
const TILES: { slug: GameSlug; name: string }[] = [
  { slug: 'five-letters', name: 'Five Letters' },
  { slug: 'chess', name: 'Chess' },
  { slug: 'sudoku', name: 'Sudoku' },
  { slug: 'minesweeper', name: 'Minesweeper' },
  { slug: '2048', name: '2048' },
];

export default function ArcadeStrip() {
  return (
    <section id="games" aria-label="Games" className="relative mt-12 scroll-mt-20">
      <h2 className="flex items-center gap-2 font-mono text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-4">
        <span className="text-[#0aee3c]">$</span> Games
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </h2>
      <div className="grid grid-cols-12 gap-6 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] p-6 transition-all duration-150 hover:border-[rgba(120,255,140,0.28)]">
        <div className="col-span-12 flex min-w-0 flex-col min-[1200px]:col-span-5">
          <h3 className="font-sans text-xl font-semibold text-white/90">Classic Games</h3>
          <p className="mt-1 font-sans text-sm leading-relaxed text-white/55 max-w-[60ch]">
            Six classics, rebuilt — a fresh daily set every midnight PT.
          </p>
          <p className="mt-3 font-sans text-sm text-white/55">
            <ArcadeDailyLine />
          </p>
          <Link
            href="/games"
            className="mt-auto block pt-4 font-sans text-sm font-semibold text-[#0aee3c] no-underline"
          >
            Play <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="col-span-12 min-w-0 min-[1200px]:col-span-7">
          {/* Desktop: one row of five. Tablet: horizontal scroll. Mobile:
              three tiles plus a +2 chip for the overflow. */}
          <div className="flex gap-3 overflow-x-auto pb-1 min-[1200px]:overflow-visible">
            {TILES.map((t, i) => (
              <Link
                key={t.slug}
                href={`/games/${t.slug}`}
                aria-label={`Play ${t.name}`}
                className={`w-[120px] shrink-0 [&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-xl [&_svg]:border [&_svg]:border-white/10 ${
                  i >= 3 ? 'hidden min-[768px]:block' : 'block'
                }`}
              >
                <span aria-hidden>
                  <TileArt slug={t.slug} />
                </span>
              </Link>
            ))}
            <Link
              href="/games"
              aria-label="Two more games"
              className="flex min-h-[72px] w-[120px] shrink-0 items-center justify-center rounded-xl border border-white/10 font-sans text-sm font-semibold text-white/60 no-underline min-[768px]:hidden"
            >
              +2
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
