import type { Metadata } from "next";
import { SiteShell } from "./components/site-shell";
import { ConsultationModal } from "./components/consultation-modal";
import { Analytics } from "./components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://standardstroy.kz"),
  title: {
    default: "Standard Stroy — строительство домов под ключ в Алматы и Астане",
    template: "%s | Standard Stroy",
  },
  description:
    "Строим дома в Алматы и Астане с фиксацией стоимости работ в договоре: онлайн-камера на объекте, оплата по актам за этап, гарантия 10 лет. Предварительную стоимость рассчитайте по городу и материалу.",
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
