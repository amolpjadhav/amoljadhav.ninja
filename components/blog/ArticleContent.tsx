'use client';

import { ComponentType, memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WIDGET_REGISTRY } from './widgets/registry';

interface WidgetSlot {
  key: string;
  el: Element;
  name: string;
  props: Record<string, string>;
}

// Memoized so that mounting widget portals (which updates state in the
// parent) never causes this component to re-render — a re-render would
// re-apply dangerouslySetInnerHTML and wipe out any portaled widget content
// living inside the injected HTML.
const StaticHtml = memo(function StaticHtml({
  html,
  category,
  containerRef,
}: {
  html: string;
  category?: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={containerRef}
      className="article-content animate-fadeInUp"
      data-category={category}
      // React hydrates dangerouslySetInnerHTML by comparing the string it was
      // given against the DOM's innerHTML, which is a re-serialisation. This
      // container is the wrong node to run that check on, for two reasons that
      // have nothing to do with our markup being wrong:
      //
      //   1. It is the subtree React does not own. Widgets are portalled into
      //      the [data-widget] placeholders inside this HTML, so its contents
      //      are deliberately changed out from under React.
      //   2. It is a large block of prose, which is exactly what writing and
      //      accessibility browser extensions rewrite before React loads —
      //      one injected attribute anywhere in 9,000 characters and the whole
      //      comparison fails.
      //
      // Verified before reaching for this: the server HTML and the string in
      // the RSC payload are byte-identical, and the HTML round-trips unchanged
      // through parse5's spec parser and serialiser, so the DOM gives back
      // exactly what we hand it. React also states it will not patch a
      // mismatch here up, so the warning costs a console error and changes
      // nothing on screen.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default function ArticleContent({
  html,
  category,
}: {
  html: string;
  category?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<WidgetSlot[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const found: WidgetSlot[] = [];
    containerRef.current.querySelectorAll<HTMLElement>('[data-widget]').forEach((el, i) => {
      const name = el.getAttribute('data-widget');
      if (name && WIDGET_REGISTRY[name]) {
        // Any other data-* attribute on the placeholder (besides data-widget
        // itself) is passed through as a prop, e.g. data-initial-slider="100"
        // becomes { initialSlider: "100" } — lets one widget be embedded
        // multiple times with different starting states.
        const props = { ...el.dataset } as Record<string, string>;
        delete props.widget;
        found.push({ key: `${name}-${i}`, el, name, props });
      }
    });
    setSlots(found);
  }, [html]);

  return (
    <>
      <StaticHtml html={html} category={category} containerRef={containerRef} />
      {slots.map(({ key, el, name, props }) => {
        const Widget = WIDGET_REGISTRY[name] as ComponentType<Record<string, string>>;
        return createPortal(<Widget key={key} {...props} />, el, key);
      })}
    </>
  );
}
