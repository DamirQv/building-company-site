import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика обработки персональных данных ТОО «Эко Дом Билдинг» (бренд Standard Stroy): какие данные мы собираем, зачем и как защищаем.",
  alternates: { canonical: "/politika-konfidencialnosti" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Документ</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Политика конфиденциальности</h1>
        <p className="mt-4 text-sm text-zinc-500">
          Редакция от 29.07.2026 · ТОО «Эко Дом Билдинг» (бренд Standard Stroy)
        </p>

        <div className="mt-10 space-y-8 leading-8 text-zinc-600">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900">1. Общие положения</h2>
            <p className="mt-3">
              Настоящая Политика определяет порядок обработки и защиты персональных данных
              пользователей сайта dombuilding.kz (далее — «Сайт»), оператором которого является
              ТОО «Эко Дом Билдинг» (далее — «Оператор»). Используя Сайт и оставляя заявку,
              вы соглашаетесь с условиями настоящей Политики.
            </p>
            <p className="mt-3">
              Обработка персональных данных осуществляется в соответствии с Законом Республики
              Казахстан «О персональных данных и их защите».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">2. Какие данные мы собираем</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Имя — для обращения к вам при звонке или переписке.</li>
              <li>Номер телефона — для связи и отправки расчёта.</li>
              <li>Комментарий к заявке — для понимания вашей задачи.</li>
              <li>
                Ответы квиз-калькулятора (тип объекта, площадь, материал, этажность, город и др.) —
                для предварительного расчёта и квалификации заявки.
              </li>
              <li>
                Технические данные: UTM-метки, источник перехода, страница входа, referrer —
                для оценки эффективности рекламы.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">3. Цели обработки</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Связь с вами для консультации и расчёта стоимости строительства.</li>
              <li>Запись на бесплатный выезд инженера на участок.</li>
              <li>Передача заявки в CRM-систему (Bitrix24) для обработки менеджером.</li>
              <li>Анализ источников трафика и эффективности рекламных каналов.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">4. Передача третьим лицам</h2>
            <p className="mt-3">
              Мы не передаём ваши персональные данные третьим лицам, за исключением:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>CRM-системы Bitrix24 — для обработки заявок сотрудниками компании.</li>
              <li>
                Платформ аналитики (Google Analytics, Яндекс.Метрика, Meta Pixel) — в обезличенном
                виде для оценки эффективности рекламы.
              </li>
              <li>По требованию уполномоченных государственных органов РК.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">5. Хранение данных</h2>
            <p className="mt-3">
              UTM-метки и источник перехода хранятся в cookie вашего браузера до 90 дней —
              чтобы мы знали, откуда вы пришли, даже если вернётесь позже. Контактные данные
              хранятся в CRM в течение срока, необходимого для обработки заявки, но не менее
              срока исковой давности.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">6. Ваши права</h2>
            <p className="mt-3">Вы вправе в любой момент:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Запросить доступ к вашим персональным данным.</li>
              <li>Попросить исправить неточные данные.</li>
              <li>Попросить удалить ваши данные («право на забвение»).</li>
              <li>Отозвать согласие на обработку — направив обращение на info@dombuilding.kz.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">7. Cookie</h2>
            <p className="mt-3">
              Сайт использует cookie для сохранения UTM-меток и аналитики. Вы можете отключить
              cookie в настройках браузера, однако в этом случае мы не сможем корректно
              определить источник вашего визита.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">8. Контакты Оператора</h2>
            <p className="mt-3">
              ТОО «Эко Дом Билдинг» · бренд Standard Stroy<br />
              Email: info@dombuilding.kz<br />
              Телефон: +7 (777) 050-08-03
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}