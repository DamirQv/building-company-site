/**
 * Утилиты для работы с UTM-метками и источниками трафика.
 * Сохраняем UTM в cookie на 90 дней, чтобы не терять при возврате посетителя.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const TRACKING_KEYS = [...UTM_KEYS, "referrer", "landing_page"] as const;

export type TrackingData = Record<(typeof TRACKING_KEYS)[number], string>;

const COOKIE_NAME = "ss_tracking";
const COOKIE_DAYS = 90;

/** Читает cookie по имени (client-side). */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
}

/** Записывает cookie с заданным сроком жизни в днях (client-side). */
export function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Парсит UTM-метки из URL и referrer/landing_page. */
export function parseTrackingFromUrl(): Partial<TrackingData> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const data: Partial<TrackingData> = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) data[key] = value;
  }

  // referrer и landing_page всегда обновляем при наличии
  if (document.referrer) data.referrer = document.referrer;
  data.landing_page = window.location.href;

  return data;
}

/** Читает сохранённые ранее данные трекинга из cookie. */
export function readTrackingFromCookie(): Partial<TrackingData> {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<TrackingData>;
  } catch {
    return {};
  }
}

/**
 * Объединяет свежие данные из URL с сохранёнными в cookie,
 * обновляет cookie и возвращает итоговый набор трекинга.
 * Вызывается на клиенте при загрузке/отправке формы.
 */
export function collectTracking(): TrackingData {
  const fromUrl = parseTrackingFromUrl();
  const fromCookie = readTrackingFromCookie();
  const merged: TrackingData = {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    referrer: "",
    landing_page: "",
    ...fromCookie,
    ...fromUrl,
  };

  setCookie(COOKIE_NAME, JSON.stringify(merged), COOKIE_DAYS);
  return merged;
}