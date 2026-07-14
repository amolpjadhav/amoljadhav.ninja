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

export interface ArticleHeading {
  id: string;
  title: string;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Splits article HTML into sections at each heading, wraps each in a
// colored card (see SECTION_ACCENTS), and injects an id on every heading
// (derived from the part of its text before a colon, e.g. "Murphy's Law:
// anything that can go wrong, will" -> id="murphys-law") so sections can be
// deep-linked. Returns both the transformed HTML and the extracted list of
// headings, so a table of contents can be rendered from the same pass.
export function colorizeArticleSections(html: string): { html: string; headings: ArticleHeading[] } {
  const chunks = html.split(/(?=<h[1-3][ >])/i).filter((chunk) => chunk.trim().length > 0);
  const usedIds = new Set<string>();
  const headings: ArticleHeading[] = [];

  const processedChunks = chunks.map((chunk, i) => {
    const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length];
    const withId = chunk.replace(
      /<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/i,
      (full, level, attrs, inner) => {
        const plainTitle = inner.replace(/<[^>]+>/g, '').trim();
        const shortTitle = plainTitle.split(':')[0].trim();

        let id = slugifyHeading(shortTitle);
        let suffix = 2;
        while (usedIds.has(id)) {
          id = `${slugifyHeading(shortTitle)}-${suffix++}`;
        }
        usedIds.add(id);
        headings.push({ id, title: shortTitle });

        return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
      }
    );
    return `<div class="article-section" style="--accent:${accent}">${withId}</div>`;
  });

  return { html: processedChunks.join(''), headings };
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
