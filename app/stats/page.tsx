import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye, Heart, Mail, BookOpen } from 'lucide-react';
import Header from '@/components/layout/Header';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { formatCount, formatDate } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Site Stats | Amol Jadhav',
  description: 'A transparent, live look at this blog — total views, likes, subscribers, and more.',
};

async function getStats() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, slug, views, likes, created_at')
    .eq('published', true);

  if (error || !posts || posts.length === 0) {
    return null;
  }

  const { count: subscriberCount } = await supabaseAdmin
    .from('subscribers')
    .select('*', { count: 'exact', head: true });

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);

  const mostViewed = posts.reduce((max, p) => ((p.views || 0) > (max.views || 0) ? p : max));
  const mostLiked = posts.reduce((max, p) => ((p.likes || 0) > (max.likes || 0) ? p : max));

  const liveSince = posts.reduce(
    (earliest, p) => (new Date(p.created_at) < new Date(earliest) ? p.created_at : earliest),
    posts[0].created_at
  );

  return {
    totalViews,
    totalLikes,
    totalPosts: posts.length,
    subscriberCount: subscriberCount ?? 0,
    mostViewed,
    mostLiked,
    liveSince,
  };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white/95 mb-2 animate-fadeIn">
            Site Stats
          </h1>
          <p className="text-white/50 mb-10 animate-fadeIn">
            A transparent, live look at how this blog is doing.
          </p>

          {!stats ? (
            <div className="bg-[#1c1d20] border border-white/10 rounded-lg p-12 text-center animate-fadeInUp">
              <p className="text-white/70">Stats aren&rsquo;t available right now.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fadeInUp">
                <StatCard
                  label="Total views"
                  value={formatCount(stats.totalViews)}
                  color="#38bdf8"
                  icon={<Eye size={20} />}
                />
                <StatCard
                  label="Total likes"
                  value={formatCount(stats.totalLikes)}
                  color="#f472b6"
                  icon={<Heart size={20} />}
                />
                <StatCard
                  label="Subscribers"
                  value={formatCount(stats.subscriberCount)}
                  color="#facc15"
                  icon={<Mail size={20} />}
                />
                <StatCard
                  label="Articles published"
                  value={String(stats.totalPosts)}
                  color="#0aee3c"
                  icon={<BookOpen size={20} />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-10">
                <Link
                  href={`/blog/${stats.mostViewed.slug}`}
                  className="bg-[#1c1d20] border-y border-r border-white/10 border-l-[3px] border-l-[#0aee3c] rounded-lg p-6 hover:border-white/30 hover:border-l-[#0aee3c] transition-colors block animate-fadeInUp"
                >
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Most-viewed article</p>
                  <p className="text-lg font-semibold text-[#0aee3c] mb-1">{stats.mostViewed.title}</p>
                  <p className="text-white/50 text-sm">{formatCount(stats.mostViewed.views || 0)} views</p>
                </Link>

                <Link
                  href={`/blog/${stats.mostLiked.slug}`}
                  className="bg-[#1c1d20] border-y border-r border-white/10 border-l-[3px] border-l-[#f472b6] rounded-lg p-6 hover:border-white/30 hover:border-l-[#f472b6] transition-colors block animate-fadeInUp"
                >
                  <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Most-liked article</p>
                  <p className="text-lg font-semibold text-[#f472b6] mb-1">{stats.mostLiked.title}</p>
                  <p className="text-white/50 text-sm">{formatCount(stats.mostLiked.likes || 0)} likes</p>
                </Link>
              </div>

              <p className="text-white/40 text-sm animate-fadeInUp">
                Live since {formatDate(stats.liveSince)}.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-[#1c1d20] border-x border-b border-white/10 border-t-[3px] rounded-lg p-6 text-center transition-colors hover:border-white/30"
      style={{ borderTopColor: color }}
    >
      <div className="flex justify-center mb-2" style={{ color }}>
        {icon}
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color }}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}
