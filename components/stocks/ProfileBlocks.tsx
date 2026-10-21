// Shared presentational blocks for the lookup tools (stocks + crypto):
// section shells, stat tiles, fact grids, links, and share icons. One
// source of truth so both profiles keep the same visual language.
import { SECTION_ACCENTS, categoryColor } from '@/lib/blog-content';

const ACCENT = categoryColor('Investing');

export function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  // Matches article h3: bold, category accent, 1.1rem.
  return (
    <h3 className="text-lg font-bold mb-3 font-sans" style={{ color: ACCENT }}>
      {children}
    </h3>
  );
}

// Key-metric tile: grouping via fill, never a border — borders mean
// clickable. Plain facts use FactGrid instead.
export function StatRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-3 py-2">
      <div className="text-xs text-white/45">{label}</div>
      <div className="text-sm font-semibold text-white/90 tabular-nums mt-0.5">{value}</div>
      {sub !== undefined && <div className="text-xs text-white/50 mt-0.5">{sub}</div>}
    </div>
  );
}

// Plain facts (Founded, CEO, …): no boxes — one hairline over a label/value
// grid, two columns on mobile. Missing facts hide instead of showing dashes.
export function FactGrid({ facts }: { facts: { label: string; value: React.ReactNode }[] }) {
  const shown = facts.filter((f) => f.value !== null && f.value !== undefined);
  if (shown.length === 0) return null;
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-8 gap-y-4 pt-5 mt-5 border-t border-white/10">
      {shown.map((f) => (
        <div key={f.label}>
          <dt className="text-[13px] text-white/40 tracking-wide">{f.label}</dt>
          <dd className="mt-1 text-[17px] text-white/90">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-[#8ab4f8] underline decoration-[#8ab4f8]/40 underline-offset-[3px] hover:text-white hover:decoration-white transition-colors"
    >
      {children}
    </a>
  );
}

export function ProfileSection({
  n,
  title,
  question,
  note,
  children,
  bare,
}: {
  n: number;
  title: string;
  question?: string;
  note: React.ReactNode;
  children: React.ReactNode;
  // Hero use: skip the "n · title" label (the content is the page hero),
  // keep the question, body and "How to read this" note.
  bare?: boolean;
}) {
  // Small caps label over the question-as-heading; the accent tints the
  // panel only (blue headings read as links).
  const accent = SECTION_ACCENTS[(n - 1) % SECTION_ACCENTS.length];
  return (
    <section className="article-section" style={{ '--accent': accent, borderLeft: 0, borderRadius: 10 } as React.CSSProperties}>
      {!bare && <p className="text-xs font-semibold uppercase tracking-widest text-white/35 font-sans">{n} · {title}</p>}
      {question && <h3 className="text-xl font-bold text-white/90 mt-1 mb-3 font-sans">{question}</h3>}
      {children}
      <p className="text-xs text-white/55 mt-3 leading-relaxed font-sans">
        <strong className="text-white/75">How to read this:</strong> {note}
      </p>
    </section>
  );
}

export function ChartSubhead({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[13px] font-semibold text-white/70 mb-2 font-sans">{children}</h4>;
}

export const shareButtonClass =
  'flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-colors';
