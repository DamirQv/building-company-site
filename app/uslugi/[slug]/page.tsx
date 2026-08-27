import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { servicesData, getServiceBySlug } from "@/lib/services";
import { LeadForm } from "../../components/lead-form";

export function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/uslugi/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.h1,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "Standard Stroy",
      url: "https://dombuilding.kz",
    },
    areaServed: "Алматы, Астана",
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "KZT",
    },
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Услуга</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{service.h1}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">{service.description}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Цена</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">{service.price}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Срок</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">{service.duration}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Что входит</h2>
              <ul className="mt-4 space-y-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-orange-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Как мы работаем</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {service.process.map((item) => (
                  <div key={item.step} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <span className="text-sm text-orange-500">{item.step}</span>
                    <p className="mt-2 text-sm text-zinc-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Частые вопросы</h2>
              <div className="mt-4 space-y-3">
                {service.faq.map((item) => (
                  <details key={item.question} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <summary className="cursor-pointer font-medium text-zinc-900">{item.question}</summary>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Заявка</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">Рассчитать стоимость</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Оставьте заявку — рассчитаем стоимость и сроки под ваш проект.
            </p>
            <div className="mt-6">
              <LeadForm
                blockCode={`S-USLUGA-${service.slug.toUpperCase()}`}
                formType="consultation"
                qualification={{ object_type: service.h1 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/uslugi" className="text-sm font-medium text-orange-500">
            ← Все услуги
          </Link>
        </div>
      </div>
    </main>
  );
}