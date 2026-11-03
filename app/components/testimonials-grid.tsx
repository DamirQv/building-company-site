"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Testimonial } from "@/lib/content";

/**
 * Секция «Что говорят клиенты».
 * Светлая премиальная подача в стиле TrustStrip / «Почему Standard Stroy» / «Процесс»:
 * тонкие линии, лёгкие тени, графитовый текст, синий акцент.
 * Показывает текстовые отзывы и ссылки на внешние видеоотзывы.
 */
export function TestimonialsGrid({ items }: { items: Testimonial[] }) {
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Отзывы</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Что говорят клиенты</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Отзывы клиентов о сотрудничестве со Standard Stroy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
          {items.map((item) => (
            <motion.figure
              key={item.name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="flex min-h-[19rem] flex-col rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:border-slate-300 sm:p-9"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {item.type}
              </span>
              {item.text ? (
                <blockquote className="mt-6 flex-1">
                  <p className="text-base leading-8 text-slate-700">«{item.text}»</p>
                </blockquote>
              ) : (
                <div className="mt-6 flex-1" />
              )}
              <figcaption className="mt-6 border-t border-slate-100 pt-5">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.object}</div>
                {item.date && <div className="mt-1 text-xs text-slate-500">{item.date}</div>}
                <div className="mt-2 text-xs text-slate-500">Источник: {item.source}</div>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {item.source === "Instagram" ? "Смотреть видеоотзыв" : "Смотреть отзыв в 2GIS"}
                </a>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/otzyvy" className="text-sm font-medium text-blue-700 transition hover:text-blue-900">
            Все отзывы →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
