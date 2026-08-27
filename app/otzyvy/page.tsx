import type { Metadata } from "next";
import { testimonials } from "@/lib/content";

export const metadata: Metadata = {
  title: "Отзывы — Standard Stroy, строительство домов в Алматы",
  description:
    "Видеоотзывы и отзывы клиентов Standard Stroy о строительстве домов в Алматы, Каскелене, Талгаре. Реальные истории — без постановочных отзывов.",
  alternates: { canonical: "/otzyvy" },
};

export default function OtzyvyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Отзывы</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Отзывы наших клиентов</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Приоритет — видеоотзывы на фоне готового дома. Дополнительно: скриншоты переписок
          и отзывы из 2GIS. Все отзывы — от реальных клиентов.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <span className="inline-block rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-600">
                {item.type}
              </span>
              <p className="mt-4 text-sm leading-7 text-zinc-700">«{item.text}»</p>
              <div className="mt-4">
                <div className="font-medium text-zinc-900">{item.name}</div>
                <div className="text-xs text-zinc-500">{item.object}</div>
              </div>
            </blockquote>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          * Отзывы — плейсхолдеры. Замените на реальные видеоотзывы, скриншоты переписок и отзывы 2GIS.
        </p>
      </div>
    </main>
  );
}