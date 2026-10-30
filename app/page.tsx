import Image from "next/image";
import Link from "next/link";
import { Suspense } from 'react';
import MatrixBackground from '@/components/layout/MatrixBackground';
import RecentArticles from '@/components/RecentArticles';
import ToolsRow from '@/components/home/ToolsRow';
import ArcadeStrip from '@/components/home/ArcadeStrip';
import FeaturedArticle from '@/components/home/FeaturedArticle';
import HeroTerminal from '@/components/home/HeroTerminal';
import SubscribeForm from '@/components/blog/SubscribeForm';

// Without this the segment defaults to `revalidate: false` (cached
// indefinitely), which freezes the view counts and the "Most Read" ranking in
// RecentArticles at build time. 60s matches /blog, /blog/[slug] and /stats.
export const revalidate = 60;

// Streaming placeholders: the terminal, featured, tools, games, and articles
// each await upstream data, so they hold skeleton space instead of popping
// the layout.
function TerminalSkeleton() {
  return (
    <div
      aria-hidden
      className="w-full overflow-hidden rounded-2xl border border-[#0aee3c]/20 bg-black"
      style={{ minHeight: 140 }}
    >
      <div className="py-3.5 px-4 space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
        <div className="h-3.5 w-full rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-[#0aee3c]/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-12 gap-6 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] p-6"
    >
      <div className="col-span-12 min-h-44 rounded-xl border border-white/10 bg-white/[0.02] motion-safe:animate-pulse min-[768px]:col-span-5" />
      <div className="col-span-12 space-y-2 min-[768px]:col-span-7">
        <div className="h-3 w-1/3 rounded bg-white/10 motion-safe:animate-pulse" />
        <div className="h-7 w-full rounded bg-white/10 motion-safe:animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-white/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function ToolsSkeleton() {
  return (
    <section aria-hidden className="relative mt-12">
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide mb-4">
        <span className="text-[#0aee3c]">$</span>
        <span className="text-[#0aee3c]/60">Tools</span>
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 min-[768px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1200px]:grid-cols-[repeat(4,minmax(0,1fr))]">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] motion-safe:animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

function GamesSkeleton() {
  return (
    <section aria-hidden className="relative mt-12">
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide mb-4">
        <span className="text-[#0aee3c]">$</span>
        <span className="text-[#0aee3c]/60">Games</span>
        <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
      </div>
      <div className="h-44 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] motion-safe:animate-pulse" />
    </section>
  );
}

function ArticlesSkeleton() {
  return (
    <div aria-hidden className="motion-safe:animate-pulse">
      <div className="grid gap-6 min-[768px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1200px]:grid-cols-[repeat(3,minmax(0,1fr))]">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-44 rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)]" />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2 font-mono text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-4">
      <span className="text-[#0aee3c]">$</span> {children}
      <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
    </h2>
  );
}

export default function Home() {
  return (
    <>
      <MatrixBackground />
      {/* Soft dark vignette so cards never sit on busy glyphs. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),transparent_70%)]"
      />

      <main className="min-h-screen pt-6 pb-8 px-[clamp(16px,4vw,48px)]">
        <div className="mx-auto w-full max-w-[1320px]">
          {/* Slim site header */}
          <header className="relative flex items-center justify-between border-b border-[#0aee3c]/10 pb-3 text-xs font-mono">
            <Link href="/" className="text-[#0aee3c] hover:text-white transition-colors">
              <span aria-hidden>$ </span>home
            </Link>
            <nav className="flex items-center gap-4" aria-label="Site">
              <Link href="/blog" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                Blog
              </Link>
              <Link href="/quiz" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                Quiz
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

          {/* Hero: intro left, terminal right (stacked below 1200px) */}
          <section className="relative grid grid-cols-12 gap-6 mt-8 items-center animate-fadeIn">
            <div className="col-span-12 min-w-0 min-[1200px]:col-span-6">
              <div className="flex items-center gap-4">
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
                  <h1 className="font-mono text-xl font-bold text-[#0aee3c] tracking-wide drop-shadow-[0_0_10px_rgba(10,238,60,0.5)] animate-fadeInUp">
                    Amol Jadhav
                  </h1>
                  <p className="font-mono italic text-[#0aee3c]/70 text-sm tracking-wide animate-fadeInUp">
                    A random walk, written down
                  </p>
                </div>
              </div>

            </div>

            <div className="col-span-12 min-w-0 min-[1200px]:col-span-6">
              <Suspense fallback={<TerminalSkeleton />}>
                <HeroTerminal />
              </Suspense>
            </div>
          </section>

          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedArticle />
          </Suspense>

          <Suspense fallback={<ToolsSkeleton />}>
            <ToolsRow />
          </Suspense>

          <Suspense fallback={<GamesSkeleton />}>
            <ArcadeStrip />
          </Suspense>

          {/* Writing */}
          <section aria-label="Articles" className="relative mt-12">
            <SectionHeader>Articles</SectionHeader>
            <Suspense fallback={<ArticlesSkeleton />}>
              <RecentArticles />
            </Suspense>
          </section>

          <div className="mt-12 animate-fadeIn">
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
