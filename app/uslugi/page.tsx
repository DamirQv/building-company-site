import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Услуги — строительство домов под ключ в Алматы и Астане",
  description:
    "Полный цикл строительства: проектирование, коробка, предчистовая и чистовая отделка, благоустройство. Коммерческие и производственные здания. Отдельный договор на каждый этап.",
  alternates: { canonical: "/uslugi" },
};

const services = [
  {
    slug: "proektirovanie",
    title: "Проектирование домов",
    description: "Эскизный проект, архитектурно-строительные чертежи, инженерные разделы. С учётом сейсмики Алматы и вашего бюджета.",
    price: "от 2 000 ₸/м²",
  },
  {
    slug: "stroitelstvo-korobki",
    title: "Строительство коробки",
    description: "Фундамент, несущие стены, перекрытия, кровля, окна и дверь. Готовый тепловой контур за 2–3 месяца.",
    price: "от 135 000 ₸/м²",
  },
  {
    slug: "predchistovaya-otdelka",
    title: "Предчистовая отделка",
    description: "Штукатурка, стяжка, разводка электрики и сантехники. Подготовка под чистовую отделку.",
    price: "от 25 000 ₸/м²",
  },
  {
    slug: "otdelka-pod-klyuch",
    title: "Отделка под ключ",
    description: "Финишные материалы, сантехника, электрика, двери, пол. Заезжаете и живёте.",
    price: "от 45 000 ₸/м²",
  },
  {
    slug: "blagoustroystvo",
    title: "Благоустройство",
    description: "Забор, ворота, дорожки, озеленение, освещение участка. Финальный штрих вашего дома.",
    price: "по проекту",
  },
  {
    slug: "kommercheskoe-stroitelstvo",
    title: "Коммерческие здания",
    description: "Офисы, склады, торговые центры, административные здания под ключ.",
    price: "по проекту",
  },
  {
    slug: "proizvodstvennye-pomescheniya",
    title: "Производственные помещения",
    description: "Цеха, склады, производственные комплексы с инженерными системами.",
    price: "по проекту",
  },
];

export default function UslugiPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Услуги</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Услуги под ключ для жилых и коммерческих проектов</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Полный цикл строительства — от проекта до ключа. На каждый этап отдельный договор
          и оплата по акту. Строим в Алматы, Астане и пригородах.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/uslugi/${service.slug}`}
              className="group rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-orange-300"
            >
              <h2 className="text-xl font-semibold text-zinc-900">{service.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{service.description}</p>
              <p className="mt-4 text-sm font-medium text-orange-500">{service.price}</p>
              <p className="mt-4 text-sm text-orange-500 opacity-0 transition group-hover:opacity-100">
                Подробнее →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}