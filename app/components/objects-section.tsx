"use client";

import { useState } from "react";
import { ObjectsGrid } from "./objects-grid";
import InteractiveMap from "./interactive-map";

type BuiltObject = {
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
 * Единая секция «Наши объекты»: переключатель «Карточки / На карте».
 * Оба представления используют одни и те же данные (builtObjects).
 * Заголовок живёт здесь один раз — ObjectsGrid показывается с showHeader={false}.
 */
export function ObjectsSection({ items }: { items: BuiltObject[] }) {
  const [view, setView] = useState<"cards" | "map">("cards");

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
      <div className="py-16 sm:py-20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Построенные объекты</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Реальные дома, которые мы построили</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Смотрите объекты карточками или на схематичной карте. На каждом объекте — площадь, материал, срок и район.
          </p>

          <div
            role="tablist"
            aria-label="Представление объектов"
            className="mt-8 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "cards"}
              aria-controls="objects-cards-panel"
              id="objects-tab-cards"
              onClick={() => setView("cards")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                view === "cards"
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Карточки
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              aria-controls="objects-map-panel"
              id="objects-tab-map"
              onClick={() => setView("map")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                view === "map"
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              На карте
            </button>
          </div>
        </div>

        {view === "cards" ? (
          <div id="objects-cards-panel" role="tabpanel" aria-labelledby="objects-tab-cards">
            <ObjectsGrid items={items} showHeader={false} />
          </div>
        ) : (
          <div id="objects-map-panel" role="tabpanel" aria-labelledby="objects-tab-map">
            <InteractiveMap />
          </div>
        )}
      </div>
    </section>
  );
}