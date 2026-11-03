import Link from "next/link";
import { builtObjects } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/obekty",
  title: "Построенные объекты — Standard Stroy, Алматы",
  description:
    "Проекты и этапы строительства домов Standard Stroy в Алматы, Каскелене и Талгаре: площадь, материал, город и описание.",
});

export default function ObektyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Объекты</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Построенные объекты</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Реальные проекты и этапы строительства домов
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {builtObjects.map((obj) => (
            <article key={obj.slug} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="p-6">
                <Link href={`/obekty/${obj.slug}`} className="block">
                  <h2 className="text-lg font-semibold text-zinc-900">{obj.title}</h2>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                  {obj.area && <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.area}</span>}
                  {obj.material && <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.material}</span>}
                  {obj.city && <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.city}</span>}
                </div>

                {obj.description && (
                  <p className="mt-4 text-sm leading-6 text-zinc-600">{obj.description}</p>
                )}

                <div className="mt-5">
                  <Link href={`/obekty/${obj.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900">
                    Подробнее <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
