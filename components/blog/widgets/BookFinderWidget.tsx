'use client';

import { Suspense } from 'react';
import BookFinder from '@/components/books/BookFinder';

// Article embed for the book finder tool (<div data-widget="book-finder">).
// The Suspense boundary is required: BookFinder reads useSearchParams() for
// shareable ?q=/?genre=/?work= links, which suspends during prerender.
export default function BookFinderWidget() {
  return (
    <Suspense fallback={<p className="text-white/50 text-sm animate-pulse">Loading book finder…</p>}>
      <BookFinder />
    </Suspense>
  );
}
