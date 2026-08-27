"use client";

import { motion } from "framer-motion";

type TrustStat = {
  value: string;
  label: string;
};

/**
 * Преимущества-полоса (trust strip) сразу после Hero.
 * Светлая, с тонкими разделителями, без карточек и тяжёлых теней.
 * Появление блока — лёгкая анимация framer-motion при входе во вьюпорт.
 */
export function TrustStrip({ items }: { items: TrustStat[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-2 gap-y-10 py-14 sm:py-16 lg:grid-cols-4 lg:divide-x lg:divide-slate-200"
      >
        {items.map((item) => (
          <div key={item.label} className="text-center lg:px-6 lg:py-2">
            <div className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {item.value}
            </div>
            <div className="mt-2 text-xs tracking-[0.15em] text-slate-500 uppercase sm:text-sm">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}