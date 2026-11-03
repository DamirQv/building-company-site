import { testimonials } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  path: "/otzyvy",
  title: "Отзывы — Standard Stroy, строительство домов в Алматы",
  description:
    "Видеоотзывы и отзывы клиентов Standard Stroy о строительстве домов в Алматы, Каскелене, Талгаре. Реальные истории — без постановочных отзывов.",
});

export default function OtzyvyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Отзывы</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Отзывы наших клиентов</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Отзывы клиентов о сотрудничестве со Standard Stroy.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.name} className="flex min-h-[19rem] flex-col rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-9">
              <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {item.type}
              </span>
              {item.text ? (
                <blockquote className="mt-6 flex-1">
                  <p className="text-base leading-8 text-slate-700">«{item.text}»</p>
                </blockquote>
              ) : (
                <div className="mt-6 flex-1" />
              )}
              <figcaption className="mt-6 border-t border-slate-100 pt-5">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.object}</div>
                {item.date && <div className="mt-1 text-xs text-slate-500">{item.date}</div>}
                <div className="mt-2 text-xs text-slate-500">Источник: {item.source}</div>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {item.source === "Instagram" ? "Смотреть видеоотзыв" : "Смотреть отзыв в 2GIS"}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </main>
  );
}