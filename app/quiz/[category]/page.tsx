import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QuizPlay from '@/components/quiz/QuizPlay';
import { QUIZ_CATEGORIES, quizCategoryById } from '@/lib/quiz/categories';

export function generateStaticParams() {
  return QUIZ_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: id } = await params;
  const category = quizCategoryById(id);
  if (!category) return {};
  return {
    title: `${category.title} Quiz | Amol Jadhav`,
    description: `${category.description} ${category.questions.length} questions with spaced repetition. Free, no ads.`,
    alternates: { canonical: `https://amoljadhav.ai/quiz/${category.id}` },
  };
}

export default async function QuizCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: id } = await params;
  const category = quizCategoryById(id);
  if (!category) notFound();

  return (
    <div className="container mx-auto max-w-3xl px-4 pt-24 pb-16">
      <p className="mb-4">
        <Link href="/quiz" className="text-sm text-white/60 hover:text-white no-underline" aria-label="Back to quiz">
          <span aria-hidden>← </span>Quiz
        </Link>
      </p>
      <h1 className="text-3xl font-bold">
        {category.emoji} {category.title} Quiz
      </h1>
      <p className="text-white/60 mt-2">
        {category.description} Your progress is saved in this browser, and the
        questions you get wrong come back more often.{' '}
        <a
          href={category.source}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 text-white/80"
        >
          From the article
        </a>
      </p>
      <div className="mt-6">
        <QuizPlay category={category} />
      </div>
    </div>
  );
}
