import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { materialsData, getMaterialBySlug } from "@/lib/materials";
import { LeadForm } from "../../components/lead-form";

export function generateStaticParams() {
  return materialsData.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const material = getMaterialBySlug(slug);
  if (!material) return {};

  return {
    title: material.title,
    description: material.description,
    alternates: { canonical: `/materialy/${material.slug}` },
  };
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const material = getMaterialBySlug(slug);

  if (!material) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Материал</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{material.h1}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">{material.description}</p>

        <div className="mt-8 inline-flex rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-lg font-semibold text-zinc-900">{material.price}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Характеристики</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    {material.specs.map((spec) => (
                      <tr key={spec.label} className="border-b border-zinc-100 last:border-0">
                        <td className="py-3 px-4 text-zinc-500">{spec.label}</td>
                        <td className="py-3 px-4 font-medium text-zinc-900">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Плюсы</h2>
              <ul className="mt-4 space-y-2">
                {material.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-emerald-500">✓</span> {pro}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Минусы</h2>
              <ul className="mt-4 space-y-2">
                {material.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-zinc-700">
                    <span className="text-rose-400">•</span> {con}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">Частые вопросы</h2>
              <div className="mt-4 space-y-3">
                {material.faq.map((item) => (
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
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">Рассчитать дом из {material.h1.toLowerCase()}</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Оставьте заявку — рассчитаем стоимость и сроки под ваш участок.
            </p>
            <div className="mt-6">
              <LeadForm
                blockCode={`S-MAT-${material.slug.toUpperCase()}`}
                formType="consultation"
                qualification={{ material: material.h1 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/materialy" className="text-sm font-medium text-orange-500">
            ← Все материалы
          </Link>
        </div>
      </div>
    </main>
  );
}