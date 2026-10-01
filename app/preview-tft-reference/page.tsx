import { colorizeArticleSections, categoryColor } from '@/lib/blog-content';
import ArticleContent from '@/components/blog/ArticleContent';
import TableOfContents from '@/components/blog/TableOfContents';
import Header from '@/components/layout/Header';

// LOCAL-ONLY PREVIEW — not wired to Supabase, not linked from the site.
// This is just the new "Traits and champions" section of the published TFT
// Set 18 article, so it can be read in place before it goes live.
// Delete this route once the section is published for real.

const TITLE = 'TFT Set 18 Comps: All 45 Teams for Enchanted Wilds';
const CATEGORY = 'Gaming';

const CONTENT = `<h3>Traits and champions</h3>
<p>The 35 traits come in three sorts, and the list below is grouped that way.</p>
<p><strong>Origins</strong> (13 of them) are where a champion is from &mdash; Elderwood, Inferno, Coven. Stacking one of these tends to do something stranger than hand out stats: Elderwood gives you plants to place on the board, Riftbeast floods your next shop with more Riftbeasts.</p>
<p><strong>Classes</strong> (12) are what a champion does in a fight &mdash; a Defender holds the front, a Spellweaver casts from the back. Stack a class and the whole team gets better at fighting that way.</p>
<p><strong>Uniques</strong> (10) belong to one champion each. There is nothing to collect &mdash; the trait is on the moment that champion is on your board, so it works more like a second, permanent ability than a tag you stack.</p>
<p>Each of the 65 champions has one ability, which they cast when their mana bar fills. 21 of them also have a <strong>passive</strong>: something that is simply true all the time, with no casting needed. Nine of the Riftbeasts have a third thing on top &mdash; a bonus they only get once you hand them the Alpha Mark.</p>
<p>Search a champion to see what their ability does, or a trait to see who carries it. The wording is Riot&rsquo;s own, read straight out of the game files, so nothing is lost in a re-telling.</p>
<div data-widget="tft-reference" data-eyebrow="Set 18 reference" data-caption="Every trait and every champion, and what each one actually does. Tap a row to open it."></div>`;

export default function PreviewTftReference() {
  const { html: contentHtml, headings } = colorizeArticleSections(CONTENT);
  const accent = categoryColor(CATEGORY);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-0 sm:px-4">
        <article className="container mx-auto max-w-3xl bg-[#1c1d20] border-y sm:border border-white/10 sm:rounded-lg p-4 sm:p-6 md:p-10">
          <div className="mb-10 animate-fadeIn">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded mb-3"
              style={{ color: accent, background: `${accent}22` }}
            >
              {CATEGORY} &middot; SECTION PREVIEW
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white/95 leading-tight mb-4">{TITLE}</h1>
          </div>

          <TableOfContents headings={headings} accent={accent} />
          <ArticleContent html={contentHtml} category={CATEGORY} />
        </article>
      </main>
    </>
  );
}
