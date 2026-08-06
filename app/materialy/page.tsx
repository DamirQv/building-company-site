import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Материалы для строительства домов — FinnBlock, газоблок, кирпич",
  description:
    "Сравнение материалов для строительства дома в Алматы: FinnBlock, газоблок, кирпич. Теплоизоляция, сейсмостойкость, цена. Поможем выбрать под ваш бюджет.",
  alternates: { canonical: "/materialy" },
};

const materials = [
  {
    slug: "doma-iz-finnblock",
    title: "Дома из FinnBlock",
    description: "Тёплый, сейсмоустойчивый, быстрый в монтаже. Не требует утепления. От 135 000 ₸/м².",
    pros: ["Отличная теплоизоляция", "Высокая сейсмостойкость", "Быстрое возведение", "Не требует утепления"],
  },
  {
    slug: "doma-iz-gazobloka",
    title: "Дома из газоблока",
    description: "Автоклавный газобетон — проверенное решение. Хорошая теплоизоляция, доступная цена. От 150 000 ₸/м².",
    pros: ["Хорошая теплоизоляция", "Высокая сейсмостойкость", "Доступная цена", "Минимальное утепление"],
  },
  {
    slug: "doma-iz-kirpicha",
    title: "Дома из кирпича",
    description: "Классика — долговечность и престиж. Требует утепления, но служит поколениями. От 180 000 ₸/м².",
    pros: ["Долговечность", "Престижный внешний вид", "Облицовочный кирпич — без фасада", "Огнестойкость"],
  },
];

export default function MaterialyPage() {
  return (
    <main className="min-h-screen bg-blue-50 px-6 py-24 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Материалы</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Из чего строить дом в Алматы</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Выбор материала влияет на тепло, сейсмоустойчивость, скорость и цену дома.
          Поможем подобрать оптимальный вариант под ваш бюджет и климат.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {materials.map((mat) => (
            <Link
              key={mat.slug}
              href={`/materialy/${mat.slug}`}
              className="group rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-300"
            >
              <h2 className="text-xl font-semibold text-zinc-900">{mat.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{mat.description}</p>
              <ul className="mt-4 space-y-1">
                {mat.pros.map((pro) => (
                  <li key={pro} className="text-xs text-slate-500">• {pro}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-blue-700 opacity-0 transition group-hover:opacity-100">
                Подробнее →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}