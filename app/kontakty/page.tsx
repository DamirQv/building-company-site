import Link from "next/link";
import { LeadForm } from "@/app/components/lead-form";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-blue-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Контакты</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
                Оставьте заявку — мы свяжемся с вами в ближайшее время
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600">
                На этой странице вы можете отправить заявку прямо из сайта. Отправляем все данные в Bitrix24,
                чтобы менеджер быстрее связался с вами и согласовал удобное время для консультации.
              </p>

              <div className="mt-10 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900">Телефон</p>
                  <p className="mt-2">+7 (777) 050-08-03</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900">WhatsApp</p>
                  <p className="mt-2">Напишите нам в мессенджере</p>
                </div>
              </div>

              <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-800">
                <p className="font-semibold">Хотите расчёт дома?</p>
                <p className="mt-2">
                  Если вы хотите получить квиз-калькулятор и приблизительную смету,
                  вернитесь на главную страницу и нажмите «Рассчитать стоимость моего дома».
                </p>
                <Link
                  href="/#quiz"
                  className="mt-4 inline-flex rounded-full bg-blue-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
                >
                  Открыть квиз на главной
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Форма заявки</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Получите консультацию прямо здесь</h2>
              </div>
              <LeadForm blockCode="S-KONTAKTY" formType="consultation" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
