import type { PricingSource } from "@/lib/pricing";

export function PricingNotice({ source }: { source: PricingSource }) {
  if (source !== "default") return null;
  return (
    <p role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      Временно показаны резервные тарифы, а не актуальные цены таблицы. Отправка расчёта возможна только после проверки актуальной цены. Итоговую стоимость уточняйте у менеджера.
    </p>
  );
}
