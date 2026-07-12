// Splits Medium-exported article HTML into sections at each heading and
// wraps each in a card with a colored left border, cycling through a
// palette so a long article reads as distinct, colorful sections.
// Also reused on the blog index so each post card's accent matches the
// colors used inside the article itself.
export const SECTION_ACCENTS = [
  '#38bdf8', // sky
  '#c084fc', // violet
  '#fb923c', // orange
  '#f472b6', // pink
  '#0aee3c', // brand green
  '#facc15', // yellow
];

export function colorizeArticleSections(html: string): string {
  const chunks = html.split(/(?=<h[1-3][ >])/i).filter((chunk) => chunk.trim().length > 0);

  return chunks
    .map((chunk, i) => {
      const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length];
      return `<div class="article-section" style="--accent:${accent}">${chunk}</div>`;
    })
    .join('');
}

// Fixed (not rotating) colors per article category, so a given topic always
// reads as the same color across the blog index, homepage, and article page.
const CATEGORY_COLORS: Record<string, string> = {
  AI: '#c084fc',
  Gaming: '#f472b6',
  Travel: '#fb923c',
  Engineering: '#38bdf8',
  Investing: '#facc15',
  'Mental Models': '#fb7185',
};

const DEFAULT_CATEGORY_COLOR = '#0aee3c';

export function categoryColor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}
