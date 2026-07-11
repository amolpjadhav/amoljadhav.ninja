'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const STORAGE_KEY = 'liked_posts';

function getLikedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLikedSlugs(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export default function LikeButton({
  slug,
  initialLikes,
}: {
  slug: string;
  initialLikes: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLiked(getLikedSlugs().includes(slug));
  }, [slug]);

  async function toggleLike() {
    if (pending) return;

    const nextLiked = !liked;
    setPending(true);
    setLiked(nextLiked);
    setLikes((count) => count + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/posts/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nextLiked }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      setLikes(data.likes);

      const slugs = getLikedSlugs();
      setLikedSlugs(
        nextLiked
          ? [...slugs, slug]
          : slugs.filter((s) => s !== slug)
      );
    } catch {
      // Revert optimistic update on failure
      setLiked(!nextLiked);
      setLikes((count) => count - (nextLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={pending}
      aria-pressed={liked}
      className="flex items-center gap-2 text-sm text-[#0aee3c]/70 border border-[#0aee3c]/20 rounded-full px-3 py-1.5 hover:border-[#0aee3c]/40 hover:text-[#0aee3c] transition-colors disabled:opacity-60"
    >
      <Heart
        size={16}
        className={liked ? 'fill-[#0aee3c] text-[#0aee3c]' : ''}
      />
      <span>{likes}</span>
    </button>
  );
}
