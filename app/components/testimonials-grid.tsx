"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Testimonial = {
  name: string;
  object: string;
  type: string;
  videoUrl?: string;
  text: string;
};

/**
 * Секция «Что говорят клиенты».
 * Светлая премиальная подача в стиле TrustStrip / «Почему Standard Stroy» / «Процесс»:
 * тонкие линии, лёгкие тени, графитовый текст, синий акцент.
 * Показывается только тип отзыва и текст — без видео-элементов.
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
            Приоритет — видеоотзывы на фоне готового дома. Дополнительно: скриншоты переписок и отзывы из 2GIS.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <motion.figure
              key={item.name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:border-slate-300"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {item.type}
              </span>
              <blockquote className="mt-5 flex-1">
                <p className="text-[15px] leading-7 text-slate-700">«{item.text}»</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 pt-4">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.object}</div>
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