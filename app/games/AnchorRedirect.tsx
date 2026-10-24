'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OLD_ANCHORS } from '@/components/games/registry';

// Legacy article anchors survive the 301 as /games#sudoku (browsers keep
// the fragment across redirects). Bounce them to the play route.
export default function AnchorRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const slug = OLD_ANCHORS[hash];
    if (slug) router.replace(`/games/${slug}`);
  }, [router]);
  return null;
}
