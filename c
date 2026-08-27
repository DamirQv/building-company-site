import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "../components/lead-form";

export const metadata: Metadata = {
  title: "Цены на строительство домов в Алматы — Standard Stroy",
  description:
    "Цены на строительство домов в Алматы: коробка от 135 000 ₸/м², отделка под ключ от 45 000 ₸/м². Фиксированная смета в договоре. Калькулятор стоимости онлайн.",
  alternates: { canonical: "/tseny" },
};

const priceTable = [
  { stage: "Проектирование", price: "от 2 000 ₸/м²", duration: "2–4 недели" },
  { stage: "Коробка (FinnBlock)", price: "от 135 000 ₸/м²", duration: "2–3 месяца" },
  { stage: "Коробка (Газоблок)", price: "от 150 000 ₸/м²", duration: "2–3 месяца" },
  { stage: "Коробка (Кирпич)", price: "от 180 000 ₸/м²", duration: "3–4 месяца" },
  { stage: "Предчистовая отделка", price: "от 25 000 ₸/м²", duration: "1–2 месяца" },
  { stage: "Чистовая отделка", price: "от 45 000 ₸/м²", duration: "2–4 месяца" },
  { stage: "Благоустройство", price: "по проекту", duration: "2–6 недель" },
];

const examples = [
  { area: "100 м²", material: "FinnBlock", level: "Коробка", price: "от 13,5 млн ₸" },
  { area: "100 м²", material: "FinnBlock", level: "Под ключ", price: "от 20 млн ₸" },
  { area: "150 м²", material: "Газоблок", level: "Коробка", price: "от 22,5 млн ₸" },
  { area: "150 м²", material: "Газоблок", level: "Под ключ", price: "от 30 млн ₸" },
  { area: "200 м²", material: "Кирпич", level: "Коробка", price: "от 36 млн ₸" },
  { area: "200 м²", material: "Кирпич", level: "Под ключ", price: "от 45 млн ₸" },
];

export default function TsenyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Цены</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Цены на строительство домов</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Прозрачные цены по этапам. Смета фиксируется в договоре и не меняется.
          Точная стоимость — после замера и проектирования.
        </p>

        <div className="mt-12 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Цены по этапам</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-3 pr-4 font-medium text-zinc-500">Этап</th>
                  <th className="py-3 px-4 font-medium text-zinc-500">Цена</th>
                  <th className="py-3 px-4 font-medium text-zinc-500">Срок</th>
                </tr>
              </thead>
              <tbody>
                {priceTable.map((row) => (
                  <tr key={row.stage} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 text-zinc-800">{row.stage}</td>
                    <td className="py-3 px-4 font-medium text-zinc-900">{row.price}</td>
                    <td className="py-3 px-4 text-zinc-500">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Примеры стоимости</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((ex) => (
              <div key={`${ex.area}-${ex.material}-${ex.level}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-900">{ex.area} · {ex.material}</p>
                <p className="mt-1 text-xs text-zinc-500">{ex.level}</p>
                <p className="mt-2 text-lg font-semibold text-orange-500">{ex.price}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            * Цены ориентировочные. Точная смета фиксируется в договоре после замера.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">Рассчитать точную стоимость</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Пройдите квиз-калькулятор за 1 минуту и получите предварительный диапазон стоимости.
                Или оставьте заявку — мы рассчитаем точную смету под ваш участок.
              </p>
              <div className="mt-4">
                <Link href="/#quiz" className="inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600">
                  Пройти квиз-калькулятор
                </Link>
              </div>
            </div>
            <div>
              <LeadForm blockCode="S-TSENY" formType="consultation" showComment={false} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}