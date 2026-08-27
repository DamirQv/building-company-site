import Image from "next/image";
import LeadQuiz from "./components/lead-quiz";
import { LeadForm } from "./components/lead-form";
import { HeroContent } from "./components/hero-content";
import { TrustStrip } from "./components/trust-strip";
import { ProcessTimeline } from "./components/process-timeline";
import { ObjectsSection } from "./components/objects-section";
import { TestimonialsGrid } from "./components/testimonials-grid";
import { MaterialsComparison } from "./components/materials-comparison";
import { TeamGrid } from "./components/team-grid";
import { DocsBlock } from "./components/docs-block";
import { FaqSection } from "./components/faq-section";
import {
  faqs,
  faqJsonLd,
  organizationJsonLd,
  materialsComparison,
  builtObjects,
  testimonials,
  team,
  documents,
} from "@/lib/content";
import { formatPrice, getPricingData } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const stats = [
  { value: "15+", label: "лет опыта" },
  { value: "320+", label: "реализованных объектов" },
  { value: "500+", label: "довольных клиентов" },
  { value: "10 лет", label: "гарантии" },
];

const heroBullets = [
  "Фиксированная смета в договоре",
  "Онлайн-камера на объекте",
  "Оплата по актам за этап",
  "Гарантия 10 лет",
];

const whyCards = [
  {
    icon: "💰",
    title: "Фиксированная смета",
    text: "Смета закреплена в договоре и не меняется. Мы берём на себя риск удорожания материалов.",
  },
  {
    icon: "🗓️",
    title: "Поэтапная оплата",
    text: "Оплата за этап — после подписания акта приёмки. Платите только за сделанное.",
  },
  {
    icon: "🔍",
    title: "Технический надзор",
    text: "Инженер технадзора проверяет качество и соответствие проекту на каждом этапе.",
  },
  {
    icon: "🛡️",
    title: "Гарантия 10 лет",
    text: "10 лет на несущие конструкции и 5 лет на отделку. Гарантия закреплена в договоре.",
  },
  {
    icon: "🧭",
    title: "Понятный процесс",
    text: "Прозрачные этапы: проект, смета, договор, стройка. Вы всегда знаете, что происходит.",
  },
];

const processSteps = [
  { step: "01", title: "Заявка", duration: "1 день", text: "Обсуждаем задачу, бюджет и сроки. Отвечаем на все вопросы." },
  { step: "02", title: "Выезд инженера", duration: "2–3 дня", text: "Замер, оценка грунта и перепадов. Рекомендации по фундаменту." },
  { step: "03", title: "Проектирование", duration: "2–4 недели", text: "Эскиз, архитектурно-строительные чертежи, инженерные разделы." },
  { step: "04", title: "Смета и договор", duration: "3–5 дней", text: "Фиксируем смету и сроки в договоре. Оплата по этапам." },
  { step: "05", title: "Строительство", duration: "2–3 месяца", text: "Коробка: фундамент, стены, перекрытия, кровля, окна." },
  { step: "06", title: "Отделка", duration: "2–4 месяца", text: "Предчистовая и чистовая отделка, инженерные сети." },
  { step: "07", title: "Передача ключей", duration: "1 неделя", text: "Подписываем акт приёмки, передаём ключи и гарантийные обязательства." },
];

export default async function Home() {
  const pricing = await getPricingData();
  const basePrice = pricing.length > 0
    ? Math.min(...pricing.map((entry) => entry.pricePerM2))
    : 135000;

  return (
    <main className="min-h-screen bg-blue-50 text-slate-900">
      {/* JSON-LD микроразметка */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      {/* Блок 1 — Первый экран */}
      <section className="relative isolate overflow-hidden bg-slate-50">
        <Image
          src="/hero-home.jpg"
          alt="Современный частный дом"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/18" />
        <div className="relative mx-auto min-h-[calc(100svh-73px)] max-w-7xl px-6 sm:px-8 lg:px-12">
          <HeroContent />
        </div>
        <div className="hidden" />
        <div className="hidden">
          <div className="grid items-end gap-10 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-blue-200 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-700">
                  Standard Stroy
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  Дом под ключ • Алматы, Астана и пригороды
                </span>
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Построим дом в Алматы по фиксированной смете — и вы будете видеть стройку из телефона
              </h1>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {heroBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-blue-700">✓</span> {bullet}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-lg text-slate-700 sm:text-xl">
                От {formatPrice(basePrice)}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#quiz"
                  className="rounded-full bg-blue-900 px-7 py-3 font-medium text-white transition hover:bg-blue-800"
                >
                  Рассчитать стоимость моего дома
                </a>
                <a
                  href="https://wa.me/77770500803?text=Здравствуйте!%20Пишу%20с%20сайта%20dombuilding.kz%20[S-HERO]"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 bg-white px-7 py-3 font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  Написать в WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Что вы получаете</p>
              <ul className="mt-6 space-y-4 text-sm text-zinc-100">
                <li>• Фиксированная смета в договоре — без удорожаний</li>
                <li>• Онлайн-камера на объекте — стройка из телефона</li>
                <li>• Оплата по актам за этап — платите за сделанное</li>
                <li>• Гарантия 10 лет на несущие конструкции</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика — premium trust strip после Hero */}
      <TrustStrip items={stats} />

      {/* Блок 2 — Квиз-калькулятор */}
      <section id="quiz" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-6 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Квиз-калькулятор</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Рассчитайте стоимость дома за 1 минуту</h2>
          </div>
          <div className="text-sm text-slate-600">Быстро • Точно • Без переплат</div>
        </div>
        <LeadQuiz />
      </section>

      {/* Блок 3 — Почему Standard Stroy (объединённый блок доверия и преимуществ) */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Наши преимущества</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Почему Standard Stroy</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Пять подтверждённых преимуществ, которые защищают ваш бюджет и гарантируют результат на каждом этапе.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {whyCards.map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-2xl">{card.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Блок 5-9 — Как мы строим ваш дом (объединённый timeline процесса) */}
      <ProcessTimeline steps={processSteps} />

      {/* Блок 6-12 — Наши объекты (карточки + карта, одно представление за раз) */}
      <ObjectsSection items={builtObjects} />

      {/* Блок 7 — Отзывы */}
      <TestimonialsGrid items={testimonials} />

      {/* Блок 8 — Материалы: сравнение */}
      <MaterialsComparison rows={materialsComparison} />

      {/* Блок 10 — Команда */}
      <TeamGrid members={team} />

      {/* Блок 11 — Документы */}
      <DocsBlock items={documents} />

      {/* Блок 12 — FAQ */}
      <FaqSection items={faqs} />

      {/* Блок 13 — Финальный CTA + форма */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 lg:p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Оставить заявку</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Получите консультацию и расчёт</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600">
                Оставьте заявку — мы перезвоним, ответим на вопросы и при необходимости
                запишем на бесплатный выезд инженера на участок.
              </p>
              <div className="mt-6 space-y-2 text-sm text-zinc-700">
                <p>📞 +7 (777) 050-08-03</p>
                <p>🕘 Пн–Сб, 9:00–20:00</p>
                <p>📍 Алматы, Астана и пригороды</p>
              </div>
            </div>
            <div>
              <LeadForm blockCode="S-HERO-CTA" formType="consultation" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
