import { getPublishedNewsResult, newsToBlogArticles } from "@/lib/news";
import { BlogArchive } from "../components/blog-archive";
import { BlogStateNotice } from "../components/blog-state-notice";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/blog",
  title: "Новости и статьи о строительстве домов",
  description:
    "Новости и публикации Standard Stroy о строительстве домов и ходе работ.",
});

export default async function BlogPage() {
  const result = await getPublishedNewsResult();
  const articles = result.ok ? newsToBlogArticles(result.items) : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-800">Журнал Standard Stroy</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Новости и статьи
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Разбираем этапы строительства, подготовку к проекту и решения, которые помогают увереннее планировать будущий дом.
          </p>
        </header>
        {!result.ok ? (
          <div className="mt-10"><BlogStateNotice unavailable /></div>
        ) : articles.length === 0 ? (
          <div className="mt-10"><BlogStateNotice /></div>
        ) : (
          <BlogArchive articles={articles} />
        )}
      </div>
    </main>
  );
}