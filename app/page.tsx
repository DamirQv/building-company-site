import type { Metadata } from "next";
import Link from "next/link";
import LeadQuiz from "./components/lead-quiz";
import { LeadForm } from "./components/lead-form";
import { HeroContent } from "./components/hero-content";
import { HeroBackground } from "./components/hero-background";
import { TrustStrip } from "./components/trust-strip";
import { ProcessTimeline } from "./components/process-timeline";
import { CurrentProjectsSection } from "./components/current-projects-section";
import { TestimonialsGrid } from "./components/testimonials-grid";
import { MaterialsComparison } from "./components/materials-comparison";
import { DocsBlock } from "./components/docs-block";
import { CallbackButton } from "./components/callback-button";
import { ArticleCard } from "./components/article-card";
import { BlogStateNotice } from "./components/blog-state-notice";
import { getPublishedNewsResult, newsToBlogArticles } from "@/lib/news";
import {
  organizationJsonLd,
  materialsComparison,
  testimonials,
  documents,
} from "@/lib/content";
import { getPricingDataWithSource } from "@/lib/pricing";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const homeTitle = "Standard Stroy — строительство домов под ключ в Алматы и Астане";
const homeDescription =
  "Строим дома в Алматы и Астане с фиксацией стоимости работ в договоре: онлайн-камера на объекте, оплата по актам за этап, гарантия 10 лет. Предварительную стоимость рассчитайте по городу и материалу.";

export const metadata: Metadata = {
  ...createPageMetadata({
    path: "/",
    title: homeTitle,
    description: homeDescription,
  }),
  title: { absolute: homeTitle },
};

const stats = [
  { value: "15+", label: "лет опыта" },
  { value: "320+", label: "реализованных объектов" },
  { value: "500+", label: "довольных клиентов" },
  { value: "10 лет", label: "гарантии" },
];

const whyCards = [
  {
    icon: "💰",
    title: "Стоимость фиксируется в договоре",
    text: "Стоимость работ закреплена в договоре и не меняется в процессе строительства. Мы берём на себя риск удорожания материалов.",
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
    text: "Прозрачные этапы: проектирование, согласование стоимости и условий, договор, строительство. Вы всегда знаете, что происходит.",
  },
];

const processSteps = [
  { step: "01", title: "Заявка", duration: "1 день", text: "Обсуждаем задачу, бюджет и сроки. Отвечаем на все вопросы." },
  { step: "02", title: "Выезд инженера", duration: "2–3 дня", text: "Замер, оценка грунта и перепадов. Рекомендации по фундаменту." },
  { step: "03", title: "Проектирование", duration: "2–4 недели", text: "Эскиз, архитектурно-строительные чертежи, инженерные разделы." },
  { step: "04", title: "Согласование условий", duration: "3–5 дней", text: "Фиксируем стоимость работ и сроки в договоре. Оплата по этапам." },
  { step: "05", title: "Строительство", duration: "2–3 месяца", text: "Коробка: фундамент, стены, перекрытия, кровля, окна." },
  { step: "06", title: "Отделка", duration: "2–4 месяца", text: "Предчистовая и чистовая отделка, инженерные сети." },
  { step: "07", title: "Передача ключей", duration: "1 неделя", text: "Подписываем акт приёмки, передаём ключи и гарантийные обязательства." },
];

export default async function Home() {
  const { pricing, source: pricingSource } = await getPricingDataWithSource();
  const newsResult = await getPublishedNewsResult();
  const recentArticles = newsResult.ok ? newsToBlogArticles(newsResult.items).slice(0, 3) : [];

  return (
    <main className="min-h-screen bg-blue-50 text-slate-900">
      {/* JSON-LD микроразметка */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      {/* Блок 1 — Первый экран */}
      <section className="relative isolate overflow-hidden bg-slate-50">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A4A]/95 via-[#155A8A]/70 to-transparent" />
        <div className="relative mx-auto min-h-[calc(100svh-73px)] max-w-7xl px-6 sm:px-8 lg:px-12">
          <HeroContent />
        </div>
      </section>

      {/* Статистика — premium trust strip после Hero */}
      <TrustStrip items={stats} />

      {/* Блок 2 — Калькулятор стоимости */}
      <section id="quiz" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-6 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Калькулятор стоимости</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Рассчитайте стоимость дома</h2>
          </div>
          <div className="text-sm text-slate-600">Быстро • Точно • Без переплат</div>
        </div>
        <LeadQuiz pricing={pricing} pricingSource={pricingSource} />
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
        <div className="mt-10 flex justify-center">
          <CallbackButton source="why" />
        </div>
      </section>

      {/* Блок 5-9 — Как мы строим ваш дом (объединённый timeline процесса) */}
      <ProcessTimeline steps={processSteps} />

      {/* Блок 6-12 — Текущие объекты */}
      <CurrentProjectsSection />

      {/* Блок 7 — Отзывы */}
      <TestimonialsGrid items={testimonials} />

      {/* Блок 8 — Материалы: сравнение */}
      <MaterialsComparison rows={materialsComparison} pricing={pricing} />

      {/* Блок 11 — Документы */}
      <DocsBlock items={documents} />

      {/* Блок 12 — Новости и статьи */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="py-16 sm:py-20">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Журнал Standard Stroy</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Новости Standard Stroy</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Полезные материалы о проектировании, планировании и этапах строительства дома.
            </p>
          </div>
          {!newsResult.ok ? (
            <BlogStateNotice unavailable />
          ) : recentArticles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recentArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <BlogStateNotice />
          )}
          <div className="mt-10">
            <Link href="/blog" className="text-sm font-medium text-blue-700 transition hover:text-blue-900">
              Все новости →
            </Link>
          </div>
        </div>
      </section>

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
