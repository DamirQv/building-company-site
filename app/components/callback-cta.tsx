"use client";

import Link from "next/link";
import { trackContact } from "@/lib/analytics-events";

type CallbackCtaProps = {
  blockCode: string;
  label?: string;
  href?: string;
  variant?: "solid" | "outline";
};

export function CallbackCta({
  blockCode,
  label = "Заказать обратный звонок",
  href = "/kontakty",
  variant = "solid",
}: CallbackCtaProps) {
  const className =
    variant === "solid"
      ? "inline-flex rounded-full bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
      : "inline-flex rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-medium text-blue-900 transition hover:bg-blue-50";

  const handleClick = () => {
    trackContact(blockCode);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {label}
    </Link>
  );
}
