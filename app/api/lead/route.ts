/**
 * API-роут приёма заявок с сайта.
 * Создаёт лид/сделку в Bitrix24 через входящий вебхук
 * и передаёт UTM-метки + поля квалификации (поля Айсулу).
 *
 * Переменные окружения (.env.local):
 *   BITRIX24_WEBHOOK_URL — полный URL входящего вебхука,
 *     например https://eco-dom.bitrix24.kz/rest/1/xxxxxxxx/crm.lead.add.json
 *   BITRIX24_SOURCE_ID   — ID источника «Сайт» в справочнике источников
 *     (необязательно; если не задан — передаём TITLE с пометкой)
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  // Контактные данные
  name: string;
  phone: string;
  comment?: string;
  // Код блока сайта (S-HERO, S-QUIZ, S-FOOTER и т.д.)
  blockCode?: string;
  // Тип формы: consultation | quiz | callback
  formType?: "consultation" | "quiz" | "callback";
  // Согласие на обработку ПД
  consent: boolean;
  // Ответственный в Bitrix24
  responsible_id?: string | number;
  assigned_by_id?: string | number;
  // UTM и трекинг
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  // Поля квалификации Айсулу (UF_CRM_*)
  city?: string;
  object_type?: string;
  has_land?: string;
  area_m2?: string;
  material?: string;
  floors?: string;
  finish_level?: string;
  start_date?: string;
  quiz_completed?: boolean;
  estimate_min?: number;
  estimate_max?: number;
};

function phoneToBitrix(raw: string): { PHONE?: { VALUE: string; VALUE_TYPE: string }[] } {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return {};
  return {
    PHONE: [{ VALUE: digits, VALUE_TYPE: "WORK" }],
  };
}

function resolveResponsibleId(body: LeadPayload): number | undefined {
  const candidates = [body.assigned_by_id, body.responsible_id, process.env.BITRIX24_RESPONSIBLE_ID?.trim()];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === "") continue;

    const normalized = String(candidate).trim();
    const numeric = Number(normalized);
    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }

    console.warn("[lead] Некорректный ID ответственного в Bitrix24:", normalized);
  }

  return undefined;
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  // Базовая валидация
  if (!body.consent) {
    return NextResponse.json(
      { ok: false, error: "Требуется согласие на обработку персональных данных" },
      { status: 400 },
    );
  }
  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ ok: false, error: "Имя и телефон обязательны" }, { status: 400 });
  }

  const rawWebhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim() ?? "";
  if (!rawWebhookUrl) {
    // Пока вебхук не настроен — возвращаем успех, но логируем в консоль сервера
    // чтобы формы работали на этапе разработки/демо.
    console.warn("[lead] BITRIX24_WEBHOOK_URL не задан. Заявка только в логе:", {
      name: body.name,
      phone: body.phone,
      blockCode: body.blockCode,
      formType: body.formType,
      utm: {
        source: body.utm_source,
        medium: body.utm_medium,
        campaign: body.utm_campaign,
      },
    });
    return NextResponse.json({ ok: true, mode: "log-only" });
  }

  const webhookUrl = rawWebhookUrl.replace(/\/+$|\s+$/g, "");
  const normalizedWebhookUrl = /\/crm\.lead\.add\.json$/i.test(webhookUrl)
    ? webhookUrl
    : `${webhookUrl}/crm.lead.add.json`;

  if (!/bitrix24/i.test(normalizedWebhookUrl)) {
    console.warn("[lead] BITRIX24_WEBHOOK_URL выглядит подозрительно:", normalizedWebhookUrl);
  }

  const title = `[Сайт${body.blockCode ? ` ${body.blockCode}` : ""}] ${body.formType === "quiz" ? "Квиз" : "Заявка"} — ${body.name}`;

  const responsibleId = resolveResponsibleId(body);
  if (!responsibleId) {
    console.warn("[lead] Для заявки не задан ASSIGNED_BY_ID, она может быть видна только владельцу вебхука.");
  }

  // Поля лида Bitrix24
  const fields: Record<string, unknown> = {
    TITLE: title,
    NAME: body.name,
    OPENED: "Y",
    ...(responsibleId ? { ASSIGNED_BY_ID: responsibleId } : {}),
    COMMENTS: [
      body.comment ?? "",
      body.quiz_completed === false ? "⚠️ Квиз не завершён" : "",
      body.estimate_min && body.estimate_max
        ? `Ориентировочный диапазон: ${body.estimate_min}–${body.estimate_max} ₸`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    SOURCE_ID: process.env.BITRIX24_SOURCE_ID ?? "",
    UF_CRM_SOURCE_URL: body.landing_page ?? "",
    UF_CRM_REFERRER: body.referrer ?? "",
    UF_CRM_UTM_SOURCE: body.utm_source ?? "",
    UF_CRM_UTM_MEDIUM: body.utm_medium ?? "",
    UF_CRM_UTM_CAMPAIGN: body.utm_campaign ?? "",
    UF_CRM_UTM_CONTENT: body.utm_content ?? "",
    UF_CRM_UTM_TERM: body.utm_term ?? "",
    // Поля квалификации Айсулу
    UF_CRM_CITY: body.city ?? "",
    UF_CRM_OBJECT_TYPE: body.object_type ?? "",
    UF_CRM_HAS_LAND: body.has_land ?? "",
    UF_CRM_AREA_M2: body.area_m2 ?? "",
    UF_CRM_MATERIAL: body.material ?? "",
    UF_CRM_FLOORS: body.floors ?? "",
    UF_CRM_FINISH_LEVEL: body.finish_level ?? "",
    UF_CRM_START_DATE: body.start_date ?? "",
    UF_CRM_QUIZ_COMPLETED: body.quiz_completed ? "Y" : "N",
    UF_CRM_ESTIMATE_MIN: body.estimate_min ?? "",
    UF_CRM_ESTIMATE_MAX: body.estimate_max ?? "",
    ...phoneToBitrix(body.phone),
  };

  try {
    const res = await fetch(normalizedWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        params: { REGISTER_SONET_EVENT: "Y" },
      }),
      // Не хотим, чтобы один зависший запрос висел долго
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[lead] Bitrix24 HTTP error:", res.status, text);
      return NextResponse.json(
        { ok: false, error: "Ошибка Bitrix24", status: res.status },
        { status: 502 },
      );
    }

    const data = await res.json();
    if (data.error) {
      console.error("[lead] Bitrix24 API error:", data.error, data.error_description);
      return NextResponse.json(
        { ok: false, error: data.error, description: data.error_description },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, leadId: data.result });
  } catch (err) {
    console.error("[lead] fetch failed:", err);
    return NextResponse.json({ ok: false, error: "Не удалось связаться с Bitrix24" }, { status: 502 });
  }
}