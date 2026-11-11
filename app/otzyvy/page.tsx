import { testimonials } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";
import { TestimonialCard } from "@/app/components/testimonial-card";
import { COMPANY_2GIS_URL } from "@/lib/contacts";

export const metadata = createPageMetadata({
  path: "/otzyvy",
  title: "Отзывы о строительстве домов в Алматы",
  description:
    "Видеоотзывы и отзывы клиентов Standard Stroy о строительстве домов в Алматы, Каскелене, Талгаре. Реальные истории — без постановочных отзывов.",
});

export default function OtzyvyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Отзывы</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Отзывы наших клиентов</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          Отзывы клиентов о сотрудничестве со Standard Stroy.
        </p>

        <a href={COMPANY_2GIS_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline underline-offset-4">Отзывы о компании в 2GIS</a>
        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <TestimonialCard key={item.sourceUrl} item={item} />
          ))}
        </div>

      </div>
    </main>
  );
}
