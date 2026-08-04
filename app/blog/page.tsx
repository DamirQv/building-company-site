import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Блог — Standard Stroy, строительство домов в Алматы",
  description:
    "Статьи о строительстве домов в Алматы: выбор материалов, этапы строительства, разрешение на ИЖС, ипотека, новый Строительный кодекс РК.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Блог</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Блог о строительстве</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Статьи о строительстве домов в Алматы: выбор материалов, этапы, разрешение на ИЖС,
          ипотека и новый Строительный кодекс РК.
        </p>

        <div className="mt-12 rounded-[2rem] border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <div className="text-4xl">📝</div>
          <h2 className="mt-4 text-xl font-semibold text-zinc-900">Блог скоро появится</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Мы готовим статьи о строительстве домов в Алматы. Загляните позже.
          </p>
        </div>
      </div>
    </main>
  );
}