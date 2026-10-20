import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    body = (await request.json()) as LeadPayload;
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

  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "BITRIX24 webhook is not configured" }, { status: 500 });
  }

  const webhookBaseUrl = webhookUrl.replace(/\/+$/, "");
  const contactEndpoint = `${webhookBaseUrl}/crm.contact.add.json`;
  const dealEndpoint = `${webhookBaseUrl}/crm.item.add.json`;
  const tracking = typeof body.tracking === "object" && body.tracking ? body.tracking : {};
  const flattenedTracking: Record<string, unknown> = { ...tracking };

  for (const [key, value] of Object.entries(body)) {
    if (key !== "tracking" && key !== "consent" && value !== undefined && value !== null && value !== "") {
      flattenedTracking[key] = value;
    }
  }

  const areaM2 = typeof body.area_m2 === "number" ? body.area_m2 : Number(body.area_m2);
  const estimateMax = typeof body.estimate_max === "number" ? body.estimate_max : Number(body.estimate_max);
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
    comments: buildComments({ ...body, tracking: flattenedTracking }),
    ufCrm_1783000963: budgetId,
  };

  const enumFields = {
    ufCrm_1783000383: CITY_IDS[body.city ?? ""],
    ufCrm_1783000592: OBJECT_TYPE_IDS[body.object_type ?? ""],
    ufCrm_1783000831: FINISH_LEVEL_IDS[body.finish_level ?? ""],
    ufCrm_1783000899: START_DATE_IDS[body.start_date ?? ""],
    ufCrm_1783000503: HAS_LAND_IDS[body.has_land ?? ""],
    ufCrm_1783078367222: MATERIAL_IDS[body.material ?? ""],
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
      return NextResponse.json({ ok: false, error: "Bitrix24 contact request failed" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Bitrix24 contact request failed" }, { status: 500 });
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
      return NextResponse.json({ ok: false, error: "Bitrix24 request failed" }, { status: 500 });
    }

    const data = await response.json();
    console.log("[Bitrix24] status:", response.status);
    console.log("[Bitrix24] error:", data?.error);
    console.log("[Bitrix24] error_description:", data?.error_description);
    console.log("[Bitrix24] result:", data?.result);
    console.log("[Bitrix24] full_data:", data);

    if (!data || data.error) {
      return NextResponse.json({ ok: false, error: "Bitrix24 request failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, bitrix_result: data.result });
  } catch {
    return NextResponse.json({ ok: false, error: "Bitrix24 request failed" }, { status: 500 });
  }
}
