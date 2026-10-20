"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/objects";

export type BuiltObject = Project;

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
              Только реальные объекты — без рендеров и визуализаций. На каждой карточке: площадь, материал, город и краткое описание проекта.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((obj) => (
            <motion.article
              key={obj.slug}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
            >
              <Link href={`/obekty/${obj.slug}`} className="block">
                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={obj.image ?? obj.afterImage}
                    alt={`${obj.title} — ${obj.material ?? "объект"}, ${obj.area ?? "объект"}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0b2a4a]/55 opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-sm text-white opacity-0 transition duration-300 group-hover:opacity-100">
                    <span className="rounded-full border border-white/40 bg-white/10 px-2.5 py-1 backdrop-blur-sm">До / После</span>
                    <span className="font-medium">Посмотреть объект →</span>
                  </div>
                </div>
              </Link>

              <div className="p-6">
                <Link href={`/obekty/${obj.slug}`} className="block">
                  <h3 className="text-lg font-semibold text-slate-900">{obj.title}</h3>
                </Link>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {obj.material && <span className="rounded-full bg-slate-100 px-2.5 py-1">{obj.material}</span>}
                  {obj.area && <span className="rounded-full bg-slate-100 px-2.5 py-1">{obj.area}</span>}
                  {obj.city && <span className="rounded-full bg-slate-100 px-2.5 py-1">{obj.city}</span>}
                </div>

                {obj.description && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{obj.description}</p>
                )}

                <div className="mt-5">
                  <Link href={`/obekty/${obj.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-900">
                    Подробнее <span aria-hidden="true">→</span>
                  </Link>
                </div>
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