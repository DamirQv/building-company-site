"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type ComparisonRow = {
  feature: string;
  finnblock: string;
  gazoblock: string;
  kirpich: string;
};

const materialLinks = [
  { label: "Дома из FinnBlock", href: "/materialy/doma-iz-finnblock" },
  { label: "Дома из газоблока", href: "/materialy/doma-iz-gazobloka" },
  { label: "Дома из кирпича", href: "/materialy/doma-iz-kirpicha" },
];

const columns = [
  { key: "finnblock", label: "FinnBlock" },
  { key: "gazoblock", label: "Газоблок" },
  { key: "kirpich", label: "Кирпич" },
] as const;

/**
 * «Сравнение материалов» — FinnBlock vs Газоблок vs Кирпич.
 * Desktop: таблица. Mobile: адаптивный стек карточек без горизонтального скролла.
 * Стиль согласован с остальными блоками: светлая основа, тонкие линии, синий акцент.
 */
export function MaterialsComparison({ rows }: { rows: ComparisonRow[] }) {
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Материалы</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">FinnBlock vs Газоблок vs Кирпич</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Сравнение по ключевым параметрам для климата и сейсмики Алматы.
          </p>
        </div>

        {/* Desktop: таблица */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.45 }}
          className="hidden overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm md:block"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                <th className="py-4 pl-6 pr-4 font-medium text-slate-500">Параметр</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-4 font-semibold text-slate-900">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap py-4 pl-6 pr-4 font-medium text-slate-700">{row.feature}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4 text-slate-600">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile/tablet: стек параметров без горизонтального скролла */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.45 }}
          className="space-y-4 md:hidden"
        >
          {columns.map((col) => (
            <div key={col.key} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-sm font-semibold text-slate-900">
                {col.label}
              </div>
              <dl className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <div key={row.feature} className="flex items-center justify-between gap-4 px-5 py-3">
                    <dt className="text-sm text-slate-500">{row.feature}</dt>
                    <dd className="text-right text-sm font-medium text-slate-800">{row[col.key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {materialLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-blue-700 transition hover:text-blue-900">
              {link.label} →
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}