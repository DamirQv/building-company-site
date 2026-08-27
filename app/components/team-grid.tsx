"use client";

import { motion } from "framer-motion";

type TeamMember = {
  name: string;
  role: string;
  experience: string;
  photo: string;
};

/**
 * Секция «Команда» — люди, которые строят ваш дом.
 * Элегантная подача без фото-аватарок: крупный инициал роли, name как заголовок,
 * role как подзаголовок, опыт как метка. Стиль согласован с остальными блоками.
 */
export function TeamGrid({ members }: { members: TeamMember[] }) {
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Команда</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Люди, которые строят ваш дом</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Безымянная компания не вызывает доверия при чеке 20 млн ₸. Знакомьтесь — те, кто отвечает за результат.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <motion.div
              key={member.role}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
                {member.role.charAt(0)}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{member.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{member.role}</p>
              <p className="mt-4 inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {member.experience}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          * Имена и роли — предварительные. Замените на реальные данные команды.
        </p>
      </motion.div>
    </section>
  );
}