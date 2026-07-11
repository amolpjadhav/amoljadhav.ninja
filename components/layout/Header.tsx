'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-[#0aee3c]/20">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#0aee3c] hover:text-[#0aee3c]/80">
          AMOL JADHAV
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a
            href="https://medium.com/@amoljadhav_48655"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0aee3c] hover:text-[#0aee3c]/80 transition-colors"
          >
            Blog
          </a>
          <Link href="/contact" className="text-[#0aee3c] hover:text-[#0aee3c]/80 transition-colors">
            Contact
          </Link>
        </div>

        <button
          className="md:hidden text-[#0aee3c]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-[#0aee3c]/20">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a
              href="https://medium.com/@amoljadhav_48655"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0aee3c] hover:text-[#0aee3c]/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </a>
            <Link
              href="/contact"
              className="text-[#0aee3c] hover:text-[#0aee3c]/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
