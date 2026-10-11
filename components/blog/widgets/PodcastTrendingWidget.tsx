'use client';

import { Suspense } from 'react';
import PodcastTrending from '@/components/podcasts/PodcastTrending';

// Article embed for the trending podcasts tool (<div data-widget="podcast-trending">).
// The Suspense boundary is required: the people tab reads useSearchParams()
// for shareable ?person= links, which suspends during prerender.
export default function PodcastTrendingWidget() {
  return (
    <Suspense fallback={null}>
      <PodcastTrending />
    </Suspense>
  );
}
