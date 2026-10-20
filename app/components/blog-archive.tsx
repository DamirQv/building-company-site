"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatArticleDate, type BlogArticle } from "@/lib/articles";
import { ArticleCard } from "./article-card";

const categories = [
  "Все",
  "Ход строительства",
  "Наши объекты",
  "Полезное о строительстве",
  "Новости компании",
  "Публикации",
] as const;

const INITIAL_VISIBLE = 6;

export function BlogArchive({ articles }: { articles: BlogArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Все");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const filteredArticles =
    activeCategory === "Все"
      ? articles
      : articles.filter((article) => article.category === activeCategory);
  const featured = filteredArticles[0];
  const remaining = filteredArticles.slice(1);
  const visibleArticles = remaining.slice(0, visibleCount);

  return (
    <div className="mt-10">
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Фильтр публикаций по категории">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setVisibleCount(INITIAL_VISIBLE);
              }}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-sky-800 bg-sky-800 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-800"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {featured ? (
        <>
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <Link href={`/blog/${featured.slug}`} className="group relative block min-h-64 overflow-hidden bg-slate-100 sm:min-h-80 lg:min-h-[410px]">
                {featured.cover ? (
                  <Image
                    src={featured.cover}
                    alt={featured.coverAlt}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 55vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                    Фотография не добавлена
                  </span>
                )}
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                  <span className="font-semibold text-sky-800">{featured.category}</span>
                  <span className="text-slate-400">{formatArticleDate(featured.publishedAt)}</span>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Рекомендуем прочитать
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  {featured.description}
                </p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-7 inline-flex w-fit items-center gap-2 border-b border-sky-800 pb-1 text-sm font-semibold text-sky-800 transition hover:text-sky-950"
                >
                  Читать статью <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>

          {remaining.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}

          {remaining.length > visibleCount && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-700 hover:text-sky-800"
              >
                Показать ещё
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
          В этой категории пока нет публикаций.
        </p>
      )}
    </div>
  );
}
