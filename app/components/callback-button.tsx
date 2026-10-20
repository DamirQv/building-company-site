"use client";

import { openCallbackModal } from "./consultation-modal";
import { trackCallbackClick } from "@/lib/analytics-events";

type CallbackButtonProps = {
  /** Идентификатор блока для Яндекс.Метрики (source=callback:<source>). */
  source: string;
  className?: string;
};

/**
 * Единая кнопка «Заказать обратный звонок» для блоков главной страницы.
 * Открывает существующую ConsultationModal и отправляет событие
 * contact с source=callback:<source> через trackCallbackClick.
 */
export function CallbackButton({ source, className }: CallbackButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        trackCallbackClick(source);
        openCallbackModal();
      }}
      className={
        className ??
        "inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
      }
    >
      Заказать обратный звонок
    </button>
  );
}