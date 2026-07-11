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
