import Image from "next/image";
import MatrixBackground from '@/components/layout/MatrixBackground';
import MediumArticles from '@/components/MediumArticles';

export default function Home() {
  return (
    <>
      <MatrixBackground />

      {/* Blog Link - Top Right */}
      <a
        href="https://medium.com/@amoljadhav_48655"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-5 right-12 bg-[#121212] text-[#0aee3c] px-5 py-2 rounded hover:bg-white hover:text-[#0aee3c] transition-all font-bold z-50 animate-fadeIn"
        style={{ animationDelay: '2s' }}
      >
        Blog
      </a>

      <main className="min-h-screen pt-8 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Main Terminal Container */}
          <section className="bg-black/70 border-2 border-[#0aee3c] rounded-lg p-8 mb-6 mt-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="mb-4 relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-full border-2 border-[#0aee3c] overflow-hidden animate-rotateIn">
                  <Image
                    src="/profile.jpg"
                    alt="Amol Jadhav"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[#0aee3c] mb-2 animate-fadeInUp">
                Amol Jadhav
              </h1>

              <p className="text-base text-[#0aee3c] mb-4 animate-fadeInUp">
                Sr. Engineering Program Manager | Bar Raiser | Amazon
              </p>

              <div className="flex justify-center gap-4 text-sm animate-fadeInUp">
                <a
                  href="https://www.linkedin.com/in/amojadha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0aee3c] hover:text-white transition-colors underline"
                >
                  🔗 LinkedIn
                </a>
                <a
                  href="https://twitter.com/amoljadhav00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0aee3c] hover:text-white transition-colors underline"
                >
                  🐦 X
                </a>
              </div>
            </div>

            {/* Latest Articles from Medium */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0aee3c] mb-4">Amol's Articles:</h2>
              <div className="pl-3">
                <MediumArticles />
              </div>
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
