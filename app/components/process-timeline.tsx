"use client";

import { motion } from "framer-motion";

export type ProcessStep = {
  step: string;
  title: string;
  text: string;
  duration?: string;
};

/**
 * Блок «Как мы строим ваш дом» — единый timeline процесса.
 * Desktop: горизонтальный timeline с тонкой связующей линией.
 * Mobile: вертикальная последовательность этапов.
 * Лёгкое появление этапов через framer-motion при scroll.
 */
export function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Как мы работаем</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Как мы строим ваш дом</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            От первой консультации до передачи ключей — каждый этап понятен и прозрачен.
          </p>
        </div>

        {/* Desktop: горизонтальный timeline */}
        <div className="relative hidden lg:block">
          <div className="absolute left-0 right-0 top-6 h-px bg-slate-200" />
          <ol className="relative grid grid-cols-7 gap-4">
            {steps.map((step) => (
              <motion.li
                key={step.step}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45 }}
                className="text-center"
              >
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                  <span className="text-sm font-semibold text-blue-700">{step.step}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[13rem] text-xs leading-5 text-slate-500">{step.text}</p>
                {step.duration && (
                  <p className="mt-2 text-xs font-medium text-blue-700">{step.duration}</p>
                )}
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Mobile/tablet: вертикальная последовательность */}
        <ol className="relative lg:hidden">
          {steps.map((step, index) => (
            <motion.li
              key={step.step}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.4 }}
              className="relative flex gap-5 pb-10 last:pb-0"
            >
              {index < steps.length - 1 && (
                <span className="absolute left-[22px] top-12 h-[calc(100%-3rem)] w-px bg-slate-200" />
              )}
              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <span className="text-sm font-semibold text-blue-700">{step.step}</span>
              </div>
              <div className="pt-1">
                <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{step.text}</p>
                {step.duration && (
                  <p className="mt-1 text-xs font-medium text-blue-700">{step.duration}</p>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}