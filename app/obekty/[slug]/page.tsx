import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { builtObjects } from "@/lib/content";

export function generateStaticParams() {
  return builtObjects.map((item) => ({ slug: item.slug }));
}

export function generateMetadata(): Metadata {
  return {
    title: "Объект — Standard Stroy",
    description: "Детальная информация по объекту.",
  };
}

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const object = builtObjects.find((item) => item.slug === slug);

  if (!object) {
    notFound();
  }

  const infoItems = [
    object.area && { label: "Площадь", value: object.area },
    object.material && { label: "Материал", value: object.material },
    object.workType && { label: "Тип работ", value: object.workType },
    object.city && { label: "Город", value: object.city },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-24 text-zinc-800 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/obekty" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900">
          ← Все объекты
        </Link>

        <header className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Объект</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{object.title}</h1>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
            <Image
              src={object.beforeImage}
              alt={`${object.title} до работ`}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">До</div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
            <Image
              src={object.afterImage}
              alt={`${object.title} после работ`}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">После</div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">Информация об объекте</h2>

            {infoItems.length > 0 ? (
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {infoItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</dt>
                    <dd className="mt-2 text-base font-medium text-zinc-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {object.description && (
              <p className="mt-6 text-base leading-8 text-zinc-600">{object.description}</p>
            )}
          </section>

          <aside className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Контакты</p>
            <h3 className="mt-3 text-xl font-semibold text-zinc-900">Нужно что-то похожее?</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Оставьте заявку — мы рассчитаем стоимость строительства под ваш участок и задачи.
            </p>
            <div className="mt-6">
              <Link href="/#quiz" className="inline-flex rounded-full bg-blue-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800">
                Рассчитать стоимость
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
