"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type BuiltObject = {
  title: string;
  area: string;
  material: string;
  duration: string;
  district: string;
  quote: string;
  author: string;
  image: string;
};

/**
 * Премиальная сетка портфолио «Реальные дома, которые мы построили».
 * Светлая основа в стиле TrustStrip / «Почему Standard Stroy» / «Процесс»:
 * тонкие линии, лёгкие тени, графитовый текст, синий акцент.
 * Лёгкое появление карточек через framer-motion при scroll.
 */
export function ObjectsGrid({
  items,
  showHeader = true,
}: {
  items: BuiltObject[];
  showHeader?: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ staggerChildren: 0.08 }}
        className={showHeader ? "py-20 sm:py-24" : ""}
      >
        {showHeader && (
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Построенные объекты</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Реальные дома, которые мы построили</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Только реальные объекты — без рендеров и визуализаций. На каждой карточке: площадь, материал, срок, район.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((obj) => (
            <motion.article
              key={obj.title}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={obj.image}
                  alt={`${obj.title} — ${obj.material}, ${obj.area}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{obj.title}</h3>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-slate-400">Площадь</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-700">{obj.area}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-slate-400">Материал</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-700">{obj.material}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-slate-400">Срок</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-700">{obj.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-slate-400">Район</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-700">{obj.district}</dd>
                  </div>
                </dl>

                <blockquote className="mt-4 border-l-2 border-blue-600 pl-3">
                  <p className="text-sm italic leading-6 text-slate-600">«{obj.quote}»</p>
                  <footer className="mt-1.5 text-xs text-slate-400">— {obj.author}</footer>
                </blockquote>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/obekty" className="text-sm font-medium text-blue-700 transition hover:text-blue-900">
            Смотреть все объекты →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}