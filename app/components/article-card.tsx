import Image from "next/image";
import Link from "next/link";
import { formatArticleDate, type BlogArticle } from "@/lib/articles";

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-slate-900/5">
      <Link href={`/blog/${article.slug}`} className="block">
        {article.cover ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <Image
              src={article.cover}
              alt={article.coverAlt}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 px-6 text-sm text-slate-500">
            Фотография не добавлена
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            <span className="font-medium text-sky-800">{article.category}</span>
            <span className="text-slate-400">{formatArticleDate(article.publishedAt)}</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-sky-800">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{article.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
            Читать <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
