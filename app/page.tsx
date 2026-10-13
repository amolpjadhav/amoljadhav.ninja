import Image from "next/image";
import Link from "next/link";
import { Suspense } from 'react';
import MatrixBackground from '@/components/layout/MatrixBackground';
import RecentArticles from '@/components/RecentArticles';
import ToolsRow from '@/components/home/ToolsRow';
import GamesRow from '@/components/home/GamesRow';
import HeroTerminal from '@/components/home/HeroTerminal';
import SubscribeForm from '@/components/blog/SubscribeForm';

// Without this the segment defaults to `revalidate: false` (cached
// indefinitely), which freezes the view counts and the "Most Read" ranking in
// RecentArticles at build time. 60s matches /blog, /blog/[slug] and /stats.
export const revalidate = 60;

// Streaming placeholders: the terminal, tools, and articles each await
// upstream data, so they hold skeleton space instead of popping the layout.
function TerminalSkeleton() {
  return (
    <div
      aria-hidden
      className="w-full md:w-[400px] md:shrink-0 overflow-hidden rounded-lg border border-[#0aee3c]/20 bg-black"
    >
      <div className="py-3.5 px-4 space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
        <div className="h-3.5 w-full rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function ToolsSkeleton() {
  return (
    <section aria-hidden className="relative mb-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span>
        <span className="text-[#0aee3c]/60">Tools</span>
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-44 rounded-lg border border-[#0aee3c]/10 bg-white/[0.02] motion-safe:animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

function GamesSkeleton() {
  return (
    <section aria-hidden className="relative mb-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2">
        <span className="text-[#0aee3c]">$</span>
        <span className="text-[#0aee3c]/60">Games</span>
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-36 rounded-lg border border-[#0aee3c]/10 bg-white/[0.02] motion-safe:animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

function ArticlesSkeleton() {
  return (
    <div aria-hidden className="motion-safe:animate-pulse">
      <div className="h-28 rounded-lg border border-white/10 bg-white/[0.02] mb-4" />
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-lg border border-white/10 bg-white/[0.02]" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded border-b border-b-[#0aee3c]/10 bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <MatrixBackground />

      <main className="min-h-screen pt-6 pb-8 px-4">
        {/* Desktop runs 20% wider than max-w-2xl (42rem -> 50.4rem); mobile unchanged. */}
        <div className="container mx-auto max-w-2xl md:max-w-[50.4rem]">
          {/* Main Terminal Container */}
          <section className="relative bg-black border border-[#0aee3c]/20 rounded-lg p-5 md:p-6 mb-4 mt-4 animate-fadeIn">
            {/* Ambient glow accents (clipped to the card's rounded corners) */}
            <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#0aee3c]/10 rounded-full blur-3xl" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0aee3c] to-transparent opacity-60" />

            {/* Slim site header, inside the container */}
            <header className="relative flex items-center justify-between border-b border-[#0aee3c]/10 pb-3 text-xs font-mono">
              <Link href="/" className="text-[#0aee3c] hover:text-white transition-colors">
                <span aria-hidden>$ </span>home
              </Link>
              <nav className="flex items-center gap-4" aria-label="Site">
                <Link href="/blog" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Blog
                </Link>
                <Link href="/#tools" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Tools
                </Link>
                <Link href="/#games" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Games
                </Link>
                <Link href="/stats" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Stats
                </Link>
                <Link href="/contact" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Contact
                </Link>
                <a
                  href="https://x.com/amol4chill"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on X"
                  className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="block h-3.5 w-3.5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </nav>
            </header>

            {/* Hero Section: compact intro + live terminal */}
            <div className="relative flex flex-col gap-4 mb-5 pt-2 md:flex-row md:items-start">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <div className="relative z-10 w-full h-full rounded-full border-2 border-[#0aee3c] overflow-hidden shadow-[0_0_18px_rgba(10,238,60,0.45)] animate-rotateIn">
                    <Image
                      src="/profile.jpg"
                      alt="Amol Jadhav"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-[#0aee3c] tracking-wide drop-shadow-[0_0_10px_rgba(10,238,60,0.5)] animate-fadeInUp">
                    Amol Jadhav
                  </h1>
                  <p className="italic text-[#0aee3c]/70 text-sm tracking-wide animate-fadeInUp">
                    A random walk, written down
                  </p>
                </div>
              </div>

              <Suspense fallback={<TerminalSkeleton />}>
                <HeroTerminal />
              </Suspense>
            </div>

            <Suspense fallback={<ToolsSkeleton />}>
              <ToolsRow />
            </Suspense>

            <Suspense fallback={<GamesSkeleton />}>
              <GamesRow />
            </Suspense>

            {/* Latest Blog Posts */}
            <div className="relative">
              <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
                <span className="text-[#0aee3c]">$</span> Articles
                <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
              </h2>
              <Suspense fallback={<ArticlesSkeleton />}>
                <RecentArticles />
              </Suspense>
            </div>
          </section>

          <div className="mb-4 animate-fadeIn">
            <SubscribeForm variant="terminal" />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#0aee3c]/20 py-6 text-center text-[#0aee3c]/60">
        <p>&copy; {new Date().getFullYear()} Amol Jadhav. All rights reserved.</p>
      </footer>
    </>
  );
}
