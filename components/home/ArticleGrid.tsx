'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FILTER_CATEGORIES, categoryColor } from '@/lib/categoryColors';

export interface ArticleCardModel {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  meta: string;
  views: number;
}

const CARD =
  'group flex h-full min-w-0 flex-col rounded-2xl border border-[rgba(120,255,140,0.14)] bg-[rgba(10,14,10,0.85)] no-underline transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(120,255,140,0.28)]';

function CategoryLabel({ category }: { category: string }) {
  const color = categoryColor(category);
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold" style={{ color }}>
      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {category}
    </span>
  );
}

function CardBody({ post }: { post: ArticleCardModel }) {
  return (
    <>
      <CategoryLabel category={post.category} />
      <h3 className="mt-2 font-sans text-xl font-semibold leading-snug text-white/90 transition-colors group-hover:text-white line-clamp-3">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-2 font-sans text-sm leading-relaxed text-white/55 line-clamp-2 max-w-[60ch]">
          {post.excerpt}
        </p>
      )}
      {post.meta && <p className="mt-auto pt-3 font-sans text-sm text-white/45 tabular-nums">{post.meta}</p>}
    </>
  );
}

export default function ArticleGrid({ posts }: { posts: ArticleCardModel[] }) {
  const [filter, setFilter] = useState<(typeof FILTER_CATEGORIES)[number]>('All');
  // Every tab ranks by views, highest first.
  const ranked = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const visible = (filter === 'All' ? ranked : ranked.filter((p) => p.category === filter)).slice(0, 6);
  const [first, ...rest] = visible;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter articles by category">
        {FILTER_CATEGORIES.map((cat) => {
          const active = filter === cat;
          const color = cat === 'All' ? '#0aee3c' : categoryColor(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              aria-pressed={active}
              className="font-sans text-sm px-3.5 py-1.5 rounded-full border transition-colors"
              style={
                active
                  ? { borderColor: color, color, background: `${color}14` }
                  : { borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)' }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 min-[768px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1200px]:grid-cols-[repeat(3,minmax(0,1fr))]">
        {first && (
          <Link
            key={first.slug}
            href={`/blog/${first.slug}`}
            className={`${CARD} overflow-hidden min-[1200px]:col-span-2`}
          >
            <div className="grid h-full min-[768px]:grid-cols-[45%_1fr]">
              <div className="relative min-h-48 min-[768px]:min-h-full">
                <Image
                  src={`/blog/${first.slug}/opengraph-image`}
                  alt=""
                  fill
                  sizes="(min-width: 1200px) 400px, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex min-w-0 flex-col p-6">
                <CardBody post={first} />
              </div>
            </div>
          </Link>
        )}
        {rest.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`${CARD} p-6 animate-fadeInUp`}
            style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: `${(index + 1) * 0.08}s` }}
          >
            <CardBody post={post} />
          </Link>
        ))}
      </div>

      <Link href="/blog" className="inline-block mt-4 font-sans text-sm font-semibold text-[#0aee3c] hover:underline">
        All articles &rarr;
      </Link>
    </div>
  );
}
