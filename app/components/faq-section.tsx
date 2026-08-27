"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Faq = {
  question: string;
  answer: string;
};

/**
 * Секция FAQ. Лёгкий премиум-аккордеон с тонкими разделителями.
 * Вопросы/ответы и JSON-LD разметка не меняются.
 */
export function FaqSection({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl py-20 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Частые вопросы</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Ответы на вопросы, которые чаще всего задают перед стартом строительства.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.question} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-base font-medium text-slate-900">{item.question}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform duration-300 ${
                      open ? "rotate-45 border-blue-700 text-blue-700" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-7 text-slate-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}