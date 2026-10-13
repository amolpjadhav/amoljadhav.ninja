// Share-on-X anchor in the notation trainer's finish-row style. The href
// is prebuilt by lib/games/share (intent + personalized OG card link).
export default function XShare({ href, className = '' }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share your score on X"
      className={`flex touch-manipulation select-none items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-[15px] font-bold text-white/85 transition-all duration-150 hover:bg-white/5 hover:shadow-[0_0_14px_rgba(10,238,60,0.35)] active:scale-[0.97] ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share on X
    </a>
  );
}
