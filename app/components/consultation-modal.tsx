"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "./lead-form";

/**
 * Поп-ап на выход (exit-intent) с оффером «Бесплатный выезд инженера».
 * Срабатывает, когда курсор покидает верхнюю часть окна (намерение закрыть вкладку).
 * На мобильных — по таймеру 15 секунд.
 * Показывается один раз за сессию (sessionStorage).
 */

const SESSION_KEY = "ss_exit_popup_shown";

export function ConsultationModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const trigger = () => {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setShowModal(true);
    };

    // Exit-intent: курсор уходит вверх за пределы окна
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) {
        trigger();
        document.removeEventListener("mouseout", onMouseOut);
      }
    };

    // На мобильных — по таймеру 15 секунд
    let timer: ReturnType<typeof setTimeout>;
    if (isMobile) {
      timer = setTimeout(trigger, 15000);
    } else {
      document.addEventListener("mouseout", onMouseOut);
    }

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => setShowModal(false);

  if (!showModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">
            Бесплатный выезд инженера
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
            Замер и консультация на участке — бесплатно
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            Оставьте телефон — инженер приедет на участок, замерит перепады,
            проверит грунт и даст рекомендации по фундаменту. Без обязательств.
          </p>

          <div className="mt-6 text-left">
            <LeadForm
              blockCode="S-POPUP"
              formType="callback"
              submitLabel="Записаться на выезд"
              showComment={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}