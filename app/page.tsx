import Image from "next/image";
import Link from "next/link";
import MatrixBackground from '@/components/layout/MatrixBackground';
import RecentArticles from '@/components/RecentArticles';

export default function Home() {
  return (
    <>
      <MatrixBackground />

      {/* Blog Link - Top Right */}
      <Link
        href="/blog"
        className="fixed top-5 right-12 bg-[#121212] text-[#0aee3c] px-5 py-2 rounded hover:bg-white hover:text-[#0aee3c] transition-all font-bold z-50 animate-fadeIn"
        style={{ animationDelay: '2s' }}
      >
        Blog
      </Link>

      <main className="min-h-screen pt-6 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Main Terminal Container */}
          <section className="bg-black/70 border-2 border-[#0aee3c] rounded-lg p-5 md:p-6 mb-4 mt-4 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center mb-5">
              <div className="mb-2 relative w-14 h-14 mx-auto">
                <div className="w-full h-full rounded-full border-2 border-[#0aee3c] overflow-hidden animate-rotateIn">
                  <Image
                    src="/profile.jpg"
                    alt="Amol Jadhav"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>

              <h1 className="text-lg font-bold text-[#0aee3c] mb-0.5 animate-fadeInUp">
                Amol Jadhav
              </h1>

              <p className="text-xs text-[#0aee3c]/80 mb-2 animate-fadeInUp">
                Sr. Engineering Program Manager | Bar Raiser | Amazon
              </p>

              <div className="flex justify-center gap-2 text-xs animate-fadeInUp">
                <a
                  href="https://www.linkedin.com/in/amojadha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors border border-[#0aee3c]/20 hover:border-[#0aee3c]/40 rounded-full px-3 py-1"
                >
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/amoljadhav00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0aee3c]/70 hover:text-[#0aee3c] transition-colors border border-[#0aee3c]/20 hover:border-[#0aee3c]/40 rounded-full px-3 py-1"
                >
                  X
                </a>
              </div>
            </div>

            {/* Latest Blog Posts */}
            <div>
              <h2 className="text-xs font-bold text-[#0aee3c]/60 uppercase tracking-wide mb-1.5">
                Articles
              </h2>
              <RecentArticles />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#0aee3c]/20 py-6 text-center text-[#0aee3c]/60">
        <p>&copy; 2025 Amol Jadhav. All rights reserved.</p>
      </footer>
    </>
  );
}
