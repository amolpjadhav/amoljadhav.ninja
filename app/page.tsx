import Image from "next/image";
import Link from "next/link";
import MatrixBackground from '@/components/layout/MatrixBackground';
import ProfileFireworks from '@/components/layout/ProfileFireworks';
import ConstantsRain from '@/components/layout/ConstantsRain';
import RecentArticles from '@/components/RecentArticles';
import ToolsRow from '@/components/home/ToolsRow';
import SubscribeForm from '@/components/blog/SubscribeForm';

// Without this the segment defaults to `revalidate: false` (cached
// indefinitely), which freezes the view counts and the "Most Read" ranking in
// RecentArticles at build time. 60s matches /blog, /blog/[slug] and /stats.
export const revalidate = 60;

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
                <Link href="/stats" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Stats
                </Link>
                <Link href="/contact" className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors">
                  Contact
                </Link>
              </nav>
            </header>

            {/* Hero Section */}
            <div className="relative text-center mb-6 pt-4">
              <ConstantsRain />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 blur-2xl"
              />

              <div className="mb-3 relative w-16 h-16 mx-auto">
                <div className="absolute left-1/2 top-1/2 w-[220px] h-[220px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <ProfileFireworks />
                </div>
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

              <h1 className="relative text-xl font-bold text-[#0aee3c] tracking-wide mb-1.5 drop-shadow-[0_0_10px_rgba(10,238,60,0.5)] animate-fadeInUp">
                Amol Jadhav
              </h1>

              <p className="relative italic text-[#0aee3c]/70 text-sm tracking-wide mb-3 animate-fadeInUp">
                A random walk, written down
              </p>

              <div className="relative flex justify-center gap-2 text-xs animate-fadeInUp">
                <a
                  href="https://x.com/amol4chill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0aee3c]/70 hover:text-[#0aee3c] hover:shadow-[0_0_12px_rgba(10,238,60,0.4)] hover:scale-105 transition-all border border-[#0aee3c]/20 hover:border-[#0aee3c]/40 rounded-full px-3 py-1"
                >
                  Follow on X
                </a>
              </div>
            </div>

            <ToolsRow />

            {/* Latest Blog Posts */}
            <div className="relative">
              <h2 className="flex items-center gap-2 text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-2">
                <span className="text-[#0aee3c]">$</span> Articles
                <span className="flex-1 h-px bg-gradient-to-r from-[#0aee3c]/30 to-transparent" />
              </h2>
              <RecentArticles />
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
