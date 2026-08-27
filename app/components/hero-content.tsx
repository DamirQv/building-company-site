"use client";

import { motion } from "framer-motion";
import { openCallbackModal } from "./consultation-modal";

const benefits = [
  "Прозрачная смета",
  "Контроль каждого этапа",
  "Гарантия 10 лет",
];

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HeroContent() {
  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.12, delayChildren: 0.1 }} className="relative z-10 max-w-3xl py-16 sm:py-24 lg:py-32">
      <motion.p variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }} className="text-xs font-semibold tracking-[0.18em] text-sky-700 sm:text-sm">
        СТРОИТЕЛЬСТВО ЧАСТНЫХ ДОМОВ В АЛМАТЫ
      </motion.p>
      <motion.h1 variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }} className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-7xl">
        Дом под ключ в Алматы
      </motion.h1>
      <motion.p variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }} className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
        Проектируем и строим частные дома под ключ — от проекта до сдачи. Прозрачная смета, контроль строительства и гарантия на выполненные работы.
      </motion.p>
      <motion.div variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="#quiz" className="inline-flex min-h-12 items-center justify-center bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800">Рассчитать стоимость</a>
        <button
          type="button"
          onClick={openCallbackModal}
          className="inline-flex min-h-12 items-center justify-center border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-white"
        >
          Заказать обратный звонок
        </button>
      </motion.div>
      <motion.ul variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
        {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-600" />{benefit}</li>)}
      </motion.ul>
    </motion.div>
  );
}
