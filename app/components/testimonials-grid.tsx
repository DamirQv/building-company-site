"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Testimonial } from "@/lib/content";
import { COMPANY_2GIS_URL } from "@/lib/contacts";
import { TestimonialCard } from "./testimonial-card";

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

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {items.map((item) => (
            <motion.div
              key={item.name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
            >
              <TestimonialCard item={item} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-blue-700">
          <Link href="/otzyvy" className="text-sm font-medium text-blue-700 transition hover:text-blue-900">
            Все отзывы →
          </Link>
          <a href={COMPANY_2GIS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Отзывы о компании в 2GIS</a>
        </div>
      </motion.div>
    </section>
  );
}
