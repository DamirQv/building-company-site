import { NextResponse } from "next/server";
import { getPricingDataWithSource, resolveMaterialPrice } from "@/lib/pricing";
import { claimLead, completeLead, leadFingerprint, savedLead } from "@/lib/lead-idempotency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  name?: string;
  phone?: string;
  blockCode?: string;
  formType?: string;
  consent?: boolean;
  quiz_completed?: boolean;
  estimate_min?: number;
  estimate_max?: number;
  price_per_m2?: number;
  pricing_source?: string;
  request_id?: string;
  city?: string;
  object_type?: string;
  has_land?: string;
  area_m2?: number | string;
  material?: string;
  finish_level?: string;
  start_date?: string;
  tracking?: Record<string, unknown>;
  [key: string]: unknown;
};

function buildComments(payload: LeadPayload): string {
  const lines: string[] = [
    `blockCode: ${payload.blockCode ?? "-"}`,
    `formType: ${payload.formType ?? "-"}`,
    `quiz_completed: ${payload.quiz_completed ?? "-"}`,
    `city: ${payload.city ?? "-"}`,
    `object_type: ${payload.object_type ?? "-"}`,
    `has_land: ${payload.has_land ?? "-"}`,
    `area_m2: ${payload.area_m2 ?? "-"}`,
    `material: ${payload.material ?? "-"}`,
    `finish_level: ${payload.finish_level ?? "-"}`,
    `start_date: ${payload.start_date ?? "-"}`,
    `estimate_min: ${payload.estimate_min ?? "-"}`,
    `estimate_max: ${payload.estimate_max ?? "-"}`,
    `price_per_m2: ${payload.price_per_m2 ?? "-"}`,
  ];

  const tracking = payload.tracking ?? {};
  for (const [key, value] of Object.entries(tracking)) {
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  const skipKeys = new Set([
    "name",
    "phone",
    "blockCode",
    "formType",
    "consent",
    "quiz_completed",
    "estimate_min",
    "estimate_max",
    "price_per_m2",
    "city",
    "object_type",
    "has_land",
    "area_m2",
    "material",
    "finish_level",
    "start_date",
    "tracking",
  ]);

  for (const [key, value] of Object.entries(payload)) {
    if (skipKeys.has(key)) continue;
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`${key}: ${String(value)}`);
    }
  }

  return lines.join("\n");
}

const CITY_IDS: Record<string, number> = {
  Алматы: 45,
  Астана: 47,
  "Пригород Алматы": 49,
  "Пригород Астаны": 51,
  Талдыкорган: 53,
  Алаколь: 55,
  Шымкент: 57,
  Тараз: 59,
  Кызылорда: 61,
  Актобе: 63,
  Атырау: 65,
  Караганды: 67,
  Өскемен: 69,
  Семей: 71,
  Павлодар: 73,
  Костанай: 75,
  Жезқазған: 77,
  Актау: 79,
  Торгай: 215,
  Орал: 229,
};

const OBJECT_TYPE_IDS: Record<string, number> = {
  Дом: 87,
  Коммерция: 89,
};

const FINISH_LEVEL_IDS: Record<string, number> = {
  "Коробка дома": 111,
  Предчистовая: 113,
  "Под ключ": 115,
};

const START_DATE_IDS: Record<string, number> = {
  "1-3 мес": 121,
  "3-6 мес": 123,
  "6+ мес": 123,
};

const HAS_LAND_IDS: Record<string, number> = {
  Да: 81,
  Присматриваю: 83,
  Нет: 85,
};

const MATERIAL_IDS: Record<string, number> = {
  Кирпич: 199,
  Газоблок: 201,
  FinnBlock: 203,
  другое: 205,
};

const QUIZ_AREA_MIN = 30;
const QUIZ_AREA_MAX = 1000;
const QUIZ_FINISH_LEVEL = "Коробка дома";

function normalizeQuizMaterial(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "finnblock" || normalized === "финблок") return "FinnBlock";
  if (normalized === "газоблок") return "Газоблок";
  if (normalized === "кирпич") return "Кирпич";
  return null;
}

export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ ok: false, error: "Request body must be an object" }, { status: 400 });
    }
    body = payload as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const consent = body.consent === true;

  if (!name) {
    return NextResponse.json({ ok: false, error: "name is required" }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({ ok: false, error: "phone is required" }, { status: 400 });
  }

  if (!consent) {
    return NextResponse.json({ ok: false, error: "consent must be true" }, { status: 400 });
  }

  const hasQuizPricingData = [
    body.city,
    body.material,
    body.area_m2,
    body.finish_level,
    body.price_per_m2,
    body.estimate_min,
    body.estimate_max,
  ].some((value) => value !== undefined && value !== null && value !== "");
  const isQuiz = body.formType === "quiz" || body.quiz_completed === true || hasQuizPricingData;
  let effectiveBody = body;
  let submissionKey: string | undefined;
  let fingerprint = "";

  if (isQuiz) {
    if (body.city !== "Алматы" && body.city !== "Астана") {
      return NextResponse.json({ ok: false, error: "Выберите город: Алматы или Астана" }, { status: 400 });
    }

    const material = normalizeQuizMaterial(body.material);
    if (!material) {
      return NextResponse.json({ ok: false, error: "Выберите допустимый материал строительства" }, { status: 400 });
    }

    const areaM2 = typeof body.area_m2 === "number" ? body.area_m2 : Number(body.area_m2);
    if (!Number.isFinite(areaM2) || !Number.isInteger(areaM2) || areaM2 < QUIZ_AREA_MIN || areaM2 > QUIZ_AREA_MAX) {
      return NextResponse.json(
        { ok: false, error: `Площадь должна быть целым числом от ${QUIZ_AREA_MIN} до ${QUIZ_AREA_MAX} м²` },
        { status: 400 },
      );
    }

    if (body.finish_level !== QUIZ_FINISH_LEVEL) {
      return NextResponse.json({ ok: false, error: "Комплектация должна быть «Коробка дома»" }, { status: 400 });
    }

    if (typeof body.request_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.request_id)) {
      return NextResponse.json({ ok: false, code: "request_id_required", error: "Обновите страницу и повторите отправку" }, { status: 400 });
    }
    submissionKey = body.request_id;
    fingerprint = leadFingerprint([name, phone, body.city, material, areaM2, QUIZ_FINISH_LEVEL]);
    try {
      const saved = await savedLead(submissionKey, fingerprint);
      if (saved) return NextResponse.json(saved.body, { status: saved.status });
    } catch {
      console.error("[lead] Idempotency storage unavailable");
      return NextResponse.json({ ok: false, error: "Отправка временно недоступна. Попробуйте позже." }, { status: 503 });
    }
    const pricingData = await getPricingDataWithSource();
    if (pricingData.source !== "google-sheets") {
      return NextResponse.json({ ok: false, code: "pricing_unavailable", error: "Актуальные цены временно недоступны. Заявка не отправлена. Повторите позже или свяжитесь с менеджером." }, { status: 503 });
    }
    const pricePerM2 = resolveMaterialPrice(material, pricingData.pricing, body.city);
    if (!Number.isFinite(pricePerM2) || pricePerM2 <= 0) {
      console.error("[lead] No valid price available for the selected quiz options");
      return NextResponse.json({ ok: false, error: "Не удалось рассчитать стоимость. Попробуйте позже" }, { status: 503 });
    }

    const estimate = Math.round(areaM2 * pricePerM2);
    if (body.pricing_source !== "google-sheets" || body.price_per_m2 !== pricePerM2 ||
        body.estimate_min !== estimate || body.estimate_max !== estimate) {
      return NextResponse.json({
        ok: false, code: "price_changed",
        error: "Актуальная цена отличается от показанной. Подтвердите новую сумму перед отправкой.",
        quote: { price_per_m2: pricePerM2, estimate_min: estimate, estimate_max: estimate, pricing_source: "google-sheets" },
      }, { status: 409 });
    }
    effectiveBody = {
      ...body,
      city: body.city,
      material,
      area_m2: areaM2,
      finish_level: QUIZ_FINISH_LEVEL,
      price_per_m2: pricePerM2,
      pricing_source: "google-sheets",
      estimate_min: estimate,
      estimate_max: estimate,
    };
  }

  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "BITRIX24 webhook is not configured" }, { status: 500 });
  }

  if (submissionKey) {
    try {
      if (!(await claimLead(submissionKey, fingerprint))) {
        const saved = await savedLead(submissionKey, fingerprint);
        return NextResponse.json(saved?.body ?? { ok: false, code: "submission_pending", error: "Заявка уже обрабатывается." }, { status: saved?.status ?? 409 });
      }
    } catch {
      console.error("[lead] Cannot reserve submission");
      return NextResponse.json({ ok: false, error: "Отправка временно недоступна." }, { status: 503 });
    }
  }
  const finish = async (result: Record<string, unknown>, status = 200) => {
    if (submissionKey) {
      try { await completeLead(submissionKey, fingerprint, status, result); }
      catch {
        console.error("[lead] Receipt persistence failed; submission remains locked");
        return NextResponse.json({ ok: false, code: "submission_pending", error: "Статус отправки уточняется. Не создавайте повторную заявку; свяжитесь с менеджером." }, { status: 503 });
      }
    }
    return NextResponse.json(result, { status });
  };

  const webhookBaseUrl = webhookUrl.replace(/\/+$/, "");
  const contactEndpoint = `${webhookBaseUrl}/crm.contact.add.json`;
  const dealEndpoint = `${webhookBaseUrl}/crm.item.add.json`;
  const tracking = typeof effectiveBody.tracking === "object" && effectiveBody.tracking ? effectiveBody.tracking : {};
  const flattenedTracking: Record<string, unknown> = { ...tracking };

  for (const [key, value] of Object.entries(effectiveBody)) {
    if (key !== "tracking" && key !== "consent" && value !== undefined && value !== null && value !== "") {
      flattenedTracking[key] = value;
    }
  }

  const areaM2 = typeof effectiveBody.area_m2 === "number"
    ? effectiveBody.area_m2
    : Number(effectiveBody.area_m2);
  const estimateMax = typeof effectiveBody.estimate_max === "number"
    ? effectiveBody.estimate_max
    : Number(effectiveBody.estimate_max);
  const budgetId = Number.isFinite(estimateMax)
    ? estimateMax < 15_000_000
      ? 127
      : estimateMax < 30_000_000
        ? 129
        : estimateMax < 50_000_000
          ? 131
          : 133
    : 135;

  const dealFields: Record<string, unknown> = {
    title: `Заявка с сайта — квиз — ${name}`,
    comments: buildComments({ ...effectiveBody, tracking: flattenedTracking }),
    ufCrm_1783000963: budgetId,
  };

  const enumFields = {
    ufCrm_1783000383: CITY_IDS[effectiveBody.city ?? ""],
    ufCrm_1783000592: OBJECT_TYPE_IDS[effectiveBody.object_type ?? ""],
    ufCrm_1783000831: FINISH_LEVEL_IDS[effectiveBody.finish_level ?? ""],
    ufCrm_1783000899: START_DATE_IDS[effectiveBody.start_date ?? ""],
    ufCrm_1783000503: HAS_LAND_IDS[effectiveBody.has_land ?? ""],
    ufCrm_1783078367222: MATERIAL_IDS[effectiveBody.material ?? ""],
  };

  for (const [field, value] of Object.entries(enumFields)) {
    if (value !== undefined) {
      dealFields[field] = value;
    }
  }

  if (Number.isFinite(areaM2)) {
    dealFields.ufCrm_1783000757 = areaM2;
  }

  const contactPayload = {
    fields: {
      NAME: name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
    },
  };

  let contactData: { result?: number; error?: string; error_description?: string };
  try {
    const contactResponse = await fetch(contactEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactPayload),
    });

    contactData = await contactResponse.json();
    if (!contactResponse.ok || contactData.error || !contactData.result) {
      console.error("[Bitrix24] contact creation failed", {
        status: contactResponse.status,
        error: contactData.error,
        error_description: contactData.error_description,
      });
      return finish({ ok: false, code: "submission_failed", error: "Не удалось подтвердить отправку. Не повторяйте заявку; свяжитесь с менеджером." }, 502);
    }
  } catch {
    return finish({ ok: false, code: "submission_failed", error: "Не удалось подтвердить отправку. Не повторяйте заявку; свяжитесь с менеджером." }, 502);
  }

  dealFields.contactId = contactData.result;

  const bitrixPayload = {
    entityTypeId: 2,
    fields: dealFields,
  };

  try {
    const response = await fetch(dealEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bitrixPayload),
    });

    if (!response.ok) {
      return finish({ ok: false, code: "submission_failed", error: "Не удалось подтвердить отправку. Не повторяйте заявку; свяжитесь с менеджером." }, 502);
    }

    const data = await response.json();
    console.log("[Bitrix24] status:", response.status);
    console.log("[Bitrix24] error:", data?.error);
    console.log("[Bitrix24] error_description:", data?.error_description);
    console.log("[Bitrix24] result:", data?.result);
    console.log("[Bitrix24] full_data:", data);

    if (!data || data.error || data.result === undefined || data.result === null) {
      return finish({ ok: false, code: "submission_failed", error: "Не удалось подтвердить отправку. Не повторяйте заявку; свяжитесь с менеджером." }, 502);
    }

    return finish({ ok: true, bitrix_result: data.result, ...(isQuiz ? {
      quote: { price_per_m2: effectiveBody.price_per_m2, estimate_min: effectiveBody.estimate_min,
        estimate_max: effectiveBody.estimate_max, pricing_source: "google-sheets" },
    } : {}) });
  } catch {
    return finish({ ok: false, code: "submission_failed", error: "Не удалось подтвердить отправку. Не повторяйте заявку; свяжитесь с менеджером." }, 502);
  }
}
