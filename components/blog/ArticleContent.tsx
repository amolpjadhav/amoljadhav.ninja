'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WIDGET_REGISTRY } from './widgets/registry';

interface WidgetSlot {
  key: string;
  el: Element;
  name: string;
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
        found.push({ key: `${name}-${i}`, el, name });
      }
    });
    setSlots(found);
  }, [html]);

  return (
    <>
      <StaticHtml html={html} category={category} containerRef={containerRef} />
      {slots.map(({ key, el, name }) => {
        const Widget = WIDGET_REGISTRY[name];
        return createPortal(<Widget key={key} />, el, key);
      })}
    </>
  );
}
