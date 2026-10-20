import type { Metadata } from "next";
import { SiteShell } from "./components/site-shell";
import { ConsultationModal } from "./components/consultation-modal";
import { Analytics } from "./components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dombuilding.kz"),
  title: {
    default: "Standard Stroy — строительство домов под ключ в Алматы и Астане",
    template: "%s | Standard Stroy",
  },
  description:
    "Строим дома в Алматы и Астане по фиксированной смете: онлайн-камера на объекте, оплата по актам за этап, гарантия 10 лет. От 135 000 ₸/м².",
  keywords: [
    "строительство домов Алматы",
    "построить дом под ключ Алматы",
    "дом из газоблока Алматы цена",
    "дом из финнблока",
    "дом из кирпича под ключ",
    "строительная компания Алматы",
    "Standard Stroy",
  ],
  alternates: {
    canonical: "/",
    languages: {
      ru: "/",
      kk: "/kk",
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    url: "https://dombuilding.kz",
    siteName: "Standard Stroy",
    title: "Standard Stroy — строительство домов под ключ в Алматы и Астане",
    description:
      "Строим дома по фиксированной смете: онлайн-камера на объекте, оплата по актам за этап, гарантия 10 лет. От 135 000 ₸/м².",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-blue-50 text-zinc-950">
        <SiteShell>{children}</SiteShell>
        <ConsultationModal />
        <Analytics />
      </body>
    </html>
  );
}
