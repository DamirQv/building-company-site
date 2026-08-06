"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collectTracking } from "@/lib/utm";
import { trackLead, trackQuizStart, trackContact } from "@/lib/analytics-events";
import { DEFAULT_PRICING, formatPrice, getPricingData, resolveMaterialPrice } from "@/lib/pricing";

/**
 * Квиз-калькулятор для Standard Stroy.
 * Шаги соответствуют полям квалификации Айсулу (city, object_type, has_land, area_m2, material).
 * Расчёт — ориентировочный диапазон в ₸; точная цена — после замера.
 *
 * ⚠️ Диапазоны цен согласованы предварительно и должны быть сверены
 * с политикой цены Айсулу v1.2 перед публикацией.
 */

type StepKey =
  | "object_type"
  | "has_land"
  | "area_m2"
  | "floors"
  | "material"
  | "finish_level"
  | "start_date"
  | "city"
  | "contact";

type Step = {
  key: StepKey;
  title: string;
  subtitle?: string;
  options?: { value: string; label: string }[];
  input?: boolean;
};

const steps: Step[] = [
  {
    key: "object_type",
    title: "Что планируете строить?",
    options: [
      { value: "Дом", label: "Дом" },
      { value: "Коробка дома", label: "Коробка дома" },
      { value: "Коммерция", label: "Коммерческое здание" },
    ],
  },
  {
    key: "has_land",
    title: "У вас уже есть участок?",
    options: [
      { value: "Да", label: "Да, участок есть" },
      { value: "Нет", label: "Нет, помогите подобрать" },
      { value: "Присматриваю", label: "Присматриваю варианты" },
    ],
  },
  {
    key: "area_m2",
    title: "Какая площадь дома?",
    subtitle: "Если точно не знаете — выберите примерный диапазон",
    options: [
      { value: "до 100", label: "до 100 м²" },
      { value: "100-150", label: "100–150 м²" },
      { value: "150-200", label: "150–200 м²" },
      { value: "200+", label: "более 200 м²" },
    ],
  },
  {
    key: "floors",
    title: "Сколько этажей?",
    options: [
      { value: "1", label: "1 этаж" },
      { value: "2", label: "2 этажа" },
    ],
  },
  {
    key: "material",
    title: "Какой материал рассматриваете?",
    subtitle: "Не уверены? Мы поможем выбрать на консультации",
    options: [
      { value: "FinnBlock", label: "FinnBlock" },
      { value: "Газоблок", label: "Газоблок (автоклавный)" },
      { value: "Кирпич", label: "Кирпич" },
      { value: "Не определился", label: "Помогите выбрать" },
    ],
  },
  {
    key: "finish_level",
    title: "Уровень отделки?",
    options: [
      { value: "Коробка дома", label: "Только коробка дома" },
      { value: "Предчистовая", label: "Предчистовая отделка" },
      { value: "Под ключ", label: "Под ключ" },
    ],
  },
  {
    key: "start_date",
    title: "Когда планируете начать?",
    options: [
      { value: "1-3 мес", label: "В течение 1–3 месяцев" },
      { value: "3-6 мес", label: "Через 3–6 месяцев" },
      { value: "6+ мес", label: "Более чем через полгода" },
      { value: "Не определился", label: "Ещё не решил" },
    ],
  },
  {
    key: "city",
    title: "Где планируете строить?",
    options: [
      { value: "Алматы", label: "Алматы" },
      { value: "Астана", label: "Астана" },
      { value: "Пригород Алматы", label: "Пригород Алматы (Каскелен, Талгар)" },
      { value: "Другой", label: "Другой город" },
    ],
  },
  {
    key: "contact",
    title: "Куда отправить точный расчёт?",
    subtitle: "Мы рассчитаем смету под ваш участок и пришлём в WhatsApp",
    input: true,
  },
];

const FINISH_FACTOR: Record<string, number> = {
  "Коробка дома": 0.6,
  Предчистовая: 0.8,
  "Под ключ": 1.0,
};

const FLOORS_FACTOR: Record<string, number> = {
  "1": 1.0,
  "2": 1.1,
};

const AREA_MIDPOINT: Record<string, number> = {
  "до 100": 90,
  "100-150": 125,
  "150-200": 175,
  "200+": 220,
};

function formatKzt(value: number): string {
  return value.toLocaleString("ru-RU");
}

export default function LeadQuiz() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const estimate = useMemo(() => {
    const area = AREA_MIDPOINT[answers.area_m2 ?? ""] ?? 125;
    const pricePerM2 = resolveMaterialPrice(answers.material, pricing);
    const finishFactor = FINISH_FACTOR[answers.finish_level ?? ""] ?? 1.0;
    const floorsFactor = FLOORS_FACTOR[answers.floors ?? ""] ?? 1.0;
    const base = area * pricePerM2 * finishFactor * floorsFactor;
    // Диапазон ±15%
    return { min: Math.round(base * 0.85), max: Math.round(base * 1.15) };
  }, [answers, pricing]);

  useEffect(() => {
    let isMounted = true;
    void getPricingData().then((data) => {
      if (isMounted) {
        setPricing(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const next = () => {
    setError("");

    // Отмечаем начало квиза при первом шаге
    if (step === 0) {
      trackQuizStart();
    }

    if (current.input) {
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
      submitQuiz(true);
      return;
    }

    if (!answers[current.key]) {
      setError("Выберите вариант");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prev = () => {
    setError("");
    setStep((prev) => Math.max(0, prev - 1));
  };

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
    setError("");
  };

  const submitQuiz = async (completed: boolean) => {
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
          quiz_completed: completed,
          estimate_min: estimate.min,
          estimate_max: estimate.max,
          // Поля квалификации Айсулу
          city: answers.city,
          object_type: answers.object_type,
          has_land: answers.has_land,
          area_m2: answers.area_m2,
          material: answers.material,
          floors: answers.floors,
          finish_level: answers.finish_level,
          start_date: answers.start_date,
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
            Базовая цена: {formatPrice(resolveMaterialPrice(answers.material, pricing))} · Ориентировочный диапазон: {formatKzt(estimate.min)}–{formatKzt(estimate.max)} ₸
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/77770500803?text=${encodeURIComponent(
                `Здравствуйте! Хочу продолжить заявку после квиза. Сайт Standard Stroy [S-QUIZ]`
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
          <p className="text-sm uppercase tracking-[0.35em] text-blue-700">Квиз-калькулятор</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Рассчитайте стоимость дома</h3>
        </div>
        <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {step + 1}/{steps.length}
        </div>
      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-900 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <motion.div key={current.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <div className="text-lg font-medium text-slate-900">{current.title}</div>
        {current.subtitle && (
          <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>
        )}

        {current.input ? (
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
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {current.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectAnswer(option.value)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  answers[current.key] === option.value
                    ? "border-blue-700 bg-blue-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0 || status === "loading"}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:opacity-40 hover:border-slate-300 transition"
          >
            Назад
          </button>
          <button
            type="button"
            onClick={next}
            disabled={status === "loading"}
            className="rounded-full bg-blue-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-blue-800 transition"
          >
            {isLast ? (status === "loading" ? "Отправляем…" : "Получить расчёт") : "Далее"}
          </button>
        </div>
      </motion.div>

      <p className="mt-6 text-xs text-zinc-500">
        ⚠️ Расчёт предварительный. Точная смета фиксируется в договоре после замера и не меняется в процессе стройки.
      </p>
    </div>
  );
}