"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { collectTracking } from "@/lib/utm";
import { trackLead, trackQuizStart, trackContact } from "@/lib/analytics-events";
import { formatCityPrice, resolveMaterialPrice } from "@/lib/pricing";
import type { PricingEntry, PricingSource } from "@/lib/pricing";
import { PricingNotice } from "./pricing-notice";

/**
 * Калькулятор стоимости дома для Standard Stroy.
 * Короткий путь: площадь → материал → результат → контакт.
 * Расчёт: площадь × цена за м² выбранного материала и города.
 */

type CalcStep = "area" | "material" | "result" | "contact";

const MATERIALS = [
  { value: "FinnBlock", label: "FinnBlock" },
  { value: "Газоблок", label: "Газоблок (автоклавный)" },
  { value: "Кирпич", label: "Кирпич" },
] as const;

const FINISH_LEVEL = "Коробка дома";

const AREA_MIN = 30;
const AREA_MAX = 1000;

const STEP_TITLES: Record<string, string> = {
  area: "Шаг 1 из 2",
  material: "Шаг 2 из 2",
  result: "Результат",
  contact: "Контакт",
};

function formatKzt(value: number): string {
  return value.toLocaleString("ru-RU");
}

export default function LeadQuiz({
  pricing,
  pricingSource,
}: {
  pricing: PricingEntry[];
  pricingSource: PricingSource;
}) {
  const [step, setStep] = useState<CalcStep>("area");
  const [city, setCity] = useState<"Алматы" | "Астана" | "">("");
  const [area, setArea] = useState("100");
  const [material, setMaterial] = useState("");
  const finishLevel = FINISH_LEVEL;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const [updatedQuote, setUpdatedQuote] = useState<{ context: string; price: number } | null>(null);
  const quoteContext = `${city}|${material}|${area}`;
  const hasUpdatedQuote = updatedQuote?.context === quoteContext;
  const currentSource = hasUpdatedQuote ? "google-sheets" : pricingSource;
  const pricePerM2 = hasUpdatedQuote ? updatedQuote.price : resolveMaterialPrice(material, pricing, city || "Алматы");

  const estimate = useMemo(() => {
    const areaValue = Number(area ?? 0);
    const total = Math.round(areaValue * pricePerM2);
    return { min: total, max: total };
  }, [area, pricePerM2]);

  const next = () => {
    setError("");

    if (step === "area") {
      trackQuizStart();
      const areaValue = Number(area);
      if (!city) {
        setError("Выберите город строительства");
        return;
      }
      if (!area || !Number.isInteger(areaValue) || areaValue < AREA_MIN || areaValue > AREA_MAX) {
        setError("Введите целое число от 30 до 1000 м²");
        return;
      }
      setStep("material");
      return;
    }

    if (!material) {
      setError("Выберите вариант");
      return;
    }
    setStep("result");
  };

  const back = () => {
    setError("");
    if (step === "material") setStep("area");
    else if (step === "contact") setStep("result");
  };

  const openContact = () => {
    setError("");
    setStep("contact");
  };

  const submitQuiz = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setStatus("loading");
    setSubmitError("");

    const tracking = collectTracking();

    try {
      requestId.current ??= crypto.randomUUID();
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          blockCode: "S-QUIZ",
          formType: "quiz",
          consent,
          quiz_completed: true,
          city,
          estimate_min: estimate.min,
          estimate_max: estimate.max,
          price_per_m2: pricePerM2,
          pricing_source: currentSource,
          request_id: requestId.current,
          area_m2: Number(area),
          material,
          finish_level: finishLevel,
          ...tracking,
        }),
      });

      const data = await res.json();
      if (res.status === 409 && data.code === "price_changed" &&
          Number.isFinite(data.quote?.price_per_m2) && data.quote.price_per_m2 > 0) {
        setUpdatedQuote({ context: quoteContext, price: data.quote.price_per_m2 });
        setSubmitError("Цена обновилась. Проверьте новую сумму ниже и подтвердите её повторным нажатием. Заявка ещё не отправлена.");
        setStatus("idle");
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Не удалось отправить заявку");
      }

      if (Number.isFinite(data.quote?.price_per_m2)) {
        setUpdatedQuote({ context: quoteContext, price: data.quote.price_per_m2 });
      }
      setStatus("success");
      trackLead("S-QUIZ", "quiz");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      submitting.current = false;
    }
  };

  // Экран успеха
  if (status === "success") {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6 text-center"
        >
          <div className="text-3xl text-blue-700">✓</div>
          <p className="mt-3 text-sm uppercase tracking-[0.35em] text-blue-700">Готово</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Заявка принята!</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Подготовим точный расчёт стоимости строительства с учётом вашего участка и пришлём в WhatsApp.
            Если не ответим в течение 30 минут — проверьте спам.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900">
            {formatCityPrice(pricePerM2, city || "Алматы")} · {city} · Ориентировочно: {formatKzt(estimate.min)} ₸
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/77770500803?text=${encodeURIComponent(
                "Здравствуйте! Хочу получить точный расчёт стоимости дома.\nГород: " + (city || "—") + "\nМатериал: " + (material || "—") + "\nЦена за м²: " + formatCityPrice(pricePerM2, city || "Алматы") + "\nПлощадь: " + (area || "—") + " м²\nОтделка: " + (finishLevel || "—") + "\nОриентировочная стоимость: " + formatKzt(estimate.min) + " ₸\nСайт Standard Stroy [S-QUIZ]"
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContact("S-QUIZ-WHATSAPP")}
              className="inline-flex rounded-full bg-blue-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              Перейти в WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
      <PricingNotice source={currentSource} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Калькулятор стоимости</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Рассчитайте стоимость дома</h3>
        </div>
        <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {STEP_TITLES[step]}
        </div>
      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-900 transition-all"
          style={{ width: `${step === "area" ? 50 : 100}%` }}
        />
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        {step === "area" && (
          <div>
            <fieldset>
              <legend className="text-lg font-medium text-slate-900">Где планируете строить?</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["Алматы", "Астана"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={city === option}
                    onClick={() => {
                      setCity(option);
                      setError("");
                    }}
                    className={`rounded-2xl border px-5 py-3 text-left text-sm transition ${
                      city === option
                        ? "border-blue-700 bg-blue-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="text-lg font-medium text-slate-900">Какая площадь дома?</div>
            <p className="mt-1 text-sm text-slate-500">Укажите примерную площадь дома в м²</p>
            <input
              type="number"
              min={AREA_MIN}
              max={AREA_MAX}
              step={1}
              inputMode="numeric"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setError("");
              }}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 outline-none focus:border-blue-700"
              placeholder="Введите площадь, м²"
              disabled={status === "loading"}
            />
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-6">
              <button
                type="button"
                onClick={next}
                disabled={status === "loading"}
                className="w-full rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {step === "material" && (
          <div>
            <div className="text-lg font-medium text-slate-900">Из чего строим?</div>
            <p className="mt-1 text-sm text-slate-500">Материал влияет на тепло, сроки и бюджет</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {MATERIALS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setMaterial(option.value);
                    setError("");
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left text-sm transition ${
                    material === option.value
                      ? "border-blue-700 bg-blue-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={back}
                disabled={status === "loading"}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={next}
                disabled={status === "loading"}
                className="rounded-full bg-blue-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {step === "result" && (
          <div>
            <div className="text-lg font-medium text-slate-900">Ориентировочная стоимость</div>
            <div className="mt-4 rounded-[2rem] border border-blue-200 bg-blue-50 p-6 text-center">
              <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {formatKzt(estimate.min)} ₸
              </div>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900">
                {formatCityPrice(pricePerM2, city || "Алматы")} · {city} · {area} м² · {finishLevel}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Предварительный расчёт. Точная стоимость зависит от проекта, участка и комплектации.
            </p>
            {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openContact}
                disabled={status === "loading"}
                className="rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Получить точный расчёт
              </button>
              <button
                type="button"
                onClick={() => setStep("area")}
                disabled={status === "loading"}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
              >
                Изменить параметры
              </button>
            </div>
          </div>
        )}

        {step === "contact" && (
          <div>
            <div className="text-lg font-medium text-slate-900">Получить точный расчёт</div>
            <p className="mt-1 text-sm text-slate-500">Оставьте контакты — подготовим расчёт стоимости с учётом вашего участка</p>
            {hasUpdatedQuote && (
              <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Актуальная цена: {formatCityPrice(pricePerM2, city || "Алматы")}. Новая сумма: {formatKzt(estimate.min)} ₸.
              </p>
            )}
            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-700"
                placeholder="Ваше имя"
                disabled={status === "loading"}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-700"
                placeholder="Ваш телефон"
                disabled={status === "loading"}
              />
              <label className="flex items-start gap-3 text-xs leading-5 text-slate-500">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  disabled={status === "loading"}
                />
                <span>
                  Я согласен на обработку персональных данных и принимаю{" "}
                  <Link href="/politika-konfidencialnosti" className="text-blue-700 underline">
                    политику конфиденциальности
                  </Link>
                  .
                </span>
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            {submitError && <p role="alert" className="mt-3 text-sm text-rose-700">{submitError}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (!name.trim()) {
                    setError("Введите имя");
                    return;
                  }
                  if (!/^\+?[\d\s()-]{7,15}$/.test(phone.trim())) {
                    setError("Введите корректный номер телефона");
                    return;
                  }
                  if (!consent) {
                    setError("Необходимо согласие на обработку персональных данных");
                    return;
                  }
                  void submitQuiz();
                }}
                disabled={status === "loading"}
                className="rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {status === "loading" ? "Отправляем…" : hasUpdatedQuote ? "Подтвердить новую сумму и отправить" : "Получить расчёт"}
              </button>
              <button
                type="button"
                onClick={back}
                disabled={status === "loading"}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
              >
                Назад
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <p className="mt-6 text-xs text-zinc-500">
        ⚠️ Расчёт предварительный. Стоимость работ фиксируется в договоре после замера и не меняется в процессе строительства.
      </p>
    </div>
  );
}
