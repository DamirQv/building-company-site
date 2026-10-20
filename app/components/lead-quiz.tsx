"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import { collectTracking } from "@/lib/utm";
import { trackLead, trackQuizStart, trackContact } from "@/lib/analytics-events";
import { formatPrice, resolveMaterialPrice } from "@/lib/pricing";
import type { PricingEntry } from "@/lib/pricing";

/**
 * Калькулятор стоимости дома для Standard Stroy.
 * Короткий путь: площадь → материал → комплектация → результат → контакт.
 * Расчёт — ориентировочный диапазон в ₸; точная цена — после замера.
 */

type CalcStep = "area" | "material" | "finish" | "result" | "contact";

const MATERIALS = [
  { value: "FinnBlock", label: "FinnBlock" },
  { value: "Газоблок", label: "Газоблок (автоклавный)" },
  { value: "Кирпич", label: "Кирпич" },
] as const;

const FINISH_LEVELS = [
  { value: "Коробка дома", label: "Коробка дома" },
  { value: "Предчистовая", label: "Предчистовая" },
  { value: "Под ключ", label: "Под ключ" },
] as const;

const FINISH_FACTOR: Record<string, number> = {
  "Коробка дома": 0.6,
  Предчистовая: 0.8,
  "Под ключ": 1.0,
};

const AREA_MIN = 30;
const AREA_MAX = 1000;

const STEP_TITLES: Record<string, string> = {
  area: "Шаг 1 из 3",
  material: "Шаг 2 из 3",
  finish: "Шаг 3 из 3",
  result: "Результат",
  contact: "Контакт",
};

function formatKzt(value: number): string {
  return value.toLocaleString("ru-RU");
}

export default function LeadQuiz({ pricing }: { pricing: PricingEntry[] }) {
  const [step, setStep] = useState<CalcStep>("area");
  const [area, setArea] = useState("");
  const [material, setMaterial] = useState("");
  const [finishLevel, setFinishLevel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const estimate = useMemo(() => {
    const areaValue = Number(area ?? 0);
    const pricePerM2 = resolveMaterialPrice(material, pricing);
    const finishFactor = FINISH_FACTOR[finishLevel ?? ""] ?? 1.0;
    const base = areaValue * pricePerM2 * finishFactor;
    // Диапазон ±15%
    return { min: Math.round(base * 0.85), max: Math.round(base * 1.15) };
  }, [area, material, finishLevel, pricing]);

  const next = () => {
    setError("");

    // Отмечаем начало работы с калькулятором на первом шаге
    if (step === "area") {
      trackQuizStart();
    }

    if (step === "area") {
      const areaValue = Number(area);
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
    setStep("finish");
  };

  const back = () => {
    setError("");
    if (step === "material") setStep("area");
    else if (step === "finish") setStep("material");
    else if (step === "contact") setStep("result");
  };

  const openContact = () => {
    setError("");
    setStep("contact");
  };

  const submitQuiz = async () => {
    setStatus("loading");
    setSubmitError("");

    const tracking = collectTracking();

    try {
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
          estimate_min: estimate.min,
          estimate_max: estimate.max,
          area_m2: Number(area),
          material,
          finish_level: finishLevel,
          ...tracking,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Не удалось отправить заявку");
      }

      setStatus("success");
      trackLead("S-QUIZ", "quiz");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Ошибка отправки");
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
            Мы рассчитаем точную смету под ваш участок и пришлём в WhatsApp.
            Если не ответим в течение 30 минут — проверьте спам.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900">
            Базовая цена: {formatPrice(resolveMaterialPrice(material, pricing))} · Ориентировочный диапазон: {formatKzt(estimate.min)}–{formatKzt(estimate.max)} ₸
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/77770500803?text=${encodeURIComponent(
                "Здравствуйте! Хочу получить точный расчёт стоимости дома.\nМатериал: " + (material || "—") + "\nПлощадь: " + (area || "—") + " м²\nОтделка: " + (finishLevel || "—") + "\nОриентировочный диапазон: " + formatKzt(estimate.min) + "–" + formatKzt(estimate.max) + " ₸\nСайт Standard Stroy [S-QUIZ]"
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
          style={{ width: `${step === "area" ? 25 : step === "material" ? 50 : step === "finish" ? 75 : 100}%` }}
        />
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        {step === "area" && (
          <div>
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

        {step === "finish" && (
          <div>
            <div className="text-lg font-medium text-slate-900">Какой уровень готовности?</div>
            <p className="mt-1 text-sm text-slate-500">Выберите комплектацию — от коробки до «под ключ»</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {FINISH_LEVELS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFinishLevel(option.value);
                    setError("");
                    setStep("result");
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left text-sm transition ${
                    finishLevel === option.value
                      ? "border-blue-700 bg-blue-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-6">
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

        {step === "result" && (
          <div>
            <div className="text-lg font-medium text-slate-900">Ориентировочная стоимость</div>
            <div className="mt-4 rounded-[2rem] border border-blue-200 bg-blue-50 p-6 text-center">
              <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {formatKzt(estimate.min)}–{formatKzt(estimate.max)} ₸
              </div>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900">
                Базовая цена: {formatPrice(resolveMaterialPrice(material, pricing))} · {area} м² · {finishLevel}
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
            <p className="mt-1 text-sm text-slate-500">Оставьте контакты — пришлём смету под ваш участок</p>
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
            {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}
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
                {status === "loading" ? "Отправляем…" : "Получить расчёт"}
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
        ⚠️ Расчёт предварительный. Точная смета фиксируется в договоре после замера и не меняется в процессе стройки.
      </p>
    </div>
  );
}