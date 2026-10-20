"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackCallbackClick, trackContact } from "@/lib/analytics-events";

const navItems = [
  { href: "/o-kompanii", label: "О компании" },
  { href: "/uslugi", label: "Услуги" },
  // ⚠️ ВРЕМЕННО СКРЫТО из верхней навигации (страницы /proekty и /obekty продолжают работать).
  // Для возврата раскомментируйте строки ниже:
  // { href: "/proekty", label: "Проекты" },
  // { href: "/obekty", label: "Объекты" },
  { href: "/otzyvy", label: "Отзывы" },
  { href: "/blog", label: "Статьи" },
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
  blog: "Новости и статьи",
  "politika-konfidencialnosti": "Политика конфиденциальности",
  about: "О компании",
  services: "Услуги",
  projects: "Проекты",
  reviews: "Отзывы",
  contacts: "Контакты",
  privacy: "Политика конфиденциальности",
};

const WHATSAPP_PHONE = "77770500803";
// TODO: заменить на реальную ссылку на профиль Standard Stroy в Instagram,
// когда она появится у владельца. Не придумываем URL.
const INSTAGRAM_URL = "https://www.instagram.com/standard_stroy?stkn=MXhqaHpoamh4d2JxdQ==";
const COMPANY = {
  name: "ТОО «Эко Дом Билдинг»",
  brand: "Standard Stroy",
  bin: "040740028309",
  address: "г. Алматы, Казахстан",
  license: "№0011698",
};

export function buildWhatsAppHref(blockCode: string, customText?: string) {
  const text =
    customText ??
    `Здравствуйте! Пишу с сайта dombuilding.kz [${blockCode}]`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

/** Иконка WhatsApp — inline SVG, монохромная (в стиле остальных иконок). */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.26L2 22l4.88-1.43A10 10 0 1 0 12 2Zm0 18.18a8.15 8.15 0 0 1-4.15-1.13l-.3-.18-2.9.85.88-2.82-.2-.3A8.17 8.17 0 1 1 12 20.18Zm4.48-6.13c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.57.13-.17.25-.65.8-.8.97-.15.17-.3.19-.55.06a6.65 6.65 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.24 0-.37.1-.5.11-.11.25-.3.37-.44.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.57-1.38-.78-1.89-.2-.5-.42-.42-.57-.43h-.48c-.17 0-.44.06-.67.32-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.28 3.8.6.26 1.06.42 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

/** Иконка Instagram — inline SVG, монохромная (в стиле остальных иконок). */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsBreadcrumb, setNewsBreadcrumb] = useState<{ slug: string; title: string }>();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const isNewsPage = segments.length === 2 && segments[0] === "blog";

    if (!isNewsPage) return;

    const slug = decodePathSegment(segments[1]);
    const request = new AbortController();

    void fetch("/api/news", { signal: request.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ items?: Array<{ id?: string; slug?: string; title?: string }> }>;
      })
      .then((data) => {
        const id = slug.split("-").pop();
        const item = data?.items?.find((candidate) =>
          candidate.slug === slug || (id !== undefined && candidate.id === id),
        );

        if (item?.title) setNewsBreadcrumb({ slug, title: item.title });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          // The existing slug fallback remains available if Bitrix24 is unavailable.
        }
      });

    return () => request.abort();
  }, [pathname]);

  const segments = pathname.split("/").filter(Boolean);
  const isHome = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-sm font-semibold tracking-[0.16em] text-slate-950 uppercase sm:text-base">
            <Image src="/standard-stroy-logo.png" alt="Standard Stroy" width={64} height={64} className="h-10 w-10 rounded-full object-cover" />
            <span>Standard Stroy</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <a href="tel:+77770500803" className="whitespace-nowrap text-sm font-semibold text-slate-900 transition hover:text-sky-700">+7 777 050 08 03</a>
            <Link href="/kontakty" onClick={() => trackCallbackClick("header")} className="inline-flex items-center justify-center bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800">Заказать обратный звонок</Link>
          </div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-800 lg:hidden" aria-label="Открыть меню" aria-expanded={menuOpen}>
            <span className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
          </button>
          <Link
            href="/kontakty"
            className="hidden"
          >
            <span className="sr-only">Получить консультацию</span>
            <span className="text-lg">✉️</span>
          </Link>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700 transition hover:text-sky-700">
                  {item.label}
                </Link>
              ))}
              <a href="tel:+77770500803" className="pt-4 text-base font-semibold text-slate-950">+7 777 050 08 03</a>
              <Link href="/kontakty" onClick={() => { trackCallbackClick("header"); setMenuOpen(false); }} className="mt-4 inline-flex items-center justify-center bg-sky-700 px-4 py-3 text-sm font-semibold text-white">Заказать обратный звонок</Link>
            </nav>
          </div>
        )}
      </header>

      {!isHome && (
        <div className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 text-sm text-zinc-500 sm:px-8 lg:px-12">
            <Link href="/" className="hover:text-zinc-900">
              Главная
            </Link>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const label =
                newsBreadcrumb?.slug === decodePathSegment(segment) && segments[0] === "blog" && index === segments.length - 1
                  ? newsBreadcrumb.title
                  : breadcrumbLabels[segment] ?? decodePathSegment(segment);
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
              <Link href="/blog" className="transition hover:text-slate-900">Статьи</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Контакты и документы</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/kontakty" className="transition hover:text-slate-900">Контакты</Link>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={buildWhatsAppHref("S-FOOTER")}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackContact("S-FOOTER-WHATSAPP")}
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 hover:text-zinc-600"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackContact("S-FOOTER-INSTAGRAM")}
                  aria-label="Instagram"
                  title="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 hover:text-zinc-600"
                >
                  <InstagramIcon />
                </a>
              </div>
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
          <WhatsAppIcon />
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackContact("S-FLOAT-INSTAGRAM")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 via-rose-500 to-amber-400 text-white shadow-lg transition hover:brightness-110"
          aria-label="Instagram"
        >
          <InstagramIcon />
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
