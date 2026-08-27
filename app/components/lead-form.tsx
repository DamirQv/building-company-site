"use client";

import { useEffect, useRef } from "react";

type LeadFormProps = {
  /** Код блока сайта для передачи в WhatsApp/Bitrix24 (S-HERO, S-FOOTER и т.д.) */
  blockCode: string;
  /** Тип формы */
  formType?: "consultation" | "quiz" | "callback";
  /** Дополнительные поля квалификации (поля Айсулу) — например, из квиза */
  qualification?: Record<string, string | number | boolean | undefined>;
  /** Текст кнопки */
  submitLabel?: string;
  /** Показывать ли поле комментария */
  showComment?: boolean;
  /** Вариант оформления: light (на светлом фоне) | dark (на тёмном) */
  variant?: "light" | "dark";
};

export function LeadForm({
  blockCode: _blockCode,
  formType: _formType = "consultation",
  submitLabel = "Получить консультацию",
  variant = "light",
}: LeadFormProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDark = variant === "dark";

  useEffect(() => {
    if (!containerRef.current) return;

    const existingScript = containerRef.current.querySelector('script[data-b24-form]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.setAttribute("data-b24-form", "inline/1/9vv7im");
    script.setAttribute("data-skip-moving", "true");
    script.textContent = `
      (function(w,d,u){
        var s=d.createElement('script');
        s.async=true;
        s.src=u+'?'+(Date.now()/180000|0);
        var h=d.getElementsByTagName('script')[0];
        h.parentNode.insertBefore(s,h);
      })(window,document,'https://cdn-ru.bitrix24.kz/b38119650/crm/form/loader_1.js');
    `;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="min-h-[220px]" />
      <p className={`text-center text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
        {submitLabel} через форму Bitrix24.
      </p>
    </div>
  );
}