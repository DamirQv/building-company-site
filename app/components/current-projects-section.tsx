"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const currentProjects = [
  {
    name: "Шукшина",
    image: "/current-projects/shukshina.jpeg",
    alt: "Дом Standard Stroy — Шукшина",
    position: "object-center",
    district: "Медеуский",
    area: "190,17 м²",
    material: "FinnBlock",
    stage: "Внутренняя отделка заканчивается",
  },
  {
    name: "Талгар",
    image: "/current-projects/talgar.jpeg",
    alt: "Дом Standard Stroy — Талгар",
    position: "object-center",
    district: "Талгарский район",
    area: "178,4 м²",
    material: "FinnBlock",
    stage: "Внутренняя отделка",
  },
];

export function CurrentProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<(typeof currentProjects)[number] | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProject]);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ staggerChildren: 0.1 }}
        className="py-16 sm:py-20"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Реальные проекты Standard Stroy</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-slate-900 sm:text-4xl">
              Дома, которые мы строим сейчас
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-slate-600 md:text-right">
            Показываем строительные площадки и дома, над которыми работает наша команда.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {currentProjects.map((project) => (
            <motion.article
              key={project.name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] bg-slate-900 shadow-sm sm:min-h-[30rem]"
            >
              <Image
                src={project.image}
                alt={project.alt}
                fill
                sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1279px) calc(50vw - 3rem), 380px"
                className={`object-cover transition duration-700 ease-out motion-safe:group-hover:scale-105 ${project.position}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071b30]/90 via-[#071b30]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">{project.name}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(project);
                  }}
                  aria-label={`Подробнее об объекте ${project.name}`}
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/10 text-xl text-white backdrop-blur-sm transition duration-300 hover:bg-white hover:text-slate-900 motion-safe:group-hover:translate-x-1 motion-safe:group-hover:bg-white motion-safe:group-hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-[#0b2a4a] px-6 py-7 text-white sm:px-8 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-semibold">Хотите такой же дом?</h3>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Рассчитаем ориентировочную стоимость строительства вашего дома.
            </p>
          </div>
          <a
            href="#quiz"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b2a4a] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Рассчитать стоимость <span aria-hidden="true" className="ml-2">→</span>
          </a>
        </div>
      </motion.div>

      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="current-project-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setSelectedProject(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md rounded-[2rem] bg-white p-7 shadow-xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Закрыть окно"
              autoFocus
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl leading-none text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <span aria-hidden="true">×</span>
            </button>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Строим сейчас
            </span>
            <h3 id="current-project-modal-title" className="mt-4 pr-10 text-2xl font-semibold text-slate-900 sm:text-3xl">
              {selectedProject.name}
            </h3>
            <dl className="mt-5 space-y-3">
              {[
                { label: "Район", value: selectedProject.district },
                { label: "Площадь", value: selectedProject.area },
                { label: "Материал", value: selectedProject.material },
                { label: "Этап", value: selectedProject.stage },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <dt className="text-sm text-slate-500">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      )}
    </section>
  );
}
