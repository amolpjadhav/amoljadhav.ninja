import type { ArticleHeading } from '@/lib/blog-content';

export default function TableOfContents({
  headings,
  accent,
}: {
  headings: ArticleHeading[];
  accent: string;
}) {
  if (headings.length < 2) return null;

  return (
    <div className="bg-[#1c1d20] border border-white/10 rounded-lg p-5 mb-8 animate-fadeIn">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Jump to a concept</p>
      <div className="flex flex-wrap gap-2">
        {headings.map((h, i) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className="text-sm px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-colors"
            style={{ color: accent, borderColor: `${accent}33` }}
          >
            {i + 1}. {h.title}
          </a>
        ))}
      </div>
    </div>
  );
}
