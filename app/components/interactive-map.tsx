"use client";

import { useState } from "react";
import { builtObjects } from "@/lib/content";

const filters = ["Алматы", "Каскелен", "Талгар"] as const;

export default function InteractiveMap() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number] | "Все">("Все");
  const [selected, setSelected] = useState(builtObjects[0]);

  const visible =
    activeFilter === "Все"
      ? builtObjects
      : builtObjects.filter((item) => item.district.includes(activeFilter));

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["Все", ...filters] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-2 text-sm transition ${activeFilter === filter ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-6">
          <div className="relative min-h-64 rounded-[1.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_40%),linear-gradient(135deg,_#e2effa,_#f8fafc)]">
            {visible.map((project, index) => (
              <button
                key={project.title}
                onClick={() => setSelected(project)}
                className={`absolute h-4 w-4 rounded-full border-2 border-white ${selected.title === project.title ? "bg-blue-900" : "bg-white/80"}`}
                style={{ top: `${20 + index * 18}%`, left: `${20 + index * 15}%` }}
                aria-label={project.title}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Объекты</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Карта построенных объектов</h3>
        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
          <div className="text-lg font-semibold text-slate-900">{selected.title}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{selected.material}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">{selected.area}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">{selected.duration}</span>
          </div>
          <div className="mt-2 text-sm text-slate-500">{selected.district}</div>
          <p className="mt-4 text-sm leading-7 text-slate-500">«{selected.quote}»</p>
          <p className="mt-2 text-xs text-slate-500">— {selected.author}</p>
        </div>
      </div>
    </div>
  );
}