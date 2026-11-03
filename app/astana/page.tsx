import Link from "next/link";
import { LeadForm } from "../components/lead-form";
import { formatCityPrice, getPricingData, resolveMaterialPrice } from "@/lib/pricing";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  path: "/astana",
  title: "Строительство домов в Астане — Standard Stroy",
  description:
    "Строим дома в Астане под ключ из FinnBlock, газоблока и кирпича. Стоимость работ фиксируем в договоре, показываем стройку через онлайн-камеру, даём гарантию 10 лет. Бесплатный выезд инженера.",
});

export default async function AstanaPage() {
  const pricing = await getPricingData();

  return (
    <main className="min-h-screen bg-blue-50 px-6 py-24 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Астана</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Строительство домов в Астане</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Standard Stroy строит дома в Астане под ключ. Стоимость работ фиксируем в договоре,
          показываем стройку через онлайн-камеру, принимаем оплату по актам за этап. Гарантия 10 лет на несущие конструкции.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Материалы</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Строим из FinnBlock, газоблока и кирпича. Учёт климата Астаны — морозостойкие
              материалы и усиленное утепление.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Цены</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ориентировочная цена за м² по материалу:
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {[
                ["Газоблок", "Газоблок"],
                ["Кирпич", "Кирпич"],
                ["FinnBlock", "FinnBlock"],
              ].map(([label, material]) => (
                <li key={material}>
                  {label} — {formatCityPrice(resolveMaterialPrice(material, pricing, "Астана"), "Астана")}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Цены ориентировочные; итоговая стоимость зависит от проекта и участка.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Сроки</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Коробка — 2–3 месяца. Под ключ — 6–9 месяцев.
              Сроки прописаны в договоре.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Бесплатный выезд инженера</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Инженер приедет на ваш участок в Астане, замерит перепады, проверит грунт
                и даст рекомендации по фундаменту. Без обязательств.
              </p>
              <div className="mt-4 space-y-2 text-sm text-zinc-700">
                <p>📞 +7 (777) 050-08-03</p>
                <p>📍 Астана — выезжаем на объекты по городу и пригородам</p>
              </div>
            </div>
            <div>
              <LeadForm blockCode="S-ASTANA" formType="callback" showComment={false} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/materialy" className="text-sm font-medium text-blue-700">Материалы →</Link>
          <Link href="/uslugi" className="text-sm font-medium text-blue-700">Услуги →</Link>
        </div>
      </div>
    </main>
  );
}