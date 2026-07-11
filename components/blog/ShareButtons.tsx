'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

export default function ShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : '';

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(shareUrl)}`;

  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const buttonClass =
    'flex items-center justify-center w-8 h-8 rounded-full border border-[#0aee3c]/20 text-[#0aee3c]/70 hover:border-[#0aee3c]/40 hover:text-[#0aee3c] transition-colors';

  return (
    <div className="flex items-center gap-2">
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={buttonClass}
      >
        <XIcon />
      </a>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={buttonClass}
      >
        <LinkedInIcon />
      </a>
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className={buttonClass}
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  );
}
