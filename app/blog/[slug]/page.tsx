import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArticleDate, type BlogArticle } from "@/lib/articles";
import { getPublishedNewsResult, newsToBlogArticles } from "@/lib/news";
import { ArticleCard } from "../../components/article-card";
import { ArticleImageCarousel } from "../../components/article-image-carousel";
import { BlogStateNotice } from "../../components/blog-state-notice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedNewsResult();
  if (!result.ok) return { title: "Публикации временно недоступны" };
  const article = newsToBlogArticles(result.items).find((item) => item.slug === slug);
  if (!article) return {};

  return {
    title: article.metaTitle,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    ...(article.cover ? { openGraph: { images: [article.cover] } } : {}),
  };
}

function ArticleContent({ article, articles }: { article: BlogArticle; articles: BlogArticle[] }) {
  const relatedArticles = article.relatedSlugs
    .map((slug) => articles.find((item) => item.slug === slug))
    .filter((item): item is BlogArticle => item !== undefined);
  const relatedForHome = relatedArticles.slice(0, 3);

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-8 sm:py-14 lg:px-12">
        <article className="mx-auto max-w-6xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 transition hover:text-sky-950"
          >
            <span aria-hidden="true">←</span> Все статьи
          </Link>

          <header className="mx-auto mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="font-semibold text-sky-800">{article.category}</span>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <time dateTime={article.publishedAt} className="text-slate-500">
                {formatArticleDate(article.publishedAt)}
              </time>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span className="text-slate-500">{article.readingMinutes} мин чтения</span>
            </div>
            <h1 className="mt-5 break-words text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{article.description}</p>
          </header>

          <ArticleImageCarousel images={article.images} title={article.title} />

          <div className="mx-auto mt-8 grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="max-w-[72ch] space-y-10">
                {article.content.map((section) => (
                  <div key={section.heading}>
                    <section>
                      <h2 className="text-2xl font-semibold leading-snug text-slate-950 sm:text-3xl">
                        {section.heading}
                      </h2>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="mt-5 text-base leading-8 text-slate-700">
                          {paragraph}
                        </p>
                      ))}
                      {section.bullets && (
                        <ul className="mt-5 space-y-3">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-3 text-base leading-7 text-slate-700">
                              <span className="mt-0.5 text-sky-700" aria-hidden="true">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </div>
                ))}
              </div>

              <div className="mt-14 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-800">Следующий шаг</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Планируете строительство дома?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Перейдите к существующему квизу расчёта стоимости и ознакомьтесь с его вопросами.
                </p>
                <Link
                  href="/#quiz"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-900"
                >
                  Перейти к расчёту стоимости
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">В этой статье</p>
              <ol className="mt-4 space-y-3">
                {article.content.map((section, index) => (
                  <li key={section.heading} className="text-sm leading-6 text-slate-600">
                    <span className="mr-2 text-sky-700">{String(index + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </li>
                ))}
              </ol>
              {article.objectLink && (
                <Link href={article.objectLink} className="mt-6 inline-flex text-sm font-semibold text-sky-800 hover:text-sky-950">
                  Связанный объект →
                </Link>
              )}
              {relatedArticles.length > 0 && (
                <div className="mt-7 border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Читайте также</p>
                  <div className="mt-3 space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="block text-sm font-medium leading-6 text-slate-700 transition hover:text-sky-800"
                      >
                        {related.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>

        {relatedForHome.length > 0 && (
          <section className="mx-auto mt-16 max-w-7xl border-t border-slate-200 pt-12">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-800">Продолжить чтение</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Другие публикации</h2>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-sky-800 hover:text-sky-950">
                Все статьи →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedForHome.map((related) => (
                <ArticleCard key={related.slug} article={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublishedNewsResult();

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <BlogStateNotice unavailable />
        </div>
      </main>
    );
  }

  const articles = newsToBlogArticles(result.items);
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  return <ArticleContent article={article} articles={articles} />;
}