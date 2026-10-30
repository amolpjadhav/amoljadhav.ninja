import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function formatDate(date: string): string {
  // Pinned to UTC: reader-local timezones turned one timestamp into two
  // different dates (Oct 6 in ET, Oct 7 in UTC). The stored stamps are UTC.
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

// Compact card date: "Aug 28", with the year only when it isn't this year
// ("Aug 28, 2025"). Server render passes nowMs through in tests.
export function formatShortDate(date: string, nowMs: number = Date.now()): string {
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
  const year = d.getUTCFullYear();
  const thisYear = new Date(nowMs).getUTCFullYear();
  return year === thisYear ? parts : `${parts}, ${year}`;
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function formatCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}
