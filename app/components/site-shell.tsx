"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackContact } from "@/lib/analytics-events";

const navItems = [
  { href: "/o-kompanii", label: "О компании" },
  { href: "/uslugi", label: "Услуги" },
  { href: "/proekty", label: "Проекты" },
  { href: "/obekty", label: "Объекты" },
  { href: "/otzyvy", label: "Отзывы" },
  { href: "/kontakty", label: "Контакты" },
];

const breadcrumbLabels: Record<string, string> = {
  "o-kompanii": "О компании",
  uslugi: "Услуги",
  proektirovanie: "Проектирование домов",
  "stroitelstvo-korobki": "Строительство коробки",
  "predchistovaya-otdelka": "Предчистовая отделка",
  "otdelka-pod-klyuch": "Отделка под ключ",
  blagoustroystvo: "Благоустройство",
  "kommercheskoe-stroitelstvo": "Коммерческие здания",
  "proizvodstvennye-pomescheniya": "Производственные помещения",
  materialy: "Материалы",
  "doma-iz-finnblock": "Дома из FinnBlock",
  "doma-iz-gazobloka": "Дома из газоблока",
  "doma-iz-kirpicha": "Дома из кирпича",
  proekty: "Проекты",
  obekty: "Построенные объекты",
  otzyvy: "Отзывы",
  kontakty: "Контакты",
  astana: "Астана",
  blog: "Блог",
  "politika-konfidencialnosti": "Политика конфиденциальности",
  about: "О компании",
  services: "Услуги",
  projects: "Проекты",
  reviews: "Отзывы",
  contacts: "Контакты",
  privacy: "Политика конфиденциальности",
};

const WHATSAPP_PHONE = "77770500803";
const COMPANY = {
  name: "ТОО «Эко Дом Билдинг»",
  brand: "Standard Stroy",
  bin: "_______ (уточняется)",
  address: "г. Алматы, Казахстан (уточняется)",
  license: "№ _______ (уточняется)",
};

export function buildWhatsAppHref(blockCode: string, customText?: string) {
  const text =
    customText ??
    `Здравствуйте! Пишу с сайта dombuilding.kz [${blockCode}]`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const isHome = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.3em] text-slate-900 uppercase">
            <img src="/logo.svg" alt="Standard Stroy" className="h-10 w-10 rounded-full border border-blue-200 bg-white p-1" />
            <span>Standard Stroy</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/kontakty"
            className="inline-flex items-center justify-center rounded-full bg-slate-100 p-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-200"
          >
            <span className="sr-only">Получить консультацию</span>
            <span className="text-lg">✉️</span>
          </Link>
        </div>
      </header>

      {!isHome && (
        <div className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 text-sm text-zinc-500 sm:px-8 lg:px-12">
            <Link href="/" className="hover:text-zinc-900">
              Главная
            </Link>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const label = breadcrumbLabels[segment] ?? segment;
              const isLast = index === segments.length - 1;

              return (
                <div key={href} className="flex items-center gap-2">
                  <span>/</span>
                  {isLast ? <span className="text-zinc-700">{label}</span> : <Link href={href} className="hover:text-zinc-900">{label}</Link>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {children}

      <footer className="border-t border-zinc-200 bg-white px-4 py-10 text-sm text-zinc-600 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="text-lg font-semibold tracking-[0.3em] text-zinc-800 uppercase">Standard Stroy</div>
            <p className="mt-2 max-w-md text-zinc-600">
              Строительство домов под ключ в Алматы, Астане и пригородах. Фиксированная смета, онлайн-камера на объекте, гарантия 10 лет.
            </p>
            <div className="mt-4 space-y-1 text-xs text-zinc-500">
              <p>{COMPANY.name}</p>
              <p>БИН: {COMPANY.bin}</p>
              <p>Юридический адрес: {COMPANY.address}</p>
              <p>Лицензия: {COMPANY.license}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Навигация</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/o-kompanii" className="transition hover:text-slate-900">О компании</Link>
              <Link href="/uslugi" className="transition hover:text-slate-900">Услуги</Link>
              <Link href="/proekty" className="transition hover:text-slate-900">Проекты</Link>
              <Link href="/obekty" className="transition hover:text-slate-900">Построенные объекты</Link>
              <Link href="/otzyvy" className="transition hover:text-slate-900">Отзывы</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Контакты и документы</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/kontakty" className="transition hover:text-slate-900">Контакты</Link>
              <a href={buildWhatsAppHref("S-FOOTER")} target="_blank" rel="noreferrer" onClick={() => trackContact("S-FOOTER-WHATSAPP")} className="transition hover:text-slate-900">WhatsApp</a>
              <Link href="/politika-konfidencialnosti" className="transition hover:text-slate-900">Политика конфиденциальности</Link>
              <a href="/oferta.pdf" className="transition hover:text-zinc-900">Образец договора</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-zinc-200 pt-6 text-xs text-zinc-400">
          © {new Date().getFullYear()} {COMPANY.name}. Все права защищены. Бренд «Standard Stroy».
        </div>
      </footer>

      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 sm:right-6">
        <Link
          href="/kontakty"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 shadow-lg transition hover:bg-slate-200"
          aria-label="Оставить заявку"
        >
          ✉️
        </Link>
        <a
          href={buildWhatsAppHref("S-FLOAT")}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackContact("S-FLOAT-WHATSAPP")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-white shadow-lg transition hover:bg-blue-800"
          aria-label="WhatsApp"
        >
          💬
        </a>
        {showTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 shadow-lg transition hover:bg-slate-200"
            aria-label="Наверх"
          >
            ↑
          </button>
        )}
      </div>
    </>
  );
}
