'use client';

import { useState } from 'react';

// Publisher mark next to the source name. The favicon service answers
// with a generic globe when it has nothing — and hotlinked icons do go
// stale — so any failure degrades to text only, never a broken glyph.
export default function SourceFavicon({ src, size = 16 }: { src: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="rounded-sm"
      aria-hidden
      onError={() => setFailed(true)}
    />
  );
}
