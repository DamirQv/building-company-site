import Link from "next/link";
import LeadQuiz from "./components/lead-quiz";
import InteractiveMap from "./components/interactive-map";
import { LeadForm } from "./components/lead-form";
import {
  faqs,
  faqJsonLd,
  organizationJsonLd,
  companyBenefits,
  workSteps,
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
  { value: "320+", label: "объектов" },
  { value: "500+", label: "довольных клиентов" },
];

const heroBullets = [
  "Фиксированная смета в договоре",
  "Онлайн-камера на объекте",
  "Оплата по актам за этап",
  "Гарантия 10 лет",
];

const trustCards = [
  {
    title: "Фиксация сметы в договоре",
    text: "Смета закреплена в договоре и не меняется. Мы берём на себя риск удорожания материалов.",
  },
  {
    title: "Оплата после подписания акта",
    text: "Транш за этап — только после того, как вы подписали акт приёмки. Не подписали — не платите.",
  },
  {
    title: "Технадзор на каждом этапе",
    text: "Инженер технадзора проверяет качество и соответствие проекту. Фото- и видеоотчёт после этапа.",
  },
];

const stages = [
  { title: "Проектирование", text: "Эскиз, чертежи, инженерные разделы. Отдельный договор." },
  { title: "Коробка", text: "Фундамент, стены, кровля, окна. Тепловой контур готов." },
  { title: "Предчистовая отделка", text: "Штукатурка, стяжка, разводка коммуникаций." },
  { title: "Чистовая отделка", text: "Финишные материалы, сантехника, электрика." },
  { title: "Благоустройство", text: "Забор, дорожки, озеленение, освещение участка." },
];

export default async function Home() {
  const pricing = await getPricingData();
  const basePrice = pricing[0]?.pricePerM2 ?? 135000;

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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-6 sm:px-8 lg:px-12">
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

      {/* Статистика */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-4xl font-semibold text-blue-700 sm:text-5xl">{item.value}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

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

      {/* Блок 3 — Почему смета не вырастет */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Главный блок доверия</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Почему смета не вырастет</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Три условия, которые защищают ваш бюджет на всех этапах строительства.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {trustCards.map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          <p className="font-medium text-zinc-900">Фрагмент договора</p>
          <p className="mt-2 leading-7">
            «Стоимость работ по настоящему договору является фиксированной и не подлежит изменению
            в одностороннем порядке. Оплата производится поэтапно — после подписания акта
            приёмки выполненных работ по каждому этапу.»
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            * Конкретные условия оплаты (проценты, суммы траншей) согласуются индивидуально и на сайте не указываются.
          </p>
        </div>
      </section>

      {/* Блок 4 — Вы видите стройку из телефона */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Онлайн-камера</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Вы видите стройку из телефона</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              На каждом объекте установлена онлайн-камера. Вы в любой момент можете открыть трансляцию
              и увидеть, что происходит на стройке — без поездок на объект. После каждого этапа
              вы получаете фото- и видеоотчёт.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-700">
              <li>📷 Трансляция в реальном времени</li>
              <li>📸 Фото-отчёт по завершении этапа</li>
              <li>🎥 Видео-обзор ключевых моментов</li>
            </ul>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-8">
            <div className="text-center">
              <div className="text-5xl">📱</div>
              <p className="mt-4 text-sm text-zinc-500">
                Скриншот интерфейса камеры и пример фото-отчёта по этапу
              </p>
              <p className="mt-2 text-xs text-zinc-400">(здесь будет скриншот — замените на реальный)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Блок 5 — Платите только за то, что заказали */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Этапы работ</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Платите только за то, что заказали</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            На каждый этап — отдельный договор. Вы можете остановиться на любом этапе
            или продолжить, когда будете готовы.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-blue-700">0{index + 1}</div>
              <h3 className="mt-3 text-base font-semibold">{stage.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{stage.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/uslugi/proektirovanie"
            className="inline-flex rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Начать с проекта
          </Link>
        </div>
      </section>

      {/* Блок 6 — Построенные объекты */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Построенные объекты</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Реальные дома, которые мы построили</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            Только реальные фото — без рендеров и визуализаций. На каждой карточке: площадь, материал, срок, район.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {builtObjects.map((obj) => (
            <article key={obj.title} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img src={obj.image} alt={`${obj.title} — ${obj.material}, ${obj.area}`} className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{obj.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{obj.area}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{obj.material}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{obj.duration}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{obj.district}</span>
                </div>
                <blockquote className="mt-4 text-sm italic leading-6 text-slate-600">
                  «{obj.quote}»
                </blockquote>
                <p className="mt-2 text-xs text-slate-400">— {obj.author}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/obekty" className="text-sm font-medium text-blue-700">
            Смотреть все объекты →
          </Link>
        </div>
      </section>

      {/* Блок 7 — Отзывы */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Отзывы</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Что говорят клиенты</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            Приоритет — видеоотзывы на фоне готового дома. Дополнительно: скриншоты переписок и отзывы из 2GIS.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {item.type}
              </span>
              <p className="mt-4 text-sm leading-7 text-slate-700">«{item.text}»</p>
              <div className="mt-4">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">{item.object}</div>
              </div>
            </blockquote>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/otzyvy" className="text-sm font-medium text-blue-700">
            Все отзывы →
          </Link>
        </div>
      </section>

      {/* Блок 8 — Материалы: сравнение */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Материалы</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">FinnBlock vs Газоблок vs Кирпич</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            Сравнение по ключевым параметрам для климата и сейсмики Алматы.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 pr-4 font-medium text-slate-500">Параметр</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">FinnBlock</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Газоблок</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Кирпич</th>
                </tr>
              </thead>
              <tbody>
                {materialsComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 text-slate-500">{row.feature}</td>
                    <td className="py-3 px-4 text-slate-800">{row.finnblock}</td>
                    <td className="py-3 px-4 text-slate-800">{row.gazoblock}</td>
                    <td className="py-3 px-4 text-slate-800">{row.kirpich}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/materialy/doma-iz-finnblock" className="text-sm font-medium text-blue-700">Дома из FinnBlock →</Link>
            <Link href="/materialy/doma-iz-gazobloka" className="text-sm font-medium text-blue-700">Дома из газоблока →</Link>
            <Link href="/materialy/doma-iz-kirpicha" className="text-sm font-medium text-blue-700">Дома из кирпича →</Link>
          </div>
        </div>
      </section>

      {/* Блок 9 — Как мы работаем (этапы) */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Как мы работаем</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">7 шагов от заявки до ключей</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workSteps.map((item) => (
            <div key={item.step} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">{item.step}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-500">{item.duration}</span>
              </div>
              <h3 className="mt-3 text-base font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Блок 10 — Команда */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Команда</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Люди, которые строят ваш дом</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
            Безымянная компания не вызывает доверия при чеке 20 млн ₸. Знакомьтесь — те, кто отвечает за результат.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {team.map((member) => (
            <div key={member.role} className="rounded-[2rem] border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-slate-100">
                <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{member.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{member.role}</p>
              <p className="mt-2 text-xs text-zinc-400">{member.experience}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-zinc-400">
          * Фото и имена — плейсхолдеры. Замените на реальные фото директора, архитектора, прораба и инженера технадзора.
        </p>
      </section>

      {/* Блок 11 — Документы */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 lg:p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Документы</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Лицензии, сертификаты, договор</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
                Все работы выполняются официально. Лицензия, сертификаты на материалы,
                протокол испытаний КазНИИСА и образец договора — для вашего спокойствия.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <div key={doc.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{doc.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Блок 12 — FAQ */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Частые вопросы</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-medium text-zinc-900">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Интерактивная карта (оставлено из оригинала) */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Объекты</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Интерактивная карта строительства</h2>
        </div>
        <InteractiveMap />
      </section>

      {/* 7 отличий — краткий блок */}
      <section className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Наши отличия</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Что делает нас разными</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companyBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-2xl">{benefit.icon}</div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-900">{benefit.title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-600">{benefit.text}</p>
              </div>
            ))}
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