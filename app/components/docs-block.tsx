"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Doc = {
  title: string;
  note: string;
};

/**
 * Секция «Документы» — Лицензии, сертификаты, договор.
 * Лицензия показывается крупным изображением (без обрезки содержимого),
 * по клику/кнопке открывается фуллскрин-просмотр в полном размере.
 * Остальные документы — компактные карточки без выдуманных файлов.
 * Стиль: светлый фон, тонкие границы, аккуратная типографика, лёгкая анимация.
 */
export function DocsBlock({ items }: { items: Doc[] }) {
  const [open, setOpen] = useState(false);
  const license = items[0];
  const otherDocs = items.slice(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ staggerChildren: 0.08 }}
        className="py-16 sm:py-20"
      >
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Документы</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Лицензии, сертификаты, договор</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Все работы выполняются официально. Лицензия, сертификаты на материалы,
            протокол испытаний КазНИИСА и образец договора — для вашего спокойствия.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          {/* Лицензия — крупное изображение */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.45 }}
          >
            {license && (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="block w-full cursor-zoom-in bg-slate-50"
                  aria-label="Открыть лицензию в полном размере"
                >
                  <Image
                    src="/license.png"
                    alt="Лицензия на строительные работы"
                    width={836}
                    height={1183}
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="h-auto w-full object-contain"
                  />
                </button>
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{license.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{license.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
                  >
                    Посмотреть документ
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Остальные документы — карточки */}
          <div className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {otherDocs.map((doc) => (
              <motion.div
                key={doc.title}
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45 }}
                className="flex flex-col justify-between rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{doc.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Полноэкранный просмотр лицензии */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Лицензия в полном размере"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg text-slate-900 transition hover:bg-white"
            aria-label="Закрыть"
          >
            ✕
          </button>
          <div className="max-h-[90vh] max-w-3xl overflow-auto" onClick={(e) => e.stopPropagation()}>
            <Image
              src="/license.png"
              alt="Лицензия на строительные работы"
              width={836}
              height={1183}
              className="h-auto w-full rounded-lg bg-white"
            />
          </div>
        </div>
      )}
    </section>
  );
}