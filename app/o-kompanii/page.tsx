import type { Metadata } from "next";
import Link from "next/link";
import { companyBenefits } from "@/lib/content";

export const metadata: Metadata = {
  title: "О компании Standard Stroy — строительство домов в Алматы",
  description:
    "Standard Stroy (ТОО «Эко Дом Билдинг») — 15 лет на рынке строительства, 320+ объектов. Фиксированная смета, онлайн-камера, гарантия 10 лет. Алматы, Астана.",
  alternates: { canonical: "/o-kompanii" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-blue-50 px-6 py-24 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">О компании</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Standard Stroy</h1>
        <p className="mt-4 text-sm text-slate-500">ТОО «Эко Дом Билдинг»</p>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Мы строим дома в Алматы, Астане и пригородах уже более 15 лет.
          За это время сдали 320+ объектов — от компактных домов 100 м²
          до коробки дома 240 м². Наш принцип: фиксированная смета, оплата по актам
          и онлайн-камера на каждом объекте.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companyBenefits.map((benefit) => (
            <div key={benefit.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-2xl">{benefit.icon}</div>
              <h2 className="mt-2 text-sm font-semibold text-zinc-900">{benefit.title}</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-600">{benefit.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Реквизиты</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-zinc-700">
            <div>
              <p className="text-zinc-400">Наименование</p>
              <p className="mt-1 font-medium">ТОО «Эко Дом Билдинг»</p>
            </div>
            <div>
              <p className="text-zinc-400">Бренд</p>
              <p className="mt-1 font-medium">Standard Stroy</p>
            </div>
            <div>
              <p className="text-zinc-400">Телефон</p>
              <p className="mt-1 font-medium">+7 (777) 050-08-03</p>
            </div>
            <div>
              <p className="text-zinc-400">Email</p>
              <p className="mt-1 font-medium">info@dombuilding.kz</p>
            </div>
            <div>
              <p className="text-zinc-400">Сайт</p>
              <p className="mt-1 font-medium">dombuilding.kz</p>
            </div>
            <div>
              <p className="text-zinc-400">География</p>
              <p className="mt-1 font-medium">Алматы, Астана, пригороды</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/kontakty" className="inline-flex rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800">
            Связаться с нами
          </Link>
        </div>
      </div>
    </main>
  );
}