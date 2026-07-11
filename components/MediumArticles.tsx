'use client';

import { useEffect, useState } from 'react';

type Article = {
  title: string;
  link: string;
  pubDate: string;
};

export default function MediumArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40amoljadhav_48655'
        );
        const data = await response.json();
        
        if (data.items) {
          setArticles(data.items);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-6">
        <p className="text-[#0aee3c]/80">Loading articles...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-black/50 border border-[#0aee3c]/20 rounded-lg p-6">
        <p className="text-[#0aee3c]/80">No articles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, index) => {
        const publishDate = new Date(article.pubDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        return (
          <div
            key={index}
            className="animate-fadeInUp"
            style={{
              animationDelay: `${index * 0.3}s`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            <p className="text-base leading-relaxed">
              <span className="text-[#0aee3c]">{index + 1}. </span>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0aee3c] hover:text-white transition-colors"
              >
                {article.title}
              </a>
              <span className="text-[#0aee3c]"> - {publishDate}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
