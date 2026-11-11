export const CONTACT_PHONES = [
  { city: "Алматы", display: "+7 777 050 08 03", href: "tel:+77770500803" },
  { city: "Алматы", display: "+7 771 944 42 95", href: "tel:+77719444295" },
  { city: "Астана", display: "+7 771 400 94 00", href: "tel:+77714009400" },
] as const;

export const COMPANY_2GIS_URL = "https://2gis.kz/almaty/firm/70000001104543506";
const WHATSAPP_PHONE = "77770500803";

export function buildWhatsAppHref(blockCode: string, customText?: string) {
  const text = customText ?? `Здравствуйте! Пишу с сайта standardstroy.kz [${blockCode}]`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}
