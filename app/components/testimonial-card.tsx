import type { Testimonial } from "@/lib/content";

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 sm:p-8">
      <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        {item.type}
      </span>
      {item.text && (
        <blockquote className="mt-6">
          <p className="text-base leading-8 text-slate-700">«{item.text}»</p>
        </blockquote>
      )}
      <figcaption className={`mt-5 ${item.text ? "border-t border-slate-100 pt-5" : ""}`}>
        <div className="font-medium text-slate-900">{item.name}</div>
        <div className="mt-0.5 text-xs text-slate-500">{item.object}</div>
        {item.date && <div className="mt-1 text-xs text-slate-500">{item.date}</div>}
        <div className="mt-2 text-xs text-slate-500">Источник: {item.source}</div>
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900">
          {item.source === "Instagram" ? "Смотреть видеоотзыв" : "Смотреть отзыв в 2GIS"}
        </a>
      </figcaption>
    </figure>
  );
}
