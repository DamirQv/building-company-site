import type { Metadata } from "next";
import { builtObjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Построенные объекты — Standard Stroy, Алматы",
  description:
    "Реальные дома, построенные Standard Stroy в Алматы, Каскелене, Талгаре, Иссыке. Фото, площадь, материал, срок, район. Без рендеров — только реальные фото.",
  alternates: { canonical: "/obekty" },
};

export default function ObektyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Объекты</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Построенные объекты</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Только реальные фото — без рендеров и визуализаций. На каждой карточке:
          площадь, материал, срок строительства, район и отзыв клиента.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {builtObjects.map((obj) => (
            <article key={obj.title} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
              <div className="relative h-48 w-full overflow-hidden bg-zinc-200">
                <img src={obj.image} alt={`${obj.title} — ${obj.material}, ${obj.area}`} className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold">{obj.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.area}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.material}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.duration}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1">{obj.district}</span>
                </div>
                <blockquote className="mt-4 text-sm italic leading-6 text-zinc-600">
                  «{obj.quote}»
                </blockquote>
                <p className="mt-2 text-xs text-zinc-400">— {obj.author}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          * Фото — плейсхолдеры. Замените на реальные фото построенных домов.
        </p>
      </div>
    </main>
  );
}