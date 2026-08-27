/**
 * Отправка событий в аналитику: Meta Pixel, GA4, Яндекс.Метрика, GTM dataLayer.
 * События по ТЗ §2.1: PageView, ViewContent, Lead, Contact, InitiateCheckout.
 */

type EventName = "PageView" | "ViewContent" | "Lead" | "Contact" | "InitiateCheckout";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

/** Безопасная отправка события во все подключенные системы аналитики. */
export function trackEvent(name: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params });
  }

  // Meta Pixel
  if (window.fbq) {
    const pixelEventMap: Record<EventName, string> = {
      PageView: "PageView",
      ViewContent: "ViewContent",
      Lead: "Lead",
      Contact: "Contact",
      InitiateCheckout: "InitiateCheckout",
    };
    window.fbq("track", pixelEventMap[name], params);
  }

  // GA4
  if (window.gtag) {
    window.gtag("event", name.toLowerCase(), params);
  }

  // Яндекс.Метрика (reachGoal)
  if (window.ym) {
    const ymId = process.env.NEXT_PUBLIC_YM_ID;
    if (ymId) {
      window.ym(Number(ymId), "reachGoal", name.toLowerCase(), params);
    }
  }
}

/** Событие Lead — отправка формы заявки. */
export function trackLead(blockCode: string, formType: string) {
  trackEvent("Lead", { block_code: blockCode, form_type: formType });
}

/** Событие Contact — клик по WhatsApp/телефону. */
export function trackContact(source: string) {
  trackEvent("Contact", { source });
}

/** Событие InitiateCheckout — открытие квиза. */
export function trackQuizStart() {
  trackEvent("InitiateCheckout", {});
}