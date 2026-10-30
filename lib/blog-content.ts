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

// Heading titles are rendered by React as plain text (not HTML), so they need
// the opposite treatment from the article body: every entity fully decoded,
// including &amp;/&lt;/&gt;, which React re-escapes on render. Without this
// the jump menu shows raw "&rsquo;" text.
function decodeHeadingEntities(text: string): string {
  return text
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (full, name) => {
      if (name === 'amp') return '&';
      if (name === 'lt') return '<';
      if (name === 'gt') return '>';
      if (name === 'nbsp') return ' ';
      return TEXT_ENTITIES[name] ?? full;
    })
    .replace(/&#(x[0-9a-fA-F]+|\d+);/g, (full, code) => {
      const point =
        code[0] === 'x' || code[0] === 'X' ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      if (!Number.isFinite(point)) return full;
      try {
        return String.fromCodePoint(point);
      } catch {
        return full;
      }
    });
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
        // The id stays derived from the raw text so existing # deep links
        // never shift; only the displayed title is decoded.
        headings.push({ id, title: decodeHeadingEntities(shortTitle) });

        return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
      }
    );
    return `<div class="article-section" style="--accent:${accent}">${withId}</div>`;
  });

  return { html: decodeTextEntities(processedChunks.join('')), headings };
}

// Category colors live in lib/categoryColors.ts (single map for the home
// grid, /blog index, and article pages); re-exported here so existing
// importers keep working.
export { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, FILTER_CATEGORIES, categoryColor } from './categoryColors';

// Splits the homepage list into pinned utilities vs everything else.
// Pinned slugs keep their PINNED order (not date order); unknown slugs are
// ignored. `rest` excludes every pinned post so a pin never renders twice,
// falling back to the full list when that would leave Latest empty (i.e.
// every published post is pinned).
export function splitPinnedPosts<T extends { slug: string }>(
  posts: T[],
  pinnedSlugs: string[],
): { pinned: T[]; rest: T[] } {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const pinned = pinnedSlugs.map((s) => bySlug.get(s)).filter((p): p is T => p !== undefined);
  const pinnedSet = new Set(pinnedSlugs);
  const unpinned = posts.filter((p) => !pinnedSet.has(p.slug));
  return { pinned, rest: unpinned.length > 0 ? unpinned : posts };
}
