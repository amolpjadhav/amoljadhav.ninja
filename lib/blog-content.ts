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

// ---------------------------------------------------------------------------
// Entity normalisation, and the reason it is not cosmetic.
//
// The article HTML is injected with dangerouslySetInnerHTML. React hydrates
// that by comparing the string it was given against the DOM's own
// innerHTML — and innerHTML is a *re-serialisation*, so it has been through the
// parser. The HTML spec says a text node re-escapes only & < > and U+00A0;
// everything else comes back as a literal character. So a string containing
// "&mdash;" can never match the DOM it produces, which serialises as "—", and
// React reports a hydration mismatch on every article that uses an entity.
//
// Fix: hand over the characters the DOM is going to give back. Entities that
// must stay escaped to match that serialisation are left alone.
// ---------------------------------------------------------------------------

const TEXT_ENTITIES: Record<string, string> = {
  // Everything the 36 published posts actually use, measured rather than
  // guessed: a missing entry is a silent hydration mismatch on whichever
  // article uses it, which is how &minus; and &asymp; were caught.
  rsquo: '\u2019',
  lsquo: '\u2018',
  ldquo: '\u201c',
  rdquo: '\u201d',
  mdash: '\u2014',
  ndash: '\u2013',
  rarr: '\u2192',
  larr: '\u2190',
  minus: '\u2212',
  times: '\u00d7',
  divide: '\u00f7',
  asymp: '\u2248',
  ne: '\u2260',
  le: '\u2264',
  ge: '\u2265',
  plusmn: '\u00b1',
  deg: '\u00b0',
  micro: '\u00b5',
  middot: '\u00b7',
  bull: '\u2022',
  hellip: '\u2026',
  prime: '\u2032',
  eacute: '\u00e9',
  egrave: '\u00e8',
  agrave: '\u00e0',
  ccedil: '\u00e7',
  uuml: '\u00fc',
  ouml: '\u00f6',
  auml: '\u00e4',
  ntilde: '\u00f1',
  laquo: '\u00ab',
  raquo: '\u00bb',
  trade: '\u2122',
  copy: '\u00a9',
  reg: '\u00ae',
  sup2: '\u00b2',
  sup3: '\u00b3',
  frac12: '\u00bd',
  frac14: '\u00bc',
  frac34: '\u00be',
  apos: "'",
  quot: '"',
};


/** & < > and the non-breaking space survive serialisation escaped, so they stay. */
const KEEP_ESCAPED = new Set([38, 60, 62, 160]);

function decodeTextEntities(html: string): string {
  // Split on tags so nothing inside an attribute is touched: decoding a &quot;
  // in there would break the attribute it delimits.
  return html
    .split(/(<[^>]*>)/)
    .map((part, i) => {
      if (i % 2 === 1) return part; // a tag
      return part
        // amp/lt/gt/nbsp are absent from the map, so they are preserved.
        .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (full, name) => TEXT_ENTITIES[name] ?? full)
        .replace(/&#(x[0-9a-fA-F]+|\d+);/g, (full, code) => {
          const point = code[0] === 'x' ? parseInt(code.slice(1), 16) : parseInt(code, 10);
          if (!Number.isFinite(point) || KEEP_ESCAPED.has(point)) return full;
          return String.fromCodePoint(point);
        })
        // A bare ampersand is tolerated by the parser but comes back as &amp;,
        // so canonicalise it here rather than lose a hydration match to it.
        .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#x?[0-9a-fA-F]+);)/g, '&amp;');
    })
    .join('');
}

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

  return { html: decodeTextEntities(processedChunks.join('')), headings };
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
  Curiosity: '#2dd4bf',
  Economics: '#34d399',
  Science: '#6366f1',
};

const DEFAULT_CATEGORY_COLOR = '#0aee3c';

export function categoryColor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}
